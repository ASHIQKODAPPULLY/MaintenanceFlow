CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(user_id) ON DELETE SET NULL,
  log_type VARCHAR(50) NOT NULL DEFAULT 'maintenance',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  priority VARCHAR(20) DEFAULT 'medium',
  completion_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  inspection_date TIMESTAMP WITH TIME ZONE,
  inspector_name VARCHAR(255),
  inspector_certification VARCHAR(255),
  compliance_status VARCHAR(50) DEFAULT 'compliant',
  cost DECIMAL(10,2),
  labor_hours DECIMAL(5,2),
  materials_used TEXT,
  safety_notes TEXT,
  before_photos TEXT[],
  after_photos TEXT[],
  documentation_files TEXT[],
  next_inspection_due TIMESTAMP WITH TIME ZONE,
  regulatory_requirements TEXT,
  qa_approved BOOLEAN DEFAULT false,
  qa_approved_by TEXT REFERENCES users(user_id) ON DELETE SET NULL,
  qa_approved_date TIMESTAMP WITH TIME ZONE,
  legal_compliance_verified BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_task_id ON maintenance_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_property_id ON maintenance_logs(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_user_id ON maintenance_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_completion_date ON maintenance_logs(completion_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_log_type ON maintenance_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_compliance_status ON maintenance_logs(compliance_status);

alter publication supabase_realtime add table maintenance_logs;