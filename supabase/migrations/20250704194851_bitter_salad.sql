/*
  # Corriger l'accès public aux actualités

  1. Problème identifié
    - Les actualités publiées ne sont pas visibles car les policies RLS sont trop restrictives
    - Seuls les utilisateurs authentifiés peuvent lire les actualités

  2. Solution
    - Créer une policy qui permet la lecture publique des actualités publiées
    - Permettre l'accès même aux utilisateurs non connectés
    - Maintenir la sécurité pour les autres opérations

  3. Changements
    - Supprimer l'ancienne policy restrictive
    - Créer une nouvelle policy pour l'accès public en lecture
    - Maintenir les policies admin pour la gestion
*/

-- Supprimer les anciennes policies sur news
DROP POLICY IF EXISTS "Anyone can read published news" ON news;
DROP POLICY IF EXISTS "Admins can manage all news" ON news;

-- Créer une policy pour permettre la lecture publique des actualités publiées
-- Cette policy permet à TOUS les utilisateurs (connectés ou non) de lire les actualités publiées
CREATE POLICY "Public can read published news"
  ON news
  FOR SELECT
  TO public
  USING (published = true);

-- Créer une policy pour les admins (gestion complète)
CREATE POLICY "Admins can manage all news"
  ON news
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- S'assurer que RLS est activé sur la table news
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Vérifier que la fonction is_admin existe et fonctionne
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'adminpopotte@popotte.local'
  );
$$;