/*
  # Correction de l'accès public aux actualités

  1. Problème identifié
    - Les actualités ne s'affichent pas car les policies RLS bloquent l'accès
    - Besoin d'autoriser l'accès public (non authentifié) aux actualités publiées

  2. Solution
    - Créer une policy permettant l'accès public aux actualités publiées
    - Corriger les policies pour les produits et catégories
    - S'assurer que les utilisateurs non connectés peuvent voir le contenu public
*/

-- Supprimer toutes les policies existantes sur news pour repartir à zéro
DROP POLICY IF EXISTS "Public can read published news" ON news;
DROP POLICY IF EXISTS "Admins can manage all news" ON news;
DROP POLICY IF EXISTS "Anyone can read published news" ON news;

-- Créer une policy simple pour l'accès public aux actualités publiées
-- Cette policy permet à TOUS (y compris les utilisateurs non connectés) de lire les actualités publiées
CREATE POLICY "Enable read access for published news"
  ON news
  FOR SELECT
  USING (published = true);

-- Policy pour les admins (gestion complète)
CREATE POLICY "Enable full access for admins"
  ON news
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Corriger les policies pour les catégories (accès public en lecture)
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
CREATE POLICY "Enable read access for categories"
  ON categories
  FOR SELECT
  USING (true);

-- Corriger les policies pour les produits (accès public en lecture pour les produits disponibles)
DROP POLICY IF EXISTS "Anyone can read products" ON categories;
CREATE POLICY "Enable read access for available products"
  ON products
  FOR SELECT
  USING (is_available = true);

-- S'assurer que RLS est activé sur toutes les tables
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;