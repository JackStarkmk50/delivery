ALTER TABLE deliveries ADD COLUMN tracking_token_hash text UNIQUE;
ALTER TABLE deliveries ADD COLUMN tracking_expires_at timestamptz;
