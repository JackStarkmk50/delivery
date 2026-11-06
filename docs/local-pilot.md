# Salem pilot

Build and validate locally before selecting hosting. The first pilot city is Salem. Existing Chennai records remain fictional demonstration data; they do not represent Salem coverage.

## Current implementation

The Next.js workspace stores demonstration records in the browser. Dispatchers can create deliveries, correct addresses, assign drivers, update status, read activity history, and export the filtered queue as CSV. These records are not shared across computers or phones. The history is an editable browser record, not a production audit trail.

## Local database

Docker Desktop must be running with its Linux engine. Set a local password in the terminal before starting PostgreSQL:

```powershell
$env:POSTGRES_PASSWORD = Read-Host 'Local database password' -MaskInput
docker compose up -d database
docker compose ps
```

PostgreSQL listens only on localhost:5432. Database and user are both `miledesk`. Its named volume preserves data across container restarts. The web application is not connected to this database yet.

## Remaining web foundations

1. Database migrations for workspaces, memberships, drivers, deliveries, and delivery events.
2. Authentication and server-side workspace access checks for every read and write.
3. Transactional delivery changes, validated transitions, failure reasons, and concurrent-edit protection.
4. Driver invitations, bulk import preview, delivery proof, and recipient tracking links with revocable tokens.
5. Salem service areas validated with the pilot business, mapping provider configuration, and notification delivery.
6. Backups, restore verification, monitoring, rate limits, and deployment configuration.

## Mobile sequence

Build the driver app after the shared authenticated API works. Use the approved Figma design, as required for mobile. Core screens: sign-in, assigned deliveries, destination details, navigation handoff, status update, failure reason, and delivery proof. Offline changes need a durable queue and conflict handling.

Start customers with a mobile-friendly tracking link. A separate customer app becomes useful only if repeat ordering, account history, or saved destinations justify installation.
