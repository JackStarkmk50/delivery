CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY, email text UNIQUE NOT NULL, password_hash text NOT NULL,
  workspace text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash text PRIMARY KEY, account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY, account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  customer text NOT NULL, phone text NOT NULL, address text NOT NULL, landmark text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Ready to assign' CHECK (status IN ('Address check','Ready to assign','Assigned','Picked up','On the way','Delivered','Failed')),
  driver text NOT NULL DEFAULT '', version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS deliveries_account ON deliveries(account_id, created_at DESC);
CREATE TABLE IF NOT EXISTS delivery_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS auth_limits (
  key text PRIMARY KEY, count integer NOT NULL, expires_at timestamptz NOT NULL
);
