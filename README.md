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

The workspace is a local product demo. Sample deliveries, drivers, and areas can be edited; changes are saved in the current browser's local storage. There is no authentication, connected server database, tenant isolation, live location, real routing, messaging, or billing yet. The map illustration does not show real streets or GPS positions. The first pilot is planned for Salem; existing Chennai records are fictional samples.

## Project notes

- `docs/product-brief.md` — product framing and research plan
- `docs/research.md` — market and tools comparison
- `docs/launch-plan.md` — pilot sequence
- `docs/saas-starter-evaluation.md` — Open SaaS / Wasp fit review
- `docs/local-pilot.md` — local database setup and remaining pilot work
