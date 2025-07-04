/*
  # Créer le compte administrateur

  1. Nouveau compte admin
    - Email: popotte@admin.local
    - Mot de passe: popottegign!
    - Rôle: admin
    
  2. Sécurité
    - Le compte sera créé avec le rôle admin
    - Accès complet aux fonctionnalités d'administration
    
  Note: Ce compte sera créé directement dans la table profiles.
  Pour la connexion, utilisez les identifiants:
  - Email: popotte@admin.local  
  - Mot de passe: popottegign!
*/

-- Insérer le compte administrateur dans la table profiles
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
) VALUES (
  'admin-popotte-2025',
  'popotte@admin.local',
  'Administrateur Popotte',
  'admin',
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  updated_at = now();

-- Note: Pour que ce compte fonctionne avec l'authentification Supabase,
-- vous devrez également créer l'utilisateur dans Supabase Auth avec ces identifiants:
-- Email: popotte@admin.local
-- Mot de passe: popottegign!