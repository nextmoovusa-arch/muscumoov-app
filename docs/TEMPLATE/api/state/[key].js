// Vercel serverless function: GET / PUT JSON state, keyed by `app_key`.
// Requires Neon Postgres connected (POSTGRES_URL / DATABASE_URL env vars).
// Apply schema.sql once before first use.

const { neon } = require('@neondatabase/serverless');

const ALLOWED_KEYS = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(body));
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});

  const key = String(req.query.key || '').toLowerCase();
  if (!ALLOWED_KEYS.test(key)) return send(res, 400, { error: 'invalid key' });

  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return send(res, 500, { error: 'DATABASE_URL not configured' });

  const sql = neon(url);

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        select data, updated_at
        from public.app_state
        where app_key = ${key}
      `;
      return send(res, 200, rows[0] || null);
    }

    if (req.method === 'PUT') {
      const body = req.body && typeof req.body === 'object' ? req.body : {};
      await sql`
        insert into public.app_state (app_key, data)
        values (${key}, ${body}::jsonb)
        on conflict (app_key)
        do update set data = excluded.data, updated_at = now()
      `;
      return send(res, 200, { ok: true });
    }

    return send(res, 405, { error: 'method not allowed' });
  } catch (e) {
    return send(res, 500, { error: String((e && e.message) || e) });
  }
};
