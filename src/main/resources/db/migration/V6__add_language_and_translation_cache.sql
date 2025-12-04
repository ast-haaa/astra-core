-- V6: add lang_pref and translation cache
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS lang_pref VARCHAR(8) DEFAULT 'en';

CREATE TABLE IF NOT EXISTS translation_cache (
  id BIGSERIAL PRIMARY KEY,
  src_hash VARCHAR(64) NOT NULL,
  source_text TEXT NOT NULL,
  target_lang VARCHAR(8) NOT NULL,
  provider VARCHAR(32),
  translated_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(src_hash, target_lang, provider)
);

CREATE INDEX IF NOT EXISTS idx_translation_cache_src ON translation_cache (src_hash);
