// Bridges the schema differences between foods-db.js / meals-db.js /
// nutrition-engine.js and the property names nutrition.html consumes.
// Runs synchronously at script-load — keep it tiny.
(function () {
  'use strict';

  // ---- Meals: flatten totals, singularize objective, rename recipe fields ----
  if (Array.isArray(window.MEALS_DB)) {
    for (const m of window.MEALS_DB) {
      if (m.totals && m.kcal == null) {
        m.kcal    = m.totals.kcal;
        m.protein = m.totals.protein;
        m.carbs   = m.totals.carbs;
        m.fat     = m.totals.fat;
      }
      if (Array.isArray(m.objectives) && m.objective == null) {
        const first = m.objectives[0];
        m.objective = (window.MEAL_OBJECTIVES || []).find(o => o.id === first)?.label
          || (typeof first === 'string' ? first : null);
      }
      if (Array.isArray(m.ingredients)) {
        for (const ing of m.ingredients) {
          if (ing.qtyG == null && ing.baseG != null) ing.qtyG = ing.baseG;
        }
      }
      if (m.recipe) {
        const r = m.recipe;
        if (r.prepMin  == null && r.prepMinutes  != null) r.prepMin  = r.prepMinutes;
        if (r.cookMin  == null && r.cookMinutes  != null) r.cookMin  = r.cookMinutes;
        if (r.tip      == null && r.tips         != null) r.tip      = r.tips;
      }
    }
  }

  // ---- Foods: alias vitaminD <-> vitD ----
  if (Array.isArray(window.FOODS_DB)) {
    for (const f of window.FOODS_DB) {
      if (f.vitD == null && f.vitaminD != null) f.vitD = f.vitaminD;
    }
  }

  // ---- NutritionEngine: wrap so the page can call (profile, load, goal)
  // and get flat numbers, while the underlying engine takes a single profile
  // object and returns {min,mid,max} ranges. ----
  const real = window.NutritionEngine;
  if (real && typeof real.computeTargets === 'function') {
    const innerCompute = real.computeTargets;
    real.computeTargets = function (profile, trainingLoad, goal) {
      const merged = Object.assign({}, profile || {});
      if (trainingLoad) merged.trainingLoad = trainingLoad;
      if (goal)         merged.goal         = goal;
      const t = innerCompute(merged);
      if (!t) return t;
      // Flatten {min, mid, max} → mid for the UI, but expose raw on .ranges
      const flatten = v => (v && typeof v === 'object' && 'mid' in v) ? v.mid : v;
      const out = {
        kcal:    flatten(t.kcal),
        protein: flatten(t.protein),
        carbs:   flatten(t.carbs),
        fat:     flatten(t.fat),
        ranges:  t,
      };
      return out;
    };

    // scaleMeal: the engine expects (meal, profile, foodsDb).
    // The UI passes (meal, profile). Patch to inject the DB automatically.
    if (typeof real.scaleMeal === 'function') {
      const innerScale = real.scaleMeal;
      real.scaleMeal = function (meal, profile, foodsDb) {
        const db = foodsDb || window.FOODS_DB || [];
        const scaled = innerScale(meal, profile, db);
        if (!scaled) return scaled;
        // Flatten totals and rename baseG→qtyG so the UI's renderer works.
        if (scaled.totals && scaled.kcal == null) {
          scaled.kcal    = scaled.totals.kcal;
          scaled.protein = scaled.totals.protein;
          scaled.carbs   = scaled.totals.carbs;
          scaled.fat     = scaled.totals.fat;
        }
        if (Array.isArray(scaled.ingredients)) {
          for (const ing of scaled.ingredients) {
            if (ing.qtyG == null) ing.qtyG = ing.scaledG ?? ing.baseG;
          }
        }
        return scaled;
      };
    }
  }
})();
