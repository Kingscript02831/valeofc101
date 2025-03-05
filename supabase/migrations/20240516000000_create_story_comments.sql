
-- Tabela para comentários em histórias
create table if not exists public.story_comments (
  id uuid default uuid_generate_v4() primary key,
  story_id uuid references public.stories(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  parent_comment_id uuid references public.story_comments(id) on delete cascade,
  created_at timestamp with time zone default now() not null
);

-- Habilitar Row Level Security
alter table public.story_comments enable row level security;

-- Políticas RLS
create policy "Story comments são visíveis para todos"
  on story_comments for select
  using (true);

create policy "Usuários podem inserir seus próprios comentários"
  on story_comments for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar seus próprios comentários"
  on story_comments for update
  using (auth.uid() = user_id);

create policy "Usuários podem excluir seus próprios comentários"
  on story_comments for delete
  using (auth.uid() = user_id);

-- Permitir que o dono da story exclua qualquer comentário
create policy "Donos de stories podem excluir qualquer comentário"
  on story_comments for delete
  using (
    auth.uid() IN (
      SELECT profiles.id 
      FROM profiles 
      JOIN stories ON stories.user_id = profiles.id 
      WHERE stories.id = story_comments.story_id
    )
  );
