-- UCLA Inventory Management System - Seed Data
-- Run this after schema.sql to populate with initial data

-- Insert categories
INSERT INTO categories (id, name, color, bg_color) VALUES
  ('c1', 'Cameras', '#0052CC', '#E9F2FF'),
  ('c2', 'Lenses', '#6554C0', '#F3F0FF'),
  ('c3', 'Projectors', '#00875A', '#E3FCEF'),
  ('c4', 'Recorders', '#FF5630', '#FFEBE6'),
  ('c5', 'Lighting', '#FF991F', '#FFF7E6'),
  ('c6', 'Audio', '#36B37E', '#E3FCEF');

-- Insert users (borrowers/students)
INSERT INTO users (id, full_name, bruin_card_number, publication, phone, email) VALUES
  ('u1', 'Alice Chen', '123456789', 'Daily Bruin', '310-555-1001', 'alice.chen@ucla.edu'),
  ('u2', 'Bob Martinez', '234567890', 'Pacific Ties', '310-555-1002', 'bob.martinez@ucla.edu'),
  ('u3', 'Carol Kim', '345678901', 'La Gente', '310-555-1003', 'carol.kim@ucla.edu'),
  ('u4', 'David Nguyen', '456789012', 'OutWrite', '310-555-1004', 'david.nguyen@ucla.edu'),
  ('u5', 'Emma Wilson', '567890123', 'Al-Talib', '310-555-1005', 'emma.wilson@ucla.edu'),
  ('u6', 'Frank Liu', '678901234', 'Daily Bruin', '310-555-1006', 'frank.liu@ucla.edu');

-- Insert managers
INSERT INTO managers (id, name, email, role) VALUES
  ('m1', 'Edin Le', 'edin.le@ucla.edu', 'super_admin'),
  ('m2', 'Jessica Park', 'jessica.park@ucla.edu', 'manager'),
  ('m3', 'Daniel Nguyen', 'daniel.nguyen@ucla.edu', 'manager');

-- Insert equipment
INSERT INTO equipment (id, name, tag_number, category_id, status, condition_notes) VALUES
  -- Cameras
  ('eq1', 'Canon EOS R5', 'CAM-001', 'c1', 'available', '{}'),
  ('eq2', 'Sony A7 IV', 'CAM-002', 'c1', 'checked_out', '{}'),
  ('eq3', 'Nikon D850', 'CAM-003', 'c1', 'available', ARRAY['Minor scratch on body']),
  ('eq4', 'Nikon D850', 'CAM-004', 'c1', 'checked_out', '{}'),
  ('eq5', 'Nikon D850', 'CAM-005', 'c1', 'available', '{}'),
  ('eq6', 'Nikon D850', 'CAM-006', 'c1', 'available', '{}'),
  -- Lenses
  ('eq7', 'Canon RF 24-70mm f/2.8', 'LNS-001', 'c2', 'available', '{}'),
  ('eq8', 'Sony FE 70-200mm f/2.8', 'LNS-002', 'c2', 'checked_out', '{}'),
  ('eq9', 'Nikon Z 50mm f/1.8', 'LNS-003', 'c2', 'available', '{}'),
  -- Projectors
  ('eq10', 'Epson EB-1795F', 'PRJ-001', 'c3', 'available', '{}'),
  ('eq11', 'BenQ TH585', 'PRJ-002', 'c3', 'available', '{}'),
  -- Recorders
  ('eq12', 'Zoom H6', 'REC-001', 'c4', 'available', '{}'),
  ('eq13', 'Tascam DR-40X', 'REC-002', 'c4', 'checked_out', '{}'),
  ('eq14', 'Sony PCM-D100', 'REC-003', 'c4', 'archived', '{}'),
  -- Lighting
  ('eq15', 'Godox SL-60W', 'LGT-001', 'c5', 'available', '{}'),
  ('eq16', 'Aputure 120D II', 'LGT-002', 'c5', 'checked_out', '{}'),
  -- Audio
  ('eq17', 'Rode NTG4+', 'AUD-001', 'c6', 'available', '{}'),
  ('eq18', 'Sennheiser EW 112P G4', 'AUD-002', 'c6', 'available', '{}');

-- Update archived equipment
UPDATE equipment SET archived_reason = 'SD card slot broken' WHERE id = 'eq14';

-- Insert checkouts (with dates relative to now)
INSERT INTO checkouts (id, equipment_id, user_id, checked_out_at, due_at, condition_note_out, checked_out_by) VALUES
  ('co1', 'eq2', 'u1', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', NULL, 'Edin Le'),
  ('co2', 'eq4', 'u2', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', NULL, 'Jessica Park'),
  ('co3', 'eq8', 'u3', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', NULL, 'Daniel Nguyen'),
  ('co4', 'eq13', 'u4', NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', 'Camera strap missing', 'Edin Le'),
  ('co5', 'eq16', 'u5', NOW() - INTERVAL '4 hours', NOW() + INTERVAL '7 days', NULL, 'Jessica Park');

-- Insert activity log
INSERT INTO activity_log (equipment_id, action, actor_name, user_id, note, timestamp) VALUES
  ('eq2', 'check_out', 'Edin Le', 'u1', NULL, NOW() - INTERVAL '5 days'),
  ('eq4', 'check_out', 'Jessica Park', 'u2', NULL, NOW() - INTERVAL '3 days'),
  ('eq8', 'check_out', 'Daniel Nguyen', 'u3', NULL, NOW() - INTERVAL '2 days'),
  ('eq13', 'check_out', 'Edin Le', 'u4', 'Camera strap missing', NOW() - INTERVAL '1 day'),
  ('eq16', 'check_out', 'Jessica Park', 'u5', NULL, NOW() - INTERVAL '4 hours'),
  ('eq2', 'reminder', 'Edin Le', 'u1', NULL, NOW() - INTERVAL '1 day'),
  ('eq4', 'reminder', 'Jessica Park', 'u2', NULL, NOW() - INTERVAL '12 hours'),
  ('eq3', 'note', 'Daniel Nguyen', NULL, 'Minor scratch on body', NOW() - INTERVAL '2 weeks');
