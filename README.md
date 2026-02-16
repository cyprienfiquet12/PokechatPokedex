# Pokéchat Pokédex

Application web **Pokédex + gestion d’équipe Pokémon** pour les viewers Twitch, connectée à la base Supabase du projet Owamons.

## Fonctionnalités

- **Connexion Twitch** (OAuth via Supabase)
- **Pokédex** : liste des Pokémon avec indicateur « capturé » pour l’utilisateur connecté
- **Mon équipe** : liste des Pokémon du joueur (table `user_pokemons`, aucune modification de BDD)
- **Inventaire** : objets et quantités du joueur

## Prérequis

- Node.js 18+
- Un projet Supabase (celui d’Owamons) avec la BDD déjà en place
- Dans le **Dashboard Supabase** : activer le provider **Twitch** (Authentication → Providers) et renseigner Client ID + Secret Twitch

## Installation

```bash
npm install
cp .env.local.example .env.local
# Éditer .env.local avec NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

## Lancement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app` : pages (App Router) — accueil, `/pokedex`, `/pokedex/[id]`, `/equipe`, `/inventaire`
- `src/app/api` : routes API (sync-user, team, pokedex, inventory, my-pokemons)
- `src/components` : Header, TeamList (liste d’équipe)
- `src/contexts` : AuthContext (Twitch + app user)
- `src/lib/supabase` : clients browser, server, admin (service_role)

## Twitch OAuth

1. Créer une app sur [Twitch Developer Console](https://dev.twitch.tv/console).
2. Configurer l’URL de redirection : `https://ton-domaine.com/auth/callback` (et en dev `http://localhost:3000/auth/callback`).
3. Dans Supabase : Authentication → Providers → Twitch → Client ID et Secret.

Après connexion, le viewer est synchronisé dans `public.users` (twitch_id, username) et peut consulter son équipe, son inventaire et son Pokédex.

## Production

- **Build** : `npm run build` puis `npm run start`
- Variables d’environnement obligatoires : voir `.env.local.example`
- Guide complet : **[DEPLOYMENT.md](./DEPLOYMENT.md)** (Vercel, VPS, checklist, Twitch OAuth prod)
