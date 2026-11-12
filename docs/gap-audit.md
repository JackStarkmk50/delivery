# MileDesk gap audit

## Working locally

The live web workspace stores accounts, team roles, subscriptions, deliveries, status history, and tracking links in PostgreSQL. New accounts need an email verification link. Owners invite dispatchers and drivers; drivers only see assigned deliveries. Recipients can correct an address and optionally share a current-location pin before pickup. The driver app opens directions to that pin when available. Dispatchers can email a tracking link after recording customer consent. A driver can add one private photo after delivery; dispatchers can view it for 30 days. The operator records service and external payment status, with a history of changes. The two Expo builds share code but have separate roles and package IDs. Driver status changes are stored locally when a connection drops and retried only when the server delivery version still matches. A conflicting update remains visible for review.

The browser demo at `/` contains fictional data and is separate from the live workspace. Customer mobile tracking uses a link provided by a dispatcher; it does not create orders.

## Gaps before a live pilot

| Area | Current limit | Pilot decision or evidence needed |
| --- | --- | --- |
| Hosting | A production Compose file, HTTPS proxy, health check, and backup instructions exist | Choose a host, domain, SMTP provider, off-host backups, monitoring, and restore drill. No live service is deployed. |
| Maps | Recipient can share a current-location pin; driver opens coordinate directions | Test Salem addresses, GPS accuracy, and entrance notes with real drivers. Geocoding, ETA, live driver GPS, and route optimization are not implemented. |
| Notifications | Dispatcher can send a tracking link by SMTP after recording consent | Choose an SMS/WhatsApp provider and a policy for automated status alerts. Verify production email deliverability. |
| Billing | Operator records external payments and an audit trail | Choose pricing, invoices, taxes, and a payment provider before collecting charges in the app. |
| Delivery proof | Optional private photo after completion, capped at 3 MB and visible for 30 days | Decide whether photos are required, obtain recipient consent where needed, schedule daily pruning, and set backup retention. No signature or OTP proof. |
| Mobile releases | Both Android bundles export locally | Build signed packages, test on real devices, and configure signing/distribution accounts. |
| Offline work | A pending driver status intent survives app restart; assigned stops load online | Test network loss and reconnection on a device. Resolve conflicting updates with a dispatcher. Do not assume a pending update reached the server. |
| Customer app | One private tracking link is stored on the device | A browser link may be sufficient for the first pilot; validate installation demand with recipients. |
| Operations | Operator can review clients and service status | Agree on support, incident response, retention, and backup ownership for multiple businesses. |

## Open-source fit

Expo SQLite stores the small, non-customer-data driver update queue on device. Expo Location captures a pin only after the recipient taps the permission action; no background location is collected. Expo ImagePicker and ImageManipulator prepare proof photos. PostgreSQL stores capped photos for the local pilot; move them to private object storage when volume or retention requires it. Caddy provides the production HTTPS proxy. A PostgreSQL-backed job runner such as pg-boss could support later notification retries once a provider and policy are selected. The public Nominatim service is unsuitable for private customer address search; no address is sent to it.

## Verification

`npm run lint`, `npm run build`, `npm run db:setup`, `node scripts/smoke-team.mjs`, and `npm run proofs:prune` check the web implementation. The production Docker image built and its health endpoint passed against the local database. In `mobile/`, `npx tsc --noEmit` and Android exports for both roles passed. Real driver and dispatcher usability, map accuracy, offline recovery, photo upload, and signed mobile builds still need field testing.
