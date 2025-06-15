-- Ensure 'assets' table exists before inserting into it
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  location TEXT,
  install_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure 'description' column exists in tasks
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS description TEXT;

-- Ensure 'email' is unique for users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_unique'
  ) THEN
    ALTER TABLE public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);
  END IF;
END;
$$;

-- Create or upsert admin user
DO $$
DECLARE
  admin_user_id UUID := gen_random_uuid();
  existing_user RECORD;
BEGIN
  SELECT * INTO existing_user
  FROM public.users
  WHERE email = 'ashiqdink@gmail.com';

  IF NOT FOUND THEN
    INSERT INTO public.users (
      id, user_id, email, name, full_name, role, token_identifier, created_at, updated_at
    ) VALUES (
      admin_user_id,
      admin_user_id,
      'ashiqdink@gmail.com',
      'System Administrator',
      'System Administrator',
      'admin',
      'ashiqdink@gmail.com',
      now(),
      now()
    );
  ELSE
    UPDATE public.users
    SET
      role = 'admin',
      name = 'System Administrator',
      full_name = 'System Administrator',
      updated_at = now()
    WHERE email = 'ashiqdink@gmail.com';
    admin_user_id := existing_user.user_id;
  END IF;
END;
$$;

-- Insert sample assets only if they don't exist
INSERT INTO public.assets (name, type, location, install_date)
SELECT * FROM (
  VALUES
    ('HVAC Unit A1', 'HVAC', 'Building A - Floor 1', '2023-01-15'::date),
    ('Water Heater B2', 'Plumbing', 'Building B - Basement', '2022-08-20'::date),
    ('Generator C1', 'Electrical', 'Building C - Roof', '2023-03-10'::date),
    ('Elevator D1', 'Mechanical', 'Building D - Shaft', '2021-12-05'::date)
) AS new_assets(name, type, location, install_date)
WHERE NOT EXISTS (
  SELECT 1 FROM public.assets WHERE assets.name = new_assets.name
);

-- Insert sample task for admin user (ensure UUID cast)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT user_id INTO admin_user_id FROM public.users WHERE email = 'ashiqdink@gmail.com';

  INSERT INTO public.tasks (
    title, description, asset_id, assigned_to, priority, status, frequency, due_date
  )
  SELECT
    'Monthly HVAC Filter Check',
    'Check and replace HVAC filters as needed',
    a.id,
    admin_user_id,
    'medium',
    'pending',
    'monthly',
    now() + interval '7 days'
  FROM public.assets a
  WHERE a.name = 'HVAC Unit A1'
  AND NOT EXISTS (
    SELECT 1 FROM public.tasks
    WHERE title = 'Monthly HVAC Filter Check'
      AND assigned_to = admin_user_id
  );
END;
$$;
