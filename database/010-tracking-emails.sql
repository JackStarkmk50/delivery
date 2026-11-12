CREATE TABLE tracking_emails (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  sent_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tracking_emails_delivery_sent ON tracking_emails(delivery_id,sent_at DESC);
