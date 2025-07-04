/*
  # Migration complète - Reconstruction du schéma Popotte Association

  1. Suppression et recréation complète des tables
  2. Configuration RLS (Row Level Security)
  3. Création des politiques de sécurité
  4. Insertion des données de démonstration
  5. Configuration des triggers et fonctions

  Cette migration reconstruit entièrement le schéma pour garantir la cohérence.
*/

-- Supprimer les tables existantes dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLE PROFILES (utilisateurs)
-- =====================================================

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  username text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. TABLE CATEGORIES
-- =====================================================

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 3. TABLE PRODUCTS
-- =====================================================

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text,
  is_available boolean DEFAULT true,
  display_order integer DEFAULT 0,
  stock_enabled boolean DEFAULT false,
  stock_quantity integer CHECK (stock_quantity >= 0),
  stock_variants jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 4. TABLE ORDERS
-- =====================================================

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'payment_notified', 'confirmed', 'cancelled')),
  payment_initiated_at timestamptz,
  payment_notified_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 5. TABLE ORDER_ITEMS
-- =====================================================

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price decimal(10,2) NOT NULL CHECK (total_price >= 0),
  variant text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 6. TABLE NEWS
-- =====================================================

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

-- =====================================================
-- 7. ACTIVATION RLS (Row Level Security)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. POLITIQUES RLS - PROFILES
-- =====================================================

-- Les utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Les admins peuvent lire tous les profils
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 9. POLITIQUES RLS - CATEGORIES
-- =====================================================

-- Tout le monde peut lire les catégories
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Seuls les admins peuvent gérer les catégories
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 10. POLITIQUES RLS - PRODUCTS
-- =====================================================

-- Tout le monde peut lire les produits disponibles
CREATE POLICY "Anyone can read available products"
  ON products FOR SELECT
  TO authenticated
  USING (is_available = true);

-- Les admins peuvent lire tous les produits
CREATE POLICY "Admins can read all products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seuls les admins peuvent gérer les produits
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 11. POLITIQUES RLS - ORDERS
-- =====================================================

-- Les utilisateurs peuvent lire leurs propres commandes
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Les utilisateurs peuvent créer leurs propres commandes
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Les utilisateurs peuvent modifier leurs propres commandes
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Les admins peuvent lire toutes les commandes
CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Les admins peuvent modifier toutes les commandes
CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 12. POLITIQUES RLS - ORDER_ITEMS
-- =====================================================

-- Les utilisateurs peuvent lire les items de leurs commandes
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent créer des items pour leurs commandes
CREATE POLICY "Users can create own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- Les admins peuvent lire tous les order items
CREATE POLICY "Admins can read all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 13. POLITIQUES RLS - NEWS
-- =====================================================

-- Tout le monde peut lire les actualités publiées
CREATE POLICY "Anyone can read published news"
  ON news FOR SELECT
  TO authenticated
  USING (published = true);

-- Les admins peuvent lire toutes les actualités
CREATE POLICY "Admins can read all news"
  ON news FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seuls les admins peuvent gérer les actualités
CREATE POLICY "Admins can manage news"
  ON news FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 14. FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour gérer la création automatique de profil
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    role = EXCLUDED.role,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour la création automatique de profil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 15. INSERTION DES DONNÉES DE DÉMONSTRATION
-- =====================================================

-- Insertion des catégories
INSERT INTO categories (name, slug, display_order) VALUES
  ('BOISSONS', 'boissons', 1),
  ('EN CAS SALE', 'en-cas-sale', 2),
  ('EN CAS SUCRE', 'en-cas-sucre', 3),
  ('PLATS PRINCIPAUX', 'plats-principaux', 4),
  ('ENTREES', 'entrees', 5),
  ('DESSERTS', 'desserts', 6);

-- Insertion des produits
DO $$
DECLARE
  cat_boissons uuid;
  cat_en_cas_sale uuid;
  cat_en_cas_sucre uuid;
  cat_plats_principaux uuid;
  cat_entrees uuid;
  cat_desserts uuid;
BEGIN
  -- Récupération des IDs des catégories
  SELECT id INTO cat_boissons FROM categories WHERE slug = 'boissons';
  SELECT id INTO cat_en_cas_sale FROM categories WHERE slug = 'en-cas-sale';
  SELECT id INTO cat_en_cas_sucre FROM categories WHERE slug = 'en-cas-sucre';
  SELECT id INTO cat_plats_principaux FROM categories WHERE slug = 'plats-principaux';
  SELECT id INTO cat_entrees FROM categories WHERE slug = 'entrees';
  SELECT id INTO cat_desserts FROM categories WHERE slug = 'desserts';

  -- Insertion des produits
  INSERT INTO products (name, description, price, category_id, image_url, is_available, display_order, stock_enabled, stock_quantity, stock_variants) VALUES
    -- BOISSONS
    ('Bières haut de gamme', 'Sélection de bières premium', 0.50, cat_boissons, 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg', true, 1, false, null, null),
    ('Bières basiques', 'Bières classiques', 0.50, cat_boissons, 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg', true, 2, false, null, null),
    ('Soft', 'Boissons sans alcool', 0.50, cat_boissons, 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg', true, 3, false, null, null),
    ('Thé à la menthe', 'Thé traditionnel marocain à la menthe fraîche', 2.50, cat_boissons, 'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg', true, 4, false, null, null),
    
    -- EN CAS SALE
    ('Chips', 'Chips croustillantes', 0.50, cat_en_cas_sale, 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg', true, 1, false, null, null),
    ('Saucisson', 'Saucisson sec de qualité', 0.50, cat_en_cas_sale, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg', true, 2, false, null, null),
    
    -- EN CAS SUCRE
    ('Bonbons', 'Assortiment de bonbons', 0.50, cat_en_cas_sucre, 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true, 1, false, null, null),
    ('Chewing-gum', 'Chewing-gum parfum menthe', 0.50, cat_en_cas_sucre, 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true, 2, false, null, null),
    
    -- PLATS PRINCIPAUX
    ('Couscous royal', 'Couscous traditionnel avec merguez, agneau et légumes', 12.50, cat_plats_principaux, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg', true, 1, false, null, null),
    ('Tajine de poulet', 'Tajine de poulet aux olives et citrons confits', 11.00, cat_plats_principaux, 'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg', true, 2, false, null, null),
    ('Pastilla au poisson', 'Pastilla traditionnelle au poisson et aux épices', 9.50, cat_plats_principaux, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg', true, 3, true, null, '[{"name": "Taille S", "quantity": 5}, {"name": "Taille M", "quantity": 3}, {"name": "Taille L", "quantity": 0}]'::jsonb),
    
    -- ENTREES
    ('Harira', 'Soupe traditionnelle marocaine aux lentilles', 4.50, cat_entrees, 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg', true, 1, true, 8, null),
    ('Salade marocaine', 'Salade fraîche aux tomates, concombres et herbes', 5.00, cat_entrees, 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg', true, 2, true, 2, null),
    
    -- DESSERTS
    ('Cornes de gazelle', 'Pâtisseries traditionnelles aux amandes', 6.00, cat_desserts, 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true, 1, true, 0, null),
    ('Chebakia', 'Pâtisseries au miel et graines de sésame', 5.50, cat_desserts, 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true, 2, false, null, null);
END $$;

-- Insertion des actualités
INSERT INTO news (title, content, excerpt, image_url, published) VALUES
  (
    'Bienvenue à la Popotte Association !',
    E'Nous sommes ravis de vous accueillir dans notre nouvelle application de commande en ligne.\n\nVous pouvez désormais :\n- Consulter notre menu complet\n- Passer vos commandes facilement\n- Suivre vos dettes et paiements\n- Rester informés de nos actualités\n\nNotre association continue de vous proposer des plats traditionnels marocains préparés avec amour et des ingrédients de qualité.\n\nN\'hésitez pas à nous faire part de vos retours pour améliorer votre expérience !',
    'Découvrez notre nouvelle application de commande en ligne',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    true
  ),
  (
    'Nouveau menu de printemps',
    E'Nous avons le plaisir de vous annoncer l\'arrivée de notre nouveau menu de printemps !\n\nAu programme :\n- Des salades fraîches de saison\n- De nouveaux tajines aux légumes printaniers\n- Des desserts légers et parfumés\n\nTous nos plats sont préparés avec des produits frais et de saison, dans le respect de nos traditions culinaires.\n\nVenez découvrir ces nouvelles saveurs dès maintenant !',
    'Découvrez nos nouveaux plats de saison',
    'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg',
    true
  ),
  (
    'Horaires d''ouverture mis à jour',
    E'Nous vous informons que nos horaires d\'ouverture ont été légèrement modifiés pour mieux vous servir :\n\nLundi - Vendredi : 11h30 - 14h30 et 18h30 - 22h00\nSamedi - Dimanche : 12h00 - 15h00 et 19h00 - 22h30\n\nLes commandes en ligne restent disponibles 24h/24 avec récupération selon nos horaires d\'ouverture.\n\nMerci de votre compréhension !',
    'Nouveaux horaires pour mieux vous servir',
    'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    true
  );

-- =====================================================
-- 16. CRÉATION D'INDEX POUR LES PERFORMANCES
-- =====================================================

-- Index pour les requêtes fréquentes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_news_published ON news(published);
CREATE INDEX idx_profiles_role ON profiles(role);

-- =====================================================
-- MIGRATION TERMINÉE
-- =====================================================

-- Affichage du résumé
DO $$
DECLARE
  cat_count integer;
  prod_count integer;
  news_count integer;
BEGIN
  SELECT COUNT(*) INTO cat_count FROM categories;
  SELECT COUNT(*) INTO prod_count FROM products;
  SELECT COUNT(*) INTO news_count FROM news;
  
  RAISE NOTICE '✅ Migration terminée avec succès !';
  RAISE NOTICE '📂 Catégories créées: %', cat_count;
  RAISE NOTICE '🍽️ Produits créés: %', prod_count;
  RAISE NOTICE '📰 Actualités créées: %', news_count;
  RAISE NOTICE '🔒 RLS activé sur toutes les tables';
  RAISE NOTICE '🎯 Politiques de sécurité configurées';
  RAISE NOTICE '⚡ Index de performance créés';
END $$;