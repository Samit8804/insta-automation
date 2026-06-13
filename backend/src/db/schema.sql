-- InstaFlow Database Schema for Supabase (PostgreSQL)

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  instagram_session_token TEXT,
  instagram_last_active TIMESTAMPTZ,
  instagram_connected BOOLEAN DEFAULT false,
  instagram_username TEXT,
  preferences_automation_enabled BOOLEAN DEFAULT true,
  preferences_default_mode TEXT DEFAULT 'random' CHECK (preferences_default_mode IN ('random', 'trending', 'smart')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Groups
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  group_name TEXT NOT NULL,
  alias TEXT,
  target_group TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Schedules
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  interval TEXT NOT NULL CHECK (interval IN ('15sec', '30min', '1hour', '2hours', '6hours', 'custom')),
  custom_interval INTEGER,
  active_days TEXT[] DEFAULT '{}',
  active_hours_start TIME DEFAULT '00:00',
  active_hours_end TIME DEFAULT '23:59',
  selection_mode TEXT DEFAULT 'random' CHECK (selection_mode IN ('random', 'trending', 'smart')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Logs
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  group_name TEXT,
  reel_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  message TEXT,
  execution_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_groups_user_id ON groups(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_status ON logs(status);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Note: RLS not used since auth is handled by custom JWT at the application layer
