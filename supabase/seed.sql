-- UCLA Inventory Management System - Seed Data
-- Run this after schema.sql to populate with initial data

-- Insert categories
INSERT INTO categories (id, name, color, bg_color) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Cameras', '#0052CC', '#E9F2FF'),
  ('00000000-0000-0000-0000-000000000002', 'Lenses', '#6554C0', '#F3F0FF'),
  ('00000000-0000-0000-0000-000000000003', 'Projectors', '#00875A', '#E3FCEF'),
  ('00000000-0000-0000-0000-000000000004', 'Recorders', '#FF5630', '#FFEBE6'),
  ('00000000-0000-0000-0000-000000000005', 'Lighting', '#FF991F', '#FFF7E6'),
  ('00000000-0000-0000-0000-000000000006', 'Audio', '#36B37E', '#E3FCEF');

-- Insert users (borrowers/students)
INSERT INTO users (id, full_name, bruin_card_number, publication, phone, email) VALUES
  ('00000000-0000-0001-0000-000000000001', 'Alice Chen', '123456789', 'Daily Bruin', '310-555-1001', 'alice.chen@ucla.edu'),
  ('00000000-0000-0001-0000-000000000002', 'Bob Martinez', '234567890', 'Pacific Ties', '310-555-1002', 'bob.martinez@ucla.edu'),
  ('00000000-0000-0001-0000-000000000003', 'Carol Kim', '345678901', 'La Gente', '310-555-1003', 'carol.kim@ucla.edu'),
  ('00000000-0000-0001-0000-000000000004', 'David Nguyen', '456789012', 'OutWrite', '310-555-1004', 'david.nguyen@ucla.edu'),
  ('00000000-0000-0001-0000-000000000005', 'Emma Wilson', '567890123', 'Al-Talib', '310-555-1005', 'emma.wilson@ucla.edu'),
  ('00000000-0000-0001-0000-000000000006', 'Frank Liu', '678901234', 'Daily Bruin', '310-555-1006', 'frank.liu@ucla.edu');

-- Insert managers
INSERT INTO managers (id, name, email, role) VALUES
  ('00000000-0000-0002-0000-000000000001', 'Edin Le', 'edin.le@ucla.edu', 'super_admin'),
  ('00000000-0000-0002-0000-000000000002', 'Jessica Park', 'jessica.park@ucla.edu', 'manager'),
  ('00000000-0000-0002-0000-000000000003', 'Daniel Nguyen', 'daniel.nguyen@ucla.edu', 'manager');

-- Insert equipment
INSERT INTO equipment (id, name, tag_number, category_id, status, condition_notes) VALUES
  -- Cameras
  ('00000000-0000-0003-0000-000000000001', 'Canon EOS R5', 'CAM-001', '00000000-0000-0000-0000-000000000001', 'available', '{}'),
  ('00000000-0000-0003-0000-000000000002', 'Sony A7 IV', 'CAM-002', '00000000-0000-0000-0000-000000000001', 'checked_out', '{}'),
  ('00000000-0000-0003-0000-000000000003', 'Nikon D850', 'CAM-003', '00000000-0000-0000-0000-000000000001', 'available', ARRAY['Minor scratch on body']),
  ('00000000-0000-0003-0000-000000000004', 'Nikon D850', 'CAM-004', '00000000-0000-0000-0000-000000000001', 'checked_out', '{}'),
  ('00000000-0000-0003-0000-000000000005', 'Nikon D850', 'CAM-005', '00000000-0000-0000-0000-000000000001', 'available', '{}'),
  ('00000000-0000-0003-0000-000000000006', 'Nikon D850', 'CAM-006', '00000000-0000-0000-0000-000000000001', 'available', '{}'),
  -- Lenses
  ('00000000-0000-0003-0000-000000000007', 'Canon RF 24-70mm f/2.8', 'LNS-001', '00000000-0000-0000-0000-000000000002', 'available', '{}'),
  ('00000000-0000-0003-0000-000000000008', 'Sony FE 70-200mm f/2.8', 'LNS-002', '00000000-0000-0000-0000-000000000002', 'checked_out', '{}'),
  ('00000000-0000-0003-0000-000000000009', 'Nikon Z 50mm f/1.8', 'LNS-003', '00000000-0000-0000-0000-000000000002', 'available', '{}'),
  -- Projectors
  ('00000000-0000-0003-0000-000000000010', 'Epson EB-1795F', 'PRJ-001', '00000000-0000-0000-0000-000000000003', 'available', '{}'),
  ('00000000-0000-0003-0000-000000000011', 'BenQ TH585', 'PRJ-002', '00000000-0000-0000-0000-000000000003', 'available', '{}'),
  -- Recorders
  ('00000000-0000-0003-0000-000000000012', 'Zoom H6', 'REC-001', '00000000-0000-0000-0000-000000000004', 'available', '{}'),
  ('00000000-0000-0003-0000-000000000013', 'Tascam DR-40X', 'REC-002', '00000000-0000-0000-0000-000000000004', 'checked_out', '{}'),
  ('00000000-0000-0003-0000-000000000014', 'Sony PCM-D100', 'REC-003', '00000000-0000-0000-0000-000000000004', 'archived', '{}'),
  -- Lighting
  ('00000000-0000-0003-0000-000000000015', 'Godox SL-60W', 'LGT-001', '00000000-0000-0000-0000-000000000005', 'available', '{}'),
  ('00000000-0000-0003-0000-000000000016', 'Aputure 120D II', 'LGT-002', '00000000-0000-0000-0000-000000000005', 'checked_out', '{}'),
  -- Audio
  ('00000000-0000-0003-0000-000000000017', 'Rode NTG4+', 'AUD-001', '00000000-0000-0000-0000-000000000006', 'available', '{}'),
  ('00000000-0000-0003-0000-000000000018', 'Sennheiser EW 112P G4', 'AUD-002', '00000000-0000-0000-0000-000000000006', 'available', '{}');

-- Update archived equipment
UPDATE equipment SET archived_reason = 'SD card slot broken' WHERE id = '00000000-0000-0003-0000-000000000014';

-- Insert checkouts (with dates relative to now)
INSERT INTO checkouts (id, equipment_id, user_id, checked_out_at, due_at, condition_note_out, checked_out_by) VALUES
  ('00000000-0000-0004-0000-000000000001', '00000000-0000-0003-0000-000000000002', '00000000-0000-0001-0000-000000000001', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', NULL, 'Edin Le'),
  ('00000000-0000-0004-0000-000000000002', '00000000-0000-0003-0000-000000000004', '00000000-0000-0001-0000-000000000002', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', NULL, 'Jessica Park'),
  ('00000000-0000-0004-0000-000000000003', '00000000-0000-0003-0000-000000000008', '00000000-0000-0001-0000-000000000003', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', NULL, 'Daniel Nguyen'),
  ('00000000-0000-0004-0000-000000000004', '00000000-0000-0003-0000-000000000013', '00000000-0000-0001-0000-000000000004', NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', 'Camera strap missing', 'Edin Le'),
  ('00000000-0000-0004-0000-000000000005', '00000000-0000-0003-0000-000000000016', '00000000-0000-0001-0000-000000000005', NOW() - INTERVAL '4 hours', NOW() + INTERVAL '7 days', NULL, 'Jessica Park');

-- Insert activity log
INSERT INTO activity_log (equipment_id, action, actor_name, user_id, note, timestamp) VALUES
  ('00000000-0000-0003-0000-000000000002', 'check_out', 'Edin Le', '00000000-0000-0001-0000-000000000001', NULL, NOW() - INTERVAL '5 days'),
  ('00000000-0000-0003-0000-000000000004', 'check_out', 'Jessica Park', '00000000-0000-0001-0000-000000000002', NULL, NOW() - INTERVAL '3 days'),
  ('00000000-0000-0003-0000-000000000008', 'check_out', 'Daniel Nguyen', '00000000-0000-0001-0000-000000000003', NULL, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0003-0000-000000000013', 'check_out', 'Edin Le', '00000000-0000-0001-0000-000000000004', 'Camera strap missing', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0003-0000-000000000016', 'check_out', 'Jessica Park', '00000000-0000-0001-0000-000000000005', NULL, NOW() - INTERVAL '4 hours'),
  ('00000000-0000-0003-0000-000000000002', 'reminder', 'Edin Le', '00000000-0000-0001-0000-000000000001', NULL, NOW() - INTERVAL '1 day'),
  ('00000000-0000-0003-0000-000000000004', 'reminder', 'Jessica Park', '00000000-0000-0001-0000-000000000002', NULL, NOW() - INTERVAL '12 hours'),
  ('00000000-0000-0003-0000-000000000003', 'note', 'Daniel Nguyen', NULL, 'Minor scratch on body', NOW() - INTERVAL '2 weeks');
