# NutriMoov' — Architecture & Design System

Guide complet pour porter le design / l'archi vers une autre app.

## 1. Architecture globale

App **single-page** statique servie par Vercel + **API serverless** pour la persistance cross-device.

```
muscumoov/
├── index.html              ← 12 000 lignes : tout le HTML/CSS/JS inline
├── lib/
│   ├── foods-db.js         ← BDD aliments (window.FOODS_DB array, ~288 items)
│   ├── meals-db.js         ← BDD plats (window.MEALS_DB array, ~60 combos)
│   ├── nutrition-engine.js ← Math : calcul macros cibles, ajustements
│   ├── data-adapter.js     ← Pont entre engine et UI (flatten shapes)
│   └── neon-sync.js        ← Sync localStorage ↔ Neon Postgres
├── api/
│   └── state/[key].js      ← Vercel serverless function GET/PUT JSON state
├── schema.sql              ← Neon: une table `app_state(app_key, data jsonb, updated_at)`
├── vercel.json             ← Headers de cache uniquement
└── package.json            ← Dépend juste de @neondatabase/serverless
```

### Pourquoi cette stack ?
- **Zéro build step** : tu modifies, tu commit, Vercel sert
- **Zéro framework** : que du JS vanilla → 0 dette, 0 dépendances qui pourrissent
- **Sync gratuite** : Neon Postgres free tier suffit pour 1 jsonb par utilisateur
- **Déploiement instant** : push → live en 30s

## 2. Design System

### Palette (CSS variables, dans `:root`)
```css
:root {
  /* Brand */
  --primary:        #22C55E;   /* vert vif — CTA, sélection, progress */
  --primary-dark:   #16A34A;
  --primary-soft:   #DCFCE7;   /* RARE — chip soft sur fond blanc */

  /* Surfaces */
  --paper:          #FFFFFF;   /* fond body */
  --card:           #FFFFFF;
  --option-bg:      #F4F5F7;   /* gris très clair pour rows inactives */
  --line:           #E5E7EB;   /* dividers + borders */

  /* Texte */
  --ink:            #0A0A0A;   /* titres + valeurs */
  --graphite:       #4B5563;   /* labels secondaires */
  --stone:          #9CA3AF;   /* tertiaire, placeholders */

  /* Macros (légende stable) */
  --c-kcal:         #22C55E;
  --c-prot:         #3B82F6;
  --c-carb:         #F472B6;
  --c-fat:          #FB923C;

  /* Sémantique */
  --gold:           #F5C518;
  --warn:           #F59E0B;
  --bad:            #DC2626;
  --cta-black:      #0A0A0A;   /* pill CTA noir secondaire */
}
```

### Typographie
```css
@import url("https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap");

--font:    'Montserrat', sans-serif;     /* body */
--display: 'Anton', 'Impact', sans-serif; /* gros chiffres + titres */
--mono:    'JetBrains Mono', monospace;   /* valeurs inline */
```

**Règle d'or** :
- Texte courant = Montserrat 500
- Titres / boutons = Montserrat 700-800
- Gros chiffres (kcal hero, valeurs wheel, BMI, day-target) = **Anton** (très condensé, sport)
- Chiffres inline dans des rows = JetBrains Mono

### Backgrounds
- **Body** : `#FFFFFF` pur, pas de gradient
- **Cards** : `#FFFFFF` avec `border: 1px solid var(--line)`, radius 16, shadow `0 4px 18px rgba(19,26,46,0.06)`
- **Selection states** : fond `var(--option-bg)` + **border vert** + **texte vert**. Jamais de fond vert clair en remplissage de surface.

## 3. State management

Tout l'état est dans un seul objet `state` persisté dans `localStorage` (clé `nutrition_v1`) ET synchronisé via Neon.

```js
const DEFAULT_STATE = {
  profile: {
    firstName: '', lastName: '',
    age: null, sex: 'm',
    sport: 'soccer', position: '',
    university: '', schoolYear: '',
    weightKg: 75, heightCm: 178,
    bodyFatPct: null, muscleMassPct: null,
    targetWeightKg: null, goal: 'maintain', // 'lose'|'maintain'|'gain'|'fit'
  },
  today: {
    date: '2026-06-10',
    trainingLoad: 'one_session',
    meals: [], // [{id, foodId|mealId, name, slot, kcal, protein, carbs, fat, portionG, time}]
  },
  history: {
    weight: [],  // [{date, weightKg}]
    meals: {},   // {date: [...meal entries]}
  },
  weekSchedule: {
    mon: { load: 'one_session', timesOfDay: ['midday'],
           locked: {breakfast: null, lunch: null, dinner: null, snack: null},
           suggestionIndex: {} },
    // ... tue → sun
  },
  favorites: { foods: [], meals: [] },
  dislikes: { foods: [], meals: [] },
  ratings: { foods: {}, meals: {} },  // id → 1..5
  customFoods: [], customMeals: [],
  customShopping: [], shoppingChecked: {},
  flags: { promoSeen: false, weightInitialized: false, ... },
};
```

### Commit + render pattern
```js
function commit() {
  try { localStorage.setItem('nutrition_v1', JSON.stringify(saveable(state))); } catch {}
  NeonSync && NeonSync.queueSave('nutrition_v1', saveable(state));
  invalidateSuggestions();  // bust caches
  render();                  // re-paint UI
}
```

### Migration safety
Quand tu ajoutes un nouveau champ, mets un defaut dans `migrate()` pour pas casser les vieilles saves :
```js
function migrate(loaded) {
  const s = JSON.parse(JSON.stringify(DEFAULT_STATE));
  // deep-merge loaded onto fresh defaults
  Object.assign(s.profile, loaded.profile || {});
  if (loaded.profile && !loaded.profile.goal) s.profile.goal = 'maintain';
  // ... pour chaque nouveau champ, fallback à default
  return s;
}
```

## 4. Routing (hash-based)

```js
const ROUTES = {
  journal:     { id: 'tab-dashboard', title: 'Journal' },
  courses:     { id: 'tab-shopping',  title: 'Courses' },
  moi:         { id: 'tab-profile',   title: 'Suivi'   },
  plats:       { id: 'tab-browse',    title: 'Plats'   },   // drill-down
  semaine:     { id: 'tab-week',      title: 'Ma semaine' },
  aliment:     { id: 'tab-food-detail', title: '' },         // #/aliment/{id}
  repas:       { id: 'tab-meal-detail', title: '' },         // #/repas/{id}
  progres:     { id: 'tab-progres',   title: 'Progrès' },
  composition: { id: 'tab-composition', title: 'Composition' },
};

function navigateTo(routeId, param) {
  const hash = param ? `#/${routeId}/${param}` : `#/${routeId}`;
  history.pushState(null, '', hash);
  applyRoute();
}

window.addEventListener('hashchange', applyRoute);

function applyRoute() {
  const { id, param } = routeFromHash();
  // hide all panels, show the active one with slide/fade transition
  // update bottom nav + sidebar active state via _updateNavUIs(id)
}
```

## 5. Components réutilisables

### A. Wheel picker iOS-style
Roue verticale qui scroll, valeur centrale = sélection, fade en haut/bas, snap au step.
```js
createWheelPicker({
  container, min, max, step, initial, unit, decimals,
  onChange: v => { state.profile.weightKg = v; commit(); },
});
```
- Drag pointer = update `transform: translateY()` en live
- Snap à pointerup avec `transition: transform 180ms cubic-bezier(0.22,1,0.36,1)`
- Wheel mouse + clavier (←→/PageUp-Down/Home/End)
- Big number Anton au-dessus = tap → ouvre modal numérique pour saisie directe
- Init centré sur **dernière valeur loggée** (pas le default) pour économiser le scroll

### B. Ring chart macros (3 anneaux)
SVG inline, 100-120px, stroke 12px :
```html
<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="42" stroke="var(--option-bg)" stroke-width="12" fill="none"/>
  <circle cx="50" cy="50" r="42" stroke="var(--c-prot)" stroke-width="12" fill="none"
          stroke-dasharray="264" stroke-dashoffset="{264*(1-pct/100)}"
          transform="rotate(-90 50 50)" stroke-linecap="round"/>
  <text x="50" y="46" text-anchor="middle" font-family="Anton" font-size="22">{pct}</text>
  <text x="50" y="62" text-anchor="middle" font-size="9">PROTÉINES</text>
</svg>
```

### C. List row (catalogue / settings)
```html
<div class="row">
  <div class="row-thumb"><img src="..." onerror="..."/></div>
  <div class="row-body">
    <div class="row-title">Titre</div>
    <div class="row-meta">Sous-info</div>
  </div>
  <button class="row-action">+</button>
</div>
```
```css
.row { display:flex; align-items:center; gap:12px; padding:12px 14px; }
.row + .row { border-top: 1px solid var(--line); }
.row-thumb { width:56px; height:56px; border-radius:10px; background:var(--option-bg); }
.row-title { font-weight:800; font-size:15px; color:var(--ink); }
.row-meta  { font-family:var(--mono); font-size:12px; color:var(--graphite); }
```

### D. Hero kcal banner (Journal)
```html
<div class="hero">
  <div class="hero-text">
    Vous pouvez encore manger
    <span class="hero-num">{remaining}</span>
    Calories
  </div>
  <div class="hero-bar"><div class="hero-bar-fill" style="width:{pct}%"></div></div>
  <div class="hero-meta">
    <span class="hero-consumed">{consumed} calories absorbées</span>
    <span class="hero-target">Objectif: {target}</span>
  </div>
</div>
```
```css
.hero-num     { font-family: var(--display); font-size: 64px; color: var(--primary); }
.hero-bar     { height: 4px; background: var(--option-bg); border-radius: 2px; }
.hero-bar-fill { height:100%; background: var(--primary); border-radius:2px; }
```

### E. Bottom nav (mobile) + Sidebar (desktop)
Toujours synchronisés via `_updateNavUIs(routeId)`. Single source of truth.
- Mobile : `position: fixed; bottom: 0` avec safe-area inset
- Desktop : `position: fixed; left: 0; width: 240px`
- Active = stroke vert + label vert (PAS de fond vert)

### F. Bottom action bar (selection mode)
Black pill, 5 actions horizontales. Apparaît quand `state._ui.selectedIds.length > 0`.
- Pattern : `Pas mangé / Dupliquer / Repas / Vers la liste / Supprimer (rouge)`
- Cache FAB + bottom nav le temps de la sélection

## 6. Persistence (Neon)

### Côté serveur (Vercel function)
```js
// api/state/[key].js
const { neon } = require('@neondatabase/serverless');
const ALLOWED_KEYS = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const key = String(req.query.key || '').toLowerCase();
  if (!ALLOWED_KEYS.test(key)) return send(res, 400, { error: 'invalid key' });
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    const rows = await sql`select data, updated_at from public.app_state where app_key = ${key}`;
    return send(res, 200, rows[0] || null);
  }
  if (req.method === 'PUT') {
    const body = req.body || {};
    await sql`insert into public.app_state (app_key, data) values (${key}, ${body})
              on conflict (app_key) do update set data = excluded.data, updated_at = now()`;
    return send(res, 200, { ok: true });
  }
  return send(res, 405, { error: 'method not allowed' });
};
```

### Schema SQL
```sql
create table if not exists public.app_state (
  app_key     text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);
```

### Côté client (NeonSync simplifié)
```js
const NeonSync = {
  appKey: 'nutrition_v1',
  queueSave(key, data) {
    // debounce 600ms, then PUT /api/state/<key>
    clearTimeout(this._t);
    this._t = setTimeout(() => fetch(`/api/state/${key}`, {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    }).catch(()=>{}), 600);
  },
  async pull(key) {
    const r = await fetch(`/api/state/${key}`);
    return r.ok ? r.json() : null;
  },
};
```

## 7. Moteur de calcul (NutritionEngine pattern)

Pur module, zero DOM, zero side effect. Bien découplé de l'UI :
```js
window.NutritionEngine = (function () {
  const TRAINING_LOAD_MULTIPLIER = {
    rest: 0.85, one_session: 1.00, two_sessions: 1.20,
    match: 1.25, tournament: 1.35,
  };
  const GOAL_KCAL_DELTA = {
    lose: -300, maintain: 0, gain: 375, fit: 0,
  };

  function computeTargets(profile) {
    const w = profile.weightKg || 75;
    const loadMul = TRAINING_LOAD_MULTIPLIER[profile.trainingLoad] || 1;
    const goalDelta = GOAL_KCAL_DELTA[profile.goal] || 0;
    const kcal = Math.round(w * 42 * loadMul) + goalDelta;
    const protein = Math.round(w * 1.9 * loadMul);
    // ...
    return { kcal, protein, carbs, fat };
  }
  return { computeTargets, /* ... */ };
})();
```

## 8. Patterns clés à porter

### Hash routing avec transitions
- Bottom nav + sidebar dispatchent via `navigateTo('id')` qui met à jour `location.hash`
- `applyRoute()` lit `routeFromHash()`, affiche le panel correspondant avec un `transform: translateX()` (mobile) ou un fade `opacity + translateY(8px)` (desktop)

### Mobile / desktop responsive
- Une seule media query principale `@media (min-width: 900px)` qui :
  - Cache `.bottom-nav`
  - Affiche `.sidebar`
  - Pousse `.content { margin-left: 240px }`
  - Grilles 1-col → 2-col où ça a du sens (Suivi, fiche aliment, courses)

### Selection mode
- Long-press OU tap sur un check d'item = entre en mode sélection
- Header swap : titre → "Tout sélectionner" + "Annuler"
- Bottom action bar noire apparaît avec 5 actions contextuelles
- FAB + bottom nav cachés tant qu'au moins 1 item est sélectionné

### Suggestion engine (variety-aware)
- Cache `_suggestCache` keyé par `(load|slot|recentFingerprint)`
- Recompute uniquement quand `commit()` → `invalidateSuggestions()`
- Pénalité -120 sur items récents pour éviter les répétitions sur 3 jours glissants
- Boosts : +100 favori, +30 objectif match, -10 dislike ingredient

## 9. Stack & déploiement

| Élément | Choix |
|---|---|
| Hosting | Vercel (statique + 1 function serverless) |
| DB | Neon Postgres (free tier 0.5 GB suffit) |
| Sync | Polling + debounce 600ms, conflit "last-write-wins" |
| Fonts | Google Fonts CDN (Anton + Montserrat + JetBrains Mono) |
| Images | TheMealDB ingredients (free, no key) + Unsplash direct URLs (curated) |
| Build | Aucun (fichiers servis tels quels) |
| Branche | `claude/setup-muscumoov-vercel-6KOqC` (push = redeploy) |

## 10. Checklist pour porter

Pour adapter à une autre app :
1. Reprendre `lib/foods-db.js` shape comme **schéma type catalogue** (id, name, category, macros, image, recipe)
2. Reprendre **NutritionEngine** pattern comme couche math pure
3. Reprendre **data-adapter** comme bridge entre engine et UI (flattening / shape normalization)
4. Reprendre **NeonSync** quasi tel quel (juste changer `appKey`)
5. Garder la palette + fonts (Anton + Montserrat + JetBrains Mono = look sport propre)
6. Garder le hash routing + bottom nav / sidebar pattern
7. Garder le composant **wheel picker** (très réutilisable pour tout input numérique de range)
8. Garder le composant **ring chart** (réutilisable pour toute %age tri-couleurs)

---

**Tu pourras récupérer ce fichier dans `muscumoov/docs/ARCHITECTURE.md` après push.**
