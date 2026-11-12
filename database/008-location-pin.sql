ALTER TABLE deliveries ADD COLUMN location_latitude double precision;
ALTER TABLE deliveries ADD COLUMN location_longitude double precision;
ALTER TABLE deliveries ADD COLUMN location_accuracy_m double precision;
ALTER TABLE deliveries ADD COLUMN location_shared_at timestamptz;
ALTER TABLE deliveries ADD CONSTRAINT deliveries_location_pair CHECK ((location_latitude IS NULL) = (location_longitude IS NULL));
ALTER TABLE deliveries ADD CONSTRAINT deliveries_location_range CHECK (location_latitude IS NULL OR (location_latitude BETWEEN -90 AND 90 AND location_longitude BETWEEN -180 AND 180));
