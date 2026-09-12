create extension if not exists pgcrypto;

create table if not exists public.ai_memories (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid null references auth.users(id) on delete cascade,
  memory_type text not null default 'context' check (memory_type in ('identity','preference','relationship','context','goal','boundary')),
  content text not null,
  importance smallint not null default 3 check (importance between 1 and 5),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_used_at timestamptz null
);

create index if not exists ai_memories_session_idx on public.ai_memories(session_id, importance desc, updated_at desc);
create index if not exists ai_memories_user_idx on public.ai_memories(user_id, importance desc, updated_at desc);

alter table public.ai_memories enable row level security;
revoke all on public.ai_memories from anon, authenticated;
grant all on public.ai_memories to service_role;

create or replace function public.ai_memories_touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ai_memories_updated_at on public.ai_memories;
create trigger ai_memories_updated_at
before update on public.ai_memories
for each row execute function public.ai_memories_touch_updated_at();
