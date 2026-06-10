/* ===========================================================
   App Template — generic state, routing, NeonSync, components
   No data, just the framework. Fork and add your features.
   =========================================================== */

(function () {
  'use strict';

  // ---------- 1. SVG ICONS LIBRARY ----------
  const ICONS = {
    home:     '<svg viewBox="0 0 24 24"><path d="M3 12 12 3l9 9"/><path d="M5 10v10h14V10"/></svg>',
    list:     '<svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
    user:     '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
    plus:     '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    close:    '<svg viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>',
    settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    check:    '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
    back:     '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>',
    trash:    '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
  };

  function hydrateIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(el => {
      const name = el.getAttribute('data-icon');
      if (name && ICONS[name]) el.innerHTML = ICONS[name];
    });
  }

  // ---------- 2. STATE + PERSISTENCE ----------
  // Adapt this shape to your app domain.
  const DEFAULT_STATE = {
    user: { name: 'Samuel KÖNG', initials: 'SK' },
    items: [],             // example: { id, title, meta, image }
    flags: { onboarded: false },
    _ui: { selectedIds: [] },  // transient, not persisted
  };

  const STORAGE_KEY = 'app_state_v1';
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      return migrate(JSON.parse(raw));
    } catch (e) { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
  }

  function migrate(loaded) {
    const s = JSON.parse(JSON.stringify(DEFAULT_STATE));
    if (loaded && typeof loaded === 'object') {
      Object.assign(s.user, loaded.user || {});
      if (Array.isArray(loaded.items)) s.items = loaded.items;
      Object.assign(s.flags, loaded.flags || {});
    }
    return s;
  }

  function saveable(s) {
    // exclude transient _ui
    const { _ui, ...persisted } = s;
    return persisted;
  }

  function commit() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saveable(state))); } catch {}
    NeonSync.queueSave(STORAGE_KEY, saveable(state));
    render();
  }

  // ---------- 3. NEON SYNC ----------
  const NeonSync = {
    _t: null,
    queueSave(key, data) {
      clearTimeout(this._t);
      this._t = setTimeout(() => {
        fetch('/api/state/' + encodeURIComponent(key), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).catch(() => {});
      }, 600);
    },
    async pull(key) {
      try {
        const r = await fetch('/api/state/' + encodeURIComponent(key));
        return r.ok ? r.json() : null;
      } catch (e) { return null; }
    },
  };

  // ---------- 4. ROUTING (hash-based) ----------
  const ROUTES = {
    home: { id: 'tab-home', title: 'Accueil' },
    list: { id: 'tab-list', title: 'Liste' },
    me:   { id: 'tab-me',   title: 'Profil' },
  };
  const ROUTE_ORDER = ['home', 'list', 'me'];

  function routeFromHash() {
    const h = (location.hash || '#/home').slice(2);
    const [name, param] = h.split('/');
    return { name: ROUTES[name] ? name : 'home', param };
  }

  function navigateTo(routeName, param) {
    location.hash = '#/' + routeName + (param ? '/' + param : '');
  }
  window.navigateTo = navigateTo;

  function applyRoute() {
    const { name } = routeFromHash();
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(ROUTES[name].id)?.classList.add('active');
    document.getElementById('appHeaderTitle').textContent = ROUTES[name].title;
    document.querySelectorAll('.bn-btn').forEach(b => b.classList.toggle('active', b.dataset.route === name));
    document.querySelectorAll('.sb-item').forEach(b => b.classList.toggle('active', b.dataset.route === name));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // ---------- 5. WHEEL PICKER (iOS-style) ----------
  function createWheelPicker(opts) {
    const { container, min, max, step, initial, unit = '', decimals = 0, onChange } = opts;
    const rowHeight = 48;
    const totalSteps = Math.round((max - min) / step) + 1;

    container.innerHTML = `
      <div class="wheel-wrap" tabindex="0" role="slider"
           aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${initial}">
        <button class="wheel-bignum" type="button">
          <span class="wheel-bignum-val">${initial.toFixed(decimals)}</span><span class="wheel-bignum-unit">${unit}</span>
        </button>
        <div class="wheel-track">
          <div class="wheel-highlight"></div>
          <div class="wheel-stack"></div>
        </div>
        <div class="wheel-caption">±${step} par cran</div>
      </div>
    `;
    const wrap = container.querySelector('.wheel-wrap');
    const track = wrap.querySelector('.wheel-track');
    const stack = wrap.querySelector('.wheel-stack');
    const bignumVal = wrap.querySelector('.wheel-bignum-val');
    const bignumBtn = wrap.querySelector('.wheel-bignum');

    // Build rows
    const pad = Math.floor(240 / rowHeight / 2);
    const rows = [];
    for (let i = -pad; i < totalSteps + pad; i++) {
      const v = i >= 0 && i < totalSteps ? (min + i * step).toFixed(decimals) : '';
      const row = document.createElement('div');
      row.className = 'wheel-row';
      row.textContent = v;
      stack.appendChild(row);
      rows.push({ el: row, value: v });
    }

    let value = initial;
    function valueToOffset(v) {
      const idx = Math.round((v - min) / step);
      return -idx * rowHeight + (240 / 2 - rowHeight / 2) - pad * rowHeight;
    }
    function offsetToValue(off) {
      const adjusted = (240 / 2 - rowHeight / 2) - pad * rowHeight - off;
      const idx = Math.round(adjusted / rowHeight);
      return Math.max(min, Math.min(max, min + idx * step));
    }
    function setVisual(v) {
      bignumVal.textContent = v.toFixed(decimals);
      wrap.setAttribute('aria-valuenow', v);
    }
    function applyOffset(off, animated) {
      stack.style.transition = animated ? 'transform 180ms cubic-bezier(0.22,1,0.36,1)' : 'none';
      stack.style.transform = 'translateY(' + off + 'px)';
    }
    applyOffset(valueToOffset(value), false);

    let startY = 0, startOffset = 0, dragging = false;
    track.addEventListener('pointerdown', (e) => {
      dragging = true; startY = e.clientY;
      startOffset = parseFloat(stack.style.transform.replace(/[^\d.\-]/g, '')) || 0;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const off = startOffset + (e.clientY - startY);
      applyOffset(off, false);
      setVisual(offsetToValue(off));
    });
    track.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      const off = startOffset + (e.clientY - startY);
      const snapped = offsetToValue(off);
      value = snapped;
      applyOffset(valueToOffset(snapped), true);
      setVisual(snapped);
      if (onChange) onChange(snapped);
    });
    track.addEventListener('wheel', (e) => {
      e.preventDefault();
      const dir = e.deltaY > 5 ? 1 : e.deltaY < -5 ? -1 : 0;
      if (!dir) return;
      value = Math.max(min, Math.min(max, value + dir * step));
      applyOffset(valueToOffset(value), true);
      setVisual(value);
      if (onChange) onChange(value);
    }, { passive: false });
    wrap.addEventListener('keydown', (e) => {
      let d = 0;
      if (e.key === 'ArrowUp')   d =  step;
      if (e.key === 'ArrowDown') d = -step;
      if (e.key === 'PageUp')    d =  step * 10;
      if (e.key === 'PageDown')  d = -step * 10;
      if (e.key === 'Home')      { value = min; }
      else if (e.key === 'End')  { value = max; }
      else if (d) value = Math.max(min, Math.min(max, value + d));
      else return;
      e.preventDefault();
      applyOffset(valueToOffset(value), true);
      setVisual(value);
      if (onChange) onChange(value);
    });

    return {
      getValue: () => value,
      setValue: (v) => {
        value = Math.max(min, Math.min(max, v));
        applyOffset(valueToOffset(value), true);
        setVisual(value);
      },
      onBigNumberTap(cb) { bignumBtn.addEventListener('click', cb); },
    };
  }

  // ---------- 6. MODALS ----------
  function openModal(id) { document.getElementById(id)?.classList.add('show'); }
  function closeModal(id) { document.getElementById(id)?.classList.remove('show'); }
  document.addEventListener('click', (e) => {
    const id = e.target.closest('[data-close]')?.getAttribute('data-close');
    if (id) closeModal(id);
  });

  // ---------- 7. RENDER ----------
  function render() {
    // Example: render the list rows
    const list = document.getElementById('rowList');
    if (list) {
      if (!state.items.length) {
        list.innerHTML = `<div style="padding:24px; text-align:center; color:var(--graphite);">Liste vide. Touche le + pour ajouter.</div>`;
      } else {
        list.innerHTML = state.items.map(it => `
          <div class="row" data-id="${it.id}">
            <div class="row-thumb">${it.image ? `<img src="${it.image}" alt=""/>` : (it.title || '?')[0]}</div>
            <div class="row-body">
              <div class="row-title">${it.title || ''}</div>
              <div class="row-meta">${it.meta || ''}</div>
            </div>
            <span class="row-chev" data-icon="chevronRight"></span>
          </div>
        `).join('');
        hydrateIcons(list);
      }
    }
    // Avatar initials
    const avatar = document.getElementById('avatarBtn');
    if (avatar) avatar.textContent = state.user?.initials || '?';
  }

  // ---------- 8. BOOT ----------
  function boot() {
    hydrateIcons();

    // Nav clicks
    document.querySelectorAll('[data-route]').forEach(b => {
      b.addEventListener('click', () => navigateTo(b.dataset.route));
    });

    // Avatar → modal example
    document.getElementById('avatarBtn')?.addEventListener('click', () => openModal('demoModal'));

    // FAB → add a fake item
    document.getElementById('fab')?.addEventListener('click', () => {
      state.items.push({
        id: 'i' + Date.now(),
        title: 'Item ' + (state.items.length + 1),
        meta: 'Ajouté maintenant',
      });
      commit();
      navigateTo('list');
    });

    // Wheel demo
    const wheelDemo = document.getElementById('wheelDemo');
    if (wheelDemo) {
      createWheelPicker({
        container: wheelDemo,
        min: 40, max: 150, step: 0.1, initial: 75, unit: 'kg', decimals: 1,
        onChange: v => console.log('weight =', v),
      });
    }

    // Open-modal demo button
    document.getElementById('openModalBtn')?.addEventListener('click', () => openModal('demoModal'));

    // Hash routing
    window.addEventListener('hashchange', applyRoute);
    applyRoute();
    render();

    // Optional: pull remote state
    NeonSync.pull(STORAGE_KEY).then(remote => {
      if (remote && remote.data) {
        state = migrate(remote.data);
        render();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else { boot(); }
})();
