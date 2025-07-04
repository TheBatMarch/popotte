/*
  # Configuration du compte administrateur

  1. Nettoyage
    - Supprime les anciens comptes admin
  
  2. Structure
    - Ajoute la colonne slug si nécessaire
  
  3. Compte admin
    - Crée ou met à jour le compte admin avec email: adminpopotte@popotte.local
    - Assigne le rôle admin
    - Ajoute un slug unique
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

-- Insérer ou mettre à jour le compte administrateur
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
) ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  slug = EXCLUDED.slug,
  updated_at = now();

-- Note: Pour que ce compte fonctionne avec l'authentification Supabase,
-- vous devrez créer l'utilisateur dans Supabase Auth avec ces identifiants:
-- Email: adminpopotte@popotte.local
-- Mot de passe: popotteGIGN!