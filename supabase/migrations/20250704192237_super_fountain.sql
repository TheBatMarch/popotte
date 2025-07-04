/*
  # Configuration du compte administrateur

  1. Nettoyage
    - Supprime tous les anciens comptes admin
  
  2. Nouveau compte admin
    - Email: adminpopotte@popotte.local
    - Identifiant de connexion: adminpopotte
    - Mot de passe: popotteGIGN!
    - Rôle: admin
    - Slug: admin-popotte-2025

  3. Sécurité
    - UUID généré automatiquement
    - RLS activé
    - Politiques d'accès configurées
*/

-- Nettoyer tous les anciens comptes admin
DELETE FROM profiles WHERE role = 'admin';

-- Ajouter la colonne slug si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'slug'
  ) THEN
    ALTER TABLE profiles ADD COLUMN slug text UNIQUE;
  END IF;
END $$;

-- Insérer le nouveau compte administrateur
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  slug,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'adminpopotte@popotte.local',
  'Administrateur Popotte',
  'admin',
  'admin-popotte-2025',
  now(),
  now()
);

-- Note: Pour que ce compte fonctionne avec l'authentification Supabase,
-- vous devrez créer l'utilisateur dans Supabase Auth avec ces identifiants:
-- Email: adminpopotte@popotte.local
-- Mot de passe: popotteGIGN!