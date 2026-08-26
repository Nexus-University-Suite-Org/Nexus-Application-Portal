-- Seed default admin user (password: admin123)
-- BCrypt hash of "admin123"
INSERT INTO admins (email, password_hash, full_name, created_at)
VALUES ('admin@nexus.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Administrator', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;
