
-- Add login customization fields to site_configuration table
ALTER TABLE public.site_configuration
ADD COLUMN IF NOT EXISTS login_background_image text,
ADD COLUMN IF NOT EXISTS login_card_background_color text DEFAULT '#0F0F10',
ADD COLUMN IF NOT EXISTS login_button_color text DEFAULT '#CB5EEE',
ADD COLUMN IF NOT EXISTS login_button_text_color text DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS login_label_color text DEFAULT '#CB5EEE',
ADD COLUMN IF NOT EXISTS login_label_muted_color text DEFAULT 'rgba(255, 255, 255, 0.5)',
ADD COLUMN IF NOT EXISTS login_developer_text text DEFAULT '2025 | Desenvolvido por Vinícius Dev',
ADD COLUMN IF NOT EXISTS login_quote_text text DEFAULT 'No futuro, a tecnologia nos permitirá criar realidades alternativas tão convincentes que será difícil distinguir o que é real do que é simulado.',
ADD COLUMN IF NOT EXISTS login_quote_author text DEFAULT 'Jaron Lanier',
ADD COLUMN IF NOT EXISTS login_quote_author_title text DEFAULT 'Cientista da computação e especialista em realidade virtual.';
