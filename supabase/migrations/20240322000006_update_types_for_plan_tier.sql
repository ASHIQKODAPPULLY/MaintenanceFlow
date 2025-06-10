-- Update types to include missing columns from subscriptions table
-- The plan_tier column already exists in the table but is missing from the types

-- Update the subscriptions table to ensure plan_tier column exists
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'basic' CHECK (plan_tier IN ('basic', 'pro', 'enterprise'));

-- Add task limits table to store plan configurations
CREATE TABLE IF NOT EXISTS public.plan_limits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_tier text NOT NULL UNIQUE CHECK (plan_tier IN ('free', 'basic', 'pro', 'enterprise')),
    tasks_per_week integer NOT NULL DEFAULT 5,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default plan limits
INSERT INTO public.plan_limits (plan_tier, tasks_per_week) VALUES 
    ('free', 5),
    ('basic', 25),
    ('pro', 100),
    ('enterprise', -1) -- -1 means unlimited
ON CONFLICT (plan_tier) DO UPDATE SET 
    tasks_per_week = EXCLUDED.tasks_per_week;

-- Enable realtime for plan_limits
alter publication supabase_realtime add table plan_limits;
