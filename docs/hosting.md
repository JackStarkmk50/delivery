# Hosting MileDesk

The production Compose file runs Next.js, PostgreSQL, and Caddy. Caddy serves HTTPS after a domain points to the host and ports 80/443 are reachable. Mailpit is only for local development; production needs an SMTP sender. The database is private to the Compose network.

Before deployment, create a host with persistent storage, firewall, domain, and SMTP account. Keep secrets outside Git. Set `DOMAIN`, `POSTGRES_PASSWORD`, `DATABASE_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `MAIL_FROM` in the deployment environment. Use a URL-safe database password or URL-encode it in `DATABASE_URL`; its host is `database` inside Compose. Set `ALLOW_REGISTRATION=false` after pilot owners are created.

Run `docker compose -f compose.production.yaml config` to check required variables, then `docker compose -f compose.production.yaml up -d --build`. The app applies additive migrations at startup. Check `https://<domain>/api/health`, create the platform operator with the documented admin setup command, then test owner sign-in and a tracking email. Build the mobile apps against the HTTPS `EXPO_PUBLIC_API_URL`.

Back up the database from the host with `docker compose -f compose.production.yaml exec -T database pg_dump -U miledesk -Fc miledesk > miledesk.dump`. Store encrypted copies outside the host and test a restore into a separate database before relying on backups. Back up Caddy's data volume for certificate continuity. Schedule `docker compose -f compose.production.yaml exec -T app npm run proofs:prune` daily to remove delivery photos older than 30 days. Expired photos are hidden from the application even before pruning; database backups may retain them until their own retention expires. Set monitoring for failed health checks, backup age, disk space, and SMTP failures.

This file does not provision a host, domain, SMTP account, automated backup job, payment provider, or signed mobile releases. Those need real accounts and a deployment decision.
