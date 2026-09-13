create table if not exists public.ai_agent_runs (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  intent text not null default 'general',
  tool_names text[] not null default '{}',
  provider text,
  model text,
  knowledge_count integer not null default 0,
  memory_used boolean not null default false,
  verified boolean not null default false,
  verification_issues text[] not null default '{}',
  latency_ms integer,
  created_at timestamptz not null default now()
);

alter table public.ai_agent_runs enable row level security;
revoke all on table public.ai_agent_runs from anon, authenticated;
