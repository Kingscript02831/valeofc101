
-- Adicionar campos para personalização da página de login
ALTER TABLE public.site_configuration 
ADD COLUMN IF NOT EXISTS login_background_image TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS login_button_color TEXT DEFAULT '#9b87f5',
ADD COLUMN IF NOT EXISTS login_button_text_color TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS login_footer_text TEXT DEFAULT NULL;

-- Atualizar valores iniciais
UPDATE public.site_configuration 
SET 
  login_background_image = 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb',
  login_button_color = '#9b87f5',
  login_button_text_color = '#FFFFFF',
  login_footer_text = '2025 | Desenvolvido por Vinícius Dev'
WHERE id IS NOT NULL;
