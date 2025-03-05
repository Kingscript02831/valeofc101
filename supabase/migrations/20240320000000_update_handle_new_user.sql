
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    email,
    phone,
    birth_date,
    location_id
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name', -- Changed from 'name' to 'full_name' to match the SignUp form
    new.email,
    new.raw_user_meta_data->>'phone',
    (new.raw_user_meta_data->>'birth_date')::date,
    (new.raw_user_meta_data->>'location_id')::uuid
  );
  RETURN new;
END;
$$;
