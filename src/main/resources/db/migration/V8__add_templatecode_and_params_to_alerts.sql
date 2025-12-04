-- V8: add template_code and params to alerts (if not present)
ALTER TABLE alerts
  ADD COLUMN IF NOT EXISTS template_code VARCHAR(100);

ALTER TABLE alerts
  ADD COLUMN IF NOT EXISTS params JSONB;
