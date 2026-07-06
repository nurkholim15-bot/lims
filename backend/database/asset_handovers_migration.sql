-- Migration for asset_handovers to use partner_id instead of partner_code
ALTER TABLE asset_handovers DROP COLUMN IF EXISTS partner_code;
ALTER TABLE asset_handovers ADD COLUMN IF NOT EXISTS partner_id BIGINT;
ALTER TABLE asset_handovers ADD CONSTRAINT fk_asset_handovers_partner FOREIGN KEY (partner_id) REFERENCES partners(id);
CREATE INDEX IF NOT EXISTS idx_asset_handovers_partner_id ON asset_handovers(partner_id);
