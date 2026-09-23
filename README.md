# Portfolio — Manassé N'dri N'guessan

Portfolio de développeur fullstack, avec back-office intégré et synchronisation automatique des projets GitHub.

**Stack** : Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion · MongoDB (optionnel) · Zod · JWT (jose)

## Fonctionnalités

- **Site public** : hero avec terminal animé (derniers dépôts poussés en direct), chiffres clés, à propos, services, compétences, projets filtrables, archive de tous les dépôts avec recherche, parcours (timeline), formulaire de contact, thème clair / sombre et palette de commandes (`⌘K` / `Ctrl+K`).
- **Pages projet** (`/projets/[slug]`) : description, liens démo / code, répartition des langages et README GitHub rendu en Markdown (les README générés par les outils sont masqués automatiquement).
- **Synchronisation GitHub** : les N dépôts publics les plus récents s'affichent automatiquement, avec un rafraîchissement toutes les heures (ISR). Un nouveau dépôt apparaît donc sans aucune action. Depuis l'admin, on peut épingler, masquer, mettre à la une, réécrire le titre, le résumé et la description, ou ajouter une image. Un instantané sert de secours si l'API GitHub ne répond pas.
- **Back-office** (`/admin`) : profil, services, compétences, expériences, formation, projets GitHub, projets manuels, messages reçus et paramètres (SEO, GitHub). Chaque enregistrement régénère le site immédiatement.
- **Sécurité** : session JWT en cookie httpOnly/SameSite=strict, mot de passe comparé à temps constant, limitation des tentatives de connexion et d'envoi de messages, validation Zod de toutes les écritures, liens `javascript:` refusés, Markdown rendu sans HTML brut, en-têtes de sécurité.

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis renseigner ADMIN_PASSWORD et AUTH_SECRET
npm run dev
```

- Site : http://localhost:3000
- Admin : http://localhost:3000/admin

## Où vit le contenu ?

| Mode | Condition | Comportement |
|---|---|---|
| Fichier local | `MONGODB_URI` absent | Lecture et écriture dans `data/content.json`. Committez ce fichier pour publier vos modifications. En production sans base, le site est en lecture seule. |
| MongoDB | `MONGODB_URI` défini | Contenu et messages stockés en base : tout est éditable en ligne. Au premier lancement, la base est initialisée depuis `data/content.json`. |

## Déploiement (Vercel)

1. Importer le dépôt sur Vercel.
2. Variables d'environnement : `ADMIN_PASSWORD`, `AUTH_SECRET` (`openssl rand -base64 48`), `MONGODB_URI` (MongoDB Atlas, offre gratuite) et, en option, `GITHUB_TOKEN` (token sans scope, relève la limite de l'API).
3. Pour recevoir un e-mail à chaque message : `RESEND_API_KEY` (+ `CONTACT_TO_EMAIL`).
4. Dans l'admin → Paramètres, renseigner l'URL publique : elle active le sitemap et les métadonnées Open Graph.

## Structure

```
data/content.json        contenu initial / stockage local
src/app/                 pages, routes API, proxy d'authentification
src/components/site/     sections du site public
src/components/admin/    back-office (éditeurs génériques, gestionnaire GitHub, messagerie)
src/lib/                 store (fichier/MongoDB), GitHub, auth, schémas de validation
```

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run lint` · `npm run typecheck`
