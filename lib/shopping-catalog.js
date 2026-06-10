/* eslint-disable */
/*
 * Walmart-averaged shopping catalog for a US college athlete.
 * Prices are 2024–2025 USD averages and intentionally rounded.
 * Standalone — no module syntax. Attaches to `window`.
 */
(function () {
  'use strict';

  var MEALDB = 'https://www.themealdb.com/images/ingredients/';
  // Generic 1x1 PNG-like emoji placeholder used as `image: null` fallback.

  window.SHOPPING_CATEGORIES = [
    { id: 'produce',     label: 'Produits frais',       icon: '🥬' },
    { id: 'meat-fish',   label: 'Viande & poisson',     icon: '🥩' },
    { id: 'carbs',       label: 'Glucides',             icon: '🍞' },
    { id: 'snacks',      label: 'Snacks',               icon: '🍿' },
    { id: 'drinks',      label: 'Boissons',             icon: '🥤' },
    { id: 'sauces',      label: 'Sauces & condiments',  icon: '🍯' },
    { id: 'frozen',      label: 'Surgelés',        icon: '❄️' },
    { id: 'utensils',    label: 'Ustensiles',           icon: '🍴' },
    { id: 'hygiene',     label: 'Hygiène',         icon: '🧴' },
    { id: 'cleaning',    label: 'Entretien',            icon: '🧽' },
    { id: 'supplements', label: 'Compléments',     icon: '💪' }
  ];

  // Unsplash hotlinks (small, curated). Generic icons returned as null fall back
  // to the category emoji in the UI thumbnail.
  var UNSPLASH = {
    bagels:    'https://images.unsplash.com/photo-1592151450145-79e9b06324c7?auto=format&fit=crop&w=200&q=70',
    oatmeal:   'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=200&q=70',
    tortillas: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=200&q=70',
    sweetPot:  'https://images.unsplash.com/photo-1596097635121-14b38c5d7a55?auto=format&fit=crop&w=200&q=70',
    quinoa:    'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=200&q=70',
    granolaBar:'https://images.unsplash.com/photo-1571197119282-7c4e2c2f0b96?auto=format&fit=crop&w=200&q=70',
    crackers:  'https://images.unsplash.com/photo-1599629954294-14df9ec8bc03?auto=format&fit=crop&w=200&q=70',
    chips:     'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?auto=format&fit=crop&w=200&q=70',
    oreos:     'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=200&q=70',
    trailMix:  'https://images.unsplash.com/photo-1606914707708-0e6f3f4f6c10?auto=format&fit=crop&w=200&q=70',
    jerky:     'https://images.unsplash.com/photo-1625938145712-fbcfca39c6a1?auto=format&fit=crop&w=200&q=70',
    pretzels:  'https://images.unsplash.com/photo-1599909533730-3c9aebc3d12d?auto=format&fit=crop&w=200&q=70',
    cookies:   'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=200&q=70',
    milk:      'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=200&q=70',
    oj:        'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=200&q=70',
    water:     'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=200&q=70',
    gatorade:  'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=200&q=70',
    coffee:    'https://images.unsplash.com/photo-1559525839-d9acfd241ec7?auto=format&fit=crop&w=200&q=70',
    redbull:   'https://images.unsplash.com/photo-1613618948931-1f7a4c7f5e9e?auto=format&fit=crop&w=200&q=70',
    arizona:   'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=200&q=70',
    coke:      'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=200&q=70',
    almondMilk:'https://images.unsplash.com/photo-1600718374662-0483d2b9da44?auto=format&fit=crop&w=200&q=70',
    kombucha:  'https://images.unsplash.com/photo-1606937295547-bc0f668ad6e3?auto=format&fit=crop&w=200&q=70',
    ketchup:   'https://images.unsplash.com/photo-1607681034540-2c46cc71896d?auto=format&fit=crop&w=200&q=70',
    mayo:      'https://images.unsplash.com/photo-1606851179548-d9d8b3b8c8a9?auto=format&fit=crop&w=200&q=70',
    ranch:     'https://images.unsplash.com/photo-1603729362753-f8162ac6c3df?auto=format&fit=crop&w=200&q=70',
    pasta:     'https://images.unsplash.com/photo-1604908554007-3a4f49f4ebcd?auto=format&fit=crop&w=200&q=70',
    hotsauce:  'https://images.unsplash.com/photo-1612257999691-c9d3d7f3e8c9?auto=format&fit=crop&w=200&q=70',
    soy:       MEALDB + 'soy%20sauce.png',
    maple:     'https://images.unsplash.com/photo-1607369062497-c7e87c89dafd?auto=format&fit=crop&w=200&q=70',
    nutella:   'https://images.unsplash.com/photo-1604719312566-878b7a8e1b16?auto=format&fit=crop&w=200&q=70',
    jam:       'https://images.unsplash.com/photo-1597393353415-b3730f3719fe?auto=format&fit=crop&w=200&q=70',
    pizza:     'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=200&q=70',
    frozenVeg: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=200&q=70',
    icecream:  'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=200&q=70',
    nuggets:   'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=200&q=70',
    burrito:   'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=200&q=70',
    pierogi:   'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=200&q=70',
    waffles:   'https://images.unsplash.com/photo-1598233847491-f16487adee2f?auto=format&fit=crop&w=200&q=70',
    fishStick: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=200&q=70',
    whey:      'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=200&q=70',
    preworkout:'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=200&q=70',
    creatine:  'https://images.unsplash.com/photo-1606889464198-fcb18894cf50?auto=format&fit=crop&w=200&q=70',
    multivit:  'https://images.unsplash.com/photo-1626033333634-1bdec1c66bbb?auto=format&fit=crop&w=200&q=70',
    omega:     'https://images.unsplash.com/photo-1626723584957-edf4f1ed29c4?auto=format&fit=crop&w=200&q=70',
    bcaa:      'https://images.unsplash.com/photo-1599058918144-1ea5d9f51b76?auto=format&fit=crop&w=200&q=70',
    greens:    'https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?auto=format&fit=crop&w=200&q=70',
    vitd:      'https://images.unsplash.com/photo-1626516381055-ef9fc6b08ddb?auto=format&fit=crop&w=200&q=70',
    pb:        MEALDB + 'peanut%20butter.png',
    honey:     MEALDB + 'honey.png'
  };

  window.SHOPPING_CATALOG = [
    /* ===== PRODUCE (12) ===== */
    { id: 'sc-banana',     name: 'Bananes',                 category: 'produce', unit: 'pcs', defaultQty: 6, pricePerUnit: 0.15, image: MEALDB + 'Banana.png',    portionG: 120, tags: ['food','vegan'] },
    { id: 'sc-apple',      name: 'Pommes Gala',             category: 'produce', unit: 'pcs', defaultQty: 6, pricePerUnit: 0.40, image: MEALDB + 'Apple.png',     portionG: 180, tags: ['food','vegan'] },
    { id: 'sc-strawberry', name: 'Fraises (1 lb)',          category: 'produce', unit: 'lb',  defaultQty: 1, pricePerUnit: 3.50, image: MEALDB + 'Strawberries.png', portionG: 454, tags: ['food','vegan'] },
    { id: 'sc-spinach',    name: 'Épinards (5 oz)',    category: 'produce', unit: 'oz',  defaultQty: 5, pricePerUnit: 0.56, image: MEALDB + 'Spinach.png',   portionG: 28,  tags: ['food','vegan'] },
    { id: 'sc-carrot',     name: 'Carottes (1 lb)',         category: 'produce', unit: 'lb',  defaultQty: 1, pricePerUnit: 1.20, image: MEALDB + 'Carrots.png',   portionG: 454, tags: ['food','vegan'] },
    { id: 'sc-broccoli',   name: 'Brocoli (pièce)',    category: 'produce', unit: 'pcs', defaultQty: 1, pricePerUnit: 1.50, image: MEALDB + 'Broccoli.png',  portionG: 350, tags: ['food','vegan'] },
    { id: 'sc-avocado',    name: 'Avocat',                  category: 'produce', unit: 'pcs', defaultQty: 2, pricePerUnit: 0.80, image: MEALDB + 'Avocado.png',   portionG: 170, tags: ['food','vegan'] },
    { id: 'sc-romaine',    name: 'Laitue romaine (3-pack)', category: 'produce', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.50, image: MEALDB + 'Lettuce.png',   portionG: 900, tags: ['food','vegan'] },
    { id: 'sc-tomato',     name: 'Tomates Roma (1 lb)',     category: 'produce', unit: 'lb',  defaultQty: 1, pricePerUnit: 1.80, image: MEALDB + 'Tomatoes.png',  portionG: 454, tags: ['food','vegan'] },
    { id: 'sc-onion',      name: 'Oignon jaune',            category: 'produce', unit: 'pcs', defaultQty: 2, pricePerUnit: 0.60, image: MEALDB + 'Onion.png',     portionG: 150, tags: ['food','vegan'] },
    { id: 'sc-garlic',     name: 'Ail (bulbe)',             category: 'produce', unit: 'pcs', defaultQty: 1, pricePerUnit: 0.50, image: MEALDB + 'Garlic.png',    portionG: 45,  tags: ['food','vegan'] },
    { id: 'sc-bellpepper', name: 'Poivron rouge',           category: 'produce', unit: 'pcs', defaultQty: 2, pricePerUnit: 1.00, image: MEALDB + 'Red%20Pepper.png', portionG: 150, tags: ['food','vegan'] },

    /* ===== MEAT & FISH (8) ===== */
    { id: 'sc-chicken',    name: 'Poulet (blanc, 1 lb)',    category: 'meat-fish', unit: 'lb', defaultQty: 2, pricePerUnit: 4.99, image: MEALDB + 'Chicken%20Breast.png', portionG: 454, tags: ['food','protein'] },
    { id: 'sc-beef',       name: 'Bœuf haché (1 lb)', category: 'meat-fish', unit: 'lb', defaultQty: 1, pricePerUnit: 5.99, image: MEALDB + 'Beef.png', portionG: 454, tags: ['food','protein'] },
    { id: 'sc-salmon',     name: 'Saumon (1 lb)',           category: 'meat-fish', unit: 'lb', defaultQty: 1, pricePerUnit: 11.99, image: MEALDB + 'Salmon.png', portionG: 454, tags: ['food','protein'] },
    { id: 'sc-eggs',       name: 'Œufs (douzaine)',    category: 'meat-fish', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.50, image: MEALDB + 'Eggs.png', portionG: 720, tags: ['food','protein'] },
    { id: 'sc-bacon',      name: 'Bacon (12 oz)',           category: 'meat-fish', unit: 'oz', defaultQty: 12, pricePerUnit: 0.50, image: MEALDB + 'Bacon.png', portionG: 28, tags: ['food','protein'] },
    { id: 'sc-turkey',     name: 'Dinde tranchée (1 lb)', category: 'meat-fish', unit: 'lb', defaultQty: 1, pricePerUnit: 5.49, image: MEALDB + 'Turkey%20Breast.png', portionG: 454, tags: ['food','protein'] },
    { id: 'sc-tuna',       name: 'Thon en boîte (5 oz)', category: 'meat-fish', unit: 'pcs', defaultQty: 2, pricePerUnit: 1.49, image: MEALDB + 'Tuna.png', portionG: 142, tags: ['food','protein'] },
    { id: 'sc-shrimp',     name: 'Crevettes (1 lb)',        category: 'meat-fish', unit: 'lb', defaultQty: 1, pricePerUnit: 8.99, image: MEALDB + 'Prawns.png', portionG: 454, tags: ['food','protein'] },

    /* ===== CARBS (10) ===== */
    { id: 'sc-rice-white', name: 'Riz blanc (5 lb)',        category: 'carbs', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.99, image: MEALDB + 'Rice.png', portionG: 2268, tags: ['food','vegan'] },
    { id: 'sc-penne',      name: 'Pâtes penne (1 lb)', category: 'carbs', unit: 'lb', defaultQty: 1, pricePerUnit: 1.34, image: MEALDB + 'Pasta.png', portionG: 454, tags: ['food','vegan'] },
    { id: 'sc-bread',      name: 'Pain de mie (20 oz)',     category: 'carbs', unit: 'pcs', defaultQty: 1, pricePerUnit: 2.49, image: MEALDB + 'Bread.png', portionG: 567, tags: ['food','vegan'] },
    { id: 'sc-bagels',     name: 'Bagels Thomas (6-pack)',  category: 'carbs', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.49, image: UNSPLASH.bagels, portionG: 510, tags: ['food'] },
    { id: 'sc-oatmeal',    name: 'Oatmeal Quaker (42 oz)',  category: 'carbs', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.49, image: UNSPLASH.oatmeal, portionG: 1190, tags: ['food','vegan'] },
    { id: 'sc-tortillas',  name: 'Tortillas Mission (10)',  category: 'carbs', unit: 'pcs', defaultQty: 1, pricePerUnit: 2.49, image: UNSPLASH.tortillas, portionG: 720, tags: ['food'] },
    { id: 'sc-potato',     name: 'Pommes de terre (5 lb)',  category: 'carbs', unit: 'lb', defaultQty: 5, pricePerUnit: 1.00, image: MEALDB + 'Potatoes.png', portionG: 454, tags: ['food','vegan'] },
    { id: 'sc-sweetpot',   name: 'Patate douce (1 lb)',     category: 'carbs', unit: 'lb', defaultQty: 1, pricePerUnit: 1.49, image: UNSPLASH.sweetPot, portionG: 454, tags: ['food','vegan'] },
    { id: 'sc-quinoa',     name: 'Quinoa (1 lb)',           category: 'carbs', unit: 'lb', defaultQty: 1, pricePerUnit: 4.99, image: UNSPLASH.quinoa, portionG: 454, tags: ['food','vegan'] },
    { id: 'sc-rice-brown', name: 'Riz brun (2 lb)',         category: 'carbs', unit: 'lb', defaultQty: 2, pricePerUnit: 1.75, image: MEALDB + 'Brown%20Rice.png', portionG: 454, tags: ['food','vegan'] },

    /* ===== SNACKS (10) ===== */
    { id: 'sc-pb',         name: 'Beurre de cacahuète Jif (40 oz)', category: 'snacks', unit: 'pcs', defaultQty: 1, pricePerUnit: 7.49, image: UNSPLASH.pb, portionG: 1134, tags: ['food'] },
    { id: 'sc-naturev',    name: 'Nature Valley bars (12)', category: 'snacks', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.99, image: UNSPLASH.granolaBar, portionG: 252, tags: ['food'] },
    { id: 'sc-goldfish',   name: 'Goldfish crackers (30 oz)', category: 'snacks', unit: 'pcs', defaultQty: 1, pricePerUnit: 5.99, image: UNSPLASH.crackers, portionG: 850, tags: ['food'] },
    { id: 'sc-doritos',    name: 'Doritos (large)',         category: 'snacks', unit: 'pcs', defaultQty: 1, pricePerUnit: 5.49, image: UNSPLASH.chips, portionG: 280, tags: ['food'] },
    { id: 'sc-oreos',      name: 'Oreos (14 oz)',           category: 'snacks', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.19, image: UNSPLASH.oreos, portionG: 397, tags: ['food'] },
    { id: 'sc-trailmix',   name: 'Trail mix (1 lb)',        category: 'snacks', unit: 'lb', defaultQty: 1, pricePerUnit: 5.49, image: UNSPLASH.trailMix, portionG: 454, tags: ['food','vegan'] },
    { id: 'sc-lays',       name: "Chips Lay's",             category: 'snacks', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.49, image: UNSPLASH.chips, portionG: 220, tags: ['food'] },
    { id: 'sc-cheezit',    name: 'Cheez-It (12 oz)',        category: 'snacks', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.99, image: UNSPLASH.crackers, portionG: 340, tags: ['food'] },
    { id: 'sc-jerky',      name: 'Beef jerky (3.25 oz)',    category: 'snacks', unit: 'pcs', defaultQty: 1, pricePerUnit: 6.99, image: UNSPLASH.jerky, portionG: 92, tags: ['food','protein'] },
    { id: 'sc-pretzels',   name: 'Bretzels (16 oz)',        category: 'snacks', unit: 'pcs', defaultQty: 1, pricePerUnit: 2.99, image: UNSPLASH.pretzels, portionG: 454, tags: ['food','vegan'] },

    /* ===== DRINKS (10) ===== */
    { id: 'sc-milk',       name: 'Lait (gallon)',           category: 'drinks', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.99, image: UNSPLASH.milk, portionG: 3785, tags: ['drink'] },
    { id: 'sc-oj',         name: "Jus d'orange (89 oz)",    category: 'drinks', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.19, image: UNSPLASH.oj, portionG: 2630, tags: ['drink'] },
    { id: 'sc-water',      name: 'Eau bouteille (24-pack)', category: 'drinks', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.99, image: UNSPLASH.water, portionG: 12000, tags: ['drink'] },
    { id: 'sc-gatorade',   name: 'Gatorade (8-pack)',       category: 'drinks', unit: 'pcs', defaultQty: 1, pricePerUnit: 7.99, image: UNSPLASH.gatorade, portionG: 4720, tags: ['drink','sport'] },
    { id: 'sc-coffee',     name: 'Café Folgers (30 oz)', category: 'drinks', unit: 'pcs', defaultQty: 1, pricePerUnit: 11.99, image: UNSPLASH.coffee, portionG: 850, tags: ['drink'] },
    { id: 'sc-redbull',    name: 'Red Bull (4-pack)',       category: 'drinks', unit: 'pcs', defaultQty: 1, pricePerUnit: 9.49, image: UNSPLASH.redbull, portionG: 984, tags: ['drink'] },
    { id: 'sc-arizona',    name: 'Arizona Iced Tea (23 oz)', category: 'drinks', unit: 'pcs', defaultQty: 1, pricePerUnit: 0.99, image: UNSPLASH.arizona, portionG: 680, tags: ['drink'] },
    { id: 'sc-coke',       name: 'Coca-Cola (12-pack)',     category: 'drinks', unit: 'pcs', defaultQty: 1, pricePerUnit: 7.49, image: UNSPLASH.coke, portionG: 4260, tags: ['drink'] },
    { id: 'sc-almondmilk', name: 'Almond milk (1/2 gallon)', category: 'drinks', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.49, image: UNSPLASH.almondMilk, portionG: 1893, tags: ['drink','vegan'] },
    { id: 'sc-kombucha',   name: 'Kombucha (16 oz)',        category: 'drinks', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.99, image: UNSPLASH.kombucha, portionG: 473, tags: ['drink'] },

    /* ===== SAUCES (10) ===== */
    { id: 'sc-ketchup',    name: 'Ketchup Heinz (32 oz)',   category: 'sauces', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.79, image: UNSPLASH.ketchup, portionG: 907, tags: ['food'] },
    { id: 'sc-mayo',       name: "Mayo Hellmann's (30 oz)", category: 'sauces', unit: 'pcs', defaultQty: 1, pricePerUnit: 5.49, image: UNSPLASH.mayo, portionG: 850, tags: ['food'] },
    { id: 'sc-ranch',      name: 'Ranch dressing (16 oz)',  category: 'sauces', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.49, image: UNSPLASH.ranch, portionG: 454, tags: ['food'] },
    { id: 'sc-pastasauce', name: 'Sauce Prego (24 oz)',     category: 'sauces', unit: 'pcs', defaultQty: 1, pricePerUnit: 2.79, image: UNSPLASH.pasta, portionG: 680, tags: ['food'] },
    { id: 'sc-hotsauce',   name: "Hot sauce Frank's (12 oz)", category: 'sauces', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.49, image: UNSPLASH.hotsauce, portionG: 340, tags: ['food','vegan'] },
    { id: 'sc-soy',        name: 'Sauce soja Kikkoman (10 oz)', category: 'sauces', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.49, image: UNSPLASH.soy, portionG: 283, tags: ['food','vegan'] },
    { id: 'sc-maple',      name: "Sirop d'érable (12 oz)", category: 'sauces', unit: 'pcs', defaultQty: 1, pricePerUnit: 6.99, image: UNSPLASH.maple, portionG: 340, tags: ['food','vegan'] },
    { id: 'sc-honey',      name: 'Miel (12 oz)',            category: 'sauces', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.49, image: UNSPLASH.honey, portionG: 340, tags: ['food'] },
    { id: 'sc-nutella',    name: 'Nutella (13 oz)',         category: 'sauces', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.99, image: UNSPLASH.nutella, portionG: 368, tags: ['food'] },
    { id: 'sc-jam',        name: 'Confiture (18 oz)',       category: 'sauces', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.49, image: UNSPLASH.jam, portionG: 510, tags: ['food','vegan'] },

    /* ===== FROZEN (8) ===== */
    { id: 'sc-pizza',      name: 'Pizza DiGiorno',          category: 'frozen', unit: 'pcs', defaultQty: 1, pricePerUnit: 7.99, image: UNSPLASH.pizza, portionG: 850, tags: ['food'] },
    { id: 'sc-frozenveg',  name: 'Légumes surgelés mix (12 oz)', category: 'frozen', unit: 'pcs', defaultQty: 1, pricePerUnit: 1.99, image: UNSPLASH.frozenVeg, portionG: 340, tags: ['food','vegan'] },
    { id: 'sc-benjerry',   name: "Ben & Jerry's (16 oz)",   category: 'frozen', unit: 'pcs', defaultQty: 1, pricePerUnit: 5.49, image: UNSPLASH.icecream, portionG: 454, tags: ['food'] },
    { id: 'sc-nuggets',    name: 'Chicken nuggets (32 oz)', category: 'frozen', unit: 'pcs', defaultQty: 1, pricePerUnit: 8.99, image: UNSPLASH.nuggets, portionG: 907, tags: ['food','protein'] },
    { id: 'sc-burritos',   name: 'Burritos surgelés (4-pack)', category: 'frozen', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.49, image: UNSPLASH.burrito, portionG: 540, tags: ['food'] },
    { id: 'sc-pierogi',    name: 'Pirogis (16 oz)',         category: 'frozen', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.99, image: UNSPLASH.pierogi, portionG: 454, tags: ['food'] },
    { id: 'sc-eggo',       name: 'Gaufres Eggo (10-pack)',  category: 'frozen', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.49, image: UNSPLASH.waffles, portionG: 350, tags: ['food'] },
    { id: 'sc-fishstick',  name: 'Poisson pané (24 oz)', category: 'frozen', unit: 'pcs', defaultQty: 1, pricePerUnit: 9.99, image: UNSPLASH.fishStick, portionG: 680, tags: ['food','protein'] },

    /* ===== UTENSILS (10) ===== */
    { id: 'sc-solocups',   name: 'Gobelets Solo rouges (50)', category: 'utensils', unit: 'pcs', defaultQty: 1, pricePerUnit: 7.49, image: null, tags: ['supplies'] },
    { id: 'sc-paperplate', name: 'Assiettes papier (50)',   category: 'utensils', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.99, image: null, tags: ['supplies'] },
    { id: 'sc-forks',      name: 'Fourchettes plastique (48)', category: 'utensils', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.49, image: null, tags: ['supplies'] },
    { id: 'sc-knives',     name: 'Couteaux plastique (48)', category: 'utensils', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.49, image: null, tags: ['supplies'] },
    { id: 'sc-spoons',     name: 'Cuillères plastique (48)', category: 'utensils', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.49, image: null, tags: ['supplies'] },
    { id: 'sc-foil',       name: 'Papier alu (75 ft)',      category: 'utensils', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.49, image: null, tags: ['supplies'] },
    { id: 'sc-ziploc',     name: 'Sacs Ziploc quart (25)',  category: 'utensils', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.99, image: null, tags: ['supplies'] },
    { id: 'sc-papertowel', name: 'Essuie-tout (6 rouleaux)', category: 'utensils', unit: 'pcs', defaultQty: 1, pricePerUnit: 9.99, image: null, tags: ['supplies'] },
    { id: 'sc-trashbag',   name: 'Sacs poubelle (40)',      category: 'utensils', unit: 'pcs', defaultQty: 1, pricePerUnit: 9.99, image: null, tags: ['supplies'] },
    { id: 'sc-tupperware', name: 'Tupperware (5-pack)',     category: 'utensils', unit: 'pcs', defaultQty: 1, pricePerUnit: 12.99, image: null, tags: ['supplies'] },

    /* ===== HYGIENE (10) ===== */
    { id: 'sc-shampoo',    name: 'Shampooing Pantene (25 oz)', category: 'hygiene', unit: 'pcs', defaultQty: 1, pricePerUnit: 7.49, image: null, tags: ['hygiene'] },
    { id: 'sc-bodywash',   name: 'Gel douche Dove (22 oz)', category: 'hygiene', unit: 'pcs', defaultQty: 1, pricePerUnit: 5.99, image: null, tags: ['hygiene'] },
    { id: 'sc-toothpaste', name: 'Dentifrice Colgate (6 oz)', category: 'hygiene', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.49, image: null, tags: ['hygiene'] },
    { id: 'sc-toothbrush', name: 'Brosse à dents',     category: 'hygiene', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.99, image: null, tags: ['hygiene'] },
    { id: 'sc-deo',        name: 'Déodorant Old Spice', category: 'hygiene', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.99, image: null, tags: ['hygiene'] },
    { id: 'sc-razor',      name: 'Rasoirs BIC (5-pack)',    category: 'hygiene', unit: 'pcs', defaultQty: 1, pricePerUnit: 5.49, image: null, tags: ['hygiene'] },
    { id: 'sc-towel',      name: 'Serviette de bain',       category: 'hygiene', unit: 'pcs', defaultQty: 1, pricePerUnit: 6.99, image: null, tags: ['hygiene'] },
    { id: 'sc-handsoap',   name: 'Savon mains (12 oz)',     category: 'hygiene', unit: 'pcs', defaultQty: 1, pricePerUnit: 2.49, image: null, tags: ['hygiene'] },
    { id: 'sc-shavecream', name: 'À raser cream',      category: 'hygiene', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.49, image: null, tags: ['hygiene'] },
    { id: 'sc-qtips',      name: 'Q-tips (500)',            category: 'hygiene', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.99, image: null, tags: ['hygiene'] },

    /* ===== CLEANING (8) ===== */
    { id: 'sc-tide',       name: 'Lessive Tide (50 oz)',    category: 'cleaning', unit: 'pcs', defaultQty: 1, pricePerUnit: 11.99, image: null, tags: ['cleaning'] },
    { id: 'sc-dawn',       name: 'Liquide vaisselle Dawn (18 oz)', category: 'cleaning', unit: 'pcs', defaultQty: 1, pricePerUnit: 3.99, image: null, tags: ['cleaning'] },
    { id: 'sc-sponges',    name: 'Éponges (3-pack)',   category: 'cleaning', unit: 'pcs', defaultQty: 1, pricePerUnit: 2.99, image: null, tags: ['cleaning'] },
    { id: 'sc-lysol',      name: 'Lingettes Lysol (80)',    category: 'cleaning', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.99, image: null, tags: ['cleaning'] },
    { id: 'sc-toiletp',    name: 'Papier toilette (12)',    category: 'cleaning', unit: 'pcs', defaultQty: 1, pricePerUnit: 14.99, image: null, tags: ['cleaning'] },
    { id: 'sc-mrclean',    name: "Mr. Clean multi-surfaces", category: 'cleaning', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.49, image: null, tags: ['cleaning'] },
    { id: 'sc-febreze',    name: 'Febreze (27 oz)',         category: 'cleaning', unit: 'pcs', defaultQty: 1, pricePerUnit: 4.99, image: null, tags: ['cleaning'] },
    { id: 'sc-laundryair', name: 'Désodorisant linge', category: 'cleaning', unit: 'pcs', defaultQty: 1, pricePerUnit: 5.99, image: null, tags: ['cleaning'] },

    /* ===== SUPPLEMENTS (10) ===== */
    { id: 'sc-whey',       name: 'Optimum Whey (5 lb)',     category: 'supplements', unit: 'pcs', defaultQty: 1, pricePerUnit: 69.99, image: UNSPLASH.whey, portionG: 2268, tags: ['supplement','protein'] },
    { id: 'sc-c4',         name: 'Pré-workout C4',     category: 'supplements', unit: 'pcs', defaultQty: 1, pricePerUnit: 24.99, image: UNSPLASH.preworkout, portionG: 300, tags: ['supplement'] },
    { id: 'sc-liquidiv',   name: 'Liquid IV (16-pack)',     category: 'supplements', unit: 'pcs', defaultQty: 1, pricePerUnit: 19.99, image: null, tags: ['supplement'] },
    { id: 'sc-creatine',   name: 'Créatine (300 g)',   category: 'supplements', unit: 'pcs', defaultQty: 1, pricePerUnit: 19.99, image: UNSPLASH.creatine, portionG: 300, tags: ['supplement'] },
    { id: 'sc-multivit',   name: 'Multivitamines',          category: 'supplements', unit: 'pcs', defaultQty: 1, pricePerUnit: 12.99, image: UNSPLASH.multivit, tags: ['supplement'] },
    { id: 'sc-mag',        name: 'Magnésium',          category: 'supplements', unit: 'pcs', defaultQty: 1, pricePerUnit: 9.99, image: UNSPLASH.multivit, tags: ['supplement'] },
    { id: 'sc-omega',      name: 'Oméga-3',            category: 'supplements', unit: 'pcs', defaultQty: 1, pricePerUnit: 14.99, image: UNSPLASH.omega, tags: ['supplement'] },
    { id: 'sc-bcaa',       name: 'BCAA',                    category: 'supplements', unit: 'pcs', defaultQty: 1, pricePerUnit: 24.99, image: UNSPLASH.bcaa, portionG: 300, tags: ['supplement'] },
    { id: 'sc-greens',     name: 'Greens powder',           category: 'supplements', unit: 'pcs', defaultQty: 1, pricePerUnit: 29.99, image: UNSPLASH.greens, portionG: 300, tags: ['supplement','vegan'] },
    { id: 'sc-vitd',       name: 'Vitamine D3',             category: 'supplements', unit: 'pcs', defaultQty: 1, pricePerUnit: 8.99, image: UNSPLASH.vitd, tags: ['supplement'] }
  ];

  try { Object.freeze(window.SHOPPING_CATALOG); } catch (e) {}
  try { Object.freeze(window.SHOPPING_CATEGORIES); } catch (e) {}
})();
