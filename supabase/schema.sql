-- UCLA Inventory Management System - Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE equipment_status AS ENUM ('available', 'checked_out', 'archived');
CREATE TYPE manager_role AS ENUM ('super_admin', 'manager');
CREATE TYPE activity_action AS ENUM ('check_out', 'check_in', 'reminder', 'note', 'added', 'archived');

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL, -- Hex color for accent
  bg_color VARCHAR(7) NOT NULL DEFAULT '#F4F5F7', -- Hex background color for column
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment table
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  tag_number VARCHAR(50) NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  status equipment_status NOT NULL DEFAULT 'available',
  condition_notes TEXT[] DEFAULT '{}',
  archived_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (borrowers/students)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(200) NOT NULL,
  bruin_card_number VARCHAR(20) NOT NULL UNIQUE,
  publication VARCHAR(200) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Managers table (staff/admins)
CREATE TABLE managers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  role manager_role NOT NULL DEFAULT 'manager',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checkouts table
CREATE TABLE checkouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  checked_out_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_at TIMESTAMPTZ NOT NULL,
  condition_note_out TEXT,
  checked_in_at TIMESTAMPTZ,
  condition_note_in TEXT,
  checked_out_by VARCHAR(200) NOT NULL,
  checked_in_by VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one active checkout per equipment
CREATE UNIQUE INDEX idx_one_active_checkout_per_equipment
ON checkouts (equipment_id)
WHERE checked_in_at IS NULL;

-- Activity log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  action activity_action NOT NULL,
  actor_id UUID REFERENCES managers(id) ON DELETE SET NULL,
  actor_name VARCHAR(200) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_checkouts_equipment ON checkouts(equipment_id);
CREATE INDEX idx_checkouts_user ON checkouts(user_id);
CREATE INDEX idx_checkouts_active ON checkouts(equipment_id) WHERE checked_in_at IS NULL;
CREATE INDEX idx_checkouts_overdue ON checkouts(due_at) WHERE checked_in_at IS NULL;
CREATE INDEX idx_activity_equipment ON activity_log(equipment_id);
CREATE INDEX idx_activity_timestamp ON activity_log(timestamp DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_managers_updated_at
  BEFORE UPDATE ON managers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkouts_updated_at
  BEFORE UPDATE ON checkouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All authenticated managers can read
CREATE POLICY "Managers can read categories" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can read equipment" ON equipment
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can read users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can read managers" ON managers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can read checkouts" ON checkouts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can read activity_log" ON activity_log
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies: All authenticated managers can write to operational tables
CREATE POLICY "Managers can insert equipment" ON equipment
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Managers can update equipment" ON equipment
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can insert users" ON users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Managers can update users" ON users
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can insert checkouts" ON checkouts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Managers can update checkouts" ON checkouts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Managers can insert activity_log" ON activity_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies: Super admin only for category management
CREATE POLICY "Super admin can update categories" ON categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM managers
      WHERE auth_user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can insert managers" ON managers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM managers
      WHERE auth_user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can update managers" ON managers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM managers
      WHERE auth_user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can delete managers" ON managers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM managers
      WHERE auth_user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- For development: Allow anon access (remove in production!)
-- These policies allow the app to work without authentication during development

CREATE POLICY "Dev: Allow anon read categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Dev: Allow anon all equipment" ON equipment
  FOR ALL USING (true);

CREATE POLICY "Dev: Allow anon all users" ON users
  FOR ALL USING (true);

CREATE POLICY "Dev: Allow anon read managers" ON managers
  FOR SELECT USING (true);

CREATE POLICY "Dev: Allow anon all checkouts" ON checkouts
  FOR ALL USING (true);

CREATE POLICY "Dev: Allow anon all activity_log" ON activity_log
  FOR ALL USING (true);

CREATE POLICY "Dev: Allow anon update categories" ON categories
  FOR UPDATE USING (true);

CREATE POLICY "Dev: Allow anon insert managers" ON managers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Dev: Allow anon update managers" ON managers
  FOR UPDATE USING (true);

CREATE POLICY "Dev: Allow anon delete managers" ON managers
  FOR DELETE USING (true);

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE equipment;
ALTER PUBLICATION supabase_realtime ADD TABLE checkouts;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
