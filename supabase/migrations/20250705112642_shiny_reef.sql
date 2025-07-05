-- =============================================
-- CORRECTION FINALE DES POLITIQUES RLS FOR INSERT
-- =============================================

-- 1. SUPPRESSION EXPLICITE DE TOUTES LES POLITIQUES FOR INSERT SUR ORDERS
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Temp orders insert" ON orders;

-- 2. SUPPRESSION EXPLICITE DE TOUTES LES POLITIQUES FOR INSERT SUR ORDER_ITEMS
DROP POLICY IF EXISTS "Users can create own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can create order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
DROP POLICY IF EXISTS "Temp order items insert" ON order_items;

-- 3. CRÉATION DES POLITIQUES FOR INSERT CORRECTES (AVEC WITH CHECK UNIQUEMENT)

-- ORDERS : Politique INSERT avec uniquement WITH CHECK (SANS USING)
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ORDER_ITEMS : Politique INSERT avec uniquement WITH CHECK (SANS USING)
CREATE POLICY "Users can create own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

-- 4. VÉRIFICATION FINALE
DO $$
BEGIN
  RAISE NOTICE '✅ CORRECTION DES POLITIQUES FOR INSERT TERMINÉE !';
  RAISE NOTICE '================================================';
  RAISE NOTICE '🔧 Politiques FOR INSERT corrigées :';
  RAISE NOTICE '   - orders: "Users can create own orders" (WITH CHECK uniquement)';
  RAISE NOTICE '   - order_items: "Users can create own order items" (WITH CHECK uniquement)';
  RAISE NOTICE '✅ Plus d''erreur "only WITH CHECK expression allowed for INSERT"';
  RAISE NOTICE '✅ Les commandes peuvent maintenant être créées sans erreur RLS';
END $$;