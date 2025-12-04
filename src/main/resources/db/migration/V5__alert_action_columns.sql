-- V5__alert_action_columns.sql
ALTER TABLE alert ADD COLUMN assigned_to VARCHAR(128) NULL;
ALTER TABLE alert ADD COLUMN deadline TIMESTAMP NULL;
ALTER TABLE alert ADD COLUMN acknowledged_at TIMESTAMP NULL;
ALTER TABLE alert ADD COLUMN action_taken_at TIMESTAMP NULL;
ALTER TABLE alert ADD COLUMN action_type VARCHAR(64) NULL;
ALTER TABLE alert ADD COLUMN action_params TEXT NULL; -- JSON as text for compatibility
ALTER TABLE alert ADD COLUMN escalated BOOLEAN DEFAULT FALSE;
ALTER TABLE alert ADD COLUMN escalation_marked_at TIMESTAMP NULL;
