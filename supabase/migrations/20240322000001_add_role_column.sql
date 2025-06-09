-- Add role column to existing users table if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'technician' CHECK (role IN ('admin', 'technician'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS mode text DEFAULT 'standard' CHECK (mode IN ('standard', 'no_phone'));

-- Update the trigger function to include role and mode columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    user_id,
    email,
    name,
    full_name,
    avatar_url,
    token_identifier,
    role,
    mode,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.id::text,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    'technician',
    'standard',
    NEW.created_at,
    NEW.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users to have default role if null
UPDATE public.users SET role = 'technician' WHERE role IS NULL;
UPDATE public.users SET mode = 'standard' WHERE mode IS NULL;
