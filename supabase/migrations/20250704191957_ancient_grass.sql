/*
  # Corriger le compte administrateur avec un UUID valide

  1. Corrections
    - Utiliser un UUID généré dynamiquement pour la colonne id
    - Ajouter une colonne slug pour conserver l'identifiant textuel
    - Assurer la compatibilité avec la contrainte de clé étrangère

  2. Sécurité
    - Maintenir les politiques RLS existantes
    - Préserver l'intégrité référentielle
*/

-- Supprimer l'ancien enregistrement s'il existe (avec l'ID textuel incorrect)
DELETE FROM profiles WHERE id = 'admin-popotte-2025';

-- Ajouter une colonne slug si elle n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'slug'
  ) THEN
    ALTER TABLE profiles ADD COLUMN slug text UNIQUE;
  END IF;
END $$;

-- Insérer le compte administrateur avec un UUID valide
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
  'popotte@admin.local',
  'Administrateur Popotte',
  'admin',
  'admin-popotte-2025',
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  slug = 'admin-popotte-2025',
  updated_at = now();

-- Note: Pour que ce compte fonctionne avec l'authentification Supabase,
-- vous devrez également créer l'utilisateur dans Supabase Auth avec ces identifiants:
-- Email: popotte@admin.local
-- Mot de passe: popottegign!