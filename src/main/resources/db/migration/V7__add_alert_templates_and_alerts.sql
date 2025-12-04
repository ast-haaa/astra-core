-- V7: templates + alerts table
CREATE TABLE IF NOT EXISTS alert_template (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  source_lang VARCHAR(8) DEFAULT 'en',
  template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  batch_id VARCHAR(100),
  template_code VARCHAR(100),
  source_text TEXT,
  params JSONB,
  severity VARCHAR(20),
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by VARCHAR(50),
  blockchain_tx VARCHAR(255)
);
