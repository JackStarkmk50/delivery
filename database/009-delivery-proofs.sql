CREATE TABLE delivery_proofs (
  delivery_id uuid PRIMARY KEY REFERENCES deliveries(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES accounts(id) ON DELETE SET NULL,
  driver_name text NOT NULL,
  mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg','image/png')),
  image bytea NOT NULL CHECK (octet_length(image) BETWEEN 1 AND 3145728),
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX delivery_proofs_uploaded_at ON delivery_proofs(uploaded_at);
