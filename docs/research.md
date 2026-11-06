# Market and tools comparison

Checked 6 November 2026. Vendor prices and terms can change; confirm them directly before making a buying decision. This is desk research, not a measured comparison or a claim about product quality.

## What the product category covers

The public products reviewed converge on order intake, dispatch, driver assignment, tracking, proof of delivery, notifications, and route planning. The gap MileDesk should test is not whether those features exist; it is whether small area-based businesses can use them with local address context and a cost structure they understand.

| Option | License / price signal | Capabilities | Main trade-off |
|---|---|---|---|
| Fleetbase self-hosted | Open source under AGPL-3.0; review network-use obligations before adapting it into a hosted product | Orders, dispatch, fleet, tracking, driver app, commerce modules, APIs and extensions | Broad starting point; running and maintaining it still costs staff and infrastructure. AGPL may affect a modified hosted service. |
| Fleetbase Cloud | Published plan: $29/month plus $5/month per driver or vehicle; orders are listed as unlimited | Hosted Fleet-Ops, Storefront, Ledger, Navigator, tracking, routing, accounting | Low posted entry cost and less operations work; vendor-hosted product and current terms apply. |
| VROOM + OSRM / Valhalla / openrouteservice | Open-source routing components; software license does not include hosting, map data operations, or support | Vehicle-routing optimization with capacity, time windows, skills, breaks, and supported routing engines | Building block, not a complete dispatch product. Requires engineering, integration, map data, and service ownership. |
| Tookan | Vendor page lists plans from $99/month; current inclusions and usage charges should be confirmed in checkout or a quote | Delivery operations, driver tracking, dispatch, route optimization, and customer-facing tools | Managed option with less infrastructure work; pricing/features vary by plan and vendor terms. |
| Onfleet | Published Launch starts at $619/month and includes 2,500 tasks; Scale and Enterprise cost more | Dispatch, driver app, route optimization, notifications, proof of delivery, APIs, analytics | Mature managed option; substantial monthly starting cost for a small operator. |

## Capability comparison

| Capability | Fleetbase | VROOM + open routing | Tookan | Onfleet | MileDesk first-release decision |
|---|---|---|---|---|---|
| Orders and dispatch | Yes | Must build | Yes | Yes | Yes, with manual dispatcher control |
| Driver assignment | Yes | Must build around optimizer | Yes | Yes | Yes, explicit availability and assignment |
| Route optimization | Product capability | Strong optimization engine; data and app are separate | Product capability | Product capability | Defer automation; manual order first |
| Live tracking | Driver tools available | Must build | Product capability | Product capability | Not represented as live in this demo |
| Proof of delivery | Product ecosystem | Must build | Product capability | Product capability | Define requirements in pilot; not built yet |
| Address correction | Product-dependent | Must build | Product-dependent | Product-dependent | Make missing landmark and uncertain pin visible |
| Customer notifications | Product ecosystem | Must build | Product capability | Product capability | Defer until channel, consent, and message cost are validated |
| Small-business setup | Hosted and self-hosted paths | Engineering-led | Managed setup | Managed setup | Self-serve setup is a validation target |

## Recommended low-cost stack to evaluate

- **Order and dispatch core:** keep the first version small and owned by the product. Consider adopting Fleetbase only after a license, maintenance, and extension-fit review.
- **Map data:** OpenStreetMap data. OSM's public tile service has limited capacity, no SLA, and strict usage terms; do not treat volunteer tile servers as a production commercial map API.
- **Geocoding:** self-host or use a provider whose terms and quota fit production. Public Nominatim is limited to one request per second and is intended for moderate, user-triggered use.
- **Routing and optimization:** evaluate OSRM or Valhalla with VROOM on a representative set of city orders. Compare route feasibility and travel times with drivers before exposing an “optimized” route as authoritative.
- **Hosting and data:** choose a low-cost managed database and application host only after the deployment region, backups, access controls, and support owner are clear. Open-source software still has an operating cost.
- **Notifications:** start with manual customer calls or messages while measuring volume, consent, delivery success, and per-message charges. Add an SMS or WhatsApp provider after the pilot reveals need and budget.

## Product implications

1. Lead with an address and exception workflow, not a promise that routing alone fixes delivery.
2. Use predictable tenant pricing and show possible usage costs before checkout.
3. Separate software costs from map, message, payment, support, and hosting costs.
4. Keep manual override available; local dispatchers know access constraints and customer context that map data may miss.
5. Treat a driver app, live location, route optimizer, and proof capture as separate decisions with pilot evidence.

## Sources

- [Fleetbase pricing](https://fleetbase.io/pricing)
- [Fleetbase licensing](https://fleetbase.io/licensing)
- [Fleetbase product overview](https://fleetbase.io/)
- [VROOM project and supported problem types](https://github.com/VROOM-Project/vroom)
- [Tookan pricing](https://jungleworks.com/tookan/pricing/)
- [Onfleet pricing](https://onfleet.com/pricing)
- [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/)
- [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/)
- [Zomato delivery integration: outlet availability](https://www.zomato.com/developer/integration/docs/getting-started/development-for-integration/outlet-configuration/delivery-status/)
- [Zomato order management](https://www.zomato.com/developer/integration/docs/api-documentation/order-management/)
- [Swiggy food order tracking API](https://mcp.swiggy.com/builders/docs/reference/food/track_food_order/)
- [Swiggy Instamart order tracking API](https://mcp.swiggy.com/builders/docs/reference/instamart/track_order/)
- [Blinkit FAQ](https://blinkit.com/faq)
- [Blinkit delivery partner information](https://blinkit.com/pages/delivery)
- [Zepto delivery agreement](https://www.zepto.com/s/de-agreement)

## Product patterns informing the interface

The public material reviewed for Zomato, Swiggy, Blinkit, and Zepto points to a small set of useful delivery patterns: make each order stage explicit, show the delivery window beside the address, let the operator see whether a driver is available, and surface problems that need a person to resolve them. These references inform the workflow only; MileDesk uses its own name, colors, layouts, and language.

MileDesk applies those patterns to local business dispatch:

- Keep the order queue, driver availability, and service area visible together for quick dispatch decisions.
- Put locality, street address, landmark, and address uncertainty in the same customer location view.
- Use direct exception labels such as “Address check” and “Ready to assign,” with an immediate next action.
- Treat the map as a service-area overview. A live driver position or route line must only appear after a real provider and consented location feed are connected.
- Keep delivery creation short and allow assignment after an order is saved.

The design takes its visual direction from MileDesk’s existing pale sage workspace, forest green actions, warm neutral details, compact typography, and rounded white panels. The current map is explicitly illustrative. No external mapping or tracking SDK is connected.

## Direction for the first application surfaces

| Surface | First implementation direction | Why it fits |
|---|---|---|
| Dispatcher workspace | Next.js App Router, TypeScript, Tailwind CSS, with `app/` at the project root | Fast browser access for owners and dispatchers; no installation needed for a small business |
| Driver experience | Separate Expo / React Native app, after driver screens and field workflow are designed | Drivers need reliable phone-first status updates, contact actions, and offline handling |
| Recipient updates | Mobile-friendly tracking link, only after consent, messaging cost, and status rules are validated | Recipients can follow a delivery without installing a marketplace app |
| Map display | MapLibre renderer with an OSM-compatible production tile provider | Open renderer avoids tying the interface to one map vendor; tile service still needs a production SLA and cost review |
| Turn-by-turn navigation | Open the chosen stop in the driver’s installed navigation app initially | Avoids building and maintaining turn-by-turn guidance in the first release |

The map renderer does not decide address quality. Before choosing a geocoder or route API, compare candidates using consented addresses from the first launch area, including apartment entrances, local landmarks, and pin corrections. The public OSM tile and Nominatim services are not production substitutes for a contracted map service.
