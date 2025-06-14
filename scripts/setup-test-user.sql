-- Setup test user with proper password hash
-- Password: admin123
-- Hash generated with bcrypt-nodejs

-- Update existing admin user with password
UPDATE users 
SET password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE email = 'admin@example.com';

-- Insert RBAC permissions if they don't exist
INSERT INTO permissions (slug, name, description, category) VALUES 
('role:read', 'Read Roles', 'View roles and their permissions', 'Role Management'),
('role:create', 'Create Roles', 'Create new roles', 'Role Management'),
('role:update', 'Update Roles', 'Edit existing roles', 'Role Management'),
('role:delete', 'Delete Roles', 'Delete roles', 'Role Management'),
('permission:read', 'Read Permissions', 'View permission catalogue', 'Permission Management')
ON CONFLICT (slug) DO NOTHING;

-- Get the owner role ID and new permission IDs
WITH owner_role AS (
  SELECT id FROM roles WHERE name = 'owner' LIMIT 1
),
rbac_permissions AS (
  SELECT id FROM permissions WHERE slug IN ('role:read', 'role:create', 'role:update', 'role:delete', 'permission:read')
)
-- Add RBAC permissions to owner role
INSERT INTO role_permissions (role_id, permission_id) 
SELECT owner_role.id, rbac_permissions.id
FROM owner_role, rbac_permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Display test credentials
SELECT 
  'Test credentials setup complete!' as message,
  'admin@example.com' as email,
  'admin123' as password; 