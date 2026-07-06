-- 1. Bersihkan data duplikat (sisakan 1 per nomor invoice)
DELETE FROM mecs.invoices a 
USING mecs.invoices b 
WHERE a.id < b.id 
  AND a.invoice_number = b.invoice_number;

-- 2. Tambahkan constraint UNIQUE pada kolom invoice_number DAN created_at (wajib untuk partitioned table)
ALTER TABLE mecs.invoices 
ADD CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number, created_at);
