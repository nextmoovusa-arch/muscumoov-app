# Cahier des charges — Module Nutrition Athlètes Universitaires

Version 1.0 — Cible : campus US (NCAA, CCCAA, lycéens, sportifs amateurs)

## 1. Objectif

Plateforme intégrée à muscumoov pour suivre automatiquement les besoins
nutritionnels d'un athlète, son évolution corporelle, et son alimentation
quotidienne (focus aliments disponibles sur campus américain).

## 2. Profil athlète

### Identité
- Nom, prénom, âge, sexe, sport, poste, université, année scolaire

### Biométrie (mise à jour régulière)
- Taille (cm), poids (kg), masse grasse (%), masse musculaire (%)
- Tour de bras, tour de taille, IMC, poids cible
- Fréquences : poids quotidien (min 2x/sem), taille mensuelle, composition hebdo
- Historique conservé

## 3. Moteur de calcul nutritionnel

### Formules de base
- Protéines : 1.6–2.2 g/kg
- Lipides   : 0.8–1.2 g/kg
- Glucides  : 4–7 g/kg
- Calories  : 35–50 kcal/kg

### Exemple (90 kg)
- Protéines : 144–198 g
- Lipides   : 72–108 g
- Glucides  : 360–630 g
- Calories  : 3150–4500 kcal

## 4. Ajustements automatiques

### Charge d'entraînement
- Repos            : -15 %
- 1 entraînement   : base
- 2 entraînements  : +20 %
- Match            : +25 %
- Tournoi          : +35 %

### Objectif
- Prise de masse : +250 à +500 kcal
- Sèche          : -300 kcal
- Maintien       : 0

### Sport
- Football américain : protéines ++
- Soccer             : glucides ++
- Basket             : glucides +
- Baseball           : standard
- Natation           : glucides +++

## 5. Base de données aliments

Cible v1 : ~150 aliments style campus US, organisés par catégorie.

### Catégories
1. **Petit-déjeuner** : œufs brouillés, omelette, bacon, saucisses, hash browns,
   pancakes, gaufres, French toast, bagels, muffins, donuts, croissants,
   céréales, granola, yaourt, fruits frais, oatmeal, breakfast burrito,
   breakfast sandwich, toast avocat, biscuits & gravy, smoothies
2. **Burgers / grill** : cheeseburger, hamburger, bacon burger, chicken burger,
   turkey burger, veggie burger, impossible burger, hot-dog, chili dog,
   corn dog, frites, onion rings, chicken tenders, mozzarella sticks
3. **Pizza** : pepperoni, cheese, hawaiian, meat lovers, BBQ chicken, veggie,
   white, calzone, stromboli
4. **Sandwiches / deli** : turkey, ham, club, BLT, grilled cheese, tuna melt,
   philly cheesesteak, panini, wraps, subs, reuben, chicken Caesar wrap
5. **Salades / healthy** : Caesar, Greek, Cobb, garden, quinoa bowl, rice bowl,
   poke bowl, buddha bowl, grain bowl, salade de pâtes, thon, fruits
6. **Cuisine mexicaine** : burrito, taco, quesadilla, nachos, enchilada,
   fajitas, rice & beans, chips & salsa, guacamole, carnitas
7. **Cuisine asiatique** : riz frit, nouilles sautées, lo mein, Pad Thai, ramen,
   udon, sushi, California rolls, teriyaki chicken, orange chicken,
   General Tso, dumplings, egg rolls, bibimbap, Korean BBQ, pho, curry thaï,
   banh mi
8. **Cuisine italienne** : spaghetti, lasagnes, Alfredo pasta, penne vodka,
   mac & cheese, ravioli, meatballs, garlic bread
9. **Comfort food US** : mac and cheese, meatloaf, fried chicken, mashed
   potatoes, gravy, pulled pork, BBQ ribs, chili, chicken pot pie
10. **International** : curry indien, butter chicken, tikka masala, riz basmati,
    falafel, shawarma, gyro, hummus, couscous, jerk chicken, empanadas
11. **Végé/Vegan** : tofu grillé, tempeh, lentilles, vegan burger, vegan pizza,
    salades vegan, plant-based nuggets, vegan burrito, soupes vegan
12. **Desserts** : cookies, brownies, ice cream, cheesecake, cupcakes,
    apple pie, chocolate cake, banana pudding, Rice Krispie treats
13. **Snacks** : chips, popcorn, barres protéinées, trail mix, pretzels,
    crackers, fruits, bonbons, beef jerky
14. **Boissons** : café, espresso, latte, cappuccino, thé, chocolat chaud,
    soda, lemonade, jus, smoothies, milkshakes, boissons énergétiques

### Données par aliment (par 100 g sauf indication)
- nom, catégorie
- portion type (g)
- calories (kcal)
- protéines (g), glucides (g), lipides (g)
- fibres (g), sucres (g), sodium (mg)
- calcium (mg), fer (mg), potassium (mg), vitamine D (UI)
- allergènes (array), tags (végétarien, vegan, halal, sans-gluten)

### Valeurs nutritionnelles de référence (pour 100 g)

| Aliment          | kcal | Prot | Lip | Gluc | Note                       |
|------------------|-----:|-----:|----:|-----:|----------------------------|
| Œufs brouillés   |  148 |   10 |  11 |    2 | Riche prot, B12            |
| Bacon            |  541 |   37 |  42 |    1 | Très sodé                  |
| Saucisses        |  300 |   13 |  27 |    2 | Lipides élevés             |
| Pancakes         |  227 |    6 |  10 |   28 | Glucides ++                |
| Gaufres          |  291 |    8 |  14 |   33 | Souvent sucrées            |
| Bagel            |  257 |   10 | 1.5 |   53 | Énergie rapide             |
| Yaourt grec      |   97 |   10 |   4 |    4 | Calcium ++                 |
| Cheeseburger     |  295 |   17 |  14 |   30 | Variable garniture         |
| Hamburger        |  250 |   15 |  11 |   28 | Mixte prot/gluc            |
| Chicken burger   |  240 |   17 |  10 |   20 | Plus maigre                |
| Frites           |  312 |    3 |  15 |   41 | Amidon ++                  |
| Onion rings      |  411 |    5 |  22 |   48 | Friture ++                 |
| Chicken tenders  |  296 |   17 |  18 |   16 | Fréquent campus            |
| Pizza pepperoni  |  300 |   13 |  13 |   33 | Sodium ++                  |
| Pizza fromage    |  266 |   11 |  10 |   33 | Calcium                    |
| Turkey sandwich  |  220 |   18 |   6 |   25 | Plus maigre                |
| Club sandwich    |  260 |   15 |  12 |   23 | Bacon souvent              |
| Grilled cheese   |  291 |   12 |  16 |   27 | Gras saturés ++            |
| Caesar salad     |  190 |    7 |  15 |    8 | Sauce calorique            |
| Cobb salad       |  220 |   14 |  16 |    7 | Œufs + fromage             |
| Rice bowl        |  140 |    4 |   1 |   30 | Base glucidique            |
| Poke bowl        |  160 |   14 |   4 |   18 | Oméga-3 ++                 |
| Burrito          |  210 |    9 |   7 |   28 | Dépend garniture           |
| Taco             |  226 |   11 |  13 |   18 | Viande variable            |
| Quesadilla       |  290 |   13 |  17 |   22 | Fromage ++                 |
| Sushi            |  143 |    7 |   1 |   28 | Peu gras                   |
| Ramen            |  188 |    6 |   7 |   25 | Sodium ++                  |
| Pad Thai         |  190 |    8 |   8 |   22 | Sauce sucrée               |
| Teriyaki chicken |  190 |   19 |   6 |   15 | Bonne prot                 |
| Mac & cheese     |  164 |    7 |   7 |   18 | Comfort food               |
| Lasagnes         |  132 |    8 |   6 |   12 | Dépend viande              |
| Fried chicken    |  320 |   25 |  20 |    8 | Panure + friture           |
| Pulled pork      |  250 |   24 |  16 |    3 | Protéines ++               |
| Butter chicken   |  230 |   15 |  15 |    7 | Sauce crémeuse             |
| Falafel          |  333 |   13 |  18 |   31 | Fibres ++                  |
| Shawarma         |  220 |   19 |  13 |    8 | Variable                   |
| Hummus           |  166 |    8 |  10 |   14 | Fibres                     |
| Tofu             |   76 |    8 |   4 |    2 | Faible calorie             |
| Vegan burger     |  180 |   17 |   6 |   15 | Variable marque            |
| Cookies          |  488 |    5 |  24 |   65 | Très énergétique           |
| Brownies         |  466 |    5 |  24 |   60 | Sucre ++                   |
| Ice cream        |  207 |  3.5 |  11 |   24 | Sucre + gras               |
| Café noir        |    2 |    0 |   0 |    0 | Quasi nul                  |
| Smoothie fruits  |   85 |    1 | 0.5 |   20 | Sucres naturels            |
| Milkshake        |  112 |  3.5 |   3 |   18 | Densité calorique          |

(Pour les ~100 autres aliments à inclure : estimer à partir de tables nutritionnelles standard USDA / Ciqual.)

## 6. Combos repas (60 fiches v1)

Chaque combo a : nom, type (petit-déj/déj/dîner/snack), composition ingrédients,
macros totaux, objectif (Performance / Endurance / Maintien / Prise de masse /
Récupération / Sèche / Match / Vegan / etc.), **recette cuisinable**.

### Petit-déjeuners (15)

| # | Nom                    | Compo                                         | kcal | Prot | Gluc | Lip | Objectif       |
|---|------------------------|-----------------------------------------------|-----:|-----:|-----:|----:|----------------|
| 1 | Breakfast Performance  | Œufs + bagel + yaourt grec + banane           |  780 |   45 |   82 |  28 | Performance    |
| 2 | Campus Soccer Fuel     | Oatmeal + granola + fruits + smoothie + œufs  |  850 |   38 |  110 |  26 | Endurance      |
| 3 | Lean Athlete Morning   | Omelette légumes + toast avocat + fruits      |  650 |   35 |   50 |  30 | Maintien       |
| 4 | Mass Gain Breakfast    | Pancakes + bacon + œufs + smoothie            | 1050 |   48 |  115 |  42 | Prise de masse |
| 5 | Recovery Breakfast     | Breakfast burrito + yaourt grec + fruits      |  900 |   52 |   85 |  35 | Récupération   |
| 6 | Fast Campus Combo      | Breakfast sandwich + hash browns + smoothie   |  880 |   40 |   92 |  38 | Énergie rapide |
| 7 | Protein Stack          | Omelette + bagel + barres protéinées + fruits |  930 |   65 |   85 |  30 | Hautes prot    |
| 8 | Basketball Morning     | French toast + saucisses + yaourt + fruits    |  950 |   42 |  105 |  38 | Match/training |
| 9 | Healthy Bowl Breakfast | Yaourt + granola + fruits + oatmeal           |  620 |   28 |   88 |  18 | Léger          |
|10 | Campus Bulk Meal       | Breakfast burrito + pancakes + smoothie       | 1200 |   55 |  140 |  42 | Grosse dépense |
|11 | Vegan Athlete Breakfast| Tofu grillé + oatmeal + fruits + smoothie     |  710 |   32 |   95 |  20 | Vegan          |
|12 | High Carb Match Day    | Bagel + pancakes + fruits + jus + œufs        |  980 |   35 |  145 |  25 | Jour de match  |
|13 | Cutting Breakfast      | Omelette blancs d'œufs + yaourt + fruits      |  520 |   50 |   35 |  15 | Sèche          |
|14 | Classic American Campus| Donut + bacon + œufs + café                   |  760 |   28 |   65 |  40 | Occasionnel    |
|15 | Heavy Training Breakfast| Gaufres + saucisses + smoothie + yaourt grec |1100 |   50 |  125 |  42 | Training ++    |

### Déjeuners (15)

| # | Nom            | Compo                                            | kcal | Prot | Gluc | Lip | Objectif      |
|---|----------------|--------------------------------------------------|-----:|-----:|-----:|----:|---------------|
| 1 | Chicken Bowl   | Riz + poulet + avocat + légumes                  |  780 |   52 |   75 |  24 | Équilibre     |
| 2 | Power Burrito  | Tortilla + poulet + riz + haricots + guacamole   |  920 |   48 |   90 |  32 | Performance   |
| 3 | Pasta Beef     | Pâtes + steak maigre + sauce tomate              |  890 |   55 |   95 |  22 | Masse         |
| 4 | Turkey Rice    | Dinde + riz basmati + légumes                    |  720 |   50 |   72 |  14 | Lean          |
| 5 | Campus Burger  | Cheeseburger + potatoes + fruit                  |  980 |   42 |   88 |  40 | Dépense ++    |
| 6 | Salmon Rice    | Saumon + riz + avocat                            |  840 |   44 |   70 |  35 | Récupération  |
| 7 | Athlete Pasta  | Pâtes + viande maigre + parmesan                 |  920 |   52 |  100 |  24 | Énergie       |
| 8 | Teriyaki Bowl  | Riz + poulet teriyaki + légumes                  |  790 |   46 |   88 |  18 | Pré-training  |
| 9 | Poke Power     | Riz + saumon + mangue + avocat                   |  810 |   42 |   78 |  28 | Soccer        |
|10 | Mexican Fuel   | Burrito bowl + haricots + viande                 |  930 |   50 |  102 |  25 | Match         |
|11 | Lean Chicken   | Poulet grillé + patate douce + salade            |  650 |   56 |   48 |  16 | Sèche         |
|12 | Sushi Lunch    | California rolls + riz + thon                    |  720 |   40 |   95 |  12 | Léger         |
|13 | Steak Plate    | Steak + pommes de terre + légumes                |  890 |   60 |   62 |  32 | Force         |
|14 | Recovery Plate | Riz + poulet + légumes + fruit                   |  760 |   48 |   82 |  15 | Post-training |
|15 | Campus Wrap    | Chicken Caesar wrap + fruit + yaourt             |  740 |   45 |   68 |  25 | Rapide        |

### Dîners (15)

| # | Nom              | Compo                                  | kcal | Prot | Gluc | Lip | Objectif       |
|---|------------------|----------------------------------------|-----:|-----:|-----:|----:|----------------|
| 1 | Recovery Dinner  | Poulet + riz basmati + légumes         |  760 |   52 |   80 |  14 | Récupération   |
| 2 | Mass Plate       | Steak + pâtes + avocat                 |  980 |   58 |   92 |  35 | Masse          |
| 3 | Lean Night       | Saumon + légumes + patate douce        |  690 |   45 |   42 |  30 | Sèche          |
| 4 | Athlete Rice     | Dinde + riz + légumes                  |  740 |   50 |   76 |  16 | Maintien       |
| 5 | Pasta Night      | Pâtes + poulet + sauce tomate          |  860 |   54 |  102 |  18 | Match lendemain|
| 6 | Protein Bowl     | Riz + steak + haricots                 |  920 |   60 |   78 |  28 | Hautes prot    |
| 7 | Salmon Recovery  | Saumon + quinoa + légumes              |  810 |   48 |   58 |  32 | Natation       |
| 8 | Chicken Power    | Poulet + pommes de terre + légumes     |  780 |   58 |   65 |  18 | Soccer         |
| 9 | Basketball Fuel  | Riz + viande + avocat                  |  950 |   54 |   98 |  30 | Basketball     |
|10 | Tennis Recovery  | Poulet + pâtes + légumes               |  840 |   52 |   88 |  18 | Tennis         |
|11 | Track Dinner     | Riz + saumon + fruits                  |  890 |   50 |  100 |  24 | Track & Field  |
|12 | Light Dinner     | Omelette + salade + pain complet       |  620 |   40 |   42 |  22 | Léger          |
|13 | Campus Comfort   | Meatballs + pâtes + légumes            |  940 |   48 |   98 |  32 | Confort        |
|14 | Evening Bowl     | Riz + tofu + légumes + avocat          |  710 |   35 |   76 |  24 | Vegan          |
|15 | Night Recovery   | Yaourt grec + fruits + oatmeal + PB    |  650 |   38 |   62 |  20 | Avant sommeil  |

### Snacks (15)

| # | Nom            | Compo                                   | kcal | Prot | Gluc | Lip | Objectif       |
|---|----------------|-----------------------------------------|-----:|-----:|-----:|----:|----------------|
| 1 | Quick Protein  | Yaourt grec + banane                    |  260 |   22 |   32 |   2 | Rapide         |
| 2 | Match Snack    | Bagel + beurre de cacahuète             |  420 |   14 |   48 |  18 | Pré-match      |
| 3 | Recovery Snack | Lait chocolaté + barre protéinée        |  380 |   28 |   42 |  10 | Post-training  |
| 4 | Energy Mix     | Granola + fruits + amandes              |  450 |   12 |   52 |  20 | Énergie        |
| 5 | Protein Shake  | Whey + lait + banane                    |  340 |   35 |   30 |   8 | Protéines      |
| 6 | Lean Snack     | Yaourt grec + fraises                   |  180 |   20 |   18 |   1 | Sèche          |
| 7 | Mass Snack     | Bagel + beurre cacahuète + banane       |  620 |   18 |   72 |  28 | Masse          |
| 8 | Campus Fuel    | Trail mix + pomme                       |  390 |   10 |   42 |  20 | Entre cours    |
| 9 | Sweet Recovery | Rice Krispie + lait                     |  310 |   12 |   44 |   9 | Recharge glyc. |
|10 | Athlete Bowl   | Yaourt grec + granola + myrtilles       |  430 |   28 |   48 |  12 | Équilibré      |
|11 | Fast Energy    | Pretzels + jus + fruits                 |  320 |    6 |   68 |   2 | Avant training |
|12 | Night Protein  | Yaourt grec + beurre cacahuète          |  340 |   30 |   12 |  18 | Avant sommeil  |
|13 | Power Fruit    | Banane + amandes + whey                 |  410 |   30 |   34 |  16 | Performance    |
|14 | Soccer Boost   | Bagel + confiture + fruits              |  430 |   11 |   82 |   4 | Endurance      |
|15 | Campus Crunch  | Popcorn + beef jerky + pomme            |  350 |   24 |   28 |  10 | Coupe-faim     |

## 7. Recettes cuisinables adaptatives

Chaque combo a une recette avec :
- **Ingrédients de base** (quantités pour profil de référence : 80 kg, 1m80)
- **Étapes de préparation** (numérotées, claires)
- **Temps de préparation / cuisson**
- **Fonction d'adaptation** : recalcule chaque quantité selon poids/taille
  utilisateur via formule `qty_user = qty_base * (poids_user / 80) * facteur_taille`
  où `facteur_taille = 1 + (taille_user - 180) / 180 * 0.3`
- Les valeurs nutritionnelles affichées dans la fiche s'actualisent aussi

Exemple : Breakfast Performance pour 80,1 kg :
- Œufs : 146 g
- Bagel : 97 g
- Yaourt grec : 188 g
- Banane : 112 g
- Granola : 21 g

Pour 81,1 kg :
- Œufs : 153 g
- Bagel : 103 g  (etc.)

## 8. Logique recommandation quotidienne

Compare objectif vs consommation, génère :
- Calories restantes / consommées
- Macros restants
- Suggestions concrètes en cas de déficit (ex : "il te manque 60 g de protéines
  → +1 portion de poulet (35 g) + 1 shake whey (25 g)")

## 9. Tableau de bord

- Poids actuel + évolution 7j / 30j
- Calories du jour (consommé / restant / objectif)
- Macros du jour (3 barres : prot / gluc / lip)
- Hydratation
- Charge entraînement
- Score récupération
- Graphiques : poids, calories, masse musculaire, masse grasse, macros

## 10. Alertes auto

- Perte/gain rapide de poids
- Protéines régulièrement trop basses
- Glucides insuffisants
- Hydratation faible
- Fatigue détectée

## 11. Persistance

Utilise l'API `/api/state/[key]` existante (Neon) pour stocker :
- `profile` : identité + biométrie (+ historique)
- `nutrition-log` : repas loggés par date
- `nutrition-targets` : objectifs calculés

## 12. UX

- Tutoiement, français naturel
- Cohérence visuelle avec l'existant (topbar, palette, typo de muscumoov)
- Fiches aliments en modal (clic sur item ouvre détails)
- Fiches repas en modal avec onglets : Macros / Ingrédients / Recette
- Mobile-friendly
