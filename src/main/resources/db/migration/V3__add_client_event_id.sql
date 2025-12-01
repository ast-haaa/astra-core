ALTER TABLE event ADD COLUMN client_event_id VARCHAR(128) NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_client_event_id ON event(client_event_id);
