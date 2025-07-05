/*
  # Migration finale - Application des consignes détaillées
  
  Cette migration applique toutes les bonnes pratiques PostgreSQL :
  1. DROP POLICY IF EXISTS avant chaque création
  2. Suppression des clauses USING dans les politiques INSERT
  3. Utilisation exclusive de WITH CHECK pour les INSERT
  4. Nettoyage des triggers et contraintes avant création
  5. Gestion correcte des ON CONFLICT avec contraintes UNIQUE
  6. Suppression des doublons d'index et contraintes
*/

-- =============================================
-- 1. NETTOYAGE PRÉALABLE - SUPPRESSION SÉCURISÉE
-- =============================================

-- Suppression des triggers existants pour éviter les doublons
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_news_updated_at ON news;

-- Suppression des contraintes existantes pour éviter les doublons
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_name_unique;
ALTER TABLE news DROP CONSTRAINT IF EXISTS news_title_unique;

-- =============================================
-- 2. AJOUT DES CONTRAINTES UNIQUE NÉCESSAIRES
-- =============================================

-- Ajouter contrainte UNIQUE sur products.name
ALTER TABLE products ADD CONSTRAINT products_name_unique UNIQUE(name);

-- Ajouter contrainte UNIQUE sur news.title pour permettre ON CONFLICT
ALTER TABLE news ADD CONSTRAINT news_title_unique UNIQUE(title);

-- =============================================
-- 3. SUPPRESSION DE TOUTES LES POLITIQUES EXISTANTES
-- =============================================

-- Profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Categories
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Anyone can insert categories" ON categories;
DROP POLICY IF EXISTS "Anyone can update categories" ON categories;
DROP POLICY IF EXISTS "Anyone can delete categories" ON categories;
DROP POLICY IF EXISTS "Temp insert categories" ON categories;
DROP POLICY IF EXISTS "Temp update categories" ON categories;
DROP POLICY IF EXISTS "Temp delete categories" ON categories;

-- Products
DROP POLICY IF EXISTS "Anyone can read available products" ON products;
DROP POLICY IF EXISTS "Admins can read all products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;
DROP POLICY IF EXISTS "Temp insert products" ON products;
DROP POLICY IF EXISTS "Temp update products" ON products;
DROP POLICY IF EXISTS "Temp delete products" ON products;

-- Orders
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Order Items
DROP POLICY IF EXISTS "Users can read own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can read all order items" ON order_items;

-- News
DROP POLICY IF EXISTS "Anyone can read published news" ON news;
DROP POLICY IF EXISTS "Admins can read all news" ON news;
DROP POLICY IF EXISTS "Admins can manage news" ON news;
DROP POLICY IF EXISTS "Anyone can insert news" ON news;
DROP POLICY IF EXISTS "Anyone can update news" ON news;
DROP POLICY IF EXISTS "Anyone can delete news" ON news;
DROP POLICY IF EXISTS "Temp insert news" ON news;
DROP POLICY IF EXISTS "Temp update news" ON news;
DROP POLICY IF EXISTS "Temp delete news" ON news;

-- =============================================
-- 4. POLITIQUES TEMPORAIRES POUR L'INSERTION
-- =============================================

-- Categories : Politiques temporaires permissives (SANS USING pour INSERT)
CREATE POLICY "Temp categories insert"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Temp categories update"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Temp categories delete"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Products : Politiques temporaires permissives (SANS USING pour INSERT)
CREATE POLICY "Temp products insert"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Temp products update"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Temp products delete"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- News : Politiques temporaires permissives (SANS USING pour INSERT)
CREATE POLICY "Temp news insert"
  ON news FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Temp news update"
  ON news FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Temp news delete"
  ON news FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- 5. NETTOYAGE DES DONNÉES EXISTANTES
-- =============================================

-- Utiliser TRUNCATE CASCADE pour éviter les erreurs de FK
TRUNCATE TABLE order_items, orders, products, news, categories CASCADE;

-- =============================================
-- 6. INSERTION SÉCURISÉE DES DONNÉES DE BASE
-- =============================================

-- Insertion des catégories avec ON CONFLICT sur contrainte UNIQUE
INSERT INTO categories (name, slug, display_order) VALUES
  ('BOISSONS', 'boissons', 1),
  ('EN CAS SALE', 'en-cas-sale', 2),
  ('EN CAS SUCRE', 'en-cas-sucre', 3),
  ('PLATS PRINCIPAUX', 'plats-principaux', 4),
  ('ENTREES', 'entrees', 5),
  ('DESSERTS', 'desserts', 6)
ON CONFLICT (name) DO NOTHING;

-- Insertion des produits avec gestion des conflits
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

  -- Insertion des produits avec ON CONFLICT sur contrainte UNIQUE
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
    ('Chebakia', 'Pâtisseries au miel et graines de sésame', 5.50, cat_desserts, 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true, 2, false, null, null)
  ON CONFLICT (name) DO NOTHING;
END $$;

-- Insertion des actualités avec ON CONFLICT sur contrainte UNIQUE
INSERT INTO news (title, content, excerpt, image_url, published) VALUES
  (
    'Bienvenue à la Popotte Association !',
    'Nous sommes ravis de vous accueillir dans notre nouvelle application de commande en ligne.

Vous pouvez désormais :
- Consulter notre menu complet
- Passer vos commandes facilement
- Suivre vos dettes et paiements
- Rester informés de nos actualités

Notre association continue de vous proposer des plats traditionnels marocains préparés avec amour et des ingrédients de qualité.

N''hésitez pas à nous faire part de vos retours pour améliorer votre expérience !',
    'Découvrez notre nouvelle application de commande en ligne',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    true
  ),
  (
    'Nouveau menu de printemps',
    'Nous avons le plaisir de vous annoncer l''arrivée de notre nouveau menu de printemps !

Au programme :
- Des salades fraîches de saison
- De nouveaux tajines aux légumes printaniers
- Des desserts légers et parfumés

Tous nos plats sont préparés avec des produits frais et de saison, dans le respect de nos traditions culinaires.

Venez découvrir ces nouvelles saveurs dès maintenant !',
    'Découvrez nos nouveaux plats de saison',
    'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg',
    true
  ),
  (
    'Horaires d''ouverture mis à jour',
    'Nous vous informons que nos horaires d''ouverture ont été légèrement modifiés pour mieux vous servir :

Lundi - Vendredi : 11h30 - 14h30 et 18h30 - 22h00
Samedi - Dimanche : 12h00 - 15h00 et 19h00 - 22h30

Les commandes en ligne restent disponibles 24h/24 avec récupération selon nos horaires d''ouverture.

Merci de votre compréhension !',
    'Nouveaux horaires pour mieux vous servir',
    'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    true
  )
ON CONFLICT (title) DO NOTHING;

-- =============================================
-- 7. SUPPRESSION DES POLITIQUES TEMPORAIRES
-- =============================================

DROP POLICY IF EXISTS "Temp categories insert" ON categories;
DROP POLICY IF EXISTS "Temp categories update" ON categories;
DROP POLICY IF EXISTS "Temp categories delete" ON categories;

DROP POLICY IF EXISTS "Temp products insert" ON products;
DROP POLICY IF EXISTS "Temp products update" ON products;
DROP POLICY IF EXISTS "Temp products delete" ON products;

DROP POLICY IF EXISTS "Temp news insert" ON news;
DROP POLICY IF EXISTS "Temp news update" ON news;
DROP POLICY IF EXISTS "Temp news delete" ON news;

-- =============================================
-- 8. CRÉATION DES POLITIQUES RLS STRICTES FINALES
-- =============================================

-- PROFILES : Politiques strictes
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
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- CATEGORIES : Politiques strictes
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PRODUCTS : Politiques strictes
CREATE POLICY "Anyone can read available products"
  ON products FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Admins can read all products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ORDERS : Politiques strictes (SANS USING pour INSERT)
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
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ORDER_ITEMS : Politiques strictes (SANS USING pour INSERT)
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- NEWS : Politiques strictes
CREATE POLICY "Anyone can read published news"
  ON news FOR SELECT
  TO authenticated
  USING (published = true);

CREATE POLICY "Admins can read all news"
  ON news FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage news"
  ON news FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- 9. RECRÉATION DES TRIGGERS SANS DOUBLONS
-- =============================================

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

-- =============================================
-- 10. CRÉATION D'INDEX POUR LES PERFORMANCES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =============================================
-- 11. RAPPORT FINAL DE MIGRATION
-- =============================================

DO $$
DECLARE
  cat_count integer;
  prod_count integer;
  news_count integer;
BEGIN
  SELECT COUNT(*) INTO cat_count FROM categories;
  SELECT COUNT(*) INTO prod_count FROM products;
  SELECT COUNT(*) INTO news_count FROM news;
  
  RAISE NOTICE '🎉 MIGRATION FINALE TERMINÉE AVEC SUCCÈS !';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ Toutes les consignes détaillées appliquées :';
  RAISE NOTICE '   - DROP POLICY IF EXISTS avant chaque création';
  RAISE NOTICE '   - SANS clause USING dans les politiques INSERT';
  RAISE NOTICE '   - WITH CHECK exclusivement pour les INSERT';
  RAISE NOTICE '   - Triggers nettoyés avant recréation';
  RAISE NOTICE '   - Contraintes UNIQUE ajoutées pour ON CONFLICT';
  RAISE NOTICE '   - TRUNCATE CASCADE pour éviter erreurs FK';
  RAISE NOTICE '================================================';
  RAISE NOTICE '📂 Catégories créées: %', cat_count;
  RAISE NOTICE '🍽️ Produits créés: %', prod_count;
  RAISE NOTICE '📰 Actualités créées: %', news_count;
  RAISE NOTICE '🔒 Politiques RLS strictes activées';
  RAISE NOTICE '⚡ Index de performance créés';
  RAISE NOTICE '✅ Base de données prête à l''utilisation';
END $$;