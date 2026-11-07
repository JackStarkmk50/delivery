ALTER TABLE accounts ADD COLUMN email_verification_required boolean NOT NULL DEFAULT false;
ALTER TABLE accounts ALTER COLUMN email_verification_required SET DEFAULT true;
ALTER TABLE accounts ADD COLUMN email_verified_at timestamptz;
CREATE TABLE email_verification_tokens (
  token_hash text PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX email_verification_tokens_account ON email_verification_tokens(account_id);
