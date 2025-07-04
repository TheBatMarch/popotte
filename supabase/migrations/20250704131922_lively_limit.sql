/*
  # Configuration complète de la base de données pour l'application Popotte

  1. Nouvelles Tables
    - `profiles` - Profils utilisateurs avec rôles
    - `categories` - Catégories de produits (boissons, sucreries, salé)
    - `products` - Produits disponibles à la commande
    - `orders` - Commandes passées par les utilisateurs
    - `order_items` - Détails des produits dans chaque commande
    - `news` - Articles d'actualité pour la page d'accueil

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour utilisateurs authentifiés
    - Politiques spéciales pour les administrateurs

  3. Données initiales
    - Catégories par défaut
    - Produits d'exemple
    - Statuts de commande
*/

-- Extension pour les UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des catégories de produits
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  image_url text,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'payment_notified', 'confirmed', 'cancelled')),
  payment_notified_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des éléments de commande
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des actualités
CREATE TABLE IF NOT EXISTS news (
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

-- Activation de RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Politiques pour les profils
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour les catégories (lecture publique)
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour les produits (lecture publique)
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour les commandes
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour les éléments de commande
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour les actualités
CREATE POLICY "Anyone can read published news"
  ON news
  FOR SELECT
  TO authenticated
  USING (published = true);

CREATE POLICY "Admins can manage all news"
  ON news
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'Utilisateur'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insertion des données initiales
INSERT INTO categories (name, slug, icon) VALUES
  ('Boissons', 'boissons', '🥤'),
  ('Sucreries', 'sucreries', '🍭'),
  ('Salé', 'sale', '🥨')
ON CONFLICT (slug) DO NOTHING;

-- Insertion de produits d'exemple
INSERT INTO products (name, description, price, category_id, image_url) VALUES
  ('Coca-Cola', 'Canette 33cl', 1.50, (SELECT id FROM categories WHERE slug = 'boissons'), 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg'),
  ('Eau minérale', 'Bouteille 50cl', 1.00, (SELECT id FROM categories WHERE slug = 'boissons'), 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg'),
  ('Café', 'Expresso', 1.20, (SELECT id FROM categories WHERE slug = 'boissons'), 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg'),
  ('Bière', 'Pression 25cl', 2.50, (SELECT id FROM categories WHERE slug = 'boissons'), 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg'),
  ('Chocolat', 'Barre chocolat noir', 2.00, (SELECT id FROM categories WHERE slug = 'sucreries'), 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg'),
  ('Bonbons', 'Sachet de bonbons', 1.80, (SELECT id FROM categories WHERE slug = 'sucreries'), 'https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg'),
  ('Cookies', 'Paquet de 6 cookies', 3.00, (SELECT id FROM categories WHERE slug = 'sucreries'), 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg'),
  ('Chips', 'Sachet de chips', 2.20, (SELECT id FROM categories WHERE slug = 'sale'), 'https://images.pexels.com/photos/479600/pexels-photo-479600.jpeg'),
  ('Sandwich', 'Sandwich jambon-beurre', 4.50, (SELECT id FROM categories WHERE slug = 'sale'), 'https://images.pexels.com/photos/1603901/pexels-photo-1603901.jpeg'),
  ('Cacahuètes', 'Sachet de cacahuètes salées', 1.90, (SELECT id FROM categories WHERE slug = 'sale'), 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg')
ON CONFLICT DO NOTHING;

-- Insertion d'actualités d'exemple
INSERT INTO news (title, content, excerpt, image_url, published) VALUES
  ('Bienvenue dans votre popotte !', 'Nous sommes ravis de vous accueillir dans notre nouvelle application de gestion de popotte. Vous pouvez désormais passer vos commandes directement depuis votre téléphone !', 'Découvrez notre nouvelle application mobile', 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg', true),
  ('Nouveaux produits disponibles', 'De nouveaux produits ont été ajoutés à notre catalogue ! Découvrez notre sélection de sandwichs frais et de boissons chaudes pour bien commencer la journée.', 'Découvrez nos nouveaux produits', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg', true),
  ('Horaires d''ouverture', 'Notre popotte est ouverte du lundi au vendredi de 8h à 18h. N''hésitez pas à passer vos commandes à l''avance pour éviter l''attente !', 'Consultez nos horaires d''ouverture', 'https://images.pexels.com/photos/745365/pexels-photo-745365.jpeg', true)
ON CONFLICT DO NOTHING;