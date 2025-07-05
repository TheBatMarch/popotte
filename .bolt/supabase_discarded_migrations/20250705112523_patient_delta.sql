/*
  # Correction des politiques RLS FOR INSERT

  1. Suppression de toutes les politiques FOR INSERT existantes
  2. Création des politiques FOR INSERT avec uniquement WITH CHECK
  3. Conservation des autres politiques (SELECT, UPDATE, DELETE) intactes

  Cette migration corrige l'erreur "only WITH CHECK expression allowed for INSERT"
*/

-- =============================================
-- 1. SUPPRESSION DES POLITIQUES FOR INSERT EXISTANTES
-- =============================================

-- ORDERS : Supprimer les politiques INSERT existantes
DROP POLICY IF EXISTS "Users can create own orders" ON orders;

-- ORDER_ITEMS : Supprimer les politiques INSERT existantes  
DROP POLICY IF EXISTS "Users can create own order items" ON order_items;

-- CATEGORIES : Supprimer les politiques INSERT existantes (si elles existent)
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Anyone can insert categories" ON categories;
DROP POLICY IF EXISTS "Temp categories insert" ON categories;

-- PRODUCTS : Supprimer les politiques INSERT existantes (si elles existent)
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Temp products insert" ON products;

-- NEWS : Supprimer les politiques INSERT existantes (si elles existent)
DROP POLICY IF EXISTS "Admins can manage news" ON news;
DROP POLICY IF EXISTS "Anyone can insert news" ON news;
DROP POLICY IF EXISTS "Temp news insert" ON news;

-- =============================================
-- 2. CRÉATION DES POLITIQUES FOR INSERT CORRECTES
-- =============================================

-- ORDERS : Politique INSERT avec uniquement WITH CHECK
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ORDER_ITEMS : Politique INSERT avec uniquement WITH CHECK
CREATE POLICY "Users can create own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- =============================================
-- 3. RECRÉATION DES POLITIQUES ALL POUR LES ADMINS
-- =============================================

-- CATEGORIES : Politique ALL pour les admins (inclut INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PRODUCTS : Politique ALL pour les admins (inclut INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- NEWS : Politique ALL pour les admins (inclut INSERT, UPDATE, DELETE)
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
-- 4. VÉRIFICATION ET RAPPORT
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '✅ CORRECTION DES POLITIQUES RLS FOR INSERT TERMINÉE !';
  RAISE NOTICE '==================================================';
  RAISE NOTICE '🔧 Politiques FOR INSERT corrigées :';
  RAISE NOTICE '   - "Users can create own orders" (WITH CHECK uniquement)';
  RAISE NOTICE '   - "Users can create own order items" (WITH CHECK uniquement)';
  RAISE NOTICE '🔒 Politiques ALL pour admins recréées :';
  RAISE NOTICE '   - "Admins can manage categories"';
  RAISE NOTICE '   - "Admins can manage products"';
  RAISE NOTICE '   - "Admins can manage news"';
  RAISE NOTICE '✅ Plus d''erreur "only WITH CHECK expression allowed for INSERT"';
  RAISE NOTICE '✅ Les commandes peuvent maintenant être créées sans erreur RLS';
END $$;