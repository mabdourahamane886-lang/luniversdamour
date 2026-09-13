create table if not exists public.amour_ai_knowledge (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null default 'general',
  language text not null default 'fr',
  tags text[] not null default '{}',
  published boolean not null default true,
  priority integer not null default 0,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.amour_ai_knowledge_set_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := to_tsvector('simple'::regconfig, coalesce(new.title, '') || ' ' || coalesce(new.content, ''));
  new.updated_at := now();
  return new;
end;
$$;

create trigger amour_ai_knowledge_search_vector_trigger
before insert or update on public.amour_ai_knowledge
for each row execute function public.amour_ai_knowledge_set_search_vector();

create index if not exists amour_ai_knowledge_search_idx
  on public.amour_ai_knowledge using gin (search_vector);

alter table public.amour_ai_knowledge enable row level security;
revoke all on public.amour_ai_knowledge from public, anon, authenticated;
grant all on public.amour_ai_knowledge to service_role;

create or replace function public.search_amour_ai_knowledge(search_text text, max_results integer default 5)
returns table (
  id uuid,
  title text,
  content text,
  category text,
  language text,
  tags text[],
  priority integer,
  rank real
)
language sql
stable
as $$
  select
    k.id, k.title, k.content, k.category, k.language, k.tags, k.priority,
    ts_rank(k.search_vector, plainto_tsquery('simple'::regconfig, search_text)) as rank
  from public.amour_ai_knowledge k
  where k.published = true
    and k.search_vector @@ plainto_tsquery('simple'::regconfig, search_text)
  order by rank desc, k.priority desc, k.updated_at desc
  limit greatest(1, least(max_results, 20));
$$;

revoke execute on function public.search_amour_ai_knowledge(text, integer) from public, anon, authenticated;
grant execute on function public.search_amour_ai_knowledge(text, integer) to service_role;
