/* ============================================================
 * neon-sync.js — cross-device sync via Vercel API + Neon Postgres.
 *
 * Usage at the bottom of a page's IIFE, BEFORE the closing })();
 *
 *   NeonSync.init({
 *     appKey: 'dashboard',                            // unique per page
 *     keyPatterns: [/^goals:/, /^goal_streak_v1$/],   // localStorage keys to sync
 *     onRemoteApply: () => { reloadInMemoryState(); rerenderUI(); }
 *   });
 *
 * Picks up any change to a matched localStorage key (via monkey-patched
 * setItem / removeItem) and pushes a debounced ~250ms snapshot to the
 * Vercel API. Polls back every 2.5s while the tab is visible. Queues
 * incoming remote updates while the user is typing in inputs and applies
 * them on focusout so live input is never wiped. Flushes pending writes
 * with keepalive on pagehide / beforeunload / visibilitychange:hidden.
 * ============================================================ */
(function () {
  'use strict';
  if (window.NeonSync) return;

  const API_BASE = '/api/state';
  const DEBOUNCE_MS = 250;
  const POLL_MS = 2500;

  function matches(key, patterns) {
    for (const p of patterns) {
      if (p instanceof RegExp) { if (p.test(key)) return true; }
      else if (typeof p === 'string') {
        if (p.endsWith('*') ? key.startsWith(p.slice(0, -1)) : key === p) return true;
      }
    }
    return false;
  }

  function snapshotLocal(patterns) {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !matches(k, patterns)) continue;
      const raw = localStorage.getItem(k);
      if (raw == null) continue;
      try { out[k] = JSON.parse(raw); } catch { out[k] = raw; }
    }
    return out;
  }

  function userIsEditing() {
    const a = document.activeElement;
    if (!a) return false;
    const tag = (a.tagName || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (a.isContentEditable) return true;
    return false;
  }

  async function apiGet(appKey) {
    const r = await fetch(`${API_BASE}/${encodeURIComponent(appKey)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!r.ok) throw new Error(`GET ${appKey} → ${r.status}`);
    return r.json();
  }

  async function apiPut(appKey, data, opts) {
    const init = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    };
    if (opts && opts.keepalive) init.keepalive = true;
    const r = await fetch(`${API_BASE}/${encodeURIComponent(appKey)}`, init);
    if (!r.ok) throw new Error(`PUT ${appKey} → ${r.status}`);
    return r.json();
  }

  function init(opts) {
    const appKey = String(opts.appKey || '').trim();
    if (!appKey) throw new Error('NeonSync.init: appKey required');
    const patterns = Array.isArray(opts.keyPatterns) ? opts.keyPatterns : [];
    const onRemoteApply = typeof opts.onRemoteApply === 'function' ? opts.onRemoteApply : () => {};

    let lastSyncedJson = '';
    let pendingRemote = null;
    let pushTimer = null;
    let pollTimer = null;
    let suppressPatchedEvents = false;
    let dirty = false;

    function applyRemote(data) {
      if (!data || typeof data !== 'object') return false;
      const newJson = JSON.stringify(data);
      if (newJson === lastSyncedJson) return false;

      suppressPatchedEvents = true;
      try {
        // Remove local keys that are matched but no longer in remote
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && matches(k, patterns) && !(k in data)) toRemove.push(k);
        }
        toRemove.forEach(k => origRemove.call(localStorage, k));
        // Write incoming keys
        for (const k of Object.keys(data)) {
          if (!matches(k, patterns)) continue;
          const v = data[k];
          const raw = typeof v === 'string' ? v : JSON.stringify(v);
          origSet.call(localStorage, k, raw);
        }
      } finally {
        suppressPatchedEvents = false;
      }
      lastSyncedJson = newJson;
      try { onRemoteApply(); } catch (e) { console.error('[NeonSync] onRemoteApply', e); }
      return true;
    }

    function scheduleApply(data) {
      if (userIsEditing()) { pendingRemote = data; return; }
      applyRemote(data);
    }

    function flushPendingRemote() {
      if (!pendingRemote) return;
      const d = pendingRemote; pendingRemote = null;
      applyRemote(d);
    }

    async function pushNow(opts2) {
      const snap = snapshotLocal(patterns);
      const json = JSON.stringify(snap);
      if (json === lastSyncedJson) { dirty = false; return; }
      try {
        await apiPut(appKey, snap, opts2);
        lastSyncedJson = json;
        dirty = false;
      } catch (e) {
        console.warn('[NeonSync] push failed', e);
      }
    }

    function schedulePush() {
      dirty = true;
      if (pushTimer) clearTimeout(pushTimer);
      pushTimer = setTimeout(() => { pushTimer = null; pushNow(); }, DEBOUNCE_MS);
    }

    async function pollOnce() {
      try {
        const remote = await apiGet(appKey);
        if (remote && remote.data) scheduleApply(remote.data);
      } catch (e) { /* swallow */ }
    }

    function startPolling() {
      stopPolling();
      pollTimer = setInterval(() => {
        if (document.hidden) return;
        pollOnce();
      }, POLL_MS);
    }
    function stopPolling() {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    }

    // ---- Monkey-patch localStorage ----
    const origSet = localStorage.setItem.bind(localStorage);
    const origRemove = localStorage.removeItem.bind(localStorage);

    localStorage.setItem = function (k, v) {
      origSet(k, v);
      if (!suppressPatchedEvents && matches(k, patterns)) {
        try { schedulePush(); } catch (e) { console.error('[NeonSync] schedulePush', e); }
      }
    };
    localStorage.removeItem = function (k) {
      origRemove(k);
      if (!suppressPatchedEvents && matches(k, patterns)) {
        try { schedulePush(); } catch (e) { console.error('[NeonSync] schedulePush', e); }
      }
    };

    // ---- Apply pendingRemote when user finishes typing ----
    document.addEventListener('focusout', () => {
      setTimeout(() => { if (!userIsEditing()) flushPendingRemote(); }, 0);
    }, true);

    // ---- Flush on tab close / hide ----
    function flushOnExit() {
      if (!dirty) return;
      const snap = snapshotLocal(patterns);
      const json = JSON.stringify(snap);
      if (json === lastSyncedJson) return;
      try {
        fetch(`${API_BASE}/${encodeURIComponent(appKey)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: snap }),
          keepalive: true
        });
      } catch (e) { /* best-effort */ }
    }
    window.addEventListener('pagehide', flushOnExit);
    window.addEventListener('beforeunload', flushOnExit);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) flushOnExit();
      else pollOnce();
    });

    // ---- Initial pull, then push-if-empty seed, then start polling ----
    (async () => {
      let remote = null;
      try { remote = await apiGet(appKey); } catch (e) { console.warn('[NeonSync] initial GET failed', e); }
      if (remote && remote.data && Object.keys(remote.data).length > 0) {
        applyRemote(remote.data);
      } else {
        const snap = snapshotLocal(patterns);
        if (Object.keys(snap).length > 0) {
          try { await apiPut(appKey, snap); lastSyncedJson = JSON.stringify(snap); }
          catch (e) { console.warn('[NeonSync] seed push failed', e); }
        }
      }
      startPolling();
    })();

    return {
      flush: () => pushNow(),
      pollNow: () => pollOnce()
    };
  }

  window.NeonSync = { init };
})();
