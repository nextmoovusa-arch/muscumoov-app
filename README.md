# MuscuMoov

Tableau de bord statique avec synchronisation multi-appareils via les fonctions serverless de Vercel + Neon Postgres.

## Pages

| Page | APP_KEY | Clés localStorage synchronisées |
|---|---|---|
| `index.html` (Objectifs / Liste de tâches) | `dashboard` | `goals:*`, `goal_streak_v1` |
| `health.html` (Eau + Compléments du jour) | `health` | `po_water_v1`, `stack:items`, `stack:low`, `stack:version`, `stack:taken:*` |
| `po-coach.html` (Surcharge progressive) | `po-coach` | `po_coach_v1`, `po_coach_workout_done`, `po_coach_weights`, `po_coach_photos` |

## Configuration (une seule fois)

### 1. Projet Neon
1. Crée un projet sur https://console.neon.tech
2. Ouvre l'éditeur SQL et exécute le contenu de `schema.sql`.
3. Copie la chaîne de connexion **pooled** (Connection details → Pooled connection → Show password).

### 2. Vercel
1. Importe ce dépôt comme nouveau projet Vercel.
2. Settings → Environment Variables, ajoute pour Production + Preview + Development :
   - `DATABASE_URL` = la chaîne de connexion de Neon
3. Déploie. Vercel détecte automatiquement `api/state/[key].js` comme fonction serverless.

### 3. Vérification
- Ouvre n'importe quelle page sur deux appareils. Ajoute un objectif / enregistre de l'eau / coche un complément sur l'appareil A.
- En ~2,5 s le changement apparaît sur l'appareil B.
- Si la synchro ne fonctionne pas, ouvre DevTools → Network et cherche `GET /api/state/<key>` toutes les 2,5 s.

## Fonctionnement de la synchro

1. Chaque page déclare une `APP_KEY` et une liste de motifs de clés localStorage qu'elle possède.
2. `lib/neon-sync.js` patche `localStorage.setItem` / `removeItem` — toute écriture sur une clé correspondante programme un `PUT /api/state/<APP_KEY>` débattu (~250 ms) avec le snapshot complet.
3. La page interroge `GET /api/state/<APP_KEY>` toutes les 2,5 s tant qu'elle est visible. Si l'état distant a changé, il est réappliqué dans localStorage et `onRemoteApply()` est appelé pour rafraîchir l'UI.
4. Pendant que l'utilisateur tape dans un `<input>` / `<textarea>` / `contenteditable`, l'état distant entrant est mis en file d'attente et appliqué au `focusout` — la saisie en cours n'est jamais effacée.
5. Sur `pagehide` / `beforeunload` / `visibilitychange:hidden`, toute écriture en attente est forcée avec `keepalive: true`.

## Développement local

C'est un site statique — ouvre les fichiers HTML directement avec VS Code Live Server ou n'importe quel serveur statique. La synchro nécessite le déploiement Vercel (ou `vercel dev` en local avec `DATABASE_URL` dans `.env.local`).

```bash
npm install
npx vercel dev
```

## Arborescence du projet

```
muscumoov/
├── index.html              # Objectifs / À faire
├── health.html             # Eau + Compléments
├── po-coach.html           # Coach Surcharge Progressive
├── topbar.js               # Barre de navigation persistante
├── api/
│   └── state/
│       └── [key].js        # Serverless Vercel : GET/PUT ligne app_state
├── lib/
│   └── neon-sync.js        # Client de synchro côté navigateur
├── package.json
├── vercel.json
├── schema.sql              # Définition de la table Neon
└── LICENSE.md
```

## Licence

Voir `LICENSE.md`.
