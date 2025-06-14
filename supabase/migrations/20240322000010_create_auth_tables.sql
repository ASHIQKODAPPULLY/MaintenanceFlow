-- Enable pgcrypto if needed for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  token_identifier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_tier TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PLAN LIMITS TABLE
CREATE TABLE IF NOT EXISTS public.plan_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_tier TEXT UNIQUE NOT NULL,
  tasks_per_week INTEGER DEFAULT 5,
  max_active_tasks INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure plan_tier CHECK constraint includes all valid options
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'plan_limits' AND constraint_type = 'CHECK'
  ) THEN
    ALTER TABLE public.plan_limits DROP CONSTRAINT IF EXISTS plan_limits_plan_tier_check;
  END IF;

  ALTER TABLE public.plan_limits
  ADD CONSTRAINT plan_limits_plan_tier_check
  CHECK (plan_tier IN ('free', 'basic', 'pro', 'enterprise', 'unlimited'));
END
$$;

-- TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  asset_id UUID,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium',
  frequency TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SEED PLAN LIMITS (SAFE UPSERT)
INSERT INTO public.plan_limits (plan_tier, tasks_per_week, max_active_tasks) VALUES
  ('free', 5, 10),
  ('basic', 25, 50),
  ('pro', 100, 200),
  ('enterprise', 500, 1000),
  ('unlimited', -1, -1)
ON CONFLICT (plan_tier) DO NOTHING;

-- ADD TABLES TO supabase_realtime PUBLICATION SAFELY
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'users'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.users';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'subscriptions'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'plan_limits'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.plan_limits';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks';
  END IF;
END
$$;