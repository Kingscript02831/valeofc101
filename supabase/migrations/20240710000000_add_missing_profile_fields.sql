
-- Add missing fields to profiles table if they don't exist
DO $$
BEGIN
    -- Check if street column exists and add it if not
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'street') THEN
        ALTER TABLE public.profiles ADD COLUMN street text;
    END IF;

    -- Check if house_number column exists and add it if not
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'house_number') THEN
        ALTER TABLE public.profiles ADD COLUMN house_number text;
    END IF;

    -- Check if postal_code column exists and add it if not
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'postal_code') THEN
        ALTER TABLE public.profiles ADD COLUMN postal_code text;
    END IF;

    -- Check if basic_info_updated_at column exists and add it if not
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'profiles' 
                  AND column_name = 'basic_info_updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN basic_info_updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- Add comments to document the fields
COMMENT ON COLUMN public.profiles.street IS 'User street address';
COMMENT ON COLUMN public.profiles.house_number IS 'User house number';
COMMENT ON COLUMN public.profiles.postal_code IS 'User postal code';
COMMENT ON COLUMN public.profiles.basic_info_updated_at IS 'Timestamp of the last basic info update';
