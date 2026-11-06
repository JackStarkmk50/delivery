ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_platform_admin boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS subscriptions (
  account_id uuid PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  service_status text NOT NULL DEFAULT 'trial' CHECK (service_status IN ('trial','active','paused','canceled')),
  payment_status text NOT NULL DEFAULT 'unknown' CHECK (payment_status IN ('unknown','unpaid','paid_externally')),
  plan_name text NOT NULL DEFAULT 'Pilot',
  renewal_date date,
  payment_reference text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES accounts(id)
);
INSERT INTO subscriptions(account_id) SELECT id FROM accounts ON CONFLICT DO NOTHING;
