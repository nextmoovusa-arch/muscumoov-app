# MuscuMoov

Static dashboard with cross-device sync via Vercel serverless functions + Neon Postgres.

## Pages

| Page | APP_KEY | Synced localStorage keys |
|---|---|---|
| `index.html` (Goals / To Do List) | `dashboard` | `goals:*`, `goal_streak_v1` |
| `health.html` (Water + Daily Stack) | `health` | `po_water_v1`, `stack:items`, `stack:low`, `stack:version`, `stack:taken:*` |
| `po-coach.html` (Progressive Overload) | `po-coach` | `po_coach_v1`, `po_coach_workout_done`, `po_coach_weights`, `po_coach_photos` |

## Setup (one-time)

### 1. Neon project
1. Create a project at https://console.neon.tech
2. Open SQL Editor and run the contents of `schema.sql`.
3. Copy the **pooled** connection string (Connection details → Pooled connection → Show password).

### 2. Vercel
1. Import this repo as a new Vercel project.
2. Settings → Environment Variables, add for Production + Preview + Development:
   - `DATABASE_URL` = the connection string from Neon
3. Deploy. Vercel auto-detects `api/state/[key].js` as a serverless function.

### 3. Verify
- Open any page on two devices. Add a goal / log water / mark a supplement on device A.
- Within ~2.5s the change appears on device B.
- If sync isn't working, open DevTools → Network and look for `GET /api/state/<key>` polling every 2.5s.

## How sync works

1. Each page declares an `APP_KEY` and a list of localStorage key patterns it owns.
2. `lib/neon-sync.js` monkey-patches `localStorage.setItem` / `removeItem` — any write to a matched key schedules a debounced (~250ms) `PUT /api/state/<APP_KEY>` with the full snapshot.
3. The page polls `GET /api/state/<APP_KEY>` every 2.5s while visible. If the remote state changed, it applies it back into localStorage and calls `onRemoteApply()` so the UI re-renders.
4. While the user is typing in an `<input>` / `<textarea>` / `contenteditable`, incoming remote state is queued and applied on `focusout` — live input is never wiped.
5. On `pagehide` / `beforeunload` / `visibilitychange:hidden`, any pending push is flushed with `keepalive: true`.

## Local development

This is a static site — open the HTML files directly with VS Code Live Server or any static server. Sync requires the Vercel deployment (or `vercel dev` locally with `DATABASE_URL` in `.env.local`).

```bash
npm install
npx vercel dev
```

## Project layout

```
muscumoov/
├── index.html              # Goals / To Do
├── health.html             # Water + Supplements
├── po-coach.html           # Progressive Overload Coach
├── topbar.js               # Persistent nav across pages
├── api/
│   └── state/
│       └── [key].js        # Vercel serverless: GET/PUT app_state row
├── lib/
│   └── neon-sync.js        # Browser-side sync client
├── package.json
├── vercel.json
├── schema.sql              # Neon table definition
└── LICENSE.md
```

## License

See `LICENSE.md`.
