/*
  # Correction finale des politiques RLS et erreurs Supabase

  1. Correction des politiques RLS
    - Suppression des clauses USING incorrectes sur les INSERT
    - Utilisation exclusive de WITH CHECK pour les INSERT
    - Politiques temporaires pour l'insertion des données

  2. Correction des contraintes
    - Ajout de la contrainte UNIQUE sur news.title
    - Gestion des conflits avec ON CONFLICT

  3. Insertion sécurisée des données
    - Politiques temporaires permissives
    - Restauration des politiques strictes après insertion
*/

-- =============================================
-- 1. CORRECTION DE LA TABLE NEWS
-- =============================================

-- Ajouter la contrainte UNIQUE sur title pour permettre ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'news_title_unique' 
    AND table_name = 'news'
  ) THEN
    ALTER TABLE news ADD CONSTRAINT news_title_unique UNIQUE (title);
    RAISE NOTICE '✅ Contrainte UNIQUE ajoutée sur news.title';
  ELSE
    RAISE NOTICE '⚠️ Contrainte news_title_unique existe déjà';
  END IF;
END $$;

-- =============================================
-- 2. SUPPRESSION DES POLITIQUES EXISTANTES
-- =============================================

-- Categories
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Anyone can insert categories" ON categories;
DROP POLICY IF EXISTS "Anyone can update categories" ON categories;
DROP POLICY IF EXISTS "Anyone can delete categories" ON categories;

-- Products  
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;

-- News
DROP POLICY IF EXISTS "Admins can manage news" ON news;
DROP POLICY IF EXISTS "Anyone can insert news" ON news;
DROP POLICY IF EXISTS "Anyone can update news" ON news;
DROP POLICY IF EXISTS "Anyone can delete news" ON news;

-- =============================================
-- 3. POLITIQUES TEMPORAIRES POUR L'INSERTION
-- =============================================

-- Categories : Politiques temporaires permissives
CREATE POLICY "Temp insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Temp update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Temp delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Products : Politiques temporaires permissives
CREATE POLICY "Temp insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Temp update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Temp delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- News : Politiques temporaires permissives
CREATE POLICY "Temp insert news"
  ON news FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Temp update news"
  ON news FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Temp delete news"
  ON news FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- 4. INSERTION SÉCURISÉE DES DONNÉES
-- =============================================

-- Insertion des catégories
INSERT INTO categories (name, slug, display_order) VALUES
  ('BOISSONS', 'boissons', 1),
  ('EN CAS SALE', 'en-cas-sale', 2),
  ('EN CAS SUCRE', 'en-cas-sucre', 3),
  ('PLATS PRINCIPAUX', 'plats-principaux', 4),
  ('ENTREES', 'entrees', 5),
  ('DESSERTS', 'desserts', 6)
ON CONFLICT (name) DO NOTHING;

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
    ('Chebakia', 'Pâtisseries au miel et graines de sésame', 5.50, cat_desserts, 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true, 2, false, null, null)
  ON CONFLICT (name) DO NOTHING;
  
  RAISE NOTICE '✅ Produits insérés avec succès';
END $$;

-- Insertion des actualités
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
-- 5. RESTAURATION DES POLITIQUES STRICTES
-- =============================================

-- Suppression des politiques temporaires
DROP POLICY IF EXISTS "Temp insert categories" ON categories;
DROP POLICY IF EXISTS "Temp update categories" ON categories;
DROP POLICY IF EXISTS "Temp delete categories" ON categories;

DROP POLICY IF EXISTS "Temp insert products" ON products;
DROP POLICY IF EXISTS "Temp update products" ON products;
DROP POLICY IF EXISTS "Temp delete products" ON products;

DROP POLICY IF EXISTS "Temp insert news" ON news;
DROP POLICY IF EXISTS "Temp update news" ON news;
DROP POLICY IF EXISTS "Temp delete news" ON news;

-- Création des politiques strictes finales

-- Categories : Seuls les admins peuvent gérer
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Products : Seuls les admins peuvent gérer
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- News : Seuls les admins peuvent gérer
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
-- 6. CRÉATION D'INDEX POUR LES PERFORMANCES
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
-- 7. RAPPORT FINAL
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
  
  RAISE NOTICE '🎉 MIGRATION TERMINÉE AVEC SUCCÈS !';
  RAISE NOTICE '================================';
  RAISE NOTICE '📂 Catégories créées: %', cat_count;
  RAISE NOTICE '🍽️ Produits créés: %', prod_count;
  RAISE NOTICE '📰 Actualités créées: %', news_count;
  RAISE NOTICE '🔒 Politiques RLS strictes activées';
  RAISE NOTICE '⚡ Index de performance créés';
  RAISE NOTICE '✅ Base de données prête à l''utilisation';
END $$;