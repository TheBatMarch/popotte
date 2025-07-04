# Popotte Association

Application de gestion de commandes pour l'association Popotte.

## Configuration

### 1. Supabase

1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Allez dans Settings > API
4. Copiez votre `Project URL` et `anon public key`
5. Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://votre-projet-ref.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anonyme-ici
```

### 2. Base de données

Les migrations Supabase sont dans le dossier `supabase/migrations/`. 

Pour appliquer les migrations :
1. Installez la CLI Supabase : `npm install -g supabase`
2. Connectez-vous : `supabase login`
3. Liez votre projet : `supabase link --project-ref votre-projet-ref`
4. Appliquez les migrations : `supabase db push`

### 3. Compte administrateur

1. Lancez l'application : `npm run dev`
2. Allez sur la page de connexion
3. Créez un compte avec votre email
4. Dans Supabase, allez dans Authentication > Users
5. Modifiez votre utilisateur pour changer le rôle de 'user' à 'admin' dans la table `profiles`

## Développement

```bash
npm install
npm run dev
```

## Fonctionnalités

- 🔐 Authentification avec Supabase
- 📱 Interface mobile-first
- 🛒 Système de commandes
- 💰 Gestion des dettes
- 📰 Actualités
- 👥 Gestion des utilisateurs (admin)
- 📦 Gestion des produits et catégories (admin)
- 📊 Statistiques (admin)

## Technologies

- React + TypeScript
- Tailwind CSS
- Supabase (base de données + authentification)
- Vite