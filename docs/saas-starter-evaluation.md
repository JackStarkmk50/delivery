# Open SaaS starter review

Reviewed 6 November 2026 against the MileDesk requirement to keep Next.js App Router, TypeScript, and Tailwind CSS.

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

Do not replace the MileDesk Next.js project with Open SaaS. That would abandon the requested framework and require porting the current UI into Wasp's structure. Keep the template as a reference for the missing SaaS foundation: tenant-aware authentication, roles, database migrations, email, background jobs, subscription lifecycle, file storage, admin operations, and deployment procedures.

When MileDesk begins backend work, choose components that fit the Next.js architecture and implement the same requirements. The decision should be revisited only if the team explicitly decides that adopting Wasp is worth changing the framework requirement.

## Sources

- [Open SaaS project site](https://opensaas.sh/)
- [Open SaaS repository and MIT license](https://github.com/wasp-lang/open-saas)
- [Open SaaS getting started guide](https://docs.opensaas.sh/start/getting-started/)
- [Open SaaS guided tour](https://docs.opensaas.sh/start/guided-tour/)
- [Wasp framework repository](https://github.com/wasp-lang/wasp)
