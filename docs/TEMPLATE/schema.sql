-- Apply once in your Neon Postgres database (or run via prisma migrate / psql).

create table if not exists public.app_state (
  app_key     text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

create index if not exists idx_app_state_updated_at on public.app_state (updated_at desc);
