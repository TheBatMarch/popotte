/*
  # Correction des erreurs Supabase

  1. Ajout de la contrainte UNIQUE sur news.title
  2. Correction des politiques RLS pour permettre l'insertion de données
  3. Amélioration de la robustesse des migrations

  Cette migration corrige les erreurs identifiées lors de l'initialisation.
*/

-- =============================================
-- 1. CORRECTION DE LA TABLE NEWS
-- =============================================

-- Ajouter la contrainte UNIQUE sur title pour permettre ON CONFLICT
DO $$
BEGIN
  -- Vérifier si la contrainte existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'news_title_unique' 
    AND table_name = 'news'
  ) THEN
    ALTER TABLE news ADD CONSTRAINT news_title_unique UNIQUE (title);
  END IF;
END $$;

-- =============================================
-- 2. CORRECTION DES POLITIQUES RLS TEMPORAIRES
-- =============================================

-- Politiques temporaires pour permettre l'insertion de données de base
-- Ces politiques seront remplacées par des politiques strictes après l'insertion

-- Categories : Permettre l'insertion temporaire
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Anyone can insert categories" ON categories;

CREATE POLICY "Anyone can insert categories"
  ON categories FOR INSERT
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Products : Permettre l'insertion temporaire
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;

CREATE POLICY "Anyone can insert products"
  ON products FOR INSERT
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- News : Permettre l'insertion temporaire
DROP POLICY IF EXISTS "Admins can manage news" ON news;
DROP POLICY IF EXISTS "Anyone can insert news" ON news;

CREATE POLICY "Anyone can insert news"
  ON news FOR INSERT
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can update news"
  ON news FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete news"
  ON news FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- 3. INSERTION SÉCURISÉE DES DONNÉES DE BASE
-- =============================================

-- Insertion des catégories avec gestion des conflits
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

  -- Insertion des produits avec gestion des conflits
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

-- Insertion des actualités avec gestion des conflits
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
-- 4. RESTAURATION DES POLITIQUES RLS STRICTES
-- =============================================

-- Attendre un peu pour s'assurer que les insertions sont terminées
-- Puis restaurer les politiques strictes

-- Categories : Restaurer les politiques strictes
DROP POLICY IF EXISTS "Anyone can insert categories" ON categories;
DROP POLICY IF EXISTS "Anyone can update categories" ON categories;
DROP POLICY IF EXISTS "Anyone can delete categories" ON categories;

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Products : Restaurer les politiques strictes
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- News : Restaurer les politiques strictes
DROP POLICY IF EXISTS "Anyone can insert news" ON news;
DROP POLICY IF EXISTS "Anyone can update news" ON news;
DROP POLICY IF EXISTS "Anyone can delete news" ON news;

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
-- 5. CRÉATION D'INDEX POUR LES PERFORMANCES
-- =============================================

-- Index pour améliorer les performances des requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =============================================
-- 6. VÉRIFICATION ET RAPPORT
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
  
  RAISE NOTICE '✅ Migration de correction terminée !';
  RAISE NOTICE '📂 Catégories: %', cat_count;
  RAISE NOTICE '🍽️ Produits: %', prod_count;
  RAISE NOTICE '📰 Actualités: %', news_count;
  RAISE NOTICE '🔒 Politiques RLS restaurées';
  RAISE NOTICE '⚡ Index de performance créés';
END $$;