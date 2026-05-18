-- Neon Postgres schema for MuscuMoov.
-- Run once in the Neon SQL Editor after creating the project.

create table if not exists public.app_state (
  app_key    text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists app_state_updated_at_idx
  on public.app_state(updated_at desc);
