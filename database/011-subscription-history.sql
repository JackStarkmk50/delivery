CREATE TABLE subscription_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  previous jsonb NOT NULL,
  current jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX subscription_events_account_created ON subscription_events(account_id,created_at DESC);
