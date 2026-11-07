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

An owner can invite a dispatcher or driver at `/team`. The one-use link expires after 48 hours and must be shared privately. The invite link creates the invited account, which then needs a one-use email verification link before sign-in. New owner accounts also need verification. Existing accounts created before migration 007 remain sign-in capable. An owner can remove a team member; removal deletes that account and its sessions. Assigned stops return to the queue when a driver is removed. In-progress stops must be reassigned or finished first. Password recovery sends a 30-minute, one-use link through SMTP and ends existing web and mobile sessions after reset. Local email is captured by Mailpit at http://localhost:8025. For a hosted pilot, configure a real SMTP sender and domain before enabling registration and recovery.

Dispatchers assign driver accounts in `/live`. The partner app lists only that driver's stops and accepts ordered status updates or a failed-attempt reason. A dispatcher can create a private customer link from a delivery. It works in a browser at `/track/<token>` or in the customer app, expires after 30 days, and can be rotated. Address corrections return the delivery to Address check. The customer link is a bearer credential and must be shared privately. The mobile app setup and limits are documented in the separate mobile repository.

The platform operator view is at `/admin`. Set a private `PLATFORM_ADMIN_EMAIL` and `PLATFORM_ADMIN_PASSWORD` in `.env.local`, run `npm run admin:setup`, then sign in at `/live` with those credentials. Only that designated account can open the operator view. Each client gets a subscription record at registration. Service status and payment status are separate; a manual payment record requires an external reference. There is no payment provider or automatic charge collection.

The operator can search businesses, see delivery counts, and record trial, active, paused, or canceled service. Payment state is unknown, unpaid, or paid externally. Plan name, renewal date, and an internal note can be recorded. Paused and canceled clients can view their existing deliveries but cannot create or update them. These are manual records, not an invoice ledger or subscription billing engine.

## Remaining web foundations

1. Stronger abuse limits and production SMTP setup.
2. Delivery proof and failure-reason categories.
3. Bulk import preview and customer notification delivery.
4. Salem service areas validated with the pilot business and mapping provider configuration.
5. Backups, restore verification, monitoring, rate limits, and deployment configuration.

## Mobile sequence

The partner app connects to assigned deliveries, navigation and calling handoff, status updates, and written failure reasons. It holds an interrupted status change locally for later retry, but needs a connection to load stops and confirm the server accepted an update. The customer app accepts a tracking link and address correction and needs connectivity. Test both on real devices and weak networks before a Salem pilot. Delivery proof needs a clear retention policy.

The mobile-friendly tracking page remains the primary customer experience. The customer app is an optional way to keep one link on a device; it does not have ordering or account history.
