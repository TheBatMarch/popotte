/*
  # Création du compte administrateur avec UUID valide

  1. Nettoyage
    - Suppression de tout enregistrement avec ID textuel incorrect
    - Ajout de la colonne slug pour l'identifiant textuel

  2. Création du compte admin
    - `id` : UUID généré automatiquement avec gen_random_uuid()
    - `email` : popotte@admin.local
    - `slug` : admin-popotte-2025 (identifiant textuel)
    - `role` : admin

  3. Sécurité
    - Gestion des conflits sur l'email
    - Mise à jour automatique des timestamps
*/

-- Supprimer tout enregistrement existant avec des problèmes d'UUID
DELETE FROM profiles WHERE email = 'popotte@admin.local';

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

-- Insérer le compte administrateur avec un UUID valide généré automatiquement
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  slug,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),  -- UUID généré automatiquement
  'popotte@admin.local',
  'Administrateur Popotte',
  'admin',
  'admin-popotte-2025',  -- Identifiant textuel dans la colonne slug
  now(),
  now()
);

-- Note: Pour que ce compte fonctionne avec l'authentification Supabase,
-- vous devrez également créer l'utilisateur dans Supabase Auth avec ces identifiants:
-- Email: popotte@admin.local
-- Mot de passe: popottegign!