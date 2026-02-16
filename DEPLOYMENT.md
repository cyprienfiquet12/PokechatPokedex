# Déploiement en production

## Prérequis

- Node.js 18+
- Projet Supabase (Owamons) avec BDD et auth Twitch configurée
- Application Twitch (Client ID + Secret) avec l’URL de redirection de **production** configurée

## Variables d’environnement

En production, définir les variables suivantes (jamais commiter `.env.local` ou `.env.production`).

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon (publique) Supabase | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service_role (secrète, côté serveur uniquement) | `eyJhbGc...` |

En **production**, si une variable manque, l’app lèvera une erreur au démarrage ou à la première requête API.

Référence : `.env.local.example`.

## Twitch OAuth

1. [Twitch Developer Console](https://dev.twitch.tv/console) → ton application.
2. **Redirect URI** : ajouter l’URL de callback de production, ex.  
   `https://ton-domaine.com/auth/callback`
3. Supabase Dashboard → Authentication → Providers → Twitch : mêmes Client ID et Secret.

## Build et exécution

```bash
npm ci
npm run build
npm run start
```

- `npm run build` : génère `.next` (optimisé pour la prod).
- `npm run start` : sert l’app sur le port 3000 (ou `PORT` si défini).

## Déploiement sur Vercel

1. Importer le dépôt (GitHub/GitLab).
2. **Environment Variables** : ajouter les 3 variables Supabase.
3. **Build Command** : `npm run build` (défaut).
4. **Output** : Next.js (défaut).
5. Après déploiement, mettre à jour l’URL de redirection Twitch avec l’URL réelle (ex. `https://xxx.vercel.app/auth/callback`).

## Déploiement sur un VPS / Node

- Utiliser un process manager (PM2, systemd) pour lancer `npm run start`.
- Configurer un reverse proxy (Nginx, Caddy) en HTTPS vers le port de l’app.
- Définir les variables d’environnement dans l’environnement du process ou via un fichier `.env.production` (non versionné).

## Checklist avant mise en production

- [ ] Variables d’environnement renseignées sur la plateforme / le serveur
- [ ] Redirect URI Twitch mise à jour avec l’URL de prod (`https://.../auth/callback`)
- [ ] Supabase : provider Twitch configuré avec le même Client ID / Secret
- [ ] `npm run build` exécuté sans erreur
- [ ] Aucun fichier `.env*.local` ou clé `SUPABASE_SERVICE_ROLE_KEY` exposé côté client (uniquement dans des API routes / serveur)
