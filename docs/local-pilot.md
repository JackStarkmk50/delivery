# Salem pilot

Build and validate locally before selecting hosting. The first pilot city is Salem. Existing Chennai records remain fictional demonstration data; they do not represent Salem coverage.

## Current implementation

The Next.js workspace stores demonstration records in the browser. Dispatchers can create deliveries, correct addresses, assign drivers, update status, read activity history, and export the filtered queue as CSV. These records are not shared across computers or phones. The history is an editable browser record, not a production audit trail.

## Local database

Docker Desktop must be running with its Linux engine. Copy `.env.example` to `.env.local`, replace both password placeholders with the same long random password, and keep `.env.local` private. Then start PostgreSQL:

```powershell
$env:POSTGRES_PASSWORD = (Get-Content .env.local | Where-Object { $_ -like 'POSTGRES_PASSWORD=*' }).Split('=',2)[1]
docker compose up -d database mailpit
docker compose ps
npm run db:setup
```

PostgreSQL listens only on localhost:5432. Database and user are both `miledesk`. Its named volume preserves data across container restarts. The `/live` workspace connects to it. The browser demo at `/` remains separate. Set `ALLOW_REGISTRATION=false` after creating local pilot accounts.

An owner can invite a dispatcher at `/team`. The one-use link expires after 48 hours and must be shared privately. The invite link is sufficient to create the invited account, so do not post it publicly. An owner can remove a dispatcher; removal deletes that account and its sessions. Password recovery sends a 30-minute, one-use link through SMTP and ends existing sessions after reset. Local email is captured by Mailpit at http://localhost:8025. For a hosted pilot, configure a real SMTP sender and domain before enabling recovery.

The platform operator view is at `/admin`. Set a private `PLATFORM_ADMIN_EMAIL` and `PLATFORM_ADMIN_PASSWORD` in `.env.local`, run `npm run admin:setup`, then sign in at `/live` with those credentials. Only that designated account can open the operator view. Each client gets a subscription record at registration. Service status and payment status are separate; a manual payment record requires an external reference. There is no payment provider or automatic charge collection.

The operator can search businesses, see delivery counts, and record trial, active, paused, or canceled service. Payment state is unknown, unpaid, or paid externally. Plan name, renewal date, and an internal note can be recorded. Paused and canceled clients can view their existing deliveries but cannot create or update them. These are manual records, not an invoice ledger or subscription billing engine.

## Remaining web foundations

1. Driver identity and permissions, recipient access, and mobile sign-in.
2. Email verification, stronger abuse limits, and production SMTP setup.
3. Formal status transitions, driver identity, proof of delivery, and failure-reason policy.
4. Driver invitations, bulk import preview, delivery proof, and recipient tracking links with revocable tokens.
5. Salem service areas validated with the pilot business, mapping provider configuration, and notification delivery.
6. Backups, restore verification, monitoring, rate limits, and deployment configuration.

## Mobile sequence

Connect the existing driver and customer mobile previews after role-aware authentication and API access work. Core driver screens need assigned deliveries, navigation handoff, status updates, failure reasons, and delivery proof. Offline changes need a durable queue and conflict handling.

Start customers with a mobile-friendly tracking link. A separate customer app becomes useful only if repeat ordering, account history, or saved destinations justify installation.
