/*
  # Schéma complet Popotte Association

  1. Nouvelles Tables
    - `profiles` - Profils utilisateurs avec rôles
    - `news` - Articles d'actualité
    - `categories` - Catégories de produits (BOISSONS, EN CAS SALE, EN CAS SUCRE)
    - `products` - Produits avec prix par défaut 0.50€
    - `orders` - Commandes avec statuts (pending, payment_notified, confirmed)
    - `order_items` - Articles de commande

  2. Sécurité
    - RLS activé sur toutes les tables
    - Policies pour utilisateurs et admins
    - Fonction is_admin() pour vérifier les droits

  3. Données initiales
    - Catégories prédéfinies
    - Produits avec prix 0.50€
*/

-- Supprimer les tables existantes si elles existent
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Créer la fonction is_admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Table profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Table news (actualités)
CREATE TABLE news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  image_url text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published news"
  ON news FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Admins can manage all news"
  ON news FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Table categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Table products
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) DEFAULT 0.50,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  image_url text,
  is_available boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read available products"
  ON products FOR SELECT
  TO public
  USING (is_available = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Table orders
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'payment_notified', 'confirmed', 'cancelled')),
  payment_notified_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Table order_items
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Admins can read all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (is_admin());

-- Fonction pour gérer les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insérer les catégories par défaut
INSERT INTO categories (name, slug, display_order) VALUES
  ('BOISSONS', 'boissons', 1),
  ('EN CAS SALE', 'en-cas-sale', 2),
  ('EN CAS SUCRE', 'en-cas-sucre', 3);

-- Insérer les produits par défaut
INSERT INTO products (name, category_id, price, display_order) VALUES
  -- BOISSONS
  ('Bieres haut de gamme', (SELECT id FROM categories WHERE slug = 'boissons'), 0.50, 1),
  ('Bieres basiques', (SELECT id FROM categories WHERE slug = 'boissons'), 0.50, 2),
  ('Bieres FOR', (SELECT id FROM categories WHERE slug = 'boissons'), 0.50, 3),
  ('Soft', (SELECT id FROM categories WHERE slug = 'boissons'), 0.50, 4),
  
  -- EN CAS SALE
  ('Chips', (SELECT id FROM categories WHERE slug = 'en-cas-sale'), 0.50, 1),
  ('Saucisson', (SELECT id FROM categories WHERE slug = 'en-cas-sale'), 0.50, 2),
  
  -- EN CAS SUCRE
  ('Bonbons', (SELECT id FROM categories WHERE slug = 'en-cas-sucre'), 0.50, 1),
  ('Chewinggum', (SELECT id FROM categories WHERE slug = 'en-cas-sucre'), 0.50, 2);