# MileDesk

MileDesk is a local delivery operations product for small businesses that need to coordinate their own orders and drivers across a defined service area. The web app has a product overview and a dispatcher workspace.

## Stack

- Next.js App Router, TypeScript, and Tailwind CSS
- The app lives in the root `app/` directory; there is no `src/` directory.
- Customer and delivery partner mobile previews are being developed separately with Expo and TypeScript.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000.

The workspace at `/` is a browser demo with fictional Chennai records. Changes stay in browser storage. The separate `/live` workspace uses PostgreSQL for account sign-in, isolated delivery queues, and delivery history. Owners can invite dispatchers from `/team`; both roles share the business queue. The restricted `/admin` view lists client businesses and their manually recorded service and payment status. The first pilot is planned for Salem. Live location, routing, delivery notifications, automated billing, and mobile connection are not implemented.

For local data, start Docker Desktop, set a private `POSTGRES_PASSWORD` and matching `DATABASE_URL` in `.env.local`, then run `docker compose up -d database mailpit` and `npm run db:setup`. Set `APP_ORIGIN=http://localhost:3000`, `ALLOW_REGISTRATION=true`, `SMTP_HOST=127.0.0.1`, `SMTP_PORT=1025`, and `MAIL_FROM=MileDesk <accounts@miledesk.local>` for local account creation and password recovery. Mailpit shows captured emails at http://localhost:8025. Disable registration after creating pilot accounts. See `docs/local-pilot.md` for setup and remaining pilot work.

To create the platform operator, set `PLATFORM_ADMIN_EMAIL` and `PLATFORM_ADMIN_PASSWORD` in `.env.local`, run `npm run admin:setup`, and sign in at `/live`. The operator view is `/admin`. A client cannot edit its subscription record. Payment records marked paid externally require a reference; no charge is collected by this application.

## Project notes

- `docs/product-brief.md` — product framing and research plan
- `docs/research.md` — market and tools comparison
- `docs/launch-plan.md` — pilot sequence
- `docs/saas-starter-evaluation.md` — Open SaaS / Wasp fit review
- `docs/local-pilot.md` — local database setup and remaining pilot work
