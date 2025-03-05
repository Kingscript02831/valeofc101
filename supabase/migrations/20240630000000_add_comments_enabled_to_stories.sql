
-- Adiciona um campo para controlar se os comentários estão habilitados
-- Por padrão, os comentários estão habilitados
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS comments_enabled boolean DEFAULT true;
