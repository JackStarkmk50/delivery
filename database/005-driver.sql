ALTER TABLE workspace_memberships DROP CONSTRAINT workspace_memberships_role_check;
ALTER TABLE workspace_memberships ADD CONSTRAINT workspace_memberships_role_check CHECK (role IN ('owner','dispatcher','driver'));
ALTER TABLE accounts ADD COLUMN display_name text NOT NULL DEFAULT '';
ALTER TABLE team_invitations ADD COLUMN role text NOT NULL DEFAULT 'dispatcher' CHECK (role IN ('dispatcher','driver'));
ALTER TABLE deliveries ADD COLUMN driver_account_id uuid REFERENCES accounts(id) ON DELETE SET NULL;
ALTER TABLE deliveries ADD COLUMN failure_reason text NOT NULL DEFAULT '';
CREATE INDEX deliveries_driver ON deliveries(driver_account_id,created_at DESC);
CREATE TABLE mobile_sessions (
  token_hash text PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX mobile_sessions_account ON mobile_sessions(account_id);
