-- =====================================================================
-- SQL SCRIPT TO ADD "ASISTEN LAB (AI)" MENU
-- Run this in pgAdmin using an administrator account.
-- =====================================================================

-- 1. Insert the new menu (ID 120, path "/asisten-lab")
INSERT INTO lims.menus (id, parent_id, title, icon, path, "order", is_password, created_at, updated_at, created_user, updated_user)
VALUES (120, 0, 'Asisten Lab (AI)', 'fas fa-robot', '/asisten-lab', 99, false, NOW(), NOW(), 'system', 'system')
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title, icon = EXCLUDED.icon, path = EXCLUDED.path;

-- 2. Map the menu to roles (1 = ADMIN, 52 = SuperUser, 11 = OPERATOR_TEST, 17 = TESTER/Test)
-- We use INSERT INTO role_menus ON CONFLICT DO NOTHING to prevent errors if already mapped
INSERT INTO lims.role_menus (role_id, menu_id, created_at, created_user) VALUES
(1, 120, NOW(), 'system'),   -- ADMIN
(52, 120, NOW(), 'system'),  -- SuperUser
(11, 120, NOW(), 'system'),  -- OPERATOR_TEST
(17, 120, NOW(), 'system')   -- TESTER / Test
ON CONFLICT DO NOTHING;
