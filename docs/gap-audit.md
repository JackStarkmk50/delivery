# MileDesk gap audit

## Working locally

The live web workspace stores accounts, team roles, subscriptions, deliveries, status history, and tracking links in PostgreSQL. New accounts need an email verification link. Owners invite dispatchers and drivers; drivers only see assigned deliveries. Recipients can correct an address before pickup through a private link. The operator can record service and external payment status. The two Expo builds share code but have separate roles and package IDs. Driver status changes are stored locally when a connection drops and retried only when the server delivery version still matches. A conflicting update remains visible for review.

The browser demo at `/` contains fictional data and is separate from the live workspace. Customer mobile tracking uses a link provided by a dispatcher; it does not create orders.

## Gaps before a live pilot

| Area | Current limit | Pilot decision or evidence needed |
| --- | --- | --- |
| Hosting | Runs locally with Docker PostgreSQL and Mailpit | Choose hosting, managed backups, HTTPS, domain, SMTP provider, and restore drill. |
| Maps | The partner app opens the address in an installed map app | Test Salem addresses and entrance notes with real drivers. Geocoding, GPS, ETA, and route optimization are not implemented. OpenStreetMap data alone does not verify a customer's entrance. |
| Notifications | Tracking links must be shared outside MileDesk | Choose an SMS/WhatsApp provider and obtain recipient consent before sending automated messages. |
| Billing | Operator records external payments manually | Choose pricing, invoicing, taxes, and a payment provider before collecting charges in the app. |
| Delivery proof | Driver records status and failure reason | Decide proof policy, retention, and storage before adding photos or signatures. |
| Mobile releases | TypeScript and Expo config can be checked locally | Build both Android roles, test on real devices, and configure signing/distribution accounts. |
| Offline work | A pending driver status intent survives app restart; assigned stops load online | Test network loss and reconnection on a device. Resolve conflicting updates with a dispatcher. Do not assume a pending update reached the server. |
| Customer app | One private tracking link is stored on the device | A browser link may be sufficient for the first pilot; validate installation demand with recipients. |
| Operations | Operator can review clients and service status | Agree on support, incident response, retention, and backup ownership for multiple businesses. |

## Open-source fit

Expo SQLite stores the small, non-customer-data driver update queue on device. PostgreSQL already owns delivery and account data. A PostgreSQL-backed job runner such as pg-boss could support later notifications once a provider and retry policy are selected. S3-compatible object storage such as MinIO is an option for proof uploads once proof rules are defined. Replacing the current authentication schema with a starter framework would require a careful account, session, and role migration; it is not necessary for the local verification flow.

## Verification

`npm run lint`, `npm run build`, `npm run db:setup`, and `node scripts/smoke-team.mjs` check the web implementation. In `mobile/`, `npx tsc --noEmit` and Expo config checks cover types and build configuration. Real driver and dispatcher usability, map accuracy, offline recovery, and signed mobile builds still need field testing.
