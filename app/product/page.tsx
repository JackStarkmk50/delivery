import Link from "next/link";
import { Icon } from "../ui-icon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MileDesk — Local delivery operations",
  description: "A practical local delivery workspace for small businesses and their own driver teams.",
};

const featureGroups = [
  {
    label: "Dispatch basics",
    title: "A shared delivery queue for your team",
    description: "Bring orders, time windows, driver assignments, and delivery exceptions into one workspace. Keep a person in control of each dispatch decision.",
    points: ["Create an order with customer and destination details", "See the delivery state and assigned driver", "Filter the queue by address check, assignment, or progress"],
    state: "Interactive demo",
  },
  {
    label: "Local address context",
    title: "Give the driver more than a pin",
    description: "Keep the locality, postal code, landmark, entrance note, and customer contact together so dispatchers can resolve missing information before handoff.",
    points: ["Flag missing landmarks", "Keep entrance instructions with the order", "Search by customer, address, or locality"],
    state: "Interactive demo",
  },
  {
    label: "People and coverage",
    title: "Work with the team you already have",
    description: "MileDesk is designed for a business’s own drivers or chosen courier partner. It coordinates work; it does not pool riders or create a consumer marketplace.",
    points: ["View sample shift availability and current workload", "Group service by locality and postal code", "Make manual assignment and exception handling visible"],
    state: "Interactive demo",
  },
  {
    label: "Customer communication",
    title: "Keep delivery updates useful and accountable",
    description: "A private link now shows delivery status and lets the recipient send an address correction. Automated messages and consent controls still need pilot decisions.",
    points: ["Private tracking link", "Address correction before pickup", "Notifications and preferences are planned"],
    state: "Local pilot",
  },
  {
    label: "Driver tools",
    title: "A phone-first flow for the last mile",
    description: "The partner app shows assigned stops and records status or a failed attempt. Offline updates, proof and location sharing are still planned.",
    points: ["Assigned stops and address details", "Call the recipient and open Maps", "Record pickup, delivery and failed attempts"],
    state: "Local pilot",
  },
  {
    label: "Owner controls",
    title: "Know how the operation is working",
    description: "The product should help owners see where time and cost go without pretending a small sample is a performance benchmark.",
    points: ["Dispatch and delivery reports", "Team roles and workspace settings", "Subscription, usage, and invoice controls"],
    state: "Planned",
  },
  {
    label: "Order intake and integrations",
    title: "Fit into the tools your business uses",
    description: "Start with one dependable way to receive orders, then connect the systems that show up repeatedly in pilot businesses.",
    points: ["Spreadsheet import and export", "POS, store, or commerce connections", "Documented API and webhook options"],
    state: "Planned",
  },
  {
    label: "Trust and data protection",
    title: "Protect customer and location data",
    description: "A production service needs clear role access, tenant isolation, retention controls, and consent for any location sharing.",
    points: ["Workspace roles and audit history", "Customer data retention controls", "Time-bounded, consented driver location"],
    state: "Planned",
  },
];

const comparison = [
  { type: "Spreadsheets and chat", suited: "Very small teams coordinating informally", limitation: "Order, location details, driver status, and customer updates are split across messages and sheets.", miledesk: "One searchable queue with address context and a visible next action." },
  { type: "Consumer marketplaces · Zomato / Swiggy", suited: "Businesses seeking customer discovery, ordering, and marketplace delivery", limitation: "Marketplace listing, order rules, and customer relationship are part of that platform's model.", miledesk: "MileDesk is a business workspace for orders the merchant already receives and its own driver team." },
  { type: "Quick commerce · Blinkit / Zepto", suited: "Retailers and consumers using rapid, inventory-led local fulfillment", limitation: "These services are built around their catalog, fulfillment operation, and serviceability model.", miledesk: "MileDesk doesn't sell inventory or promise a fixed ultra-fast delivery time; it coordinates local business deliveries." },
  { type: "Delivery suites · Tookan / Onfleet", suited: "Operations needing managed dispatch, routing, tracking, and wider integrations", limitation: "The implementation and feature set may exceed what a small local operator needs; actual fit and price depend on the vendor plan.", miledesk: "Start with dispatcher-led local delivery and add automation only when pilot evidence supports it." },
  { type: "MileDesk", suited: "Small businesses serving defined neighborhoods", limitation: "The product is a local pilot; live maps, offline mobile work, automated billing, and integrations are not ready.", miledesk: "Locality and landmark clarity, dispatcher control, and transparent operating scope are the starting point." },
];

const roadmap = [
  ["Now · browser demo", "Create and search sample deliveries, add address context, assign sample drivers, update status, manage locality lists, view a sample report."],
  ["Now · local pilot", "PostgreSQL-backed business queues, team sign-ins, assigned driver stops, private customer links, delivery history, and manual service records."],
  ["After field validation", "Consented location sharing, route and geocoding provider, delivery proof, offline updates, and customer notifications."],
  ["Commercial readiness", "Subscription billing, usage limits, support process, backups, monitoring, privacy controls, and production deployment."],
];

export default function ProductPage() {
  return <main id="top" className="product-site">
    <header className="product-nav"><Link href="/" className="brand"><span className="brand-mark">m</span><span>MileDesk</span></Link><nav aria-label="Product navigation"><a href="#how-it-works">How it works</a><a href="#features">Features</a><a href="#difference">Why MileDesk</a><a href="#roadmap">Roadmap</a></nav><Link className="primary-button" href="/live">Open local pilot <span><Icon name="↗"/></span></Link></header>

    <section className="product-hero"><div className="product-hero-copy"><h1>Local deliveries,<br/><span className="headline-accent">easier to find.</span></h1><p className="product-lede">MileDesk helps small teams organize local orders, clarify hard-to-find destinations, assign their own drivers, and keep delivery exceptions visible.</p><div className="product-hero-actions"><Link className="primary-button" href="/">Explore the workspace <span aria-hidden="true"><Icon name="→"/></span></Link><a className="secondary-button" href="#difference">See how it differs</a></div><p className="product-honesty">Built for neighborhood delivery operations. No marketplace promises or live tracking claims.</p></div><div className="product-hero-art" role="img" aria-label="Illustration of a local dispatch workflow"><div className="hero-route-line"/><div className="hero-area-label label-top">T. Nagar</div><div className="hero-area-label label-right">Mylapore</div><div className="hero-area-label label-bottom">Alwarpet</div><div className="hero-order order-card-one"><span className="hero-order-icon"><Icon name="⌖"/></span><span><strong>Address check</strong><small>Landmark needed · T. Nagar</small></span></div><div className="hero-order order-card-two"><span className="hero-driver-avatar">FA</span><span><strong>Farah is available</strong><small>2 nearby orders ready</small></span></div><div className="hero-stop stop-one">1</div><div className="hero-stop stop-two">2</div><div className="hero-stop stop-three">3</div><div className="hero-map-note">Local area view · sample</div></div></section>

    <section className="product-proof-row"><div><strong>For local operators</strong><span>Small shops, kitchens, florists, pharmacies, and neighborhood services</span></div><div><strong>Your customer relationship</strong><span>Keep your customers and your delivery process in your workspace</span></div><div><strong>Your dispatch decisions</strong><span>Keep manual control when local context matters</span></div></section>

    <section id="how-it-works" className="product-section workflow-section"><div className="section-heading"><p className="product-kicker">A simple operating loop</p><h2>From order details<br/>to a clear handoff.</h2><p>Each delivery connects the destination, the responsible driver, and the next action.</p></div><div className="workflow-steps">{[["01","Capture the order","Enter customer contact, address, locality, delivery window, and any access notes."],["02","Check the destination","Resolve missing landmarks or entrance instructions before the order goes out."],["03","Assign and follow","Choose a driver, keep the status current, and make failed attempts visible."],["04","Learn from the work","Review address corrections and delivery outcomes before automating more." ]].map(([number,title,description]) => <article className="workflow-step" key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>

    <section id="features" className="product-section feature-section"><div className="section-heading"><p className="product-kicker">What miledesk provides</p><h2>Useful at each handoff.</h2><p>Features are labeled honestly: the current browser demo and the capabilities still to build.</p></div><div className="feature-grid">{featureGroups.map((feature, index) => <article className="feature-card" key={feature.title}><div className="feature-card-top"><span className={`feature-icon feature-tone-${index % 4}`}><Icon name={["▤","⌖","♙","↗","➜","▥","⇄","◇"][index]}/></span><span className={`feature-state ${feature.state === "Planned" ? "planned" : "available"}`}>{feature.state}</span></div><p className="feature-label">{feature.label}</p><h3>{feature.title}</h3><p className="feature-description">{feature.description}</p><ul>{feature.points.map((point) => <li key={point}><span><Icon name="✓"/></span>{point}</li>)}</ul></article>)}</div></section>

    <section id="difference" className="difference-section"><div className="section-heading"><h2>Delivery software is not all the same.</h2><p>Marketplaces bring customer demand and a delivery network. Fleet suites coordinate broad operations. MileDesk is being shaped for small businesses that already have local customers and need a better way to manage the last mile.</p></div><div className="comparison-wrap"><table className="comparison-table"><thead><tr><th>Approach</th><th>Often fits</th><th>Trade-off to consider</th><th>How MileDesk is positioned</th></tr></thead><tbody>{comparison.map((row) => <tr key={row.type} className={row.type === "MileDesk" ? "miledesk-row" : ""}><th>{row.type}{row.type === "MileDesk" && <span className="comparison-you">Our direction</span>}</th><td>{row.suited}</td><td>{row.limitation}</td><td>{row.miledesk}</td></tr>)}</tbody></table><div className="comparison-cards">{comparison.map((row) => <article className={`comparison-card ${row.type === "MileDesk" ? "miledesk-row" : ""}`} key={row.type}><h3>{row.type}</h3><dl><div><dt>Often fits</dt><dd>{row.suited}</dd></div><div><dt>Trade-off to consider</dt><dd>{row.limitation}</dd></div><div><dt>How MileDesk is positioned</dt><dd>{row.miledesk}</dd></div></dl></article>)}</div></div><p className="comparison-caveat">This is a product-category comparison, not an audited feature-by-feature rating of individual vendors. Plans and capabilities vary by provider.</p></section>

    <section className="product-section principles-section"><div className="section-heading"><p className="product-kicker">Product principles</p><h2>Practical first.<br/>Automation with evidence.</h2></div><div className="principles-list"><article><span>01</span><div><h3>Keep the business in control</h3><p>Dispatchers can manually assign, correct, or pause a delivery when a map or rule misses local reality.</p></div></article><article><span>02</span><div><h3>Make destination context visible</h3><p>Street address, locality, postal code, landmark, contact, and entrance note belong together.</p></div></article><article><span>03</span><div><h3>Show the real state of the product</h3><p>A sample map must not look live. Tracking, proof, messaging, and performance claims need real services and pilot data.</p></div></article><article><span>04</span><div><h3>Measure the cost of a successful handoff</h3><p>Software, maps, messages, driver time, support, and repeat attempts all count toward delivery cost.</p></div></article></div></section>

    <section id="roadmap" className="product-section roadmap-section"><div className="section-heading"><p className="product-kicker">WHAT&apos;S INCLUDED AND WHAT&apos;S NEXT</p><h2>A clear product boundary.</h2><p>The current workspace is a browser demo, not a live delivery service.</p></div><div className="roadmap-list">{roadmap.map(([stage, description], index) => <article key={stage}><span className={`roadmap-dot ${index === 0 ? "current" : ""}`}/><div><h3>{stage}</h3><p>{description}</p></div></article>)}</div></section>

    <section className="pricing-band"><div><p className="product-kicker">Pilot pricing</p><h2>Predictable for a small team.</h2><p>We are validating order volume, driver seats, map use, messages, and support cost with early businesses before publishing a price. No fixed plan is being sold from this demo.</p></div><div className="pricing-note"><span>Pricing principles</span><strong>Clear monthly base</strong><strong>Visible usage costs</strong><strong>No surprise per-drop charge</strong><small>Final plan and limits need pilot evidence.</small></div></section>

    <section className="product-cta"><div><p className="product-kicker">READY TO SEE THE WORKFLOW?</p><h2>Open the MileDesk workspace.</h2><p>Explore the sample queue, address checks, driver board, service-area list, and reports.</p></div><Link href="/" className="primary-button">Open workspace <span><Icon name="→"/></span></Link></section>

    <footer className="product-footer"><Link href="/" className="brand"><span className="brand-mark">m</span><span>MileDesk</span></Link><span>Local delivery operations software · Product direction and capabilities are subject to pilot validation.</span><a href="#top">Back to top ↑</a></footer>
  </main>;
}
