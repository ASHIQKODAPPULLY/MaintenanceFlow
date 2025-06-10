-- Add phone number column to users table for SMS notifications
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_number text;

-- Create index for phone number lookups
CREATE INDEX IF NOT EXISTS users_phone_number_idx ON public.users(phone_number);

-- Update the trigger function to include phone number from user metadata
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
    phone_number,
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
    NEW.raw_user_meta_data->>'phone_number',
    NEW.email,
    'technician',
    'standard',
    NEW.created_at,
    NEW.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the user update function to include phone number
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    email = NEW.email,
    name = NEW.raw_user_meta_data->>'name',
    full_name = NEW.raw_user_meta_data->>'full_name',
    avatar_url = NEW.raw_user_meta_data->>'avatar_url',
    phone_number = NEW.raw_user_meta_data->>'phone_number',
    updated_at = NEW.updated_at
  WHERE user_id = NEW.id::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
