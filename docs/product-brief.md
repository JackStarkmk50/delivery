# MileDesk product brief

## Rewritten working prompt

Build a low-cost, area-based delivery operations product for small local businesses. Start from the least processed evidence available: observe dispatchers and drivers doing real work, review consented order exports and delivery exceptions, and inspect the actual address instructions customers send. Learn how businesses capture orders, identify locations, assign nearby drivers, handle failed handoffs, and tell customers what is happening.

Use field observation, short interviews, task walkthroughs, service blueprints, address-quality coding, exception analysis, and usability sessions. Compare open-source building blocks with managed commercial tools by capability, license, operating burden, local coverage, and total cost. Use public product documentation and visible workflows as category references. Use reverse engineering only on applications and traffic the team is authorized to inspect; do not copy private services or assume their internal APIs are available for reuse.

Design and build the smallest coherent product that lets one small business create a delivery, validate and clarify its destination, assign it to a driver, see delivery status, and resolve common exceptions. Keep the interface easy for a non-technical dispatcher and practical on a phone. Prefer open-source and low-cost tools where service quality and terms permit. Mark assumptions, sample data, and missing infrastructure clearly.

Judge the work with evidence outside the design team: observed task completion by dispatchers and drivers, address correction rates, failed-delivery causes, time to dispatch, customer understanding of tracking updates, and a pilot business's cost per successful delivery. Do not claim product-market fit, address accuracy, route savings, or production readiness until those measures exist.

## What an experienced product team adds

- **Operational research:** watch actual order intake, route planning, driver handoff, and failed deliveries. Ask operators to narrate recent incidents, not describe an ideal workflow.
- **Address evidence:** collect consented raw address text, landmarks, contact attempts, pin corrections, and delivery outcomes. Record why a delivery failed so “bad address” does not hide multiple causes.
- **Economics:** measure cost per successful delivery, support time, driver idle time, repeat trips, message cost, and willingness to pay. Low software fees alone do not make delivery cheaper.
- **Service design:** include the dispatcher, driver, recipient, and business owner. Define who resolves a missing landmark, unavailable customer, restricted access, or no-show.
- **Trust and safety:** minimize customer data, limit who sees phone numbers and live location, set retention periods, and make tracking opt-in and time-bounded.
- **Reliability:** plan for weak mobile networks, duplicate orders, delayed status updates, wrong pins, cash collection, and handover disputes.
- **Commercial fit:** validate the city's density, delivery types, business tools, language needs, and operational differences before picking a launch area.

## Starting material

The project starts with no customer interviews, order exports, driver records, or existing software. Therefore the actual raw material is not available yet. The first research packet should contain:

1. A dispatcher-observed shift, with names and customer details removed.
2. A consented sample of completed, delayed, failed, and returned orders.
3. Original customer address messages and the final location confirmed by the driver.
4. Driver arrival, contact, handoff, and proof-of-delivery steps.
5. Current tools, payment and cash-on-delivery steps, and actual fees.

The dashboard currently uses fabricated examples. They demonstrate a hypothesis: delivery systems should make locality, landmarks, and address uncertainty visible before a driver loses time.

## Methods and tools

| Need | Method or tool | What it tells us |
|---|---|---|
| Understand today's work | Shift observation, contextual interview, task walkthrough | Real handoffs and workarounds |
| Find failure patterns | Anonymized order review, exception coding, address correction log | Which problems happen and where |
| Design the service | Service blueprint and role-by-role journey | Ownership across dispatcher, driver, and recipient |
| Test the interface | Moderated usability sessions with local operators and drivers | Whether users can dispatch and resolve an issue without coaching |
| Compare implementation options | License review, deploy trial, capability matrix, monthly cost model | Full cost and operational burden |
| Establish baseline | Small pilot with agreed metrics and a before/after comparison | Whether the service improves real work |

Potential tools include spreadsheet-based research logs, paper maps and route sketches, the browser prototype in this repository, OpenStreetMap-derived mapping, OSRM or Valhalla routing, and VROOM route optimization. Use a paid mapping or dispatch provider if the open stack cannot meet coverage, ETA, uptime, or support needs at a sustainable total cost.

## How someone outside the product team can judge it

- Dispatchers can enter and assign a real order without help.
- Drivers can find the intended entrance or landmark and report a genuine exception.
- Recipients understand the tracking message and know what to do when no one is available.
- A pilot compares time to dispatch, address correction, failed delivery, repeat trip, and cost per successful handoff against the business's existing baseline.
- A second business in the same service area can configure its workflow without the product team editing code.
- A security review confirms tenant isolation, least-privilege access, retention, and protection of customer contact and location data.

## Current product hypothesis

Small local businesses need a shared delivery queue that combines an order, a useful local address, a driver, a time window, and a clear exception state. The first wedge is dispatcher-led, same-city delivery. A partner app and private recipient tracking link now support a local pilot. Multi-city carrier aggregation, a consumer marketplace, automated pricing, payroll, and route optimization remain later decisions until field evidence supports them.

## How the service would be provided

MileDesk is a business-to-business subscription. Each business gets a separate workspace for its orders, staff, customers, service areas, and delivery history. The business keeps its own drivers or chooses its own courier; MileDesk coordinates the work and does not employ or pool riders in the first release.

The initial service can be delivered in three surfaces:

- A browser workspace for the owner and dispatcher to receive, check, assign, and follow orders.
- A lightweight phone experience for drivers to open assigned stops, contact the recipient, and record a handoff or exception.
- A simple recipient link for the order status and location clarification, if the business opts into customer messaging.

Start with assisted onboarding for the first few businesses. Configure their service area, driver roster, order intake, delivery windows, and exception reasons with them. Provide spreadsheet import before building many integrations. Add self-serve setup after repeated onboarding steps are clear.

Keep the price easy to predict. Test a base monthly fee with a reasonable included workload and optional driver seats. Avoid a per-success fee that makes monthly costs harder to forecast. Do not set a price until a local cost model includes hosting, map requests, geocoding, messages, support, payment processing, and failed-delivery handling. Compare that full monthly cost with what each pilot business pays today.

The browser demo includes sample dispatcher sections for overview, deliveries, drivers, service areas, customers, reports, and workspace settings. It supports local browser edits to fictional orders and driver availability. The separate PostgreSQL-backed pilot workspace has isolated business accounts, team roles, driver assignments and status updates, and private recipient links with address correction. Live maps, automated billing, notifications, and production operations remain future work.
