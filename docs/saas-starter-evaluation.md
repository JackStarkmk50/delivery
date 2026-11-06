# Open SaaS starter review

Reviewed 6 November 2026 against the MileDesk requirement to keep Next.js App Router, TypeScript, and Tailwind CSS. Current implementation status was checked against the project source.

## What it is

Open SaaS is a ready-made SaaS application template. It uses Wasp for the application framework, with React on the client, Node.js on the server, and Prisma with PostgreSQL. The linked repository is published under the MIT license.

Its supplied features include account authentication, email, background jobs, a landing page, a sample admin dashboard, payment provider examples, S3 file uploads, analytics options, and deployment guidance. The template includes integrations that still need the team's own provider accounts, API keys, billing configuration, and deployment settings. A starter does not remove those service costs or production decisions.

Wasp is the underlying framework, not just a component library. It owns routes and full-stack operations through its app specification and generated project structure. The getting-started instructions currently target macOS, Linux, or Windows through WSL. The project in this workspace is a native Windows Next.js App Router project.

## Fit for MileDesk

| Area | Open SaaS | MileDesk requirement | Fit |
|---|---|---|---|
| Web framework | Wasp-managed React, Node.js, Prisma | Next.js App Router | Different framework |
| Styling | Tailwind and shadcn/ui in the template | Tailwind, with MileDesk's current visual system | CSS approach is compatible; component conventions would need adaptation |
| Data and backend | Prisma/PostgreSQL through Wasp | SaaS data model with tenant isolation and delivery records | Useful reference, but not a direct drop-in backend |
| SaaS foundation | Auth, email, jobs, payments, admin examples | These production capabilities are still needed | Valuable checklist and implementation reference |
| Deployment | Wasp deploy flow plus manual options | Keep Next.js hosting options open | Different build and deployment workflow |
| License | MIT for the Open SaaS repository | Open-source use preferred | Permissive template license; review every bundled dependency and service term separately |

## Recommendation

Keep the MileDesk Next.js project. Open SaaS is a useful feature reference, but its Wasp routes, generated operations, auth, jobs, and deploy commands cannot be installed into this application unchanged. Its MIT-licensed source may be adapted where it fits, with attribution and dependency review; copying its Wasp modules alone would not provide working Next.js features.

The web backend now has PostgreSQL, workspace-scoped delivery records, owner and dispatcher sessions, an operator dashboard, manual client subscription records, and password recovery through SMTP. These are a local pilot foundation. The remaining Open SaaS capabilities need their own Next.js integrations and provider configuration.

## Current gap

| Capability | MileDesk today | Next step |
|---|---|---|
| Authentication | Email and password with server sessions, owner and dispatcher memberships, one-use invites, password recovery | Verify email, add driver identity and permissions, strengthen abuse controls; evaluate a maintained Next.js compatible auth package before extending the custom flow |
| Subscriptions | Operator records service and external payment status manually | Choose a payment provider, add hosted checkout and verified webhooks, reconcile events, then generate invoices and entitlement rules |
| Email | Nodemailer SMTP for password recovery; Mailpit captures local messages | Select a production SMTP or transactional sender for verification, invitations, and delivery notices |
| Background work | No queue | Add a PostgreSQL-backed queue and a separate worker for email, retries, reminders, and cleanup |
| File storage | None | Add proof-of-delivery uploads only after driver identity, retention, size limits, and access checks are defined; use S3-compatible storage |
| Admin analytics | Client counts and delivery totals | Record dated operational events and compute reconciled subscription and delivery measures; do not infer revenue from manual payment labels |
| Landing page | Product page exists | Keep its claims synchronized with delivered capabilities |
| Deployment | Local Docker database and Next.js app | Pick a host and managed PostgreSQL, run migrations on deploy, configure secrets, backups, monitoring, and restore checks |
| Automated verification | Lint, build, and local browser/API checks | Add repeatable integration and end-to-end checks around tenant isolation, subscription webhooks, and delivery permissions |

The order for a Salem pilot is email verification and driver identity; then a worker for messages and cleanup, delivery proof, and recipient updates. Automatic billing follows a pricing decision and a provider account. Analytics and uploads should answer observed operator needs. An AI example from the starter is not a required MileDesk feature.

One package can cover several needs, but a package does not supply provider accounts or operational policy. Better Auth documents Next.js email verification and organization roles; `pg-boss` provides PostgreSQL-backed jobs. These are options to evaluate against our existing session and database model, not dependencies already in MileDesk.

## Sources

- [Open SaaS project site](https://opensaas.sh/)
- [Open SaaS repository and MIT license](https://github.com/wasp-lang/open-saas)
- [Open SaaS getting started guide](https://docs.opensaas.sh/start/getting-started/)
- [Open SaaS guided tour](https://docs.opensaas.sh/start/guided-tour/)
- [Wasp framework repository](https://github.com/wasp-lang/wasp)
- [Open SaaS payment integrations](https://docs.opensaas.sh/guides/payment-integrations/)
- [Open SaaS admin dashboard](https://docs.opensaas.sh/general/admin-dashboard/)
- [Better Auth Next.js example](https://better-auth.com/docs/examples/next-js)
- [pg-boss repository](https://github.com/timgit/pg-boss)
- [Nodemailer SMTP transport](https://nodemailer.com/smtp)
- [Mailpit Docker setup](https://mailpit.axllent.org/docs/install/docker/)
