ALTER TABLE tasks ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type VARCHAR(50) DEFAULT 'recurring';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_notes TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_tasks_property_id ON tasks(property_id);
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type);

ALTER TABLE users ADD COLUMN IF NOT EXISTS contact_method VARCHAR(50) DEFAULT 'email';
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "whatsapp": false}'::jsonb;

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (assigned_to = auth.uid() OR EXISTS (
  SELECT 1 FROM properties WHERE properties.id = tasks.property_id AND properties.owner_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
CREATE POLICY "Users can insert own tasks"
ON tasks FOR INSERT
WITH CHECK (assigned_to = auth.uid() OR EXISTS (
  SELECT 1 FROM properties WHERE properties.id = tasks.property_id AND properties.owner_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (assigned_to = auth.uid() OR EXISTS (
  SELECT 1 FROM properties WHERE properties.id = tasks.property_id AND properties.owner_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
USING (assigned_to = auth.uid() OR EXISTS (
  SELECT 1 FROM properties WHERE properties.id = tasks.property_id AND properties.owner_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can view own properties" ON properties;
CREATE POLICY "Users can view own properties"
ON properties FOR SELECT
USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
CREATE POLICY "Users can insert own properties"
ON properties FOR INSERT
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own properties" ON properties;
CREATE POLICY "Users can update own properties"
ON properties FOR UPDATE
USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own properties" ON properties;
CREATE POLICY "Users can delete own properties"
ON properties FOR DELETE
USING (owner_id = auth.uid());