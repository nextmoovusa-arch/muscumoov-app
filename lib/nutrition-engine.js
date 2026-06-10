window.NutritionEngine = (function () {
  'use strict';

  // ===== Constants =====
  const REFERENCE_WEIGHT_KG = 80;
  const REFERENCE_HEIGHT_CM = 180;

  const TRAINING_LOAD_MULTIPLIER = {
    rest: 0.85,           // -15%
    one_session: 1.00,    // base
    two_sessions: 1.20,   // +20%
    match: 1.25,          // +25%
    tournament: 1.35,     // +35%
  };

  const GOAL_KCAL_DELTA = {
    cutting:      -300,
    maintenance:    0,
    mass_gain:    375,    // mid of 250..500
    // v8 — new UI-facing goal keys
    lose:         -300,
    maintain:       0,
    gain:         375,
    fit:            0,
  };

  // Macro re-weighting per goal — applied AFTER base build.
  // Numbers are fractional shifts applied to the *grams* of that macro.
  // (fit boosts protein +5% and shaves carbs to compensate kcal-neutrally.)
  const GOAL_MACRO_BIAS = {
    fit: { protein: +0.05, carbs: -0.05, fat: 0 },
  };

  // Sport biases applied as macro re-balancing AFTER base calculation
  const SPORT_BIAS = {
    football_us:   { protein: +0.20, carbs:  0.00, fat: 0.00 }, // protéines ++
    soccer:        { protein:  0.00, carbs: +0.20, fat: 0.00 }, // glucides ++
    basketball:    { protein:  0.00, carbs: +0.10, fat: 0.00 }, // glucides +
    baseball:      { protein:  0.00, carbs:  0.00, fat: 0.00 }, // standard
    swimming:      { protein:  0.00, carbs: +0.30, fat: 0.00 }, // glucides +++
    track_field:   { protein:  0.00, carbs: +0.10, fat: 0.00 },
    tennis:        { protein:  0.00, carbs: +0.10, fat: 0.00 },
    other:         { protein:  0.00, carbs:  0.00, fat: 0.00 },
  };

  // Per-kg coefficients (min / mid / max) per spec §3
  const COEFF = {
    protein: { min: 1.6, mid: 1.9, max: 2.2 },
    fat:     { min: 0.8, mid: 1.0, max: 1.2 },
    carbs:   { min: 4.0, mid: 5.5, max: 7.0 },
    kcal:    { min: 35,  mid: 42,  max: 50  },
  };

  // ===== Helpers =====
  const roundInt = (v) => Math.round(v);
  const roundKcal = (v) => Math.round(v / 10) * 10;
  const clampNum = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  // ===== Macro targets from profile =====
  function computeTargets(profile) {
    profile = profile || {};
    const weight = clampNum(profile.weightKg, REFERENCE_WEIGHT_KG);
    const loadMult = TRAINING_LOAD_MULTIPLIER[profile.trainingLoad] != null
      ? TRAINING_LOAD_MULTIPLIER[profile.trainingLoad]
      : 1.0;
    const goalDelta = GOAL_KCAL_DELTA[profile.goal] != null
      ? GOAL_KCAL_DELTA[profile.goal]
      : 0;
    const bias = SPORT_BIAS[profile.sport] || SPORT_BIAS.other;

    // Build a tier (min/mid/max) of macro grams + kcal target.
    function buildTier(level) {
      const proteinG = weight * COEFF.protein[level] * loadMult;
      const fatG     = weight * COEFF.fat[level]     * loadMult;
      const carbsG   = weight * COEFF.carbs[level]   * loadMult;
      let kcal       = weight * COEFF.kcal[level]    * loadMult + goalDelta;

      // Base kcal from macros (4/4/9). We re-balance carbs/fat to hit kcal target
      // while keeping protein at its g/kg target and respecting sport bias.
      // Apply sport bias: redistribute kcal share among macros.
      // We treat bias as fractional kcal shifts relative to the macro's own kcal.
      let pKcal = proteinG * 4 * (1 + bias.protein);
      let cKcal = carbsG   * 4 * (1 + bias.carbs);
      let fKcal = fatG     * 9 * (1 + bias.fat);

      // Scale all macro kcals so their sum equals the kcal target.
      const sum = pKcal + cKcal + fKcal;
      if (sum > 0) {
        const k = kcal / sum;
        pKcal *= k;
        cKcal *= k;
        fKcal *= k;
      }

      var pG = pKcal / 4;
      var cG = cKcal / 4;
      var fG = fKcal / 9;

      // Goal-specific macro bias (e.g. fit = +5% protein, -5% carbs)
      var gbias = GOAL_MACRO_BIAS[profile.goal];
      if (gbias) {
        pG = pG * (1 + (gbias.protein || 0));
        cG = cG * (1 + (gbias.carbs   || 0));
        fG = fG * (1 + (gbias.fat     || 0));
      }

      return {
        kcal:    roundKcal(kcal),
        protein: roundInt(pG),
        carbs:   roundInt(cG),
        fat:     roundInt(fG),
      };
    }

    const tiers = { min: buildTier('min'), mid: buildTier('mid'), max: buildTier('max') };

    return {
      kcal:    { min: tiers.min.kcal,    mid: tiers.mid.kcal,    max: tiers.max.kcal },
      protein: { min: tiers.min.protein, mid: tiers.mid.protein, max: tiers.max.protein },
      carbs:   { min: tiers.min.carbs,   mid: tiers.mid.carbs,   max: tiers.max.carbs },
      fat:     { min: tiers.min.fat,     mid: tiers.mid.fat,     max: tiers.max.fat },
    };
  }

  // ===== Recipe / ingredient scaling =====
  // Given an ingredient base quantity (in grams) for the 80kg / 180cm reference
  // profile, return the scaled quantity for the user's profile.
  function scaleIngredient(baseG, profile) {
    profile = profile || {};
    const weight = clampNum(profile.weightKg, REFERENCE_WEIGHT_KG);
    const height = clampNum(profile.heightCm, REFERENCE_HEIGHT_CM);
    const weightFactor = weight / REFERENCE_WEIGHT_KG;
    const heightFactor = 1 + ((height - REFERENCE_HEIGHT_CM) / REFERENCE_HEIGHT_CM) * 0.3;
    return Math.round(Number(baseG || 0) * weightFactor * heightFactor);
  }

  // Returns scaled ingredients array AND recomputed totals from those scaled quantities,
  // using a foods database lookup if available.
  function scaleMeal(meal, profile, foodsDb) {
    meal = meal || {};
    const ingredients = Array.isArray(meal.ingredients) ? meal.ingredients : [];
    const baseTotals = meal.totals || { kcal: 0, protein: 0, carbs: 0, fat: 0 };

    const db = foodsDb || {};

    const scaled = ingredients.map((ing) => {
      const baseG = Number(ing.baseG) || 0;
      const scaledG = scaleIngredient(baseG, profile);
      return Object.assign({}, ing, { scaledG: scaledG });
    });

    // Try DB-based recompute first; if any ingredient has no DB entry, fall back
    // to linear scaling of original totals by overall scale factor.
    let totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    let dbCoverage = scaled.length > 0;

    for (const ing of scaled) {
      const food = ing.foodId ? db[ing.foodId] : null;
      if (!food) { dbCoverage = false; break; }
      const factor = ing.scaledG / 100; // food values are per 100g
      totals.kcal    += (Number(food.kcal)    || 0) * factor;
      totals.protein += (Number(food.protein) || 0) * factor;
      totals.carbs   += (Number(food.carbs)   || 0) * factor;
      totals.fat     += (Number(food.fat)     || 0) * factor;
    }

    if (!dbCoverage) {
      // Linear fallback: average the per-ingredient (scaledG / baseG) ratio.
      let baseSum = 0, scaledSum = 0;
      for (const ing of scaled) {
        baseSum   += Number(ing.baseG) || 0;
        scaledSum += Number(ing.scaledG) || 0;
      }
      const ratio = baseSum > 0 ? (scaledSum / baseSum) : 1;
      totals = {
        kcal:    (Number(baseTotals.kcal)    || 0) * ratio,
        protein: (Number(baseTotals.protein) || 0) * ratio,
        carbs:   (Number(baseTotals.carbs)   || 0) * ratio,
        fat:     (Number(baseTotals.fat)     || 0) * ratio,
      };
    }

    return {
      ingredients: scaled,
      totals: {
        kcal:    roundKcal(totals.kcal),
        protein: roundInt(totals.protein),
        carbs:   roundInt(totals.carbs),
        fat:     roundInt(totals.fat),
      },
    };
  }

  // ===== Intake comparison + suggestions =====
  function diffIntakeVsTarget(intakeMacros, targets) {
    intakeMacros = intakeMacros || {};
    targets = targets || {};

    function diff(key, unitRound) {
      const consumed = Number(intakeMacros[key]) || 0;
      const t = targets[key] || { min: 0, mid: 0, max: 0 };
      const target = Number(t.mid) || 0;
      const remaining = target - consumed;
      const pct = target > 0 ? Math.round((consumed / target) * 100) : 0;
      return {
        consumed:  unitRound(consumed),
        target:    unitRound(target),
        remaining: unitRound(remaining),
        pct: pct,
      };
    }

    return {
      kcal:    diff('kcal',    roundKcal),
      protein: diff('protein', roundInt),
      carbs:   diff('carbs',   roundInt),
      fat:     diff('fat',     roundInt),
    };
  }

  // Generic fallbacks when foodsDb is empty or lacks tags.
  const GENERIC_SUGGESTIONS = {
    protein: [
      { foodId: 'chicken_breast', name: 'Poulet grillé',     portionG: 120, perPortion: { protein: 31 } },
      { foodId: 'greek_yogurt',   name: 'Yaourt grec',       portionG: 200, perPortion: { protein: 20 } },
      { foodId: 'whey_shake',     name: 'Shake whey',        portionG:  30, perPortion: { protein: 24 } },
      { foodId: 'tuna_can',       name: 'Thon en boîte',     portionG: 100, perPortion: { protein: 26 } },
    ],
    carbs: [
      { foodId: 'bagel',          name: 'Bagel',             portionG: 100, perPortion: { carbs: 53 } },
      { foodId: 'white_rice',     name: 'Riz blanc cuit',    portionG: 200, perPortion: { carbs: 56 } },
      { foodId: 'banana',         name: 'Banane',            portionG: 120, perPortion: { carbs: 27 } },
      { foodId: 'oatmeal',        name: 'Oatmeal',           portionG:  80, perPortion: { carbs: 54 } },
    ],
    fat: [
      { foodId: 'almonds',        name: 'Amandes',           portionG:  30, perPortion: { fat: 15 } },
      { foodId: 'avocado',        name: 'Avocat',            portionG: 100, perPortion: { fat: 15 } },
      { foodId: 'peanut_butter',  name: 'Beurre de cacahuète', portionG:  20, perPortion: { fat: 10 } },
    ],
  };

  function pickFromDb(foodsDb, macroKey) {
    if (!foodsDb) return [];
    const list = Object.keys(foodsDb).map((id) => Object.assign({ foodId: id }, foodsDb[id]));
    // Rank by macro density per 100g.
    return list
      .filter((f) => (Number(f[macroKey]) || 0) > 0)
      .sort((a, b) => (Number(b[macroKey]) || 0) - (Number(a[macroKey]) || 0));
  }

  function suggestFromMacro(macroKey, deficitG, foodsDb) {
    const items = pickFromDb(foodsDb, macroKey);
    const suggestions = [];

    if (items.length > 0) {
      // Take top 1–2 dense items, derive a portion that covers part of the deficit.
      const top = items.slice(0, 2);
      for (const f of top) {
        const per100 = Number(f[macroKey]) || 1;
        const portionG = Math.max(50, Math.round((deficitG / per100) * 100 / 10) * 10);
        const label = {
          protein: 'protéines',
          carbs:   'glucides',
          fat:     'lipides',
        }[macroKey];
        suggestions.push({
          foodId: f.foodId,
          name: f.name || f.foodId,
          portionG: portionG,
          reason: `Il te manque ${Math.round(deficitG)} g de ${label} : ajoute ~${portionG} g de ${f.name || f.foodId}.`,
        });
      }
      return suggestions;
    }

    // Generic fallback path.
    const generics = GENERIC_SUGGESTIONS[macroKey] || [];
    let covered = 0;
    for (const g of generics) {
      if (covered >= deficitG) break;
      const gain = (g.perPortion && g.perPortion[macroKey]) || 0;
      const label = {
        protein: 'protéines',
        carbs:   'glucides',
        fat:     'lipides',
      }[macroKey];
      suggestions.push({
        foodId: g.foodId,
        name: g.name,
        portionG: g.portionG,
        reason: `Il te manque ${Math.round(deficitG)} g de ${label} : 1 portion de ${g.name} (~${g.portionG} g) apporte ${gain} g.`,
      });
      covered += gain;
      if (suggestions.length >= 2) break;
    }
    return suggestions;
  }

  function suggestFoodsForDeficit(deficits, foodsDb) {
    deficits = deficits || {};
    const out = [];
    const proteinDef = Number(deficits.protein) || 0;
    const carbsDef   = Number(deficits.carbs)   || 0;
    const fatDef     = Number(deficits.fat)     || 0;

    if (proteinDef > 20) {
      out.push(...suggestFromMacro('protein', proteinDef, foodsDb));
    }
    if (carbsDef > 30) {
      out.push(...suggestFromMacro('carbs', carbsDef, foodsDb));
    }
    if (fatDef > 15) {
      out.push(...suggestFromMacro('fat', fatDef, foodsDb));
    }
    return out;
  }

  // ===== Alerts =====
  function detectAlerts(profile, weightHistory, last7DaysIntake) {
    const alerts = [];
    const history = Array.isArray(weightHistory) ? weightHistory.slice() : [];
    const intake = Array.isArray(last7DaysIntake) ? last7DaysIntake : [];

    // --- Weight delta over the most recent ~7 days. ---
    if (history.length >= 2) {
      // Expect entries like { date: 'YYYY-MM-DD', kg: number }; sort ascending.
      history.sort((a, b) => String(a.date).localeCompare(String(b.date)));
      const latest = history[history.length - 1];
      const latestTime = new Date(latest.date).getTime();
      // Find oldest entry within last 7 days (>= latest - 7d).
      let baseline = history[0];
      for (let i = history.length - 1; i >= 0; i--) {
        const t = new Date(history[i].date).getTime();
        if (!isFinite(t)) continue;
        if (latestTime - t >= 6 * 24 * 3600 * 1000) { baseline = history[i]; break; }
        baseline = history[i];
      }
      const delta = (Number(latest.kg) || 0) - (Number(baseline.kg) || 0);
      if (delta <= -1) {
        alerts.push({
          type: 'weight_loss_rapid',
          severity: 'warning',
          message: `Tu as perdu ${Math.abs(delta).toFixed(1)} kg en ~1 semaine. Vérifie ton apport calorique.`,
        });
      } else if (delta >= 1) {
        alerts.push({
          type: 'weight_gain_rapid',
          severity: 'warning',
          message: `Tu as pris ${delta.toFixed(1)} kg en ~1 semaine. Adapte tes apports si ce n'est pas l'objectif.`,
        });
      }
    }

    // --- Intake-vs-target consistency over the last 3+ days. ---
    const targets = computeTargets(profile || {});
    const recent = intake.slice(-7);
    function countLowDays(key, threshold) {
      let streak = 0, maxStreak = 0;
      for (const d of recent) {
        const v = Number((d || {})[key]) || 0;
        if (v < threshold) { streak++; if (streak > maxStreak) maxStreak = streak; }
        else streak = 0;
      }
      return maxStreak;
    }

    if (countLowDays('protein', targets.protein.min) >= 3) {
      alerts.push({
        type: 'low_protein_streak',
        severity: 'warning',
        message: `Tes protéines sont trop basses depuis 3 jours (cible min : ${targets.protein.min} g). Pense au poulet, yaourt grec ou whey.`,
      });
    }
    if (countLowDays('carbs', targets.carbs.min) >= 3) {
      alerts.push({
        type: 'low_carbs_streak',
        severity: 'warning',
        message: `Tes glucides sont trop bas depuis 3 jours (cible min : ${targets.carbs.min} g). Tu vas manquer d'énergie pour t'entraîner.`,
      });
    }
    if (countLowDays('kcal', Math.max(0, targets.kcal.min - 500)) >= 3) {
      alerts.push({
        type: 'low_kcal_streak',
        severity: 'critical',
        message: `Tu manges trop peu depuis 3 jours (sous ${targets.kcal.min - 500} kcal). Risque de fatigue et de perte musculaire.`,
      });
    }

    return alerts;
  }

  // ===== Public API =====
  return {
    REFERENCE_WEIGHT_KG: REFERENCE_WEIGHT_KG,
    REFERENCE_HEIGHT_CM: REFERENCE_HEIGHT_CM,
    TRAINING_LOAD_MULTIPLIER: TRAINING_LOAD_MULTIPLIER,
    GOAL_KCAL_DELTA: GOAL_KCAL_DELTA,
    SPORT_BIAS: SPORT_BIAS,
    computeTargets: computeTargets,
    scaleIngredient: scaleIngredient,
    scaleMeal: scaleMeal,
    diffIntakeVsTarget: diffIntakeVsTarget,
    suggestFoodsForDeficit: suggestFoodsForDeficit,
    detectAlerts: detectAlerts,
  };
})();
