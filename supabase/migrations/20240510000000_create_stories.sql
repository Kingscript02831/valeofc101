
-- Tabela para histórias (stories)
create table if not exists public.stories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video', 'text')),
  created_at timestamp with time zone default now() not null,
  expires_at timestamp with time zone default (now() + interval '24 hours') not null
);

-- Tabela para registrar visualizações de histórias
create table if not exists public.story_views (
  id uuid default uuid_generate_v4() primary key,
  story_id uuid references public.stories(id) on delete cascade not null,
  viewer_id uuid references public.profiles(id) on delete cascade not null,
  viewed_at timestamp with time zone default now() not null,
  unique(story_id, viewer_id)
);

-- Criar políticas RLS
alter table public.stories enable row level security;
alter table public.story_views enable row level security;

-- Políticas para stories
create policy "Stories are viewable by everyone"
  on stories for select
  using (true);

create policy "Users can insert their own stories"
  on stories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own stories"
  on stories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own stories"
  on stories for delete
  using (auth.uid() = user_id);

-- Políticas para story_views
create policy "Story views are viewable by everyone"
  on story_views for select
  using (true);

create policy "Users can insert their own story views"
  on story_views for insert
  with check (auth.uid() = viewer_id);

-- Função para limpar histórias expiradas (será executada por um cron job)
create or replace function clean_expired_stories()
returns void
language plpgsql
security definer
as $$
begin
  delete from stories where expires_at < now();
end;
$$;
