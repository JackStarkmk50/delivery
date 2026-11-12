ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_updated_by_fkey;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES accounts(id) ON DELETE SET NULL;
