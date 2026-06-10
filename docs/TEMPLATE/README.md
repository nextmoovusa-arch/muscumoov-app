# App Template — design + architecture only

Squelette fork-able du design system NutriMoov'. **Aucune donnée nutrition**,
juste l'architecture et les composants.

## Démarrer

C'est statique, pas de build. Pour tester en local :

```bash
cd template/
python3 -m http.server 8000
# puis http://localhost:8000
```

Ou déploie tel quel sur Vercel : pose les 5 fichiers à la racine d'un nouveau
projet, configure Vercel Postgres dans Settings → Storage, et c'est live.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Coquille HTML + tout le CSS du design system (tokens, composants, responsive) |
| `app.js` | State + routing + NeonSync + wheel picker + ICONS + render |
| `api/state/[key].js` | Vercel serverless function pour GET/PUT du state JSON |
| `schema.sql` | Une seule table Postgres `app_state(app_key, data jsonb, updated_at)` |
| `vercel.json` | Headers de cache + routing minimal |

## Architecture en 5 minutes

### State
Tout l'état utilisateur dans un objet JS dans `localStorage`, plus
synchronisation Neon Postgres. Schéma simple :

```js
state = {
  user: { name, initials },
  items: [...],
  flags: {...},
  _ui: { selectedIds: [] },  // transient, pas persisté
}
```

Pattern : tu modifies `state.xxx`, tu appelles `commit()`, ça :
1. `localStorage.setItem(...)`
2. Queue un PUT vers `/api/state/<key>` (debounce 600ms)
3. Re-render

### Routing
Hash-based, ultra simple. Trois routes dans `ROUTES`. `navigateTo('list')`
met à jour `location.hash`, l'event `hashchange` déclenche `applyRoute()` qui :
- Affiche le panel correspondant
- Met à jour la nav du bas + sidebar (single source of truth via `_updateNavUIs`)

### Composants prêts à l'emploi (dans le CSS de `index.html`)

| Sélecteur | Usage |
|---|---|
| `.card` | Carte blanche avec border + shadow |
| `.btn-primary` | Pill noire CTA |
| `.btn-accent` | Pill verte CTA secondaire |
| `.btn-outline` | Pill outline ink |
| `.chip` / `.chip.active` | Chip de filtre / sélection |
| `.row-list > .row` | Liste de rows type catalogue/settings |
| `.hero` + `.hero-num` | Big counter avec barre progress |
| `.rings > .ring` | 3 anneaux SVG avec %age + label |
| `.modal-bg.show > .modal` | Modal bottom-sheet sur mobile / centrée sur desktop |
| `.fab` | Floating Action Button vert |
| `.actionbar` | Barre noire d'actions (selection mode) |
| `.bottom-nav` + `.sidebar` | Navigation responsive |
| Wheel picker | Composant JS dans `app.js`, voir `createWheelPicker(opts)` |

### Design tokens (à éditer pour rebrand)

Tous dans `:root` en haut de `index.html` :

```css
--primary:        #22C55E;   /* couleur de marque */
--primary-dark:   #16A34A;
--primary-soft:   #DCFCE7;   /* rares fonds soft, sinon transparent */
--ink:            #0A0A0A;
--graphite:       #4B5563;
--option-bg:      #F4F5F7;   /* gris clair des sélections / fonds neutres */
--cta-black:      #0A0A0A;   /* pill CTA secondaire */
```

Fonts :
- **Anton** pour les gros chiffres et titres (très condensé, sport)
- **Montserrat** pour le body
- **JetBrains Mono** pour les valeurs inline

### Persistence Neon

Une seule table :

```sql
create table public.app_state (
  app_key     text primary key,
  data        jsonb not null,
  updated_at  timestamptz default now()
);
```

Le client appelle `GET /api/state/<key>` au boot pour pull le state remote,
et `PUT /api/state/<key>` à chaque `commit()` (debouncé). Last-write-wins,
suffit pour 99% des cas single-user.

## Pour brancher Postgres sur Vercel

1. Vercel → projet → **Storage** → Create Database → **Postgres** (free Hobby)
2. **Connect Project** au projet en cours
3. Vercel ajoute automatiquement `POSTGRES_URL` et `DATABASE_URL` aux env vars
4. Exécute le `schema.sql` dans le query editor Neon (ou en local via psql)
5. Redéploie

## Pour adapter à une autre app

1. **Adapter le state** : remplace `state.items` par ce qui colle (clients,
   tâches, factures...). Garde le pattern `commit()` → save + sync + render.

2. **Adapter le routing** : ajoute des routes dans `ROUTES` (ex: 
   `clients`, `factures`...) + un panel `#tab-clients` dans le HTML +
   un bouton dans `.bottom-nav` + dans `.sidebar`.

3. **Réutiliser les composants** : copie-colle des `.row`, `.card`,
   `.chip` partout. Pour les chiffres, mets `.hero-num` ou `.ring`.

4. **Adapter la palette** : change les variables `--primary*` dans `:root`
   et tout suit. Si tu veux navy/orange à la place de vert, c'est 6 lignes.

5. **Ajouter une modal** : copie-colle le bloc `.modal-bg`, donne-lui un ID,
   appelle `openModal('monId')`.

6. **Wheel picker** : `createWheelPicker({ container, min, max, step,
   initial, unit, decimals, onChange })`. Marche tout seul.

## Patterns clés à conserver

### Single source of truth pour la nav active
Quand tu changes de route, met à jour `.bn-btn` ET `.sb-item` ensemble dans
`applyRoute()`. Sinon t'auras des incohérences mobile/desktop.

### Migration safe sur le state
À chaque ajout de champ dans `DEFAULT_STATE`, vérifie dans `migrate()` que
les vieilles saves sans ce champ ont un fallback. Sinon les users perdent
leur historique.

### Pas de fond vert en surface
La règle : le vert est un ACCENT (border, texte, icône, progress, FAB)
mais jamais un fond de surface (card, modal, row). Pour signaler une
sélection, utilise `var(--option-bg)` (gris clair) + border vert + texte
vert. Ça reste lisible et propre.

### CTA noire pour les actions secondaires, verte pour les primaires
Le CTA principal (Ajouter, Enregistrer, Logger) est vert. Les CTA
secondaires importants (Suivant dans un flow, Confirmer une action
neutre) sont en pill **noire** — ça reste premium et lisible.

### Transitions douces, pas trop
220ms ease-out sur les routes, sliders, modals. Au-delà ça se sent.

## Inspiration

Construit en s'inspirant de :
- **Yazio** — pour la structure Journal/macros/anneaux
- **Apple Settings** — pour le pattern row-list avec inline edit
- **iOS native** — pour le wheel picker
- **Linear / Vercel** — pour la rigueur visuelle des cards/spacing

---

Voilà. Pas plus, pas moins. Adapte et fais ton truc.
