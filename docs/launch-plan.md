# First release and validation plan

## First usable release

The first release should serve one small business in one local area. Its main job is to make the order-to-handoff process visible and easier to recover when an address or handoff goes wrong.

### Core workflow

1. Create an order manually or import a simple spreadsheet.
2. Keep recipient contact, street address, locality, postal code, landmark, delivery window, and any access note together.
3. Flag an incomplete address for confirmation before it is assigned.
4. Show available drivers and assign an order manually.
5. Record accepted, picked up, on the way, delivered, failed, or returned, with time and reason.
6. Keep the dispatcher, driver, and customer aware of the next action.
7. Review completed work and the reason for every failed handoff.

### Not in the first release

Consumer marketplace, multi-carrier shipping, automatic route optimization, live GPS, automatic customer messaging, payments, payroll, AI address inference, and multi-city operation. Each adds cost or operational risk before the initial workflow is validated.

## Evidence to collect before implementation expands

Interview and observe at least five businesses with recent examples of actual delivery exceptions. Include dispatchers and drivers, not only owners. The sample is for pattern discovery, not market sizing.

For each business, collect (with permission):

- Typical deliveries per day, peak hours, service area, vehicle mix, and staffing.
- Existing order sources and route/driver assignment steps.
- A small anonymized order sample with successful, delayed, failed, and returned deliveries.
- Original address text, landmark, pin correction, arrival, contact attempt, and outcome.
- Customer notification channels, language, consent, and monthly message cost.
- Baseline minutes to dispatch, address clarification rate, first-attempt success, repeat trips, and cost per successful delivery.
- A price range the owner would approve, and what they would stop paying for.

## Prototype validation

Ask dispatchers to create an order with an incomplete address, identify the missing information, assign a driver, and recover from an unsuccessful handoff. Ask drivers to find a named building using the supplied address and landmark. Do not explain the interface while measuring. Record completion, errors, help needed, and time. Review all customer-facing words with local speakers before rollout.

## Pilot gates

Proceed only when a pilot business agrees to share a baseline and outcome data, users can complete the essential workflow, and the expected total cost is acceptable. Expand the scope only if pilot evidence identifies a repeated need. Treat the following as measures, not promised targets:

- Time from order receipt to assignment.
- Address clarification rate and time spent resolving it.
- First-attempt delivery success and repeat trip rate.
- Late and failed handoffs by cause.
- Dispatcher and driver task completion without assistance.
- Customer understanding of status and tracking instructions.
- Total cost per successful delivery and monthly spend by provider.

## Production architecture decisions still open

Choose a region and first city, tenancy model, authentication, database, data retention, backup policy, map/routing services, driver device strategy, notification provider, local languages, tax/invoice handling, support coverage, uptime target, and incident owner. Before holding live data, write a data-flow map and access policy. Avoid storing exact customer location longer than the delivery and business records require.
