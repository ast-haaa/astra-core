-- add location text for telemetry and box
ALTER TABLE telemetry ADD COLUMN location_text VARCHAR(512) NULL;
ALTER TABLE box ADD COLUMN location_text VARCHAR(512) NULL;
