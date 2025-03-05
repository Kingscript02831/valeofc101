
-- Adiciona o campo parent_comment_id à tabela story_comments se ainda não existir
-- (Esta parte já está em uma migração anterior)

-- Primeiro vamos verificar se a política já existe e removê-la caso exista
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'story_comments' 
    AND policyname = 'Donos de stories podem excluir qualquer comentário'
  ) THEN
    DROP POLICY "Donos de stories podem excluir qualquer comentário" ON story_comments;
  END IF;
END
$$;

-- Agora criamos a política
CREATE POLICY "Donos de stories podem excluir qualquer comentário"
  ON story_comments FOR DELETE
  USING (
    auth.uid() IN (
      SELECT profiles.id 
      FROM profiles 
      JOIN stories ON stories.user_id = profiles.id 
      WHERE stories.id = story_comments.story_id
    )
  );
