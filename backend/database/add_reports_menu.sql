-- Menambahkan Menu Laporan Tagihan dan Pembayaran ke dalam Sidebar

-- 1. Insert ke tabel menus
INSERT INTO menus (id, parent_id, title, icon, path, priority)
VALUES 
(
  8001, 
  (SELECT id FROM menus WHERE title ILIKE '%Report%' OR title ILIKE '%Laporan%' LIMIT 1), 
  'Laporan Tagihan', 
  'fas fa-file-invoice-dollar', 
  '/reports/invoices', 
  30
),
(
  8002, 
  (SELECT id FROM menus WHERE title ILIKE '%Report%' OR title ILIKE '%Laporan%' LIMIT 1), 
  'Laporan Pembayaran', 
  'fas fa-receipt', 
  '/reports/payments', 
  40
)
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, 
  path = EXCLUDED.path, 
  parent_id = EXCLUDED.parent_id;

-- 2. Berikan akses ke Role Administrator (Sesuaikan 'SYS_ADMIN' jika menggunakan kode role lain)
INSERT INTO role_menus (role_code, menu_id) 
VALUES 
('SYS_ADMIN', 8001), 
('SYS_ADMIN', 8002)
ON CONFLICT DO NOTHING;
