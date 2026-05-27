# Refonte v2 — Module Nutrition

## Système de design (repris de VarsityPath / NEXTMOOV USA)

### Police
- Inter (300/400/500/600/700/800) — via Google Fonts
- JetBrains Mono pour les chiffres / stats
- Import : `@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap");`

### Thème : CLAIR
- Fond body :
  `radial-gradient(circle at top left, rgba(0,7,105,0.12), transparent 34rem),
   linear-gradient(180deg, #ffffff 0%, #F7F8FB 46%, #f0f1f5 100%)`
- Texte principal `--ink #050505`, secondaire `--graphite #4B5563`, tertiaire `--stone #9CA3AF`

### Palette
| Token        | Valeur     | Usage                         |
|--------------|------------|-------------------------------|
| navy         | #000769    | primaire, boutons, accents    |
| navy-50      | #F2F4FF    | fonds doux                    |
| navy-100     | #E6E9FF    | fonds doux hover              |
| red-flag     | #BF0A30    | accent/alerte                 |
| ink          | #050505    | texte                         |
| graphite     | #4B5563    | texte secondaire              |
| stone        | #9CA3AF    | texte tertiaire               |
| paper        | #F7F8FB    | fond panneau                  |
| line         | #E5E7EB    | bordures                      |

Macros (couleurs dédiées, cohérentes avec les graphes) :
- Calories : navy #000769
- Protéines : #2563EB (bleu)
- Glucides  : #F59E0B (ambre)
- Lipides   : #BF0A30 (rouge)

### Cartes
- Fond blanc, bordure `1px solid rgba(0,7,105,0.12)`
- Ombre `0 18px 60px rgba(0,7,105,0.08)`
- Radius 16px, padding généreux (20-24px)

### Boutons
- Primaire : fond navy, texte blanc, radius 8px, hauteur 38-40px, `box-shadow` léger
- Outline  : bordure `--line`, fond blanc, texte graphite
- Ghost    : transparent, hover fond paper

### Badges / chips
- Pilule (radius full), fond doux coloré : vert `#ECFDF5/#047857`, ambre `#FFFBEB/#B45309`,
  bleu `#EFF6FF/#1D4ED8`, navy `#F2F4FF/#000769`

### Style général
- AÉRÉ : beaucoup d'espace blanc, sections bien séparées, pas de surcharge
- Simple à comprendre pour un athlète : labels clairs, gros chiffres, peu de jargon

## Structure : application à ONGLETS

Barre d'onglets en haut (sous le topbar) :

1. **Tableau de bord** (défaut)
2. **Aliments & Repas**
3. **Ma semaine**
4. **Liste de courses**

### Onglet 1 — Tableau de bord
- **Carte profil** en haut : nom/prénom, sport, université, âge, poste — tout affiché ici
  (modifiable via un bouton « Modifier »)
- **2 sliders directement sur le tableau de bord** :
  - Slider POIDS (40-150 kg, pas 0.5)
  - Slider TAILLE (150-220 cm, pas 1)
  - Chaque slider montre la valeur en gros + met à jour les macros instantanément
  - IMC calculé et affiché à côté
- **Graphiques** (style des captures fournies) :
  - DONUT : répartition des macros du jour (prot/gluc/lip)
  - AIRE : évolution du poids (gradient sous la courbe, 7j/30j)
  - BARRES groupées : calories prévues vs consommées sur 7 jours
- **Cartes stats** : calories du jour (consommé/objectif), 3 mini-cartes macros
- **Repas du jour** : liste simple des repas loggés aujourd'hui
- ⚠️ PAS de section « objectifs » (prise de masse / sèche / maintien) — SUPPRIMÉE
- La charge d'entraînement reste (Repos / 1 / 2 / Match / Tournoi) mais discrète

### Onglet 2 — Aliments & Repas
- Sous-onglets ou filtres : Combos repas | Aliments
- Combos : 60 cartes, clic → fiche repas (macros / ingrédients adaptés / recette)
- Aliments : 168 cartes par catégorie, clic → fiche aliment
  - **CHAQUE FICHE ALIMENT contient maintenant une RECETTE** (champ `recipe` ajouté à foods-db.js)
- Recherche

### Onglet 3 — Ma semaine
- Grille 7 jours (Lun→Dim) × 4 créneaux (Petit-déj / Déj / Dîner / Snack)
- Clic sur une case vide → choisir un combo repas
- Affiche le total calorique prévu par jour
- Bouton « Vider la semaine »
- Persisté dans le state (clé `weekPlan`)

### Onglet 4 — Liste de courses
- Générée automatiquement à partir de « Ma semaine »
- Agrège tous les ingrédients des combos planifiés, additionne les quantités
  (quantités adaptées au profil via NutritionEngine.scaleMeal)
- Groupée par catégorie d'aliment
- Cases à cocher (barrer ce qu'on a acheté)
- Bouton « Régénérer » et « Exporter »

## Graphiques — style attendu
- SVG inline, pas de librairie externe
- AIRE : courbe lissée + remplissage dégradé vertical (couleur → transparent)
- DONUT : anneau épais, segments macro, trou central avec total au centre
- BARRES : barres groupées par jour, coins arrondis, 2 séries (prévu gris / réel coloré)
- Grille horizontale discrète, axes légers, typo mono pour les valeurs

## Conserve absolument
- Le moteur `NutritionEngine` (lib/nutrition-engine.js) et ses calculs
- Les bases `FOODS_DB` / `MEALS_DB`
- `lib/data-adapter.js`, `lib/neon-sync.js`
- La persistance NeonSync (clé `nutrition`)
- Le tutoiement, le français

## Persistance — nouveau state
```js
const DEFAULT_STATE = {
  profile: { firstName, lastName, age, sex, sport, position, university, schoolYear,
             weightKg: 75, heightCm: 178, bodyFatPct, muscleMassPct, targetWeightKg },
  today: { date, trainingLoad: 'one_session', meals: [] },
  history: { weight: [], meals: {} },
  weekPlan: {},      // { 'mon': {breakfast: mealId, lunch: mealId, ...}, 'tue': {...}, ... }
  shoppingChecked: {} // { ingredientKey: true }
};
```
