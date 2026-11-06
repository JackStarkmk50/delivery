# Web interface refinement

## Scope

Product page and all seven dispatcher views. Existing demo behavior, brand palette, routes, and feature availability remain intact. Authentication and database work are outside this change.

## Findings addressed

- Missing display fonts produced unintended serif fallbacks. Shared system typography now gives headings and controls predictable metrics.
- Text symbols used as icons had inconsistent weight and alignment. Shared stroke-based SVG icons now cover navigation, actions, features, and summaries.
- Small, faint labels made dense screens difficult to scan. Type sizes, contrast, component spacing, and control dimensions are standardized in `app/design-system.css`.
- Narrow navigation clipped items beside the brand. Compact navigation has its own horizontally scrollable row, visible text labels, and keyboard access.
- Wide delivery and comparison tables concealed information on small screens. Card layouts expose the same content; comparison cells wrap on desktop.
- Service-area actions were ambiguous and long names could push them out of view. Explicit pause/resume labels and stacked narrow layouts fix both issues.
- Dialogs lacked focus containment, Escape handling, and focus restoration. A shared dialog hook handles these behaviors and locks background scrolling.
- Settings lacked save feedback and offered a timezone selector whose changes were not saved. Save confirmation is now visible; the fixed timezone is disabled.

## Verification

Captured before and after states for the product page and every workspace view at 320, 375, 768, 1280, and 1920 pixels. Local screenshots are in `.hallmark/before/` and `.hallmark/after/`; they are intentionally excluded from Git. Representative layouts were visually inspected, including narrow service areas and tablet settings.

A fresh browser session completed delivery creation, address correction, driver assignment, status update, activity-history inspection, and reload persistence. Empty search feedback, keyboard focus containment, and Escape dismissal were also checked. The workflow emitted no browser errors.

Automated WCAG A/AA checks reported no violations for the overview and product page at 1280 pixels, or the remaining dashboard views at 375 and 1280 pixels after contrast fixes. These checks do not establish full accessibility conformance or replace screen-reader testing.

## Limits

The style heuristic audit still reports section-label and legacy-styling conventions. Its score is not treated as a usability measure. Existing stylesheets remain underneath the shared design-system layer; consolidating them is a separate maintenance task.

No dispatcher usability study has been conducted. Task completion time, error rates, comprehension, and suitability for daily operations require observation with real dispatchers. Live-service loading and network-error states remain outside this browser-only demo's behavior.
