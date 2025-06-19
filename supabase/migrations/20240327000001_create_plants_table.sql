CREATE TABLE IF NOT EXISTS plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location TEXT,
  plant_type VARCHAR(100),
  capacity VARCHAR(100),
  notes TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plants_owner_id ON plants(owner_id);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS plant_id UUID REFERENCES plants(id) ON DELETE SET NULL;
ALTER TABLE maintenance_logs ADD COLUMN IF NOT EXISTS plant_id UUID REFERENCES plants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tasks_plant_id ON tasks(plant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_plant_id ON maintenance_logs(plant_id);

DROP POLICY IF EXISTS "Users can view own plants" ON plants;
CREATE POLICY "Users can view own plants"
ON plants FOR SELECT
USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own plants" ON plants;
CREATE POLICY "Users can insert own plants"
ON plants FOR INSERT
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own plants" ON plants;
CREATE POLICY "Users can update own plants"
ON plants FOR UPDATE
USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own plants" ON plants;
CREATE POLICY "Users can delete own plants"
ON plants FOR DELETE
USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can view plant tasks" ON tasks;
CREATE POLICY "Users can view plant tasks"
ON tasks FOR SELECT
USING (assigned_to = auth.uid() OR EXISTS (
  SELECT 1 FROM plants WHERE plants.id = tasks.plant_id AND plants.owner_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can insert plant tasks" ON tasks;
CREATE POLICY "Users can insert plant tasks"
ON tasks FOR INSERT
WITH CHECK (assigned_to = auth.uid() OR EXISTS (
  SELECT 1 FROM plants WHERE plants.id = tasks.plant_id AND plants.owner_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can update plant tasks" ON tasks;
CREATE POLICY "Users can update plant tasks"
ON tasks FOR UPDATE
USING (assigned_to = auth.uid() OR EXISTS (
  SELECT 1 FROM plants WHERE plants.id = tasks.plant_id AND plants.owner_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can delete plant tasks" ON tasks;
CREATE POLICY "Users can delete plant tasks"
ON tasks FOR DELETE
USING (assigned_to = auth.uid() OR EXISTS (
  SELECT 1 FROM plants WHERE plants.id = tasks.plant_id AND plants.owner_id = auth.uid()
));

alter publication supabase_realtime add table plants;