# Salem pilot

Build and validate locally before selecting hosting. The first pilot city is Salem. Existing Chennai records remain fictional demonstration data; they do not represent Salem coverage.

## Current implementation

The Next.js workspace stores demonstration records in the browser. Dispatchers can create deliveries, correct addresses, assign drivers, update status, read activity history, and export the filtered queue as CSV. These records are not shared across computers or phones. The history is an editable browser record, not a production audit trail.

## Local database

Docker Desktop must be running with its Linux engine. Copy `.env.example` to `.env.local`, replace both password placeholders with the same long random password, and keep `.env.local` private. Then start PostgreSQL:

```powershell
$env:POSTGRES_PASSWORD = (Get-Content .env.local | Where-Object { $_ -like 'POSTGRES_PASSWORD=*' }).Split('=',2)[1]
docker compose up -d database
docker compose ps
npm run db:setup
```

PostgreSQL listens only on localhost:5432. Database and user are both `miledesk`. Its named volume preserves data across container restarts. The `/live` workspace connects to it. The browser demo at `/` remains separate. Set `ALLOW_REGISTRATION=false` after creating local pilot accounts.

## Remaining web foundations

1. Versioned migrations and a membership model for owners, dispatchers, drivers, and recipients.
2. Email verification, account recovery, stronger abuse limits, and mobile sign-in.
3. Formal status transitions, driver identity, proof of delivery, and failure-reason policy.
4. Driver invitations, bulk import preview, delivery proof, and recipient tracking links with revocable tokens.
5. Salem service areas validated with the pilot business, mapping provider configuration, and notification delivery.
6. Backups, restore verification, monitoring, rate limits, and deployment configuration.

## Mobile sequence

Connect the existing driver and customer mobile previews after role-aware authentication and API access work. Core driver screens need assigned deliveries, navigation handoff, status updates, failure reasons, and delivery proof. Offline changes need a durable queue and conflict handling.

Start customers with a mobile-friendly tracking link. A separate customer app becomes useful only if repeat ordering, account history, or saved destinations justify installation.
