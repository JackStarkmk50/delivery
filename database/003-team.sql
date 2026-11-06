CREATE TABLE workspace_memberships (
  account_id uuid PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','dispatcher')),
  joined_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO workspace_memberships(account_id,workspace_id,role)
SELECT id,id,'owner' FROM accounts WHERE is_platform_admin=false;
CREATE INDEX workspace_memberships_workspace ON workspace_memberships(workspace_id);

CREATE TABLE team_invitations (
  token_hash text PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  email text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);
CREATE INDEX team_invitations_workspace ON team_invitations(workspace_id,created_at DESC);
