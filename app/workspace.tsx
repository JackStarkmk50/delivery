"use client";

import Link from "next/link";
import { DeliveryEditor, exportDeliveries } from "./delivery-editor";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Delivery, DeliveryStatus, Driver } from "./delivery-types";
import { sampleAreas, sampleDeliveries, sampleDrivers } from "./sample-data";

type Page = "Overview" | "Deliveries" | "Drivers" | "Service areas" | "Customers" | "Reports" | "Settings";
type Filter = "All" | "Needs attention" | "Unassigned" | "In progress" | "Delivered";

const navigation: Array<[Page, string]> = [
  ["Overview", "▦"], ["Deliveries", "▤"], ["Drivers", "♙"], ["Service areas", "⌖"],
  ["Customers", "♧"], ["Reports", "▥"], ["Settings", "⚙"],
];
const statuses: DeliveryStatus[] = ["Address check", "Ready to assign", "Assigned", "Picked up", "On the way", "Delivered", "Failed"];
const statusClass: Record<DeliveryStatus, string> = {
  "Address check": "badge-address", "Ready to assign": "badge-pending", Assigned: "badge-pending",
  "Picked up": "badge-transit", "On the way": "badge-transit", Delivered: "badge-success", Failed: "badge-delayed",
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export default function Workspace() {
  const [page, setPage] = useState<Page>("Overview");
  const [deliveries, setDeliveries] = useState<Delivery[]>(sampleDeliveries);
  const [drivers, setDrivers] = useState<Driver[]>(sampleDrivers);
  const [areas, setAreas] = useState(sampleAreas);
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState<Delivery | null>(null);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [ready, setReady] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("Bloom & Basket");
  const [workspaceArea, setWorkspaceArea] = useState("Chennai");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem("miledesk-demo");
      if (saved) {
        try {
          const data = JSON.parse(saved) as { deliveries?: Delivery[]; drivers?: Driver[]; areas?: typeof sampleAreas; workspaceName?: string; workspaceArea?: string };
          if (data.deliveries) setDeliveries(data.deliveries);
          if (data.drivers) setDrivers(data.drivers);
          if (data.areas) setAreas(data.areas);
          if (data.workspaceName) setWorkspaceName(data.workspaceName);
          if (data.workspaceArea) setWorkspaceArea(data.workspaceArea);
        } catch {
          localStorage.removeItem("miledesk-demo");
        }
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("miledesk-demo", JSON.stringify({ deliveries, drivers, areas, workspaceName, workspaceArea }));
  }, [ready, deliveries, drivers, areas, workspaceName, workspaceArea]);

  const activeCount = deliveries.filter((item) => !["Delivered", "Failed"].includes(item.status)).length;
  const attentionCount = deliveries.filter((item) => ["Address check", "Ready to assign", "Failed"].includes(item.status)).length;
  const deliveredCount = deliveries.filter((item) => item.status === "Delivered").length;
  const filteredDeliveries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return deliveries.filter((item) => {
      const matchesSearch = !normalized || [item.id, item.customer, item.address, item.locality, item.landmark, item.phone].join(" ").toLowerCase().includes(normalized);
      const matchesFilter = filter === "All" ||
        (filter === "Needs attention" && ["Address check", "Ready to assign", "Failed"].includes(item.status)) ||
        (filter === "Unassigned" && !item.driverId) ||
        (filter === "In progress" && ["Assigned", "Picked up", "On the way"].includes(item.status)) ||
        (filter === "Delivered" && item.status === "Delivered");
      return matchesSearch && matchesFilter;
    });
  }, [deliveries, filter, query]);

  function toast(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function addDelivery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const driverId = String(form.get("driverId") || "");
    const id = `MD-${Math.max(2048, ...deliveries.map((item) => Number(item.id.slice(3)) || 0)) + 1}`;
    const item: Delivery = {
      id,
      customer: String(form.get("customer")).trim(),
      phone: String(form.get("phone")).trim(),
      address: String(form.get("address")).trim(),
      locality: String(form.get("locality")).trim(),
      postalCode: String(form.get("postalCode")).trim(),
      landmark: String(form.get("landmark")).trim(),
      window: String(form.get("window")),
      driverId,
      status: !String(form.get("landmark")).trim() ? "Address check" : driverId ? "Assigned" : "Ready to assign",
      note: String(form.get("note")).trim(),
      createdAt: "Just now",
      history: [{ at: new Date().toISOString(), message: "Delivery created" }],
    };
    setDeliveries((current) => [item, ...current]);
    setModalOpen(false);
    event.currentTarget.reset();
    toast(`${item.id} added to the delivery queue`);
  }

  function assign(id: string, driverId: string) {
    const driver = drivers.find((item) => item.id === driverId);
    if (!driver || driver.availability === "Off shift") return;
    setDeliveries((current) => current.map((item) => item.id === id ? { ...item, driverId, history: [...(item.history ?? []), { at: new Date().toISOString(), message: `Assigned to ${driver.name}` }], status: item.status === "Address check" ? item.status : "Assigned" } : item));
    toast(`${driver.name} assigned to ${id}`);
  }

  function updateStatus(id: string, status: DeliveryStatus) {
    const item = deliveries.find(entry => entry.id === id);
    if (!item || item.status === status) return;
    if (["Assigned", "Picked up", "On the way", "Delivered"].includes(status) && (!item.driverId || !item.landmark.trim())) {
      toast("Confirm the landmark and assign a driver before dispatch.");
      return;
    }
    const updated = { ...item, status, history: [...(item.history ?? []), { at: new Date().toISOString(), message: "Status changed to " + status }] };
    setDeliveries(current => current.map(entry => entry.id === id ? updated : entry));
    setDetail(current => current?.id === id ? updated : current);
    toast(id + " moved to " + status);
  }

  function saveDelivery(updated: Delivery) {
    setDeliveries(current => current.map(item => item.id === updated.id ? updated : item));
    setDetail(updated);
    toast(updated.id + " saved");
  }

  function toggleDriver(id: string) {
    setDrivers((current) => current.map((driver) => driver.id === id ? { ...driver, availability: driver.availability === "Available" ? "Off shift" : "Available" } : driver));
  }

  return <div className="app-shell">
    <aside className="sidebar" aria-label="Workspace navigation">
      <Link className="brand" href="/product" aria-label="MileDesk product overview"><span className="brand-mark">m</span><span>MileDesk</span></Link>
      <div className="workspace-picker"><span className="workspace-icon">{initials(workspaceName)[0]}</span><span><strong>{workspaceName}</strong><small>{workspaceArea} workspace</small></span><span className="chevron">⌄</span></div>
      <nav className="main-nav" aria-label="Workspace pages">
        <p className="nav-label">WORKSPACE</p>
        {navigation.slice(0, 4).map(([label, icon]) => <button type="button" key={label} className={`nav-item ${page === label ? "active" : ""}`} aria-label={label} title={label} aria-current={page === label ? "page" : undefined} onClick={() => setPage(label)}><span className="nav-icon" aria-hidden="true">{icon}</span><span className="nav-copy">{label}</span>{label === "Deliveries" && <span className="nav-count">{activeCount}</span>}</button>)}
        <p className="nav-label second-label">MANAGE</p>
        {navigation.slice(4).map(([label, icon]) => <button type="button" key={label} className={`nav-item ${page === label ? "active" : ""}`} aria-label={label} title={label} aria-current={page === label ? "page" : undefined} onClick={() => setPage(label)}><span className="nav-icon" aria-hidden="true">{icon}</span><span className="nav-copy">{label}</span></button>)}
      </nav>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-dot"/><span><strong>Demo workspace</strong><small>Changes saved in this browser</small></span></div><div className="profile"><span className="avatar avatar-dark">AK</span><span><strong>Ananya Kumar</strong><small>Workspace owner · demo</small></span></div><Link className="product-link" href="/product">About MileDesk <span aria-hidden="true">↗</span></Link></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="crumbs"><span>{workspaceName}</span><span className="slash">/</span><strong>{page}</strong></div><div className="top-actions"><span className="today-label"><span className="calendar-icon">▣</span> Friday, 6 November</span><button type="button" className="icon-button" aria-label="Notifications" onClick={() => toast("You’re all caught up")}>♧</button><span className="avatar avatar-light" aria-label="Signed in as Ananya Kumar">AK</span></div></header>
      <div className="page-content">
        {page === "Overview" && <Overview deliveries={deliveries} drivers={drivers} activeCount={activeCount} attentionCount={attentionCount} deliveredCount={deliveredCount} onPage={setPage} onNew={() => setModalOpen(true)} onAssign={assign} onOpen={setDetail} />}
        {page === "Deliveries" && <DeliveriesView deliveries={filteredDeliveries} drivers={drivers} filter={filter} query={query} onFilter={setFilter} onQuery={setQuery} onNew={() => setModalOpen(true)} onAssign={assign} onStatus={updateStatus} onOpen={setDetail} />}
        {page === "Drivers" && <DriversView deliveries={deliveries} drivers={drivers} onToggle={toggleDriver} onAssign={assign} onPage={setPage} />}
        {page === "Service areas" && <AreasView areas={areas} onChange={setAreas} />}
        {page === "Customers" && <CustomersView deliveries={deliveries} query={query} onQuery={setQuery} onOpen={setDetail} />}
        {page === "Reports" && <ReportsView deliveries={deliveries} drivers={drivers} />}
        {page === "Settings" && <SettingsView workspaceName={workspaceName} workspaceArea={workspaceArea} onName={setWorkspaceName} onArea={setWorkspaceArea} onReset={() => { localStorage.removeItem("miledesk-demo"); setDeliveries(sampleDeliveries); setDrivers(sampleDrivers); setAreas(sampleAreas); setWorkspaceName("Bloom & Basket"); setWorkspaceArea("Chennai"); toast("Demo workspace reset"); }} />}
        <footer className="page-foot"><span>Need help with a delivery? Talk to your workspace owner.</span><span>Workspace timezone: Asia/Kolkata · Sample data</span></footer>
      </div>
    </main>

    {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}><section className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="new-order-title"><form onSubmit={addDelivery}><div className="modal-head"><div><p className="eyebrow">DELIVERY INTAKE</p><h2 id="new-order-title">Add a delivery</h2><p>Capture the address details that help a driver reach the right entrance.</p></div><button type="button" className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close">×</button></div><div className="form-grid"><label>Customer name<input name="customer" required placeholder="e.g. Kavya Iyer"/></label><label>Phone number<input name="phone" required inputMode="tel" placeholder="+91 98765 43210"/></label><label className="full-width">Street address<input name="address" required placeholder="Door number, street, apartment"/></label><label>Locality<input name="locality" required placeholder="e.g. Adyar"/></label><label>Postal code<input name="postalCode" inputMode="numeric" placeholder="600020"/></label><label className="full-width">Landmark or entrance detail<input name="landmark" placeholder="Gate, floor, nearby shop or landmark"/></label><label>Delivery window<select name="window"><option>12:00 PM – 1:00 PM</option><option>1:00 PM – 2:00 PM</option><option>2:00 PM – 4:00 PM</option><option>As soon as possible</option></select></label><label>Assign driver<select name="driverId"><option value="">Assign later</option>{drivers.filter((driver) => driver.availability !== "Off shift").map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}</select></label><label className="full-width">Delivery note<input name="note" placeholder="Call at gate, leave with reception…"/></label></div><div className="address-hint"><span>⌖</span><span><strong>Address quality is part of dispatch</strong><small>Missing landmarks stay visible as an address check until someone confirms them.</small></span></div><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary-button" type="submit">Add to queue</button></div></form></section></div>}
    {detail && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetail(null); }}><section className="modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><div className="detail-head"><div><p className="eyebrow">DELIVERY RECORD</p><h2 id="detail-title">#{detail.id}</h2><p>Created {detail.createdAt} · Sample record</p></div><button type="button" className="modal-close" onClick={() => setDetail(null)} aria-label="Close">×</button></div><div className="detail-content"><span className={`badge ${statusClass[detail.status]}`}><i/>{detail.status}</span><h3>{detail.customer}</h3><p>{detail.phone}</p><div className="detail-address"><strong>Delivery location</strong><span>{detail.address}</span><span>{detail.locality} {detail.postalCode}</span><small>Landmark: {detail.landmark || "Not provided"}</small></div><p><strong>Delivery window:</strong> {detail.window}</p><p><strong>Driver:</strong> {drivers.find((driver) => driver.id === detail.driverId)?.name ?? "Not assigned"}</p><p><strong>Delivery note:</strong> {detail.note || "No note"}</p><label className="status-control">Update delivery status<select value={detail.status} onChange={(event) => updateStatus(detail.id, event.target.value as DeliveryStatus)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><DeliveryEditor key={detail.id} delivery={detail} drivers={drivers} onSave={saveDelivery}/></div><div className="modal-actions"><button className="secondary-button" onClick={() => setDetail(null)}>Close record</button><button className="primary-button" onClick={() => { setDetail(null); setPage("Deliveries"); }}>Back to queue</button></div></section></div>}
    {notice && <div className="toast visible" role="status" aria-live="polite">{notice}</div>}
  </div>;
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <section className="welcome-row page-intro"><div><p className="eyebrow">{eyebrow} <span className="sample-tag">DEMO</span></p><h1>{title}</h1><p className="welcome-subtitle">{description}</p></div>{action}</section>;
}

function Overview({ deliveries, drivers, activeCount, attentionCount, deliveredCount, onPage, onNew, onAssign, onOpen }: {
  deliveries: Delivery[]; drivers: Driver[]; activeCount: number; attentionCount: number; deliveredCount: number;
  onPage: (page: Page) => void; onNew: () => void; onAssign: (id: string, driverId: string) => void; onOpen: (delivery: Delivery) => void;
}) {
  const completed = deliveredCount + deliveries.filter((item) => item.status === "Failed").length;
  const assignedDrivers = drivers.filter((driver) => driver.availability === "On route").length;
  return <>
    <PageIntro eyebrow="WORKSPACE OVERVIEW" title="Good morning, Ananya" description="Your local delivery queue, driver availability, and the orders that need a closer look." action={<button className="primary-button" onClick={onNew}><span>＋</span> New delivery</button>} />
    <section className="stats-grid" aria-label="Sample delivery summary">
      <Stat label="Orders in sample queue" value={String(deliveries.length)} icon="▤" tone="sage" foot="Example records for this workspace" />
      <Stat label="Active deliveries" value={String(activeCount)} icon="↗" tone="blue" foot={`${assignedDrivers} drivers currently on route`} />
      <Stat label="Delivered" value={String(deliveredCount)} icon="✓" tone="green" foot="From the sample records shown" />
      <Stat label="Needs attention" value={String(attentionCount)} icon="!" tone="amber" foot={`${deliveries.filter((item) => item.status === "Address check").length} address checks · ${deliveries.filter((item) => !item.driverId).length} unassigned`} />
    </section>
    <section className="operations-grid">
      <article className="panel map-panel"><div className="panel-heading"><div><h2>Service area snapshot</h2><p>Central {""}Chennai <span className="muted-dot">·</span> Illustrative only</p></div><button className="select-button" onClick={() => onPage("Service areas")}>Manage areas <span>→</span></button></div><AreaSketch /></article>
      <article className="panel driver-panel"><div className="panel-heading"><div><h2>Driver availability</h2><p>{drivers.filter((driver) => driver.availability !== "Off shift").length} on shift in this sample</p></div><button className="more-button" aria-label="Open drivers" onClick={() => onPage("Drivers")}>···</button></div><div className="driver-list">{drivers.slice(0, 4).map((driver) => <DriverRow key={driver.id} driver={driver} assigned={deliveries.filter((item) => item.driverId === driver.id && !["Delivered", "Failed"].includes(item.status)).length} />)}</div><button className="panel-footer-link" onClick={() => onPage("Drivers")}>Open driver board <span>→</span></button></article>
    </section>
    <section className="panel orders-panel"><div className="orders-heading"><div><h2>Needs a dispatcher</h2><p>Address questions and unassigned orders stay visible in one queue.</p></div><button className="panel-footer-link header-link" onClick={() => onPage("Deliveries")}>Open all deliveries <span>→</span></button></div><DeliveryTable deliveries={deliveries.filter((item) => ["Address check", "Ready to assign", "Failed", "On the way"].includes(item.status)).slice(0, 5)} drivers={drivers} onOpen={onOpen} onAssign={onAssign} /></section>
    <section className="quick-links"><button className="quick-link-card" onClick={() => onNew()}><span className="quick-link-mark">＋</span><span><strong>Create a delivery</strong><small>Add the address, landmark, and delivery window.</small></span><b>→</b></button><button className="quick-link-card" onClick={() => onPage("Service areas")}><span className="quick-link-mark">⌖</span><span><strong>Review service areas</strong><small>See the localities your team has configured.</small></span><b>→</b></button><button className="quick-link-card" onClick={() => onPage("Reports")}><span className="quick-link-mark">▥</span><span><strong>View sample reports</strong><small>Explore the measures a pilot should track.</small></span><b>→</b></button></section>
    <p className="prototype-note">All figures, people, locations, and performance values in this workspace are sample data. It is not connected to live orders or driver locations. {completed > 0 && "Use the delivery list to explore sample status changes."}</p>
  </>;
}

function Stat({ label, value, icon, tone, foot }: { label: string; value: string; icon: string; tone: string; foot: string }) {
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon icon-${tone}`}>{icon}</span></div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></article>;
}

function AreaSketch() {
  return <div className="map-visual" role="img" aria-label="Illustrative schematic of central Chennai localities; not a live map"><div className="map-grid"/><svg className="roads" viewBox="0 0 740 360" preserveAspectRatio="none" aria-hidden="true"><path d="M-20 90 C120 125 135 210 280 176 S440 70 760 125"/><path d="M80 -20 C120 80 240 90 245 180 S300 280 360 380"/><path d="M475 -10 C410 80 470 150 410 215 S345 305 400 380"/><path d="M-10 278 C110 220 200 235 305 270 S515 320 760 250"/><path d="M610 -10 C590 80 640 150 590 210 S540 300 590 380"/></svg>{[["T. Nagar","20%","52%"],["Nungambakkam","46%","24%"],["Mylapore","70%","68%"],["Alwarpet","49%","72%"]].map(([name,left,top]) => <span key={name} className="place" style={{ left, top }}>{name}</span>)}<span className="map-stop stop-a">1</span><span className="map-stop stop-b">2</span><span className="map-stop stop-c">3</span><div className="map-legend"><span><i className="legend-stop"/>Sample locality</span></div><span className="map-credit">Illustration only · map provider not connected</span></div>;
}

function DriverRow({ driver, assigned }: { driver: Driver; assigned: number }) {
  return <div className="driver-row"><span className={`avatar driver-photo ${driver.availability === "Available" ? "d4" : "d1"}`}>{initials(driver.name)}</span><div className="driver-detail"><strong>{driver.name}</strong><small><i className={`status-pip ${driver.availability === "Available" ? "available" : driver.availability === "Off shift" ? "offline" : ""}`}/>{driver.availability} <span>·</span> {assigned} active stops</small></div><span className="driver-order-count">{assigned.toString().padStart(2, "0")}</span></div>;
}

function DeliveriesView({ deliveries, drivers, filter, query, onFilter, onQuery, onNew, onAssign, onStatus, onOpen }: {
  deliveries: Delivery[]; drivers: Driver[]; filter: Filter; query: string; onFilter: (filter: Filter) => void; onQuery: (query: string) => void;
  onNew: () => void; onAssign: (id: string, driverId: string) => void; onStatus: (id: string, status: DeliveryStatus) => void; onOpen: (delivery: Delivery) => void;
}) {
  const filters: Filter[] = ["All", "Needs attention", "Unassigned", "In progress", "Delivered"];
  return <><PageIntro eyebrow="ORDER OPERATIONS" title="Deliveries" description="Find an order, check the address, assign a driver, and keep exceptions moving." action={<button className="primary-button" onClick={onNew}><span>＋</span> New delivery</button>} />
    <section className="panel queue-panel"><div className="queue-toolbar"><button className="secondary-button" onClick={() => exportDeliveries(deliveries, drivers)}>Export CSV</button><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search order, customer, address or locality" aria-label="Search deliveries"/></label><span className="sample-caption">{deliveries.length} matching sample {deliveries.length === 1 ? "delivery" : "deliveries"}</span></div><div className="filter-row" role="tablist" aria-label="Filter deliveries">{filters.map((item) => <button key={item} role="tab" aria-selected={filter === item} className={`filter-chip ${filter === item ? "selected" : ""}`} onClick={() => onFilter(item)}>{item}</button>)}</div><DeliveryTable deliveries={deliveries} drivers={drivers} onOpen={onOpen} onAssign={onAssign} onStatus={onStatus} emptyMessage="No deliveries match this search. Try another name, order number, or locality." /></section>
    <div className="helper-strip"><span className="helper-icon">⌖</span><span><strong>Address checks prevent avoidable searching.</strong><small>Confirm the landmark or entrance detail before you move an order into dispatch.</small></span></div>
  </>;
}

function DeliveryTable({ deliveries, drivers, onOpen, onAssign, onStatus, emptyMessage = "No deliveries need attention right now." }: {
  deliveries: Delivery[]; drivers: Driver[]; onOpen: (delivery: Delivery) => void; onAssign: (id: string, driverId: string) => void;
  onStatus?: (id: string, status: DeliveryStatus) => void; emptyMessage?: string;
}) {
  return <div className="table-wrap"><table className="delivery-table"><thead><tr><th>ORDER</th><th>CUSTOMER &amp; LOCATION</th><th>WINDOW</th><th>DRIVER</th><th>STATUS</th><th/></tr></thead><tbody>{deliveries.map((item) => {
    const driver = drivers.find((entry) => entry.id === item.driverId);
    return <tr key={item.id}><td><button className="order-id link-button" onClick={() => onOpen(item)}>#{item.id}</button><small>{item.createdAt}</small></td><td><strong>{item.customer}</strong><small>{item.address}, {item.locality}</small><span className={`address-note ${item.landmark ? "" : "missing-note"}`}>{item.landmark || "Add landmark"}</span></td><td><strong>{item.window}</strong><small>{item.postalCode || "Postal code not set"}</small></td><td>{driver ? <span className="driver-assigned"><span className="avatar tiny-avatar d2">{initials(driver.name)}</span>{driver.name.split(" ")[0]}</span> : <select className="table-select" value="" aria-label={`Assign a driver to ${item.id}`} onChange={(event) => onAssign(item.id, event.target.value)}><option value="">Assign driver</option>{drivers.filter((entry) => entry.availability !== "Off shift").map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select>}</td><td>{onStatus ? <select className={`status-select ${statusClass[item.status]}`} value={item.status} aria-label={`Update status for ${item.id}`} onChange={(event) => onStatus(item.id, event.target.value as DeliveryStatus)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select> : <span className={`badge ${statusClass[item.status]}`}><i/>{item.status}</span>}</td><td><button className="row-more" aria-label={`Open ${item.id}`} onClick={() => onOpen(item)}>···</button></td></tr>;
  })}{deliveries.length === 0 && <tr><td colSpan={6} className="empty-state">{emptyMessage}</td></tr>}</tbody></table><div className="delivery-cards">{deliveries.map((item) => {
    const driver = drivers.find((entry) => entry.id === item.driverId);
    return <article className="delivery-card" key={item.id}><div className="delivery-card-top"><button className="order-id link-button" onClick={() => onOpen(item)}>#{item.id}</button><span className={`badge ${statusClass[item.status]}`}><i/>{item.status}</span></div><div className="delivery-card-customer"><strong>{item.customer}</strong><small>{item.phone}</small></div><div className="delivery-card-location"><span className="delivery-card-label">Delivery location</span><span>{item.address}, {item.locality}</span><small>{item.landmark || "Landmark not provided"}{item.postalCode ? ` · ${item.postalCode}` : ""}</small></div><div className="delivery-card-meta"><div><span className="delivery-card-label">Window</span><strong>{item.window}</strong></div><div><span className="delivery-card-label">Driver</span>{driver ? <strong>{driver.name}</strong> : <select className="table-select" value="" aria-label={`Assign a driver to ${item.id}`} onChange={(event) => onAssign(item.id, event.target.value)}><option value="">Assign driver</option>{drivers.filter((entry) => entry.availability !== "Off shift").map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select>}</div></div>{onStatus && <label className="delivery-card-status"><span className="delivery-card-label">Update status</span><select className={`status-select ${statusClass[item.status]}`} value={item.status} aria-label={`Update status for ${item.id}`} onChange={(event) => onStatus(item.id, event.target.value as DeliveryStatus)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>}<button className="delivery-card-open" onClick={() => onOpen(item)}>View delivery details</button></article>;
  })}{deliveries.length === 0 && <p className="empty-state">{emptyMessage}</p>}</div></div>;
}

function DriversView({ deliveries, drivers, onToggle, onAssign, onPage }: { deliveries: Delivery[]; drivers: Driver[]; onToggle: (id: string) => void; onAssign: (id: string, driverId: string) => void; onPage: (page: Page) => void }) {
  const unassigned = deliveries.filter((item) => !item.driverId && item.status !== "Delivered");
  return <><PageIntro eyebrow="TEAM OPERATIONS" title="Drivers" description="Keep shift availability clear and assign work with the driver’s current area in view." action={<button className="secondary-button" onClick={() => onPage("Deliveries")}>Open delivery queue</button>} />
    {unassigned.length > 0 && <div className="attention-banner"><span>!</span><div><strong>{unassigned.length} unassigned {unassigned.length === 1 ? "delivery" : "deliveries"}</strong><small>Choose an available driver from the delivery queue when the destination is ready.</small></div><button onClick={() => onPage("Deliveries")}>Review queue →</button></div>}
    <section className="driver-cards">{drivers.map((driver) => { const assignments = deliveries.filter((item) => item.driverId === driver.id && !["Delivered", "Failed"].includes(item.status)); return <article className="panel driver-card" key={driver.id}><div className="driver-card-top"><span className={`avatar driver-photo ${driver.availability === "Available" ? "d4" : "d1"}`}>{initials(driver.name)}</span><span className={`availability-pill ${driver.availability.toLowerCase().replace(" ", "-")}`}><i/> {driver.availability}</span></div><h2>{driver.name}</h2><p>{driver.vehicle}</p><div className="driver-card-meta"><span>Current area</span><strong>{driver.area}</strong></div><div className="driver-card-meta"><span>Active stops</span><strong>{assignments.length}</strong></div><div className="driver-card-actions"><button className="secondary-button" onClick={() => onToggle(driver.id)}>{driver.availability === "Available" ? "End availability" : "Mark available"}</button>{unassigned[0] && driver.availability !== "Off shift" && <button className="assign-button" onClick={() => onAssign(unassigned[0].id, driver.id)}>Assign next</button>}</div></article>; })}</section>
    <p className="prototype-note">Driver cards use fictional people and vehicle details. This workspace does not send jobs to a real phone.</p>
  </>;
}

function AreasView({ areas, onChange }: { areas: typeof sampleAreas; onChange: (areas: typeof sampleAreas) => void }) {
  const [open, setOpen] = useState(false);
  function addArea(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const data = new FormData(event.currentTarget); const name = String(data.get("name")).trim(); if (!name) return; onChange([...areas, { name, postalCodes: String(data.get("postalCodes")).trim() || "Add postal codes", hours: String(data.get("hours")), status: "Active" }]); setOpen(false); event.currentTarget.reset(); }
  return <><PageIntro eyebrow="LOCAL COVERAGE" title="Service areas" description="Define the neighborhoods your business serves and the delivery hours your team can support." action={<button className="primary-button" onClick={() => setOpen((value) => !value)}><span>＋</span> Add area</button>} />
    <div className="area-summary"><div><span className="area-summary-icon">⌖</span><strong>{areas.length} localities configured</strong><small>Boundary map connection is not set up in this demo.</small></div><span className="badge badge-pending">Manual coverage list</span></div>
    {open && <form className="area-form" onSubmit={addArea}><label>Locality<input name="name" required placeholder="e.g. Besant Nagar"/></label><label>Postal codes<input name="postalCodes" placeholder="e.g. 600090"/></label><label>Delivery hours<select name="hours"><option>9:00 AM – 7:00 PM</option><option>8:00 AM – 8:00 PM</option><option>10:00 AM – 6:00 PM</option></select></label><button className="primary-button" type="submit">Save locality</button></form>}
    <section className="area-list">{areas.map((area) => <article className="panel area-card" key={area.name}><div className="area-card-icon">⌖</div><div className="area-card-main"><div className="area-title"><h2>{area.name}</h2><span className={`badge ${area.status === "Active" ? "badge-pending" : "badge-delayed"}`}><i/>{area.status}</span></div><p>Postal codes: {area.postalCodes}</p><p>Delivery hours: {area.hours}</p></div><button className="more-button" aria-label={`Toggle ${area.name}`} onClick={() => onChange(areas.map((entry) => entry.name === area.name ? { ...entry, status: entry.status === "Active" ? "Paused" : "Active" } : entry))}>···</button></article>)}</section>
    <p className="prototype-note">Coverage is represented as a locality and postal-code list. Polygon drawing, serviceability checks, and geocoding need a real mapping provider.</p>
  </>;
}

function CustomersView({ deliveries, query, onQuery, onOpen }: { deliveries: Delivery[]; query: string; onQuery: (value: string) => void; onOpen: (delivery: Delivery) => void }) {
  const latestByPhone = new Map<string, Delivery>();
  for (const delivery of deliveries) { if (!latestByPhone.has(delivery.phone)) latestByPhone.set(delivery.phone, delivery); }
  const customers = [...latestByPhone.values()].filter((item) => [item.customer, item.phone, item.address, item.locality].join(" ").toLowerCase().includes(query.toLowerCase()));
  return <><PageIntro eyebrow="CUSTOMER CONTEXT" title="Customers" description="See the delivery location details your team has collected. Customer records are derived from the sample orders." />
    <section className="panel customer-panel"><div className="queue-toolbar"><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search customers or localities" aria-label="Search customers"/></label><span className="sample-caption">{customers.length} sample records</span></div><div className="customer-list">{customers.map((item) => <button className="customer-row" key={item.phone} onClick={() => onOpen(item)}><span className="avatar customer-avatar">{initials(item.customer)}</span><span className="customer-info"><strong>{item.customer}</strong><small>{item.phone}</small></span><span className="customer-location"><strong>{item.locality}</strong><small>{item.address}</small></span><span className="customer-last"><small>Most recent order</small><strong>#{item.id}</strong></span><span className="customer-arrow">→</span></button>)}</div>{customers.length === 0 && <p className="empty-state">No sample customer matches that search.</p>}</section>
    <p className="prototype-note">A production customer directory needs consent, access controls, data retention rules, and duplicate handling.</p>
  </>;
}

function ReportsView({ deliveries, drivers }: { deliveries: Delivery[]; drivers: Driver[] }) {
  const delivered = deliveries.filter((item) => item.status === "Delivered").length;
  const notDelivered = deliveries.filter((item) => item.status === "Failed").length;
  const assigned = deliveries.filter((item) => item.driverId).length;
  const max = Math.max(1, ...[delivered, notDelivered, assigned, deliveries.length]);
  return <><PageIntro eyebrow="OPERATIONS REVIEW" title="Reports" description="A starting set of delivery measures. Sample records are too small to represent a reliable business trend." />
    <div className="report-callout"><span>i</span><span><strong>Example data, not a performance claim.</strong><small>Use a real pilot to establish a baseline before comparing delivery time, success rate, or cost.</small></span></div>
    <section className="stats-grid report-stats"><Stat label="Sample deliveries" value={String(deliveries.length)} icon="▤" tone="sage" foot="Records currently in this browser"/><Stat label="Assigned to a driver" value={String(assigned)} icon="♙" tone="blue" foot="Includes completed sample jobs"/><Stat label="Delivered" value={String(delivered)} icon="✓" tone="green" foot="Status marked delivered"/><Stat label="Failed attempt" value={String(notDelivered)} icon="!" tone="amber" foot="Requires an agreed retry policy"/></section>
    <section className="reports-grid"><article className="panel report-panel"><div className="panel-heading"><div><h2>Queue snapshot</h2><p>Current sample statuses</p></div></div>{statuses.map((status) => { const count = deliveries.filter((item) => item.status === status).length; return <div className="bar-row" key={status}><span>{status}</span><div className="bar-track"><i style={{ width: `${Math.max(count ? 8 : 0, count / max * 100)}%` }}/></div><strong>{count}</strong></div>; })}</article><article className="panel report-panel"><div className="panel-heading"><div><h2>Driver workload</h2><p>Active stops by driver</p></div></div>{drivers.map((driver) => <div className="workload-row" key={driver.id}><span className="avatar tiny-avatar d2">{initials(driver.name)}</span><span>{driver.name}</span><strong>{deliveries.filter((item) => item.driverId === driver.id && !["Delivered", "Failed"].includes(item.status)).length}</strong></div>)}</article></section>
    <p className="prototype-note">Production reports should include dispatch time, delivery-window adherence, address corrections, failed attempts, repeat trips, and cost per successful handoff.</p>
  </>;
}

function SettingsView({ workspaceName, workspaceArea, onName, onArea, onReset }: { workspaceName: string; workspaceArea: string; onName: (value: string) => void; onArea: (value: string) => void; onReset: () => void }) {
  const [name, setName] = useState(workspaceName);
  const [area, setArea] = useState(workspaceArea);
  function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onName(name.trim() || "My workspace"); onArea(area.trim() || "Local area"); }
  return <><PageIntro eyebrow="WORKSPACE PREFERENCES" title="Settings" description="Set the workspace details shown to your dispatch team. These settings are stored only in this browser demo." />
    <form className="panel settings-form" onSubmit={save}><div className="panel-heading"><div><h2>Workspace profile</h2><p>Basic details for the business using MileDesk.</p></div></div><label>Workspace name<input value={name} onChange={(event) => setName(event.target.value)} required/></label><label>Primary city or delivery area<input value={area} onChange={(event) => setArea(event.target.value)} required/></label><label>Workspace timezone<select defaultValue="Asia/Kolkata"><option>Asia/Kolkata</option><option>Asia/Dubai</option><option>UTC</option></select></label><button className="primary-button" type="submit">Save workspace details</button></form>
    <div className="settings-grid"><article className="panel settings-card"><span className="settings-card-icon">♙</span><h2>Team access</h2><p>Role-based accounts are planned. This demo has no sign-in or permission controls.</p><span className="feature-state planned">Planned</span></article><article className="panel settings-card"><span className="settings-card-icon">⌖</span><h2>Maps and navigation</h2><p>No geocoding, live GPS, or routing service is connected to this sample.</p><span className="feature-state planned">Provider selection needed</span></article><article className="panel settings-card"><span className="settings-card-icon">↻</span><h2>Browser data</h2><p>Reset sample orders and workspace preferences stored in this browser.</p><button className="secondary-button" onClick={() => { if (window.confirm("Reset all browser deliveries and workspace preferences to sample data? Export deliveries first if needed.")) onReset(); }}>Reset demo data</button></article></div>
  </>;
}
