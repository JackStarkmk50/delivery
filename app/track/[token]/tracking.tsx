"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Delivery = {
  id: string;
  customer: string;
  address: string;
  landmark: string;
  status: string;
  version: number;
  workspace: string;
};
const stages = ["Assigned", "Picked up", "On the way", "Delivered"];
function heading(status: string) {
  if (status === "Address check") return "Address needs a check";
  if (status === "Failed") return "Delivery needs attention";
  if (status === "Delivered") return "Delivered";
  if (status === "Ready to assign")
    return "The shop is preparing your delivery";
  if (status === "Assigned") return "A driver has been assigned";
  return "Your delivery is moving";
}
export default function Tracking({ token }: { token: string }) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    fetch(`/api/track/${token}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (active) setDelivery(data.delivery);
      })
      .catch((error) => {
        if (active) setMessage(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!delivery) return;
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/track/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          version: delivery.version,
          address: data.get("address"),
          landmark: data.get("landmark"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setDelivery(result.delivery);
      setMessage("Address sent to the dispatcher for review.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setSaving(false);
    }
  }
  const editable =
    delivery &&
    ["Address check", "Ready to assign", "Assigned"].includes(delivery.status);
  return (
    <main className="tracking-shell">
      <header className="tracking-header">
        <Link href="/" className="brand">
          <span className="brand-mark">m</span>MileDesk
        </Link>
        <span>Delivery status</span>
      </header>
      {loading ? (
        <p role="status">Loading delivery…</p>
      ) : !delivery ? (
        <section className="panel tracking-panel">
          <h1>Link unavailable</h1>
          <p>{message || "Ask the shop for a new tracking link."}</p>
        </section>
      ) : (
        <div className="tracking-content">
          <div className="tracking-heading">
            <p>{delivery.workspace}</p>
            <h1>{heading(delivery.status)}</h1>
            <p>
              Delivery {delivery.id.slice(0, 8)} for {delivery.customer}
            </p>
          </div>
          <section className="panel tracking-panel">
            <h2>Current status</h2>
            <strong className="tracking-status">{delivery.status}</strong>
            <p>
              {delivery.status === "Address check"
                ? "The dispatcher is checking the location details."
                : delivery.status === "Failed"
                  ? "Contact the shop to arrange the next step."
                  : delivery.status === "Delivered"
                    ? "This delivery is complete."
                    : "Arrival times and live location are not available yet."}
            </p>
            <ol className="tracking-steps">
              {stages.map((stage, index) => (
                <li
                  key={stage}
                  className={
                    stages.indexOf(delivery.status) >= index ? "done" : ""
                  }
                >
                  {stage}
                </li>
              ))}
            </ol>
          </section>
          <section className="panel tracking-panel">
            <h2>Destination</h2>
            {editable ? (
              <form onSubmit={save} key={delivery.version}>
                <label>
                  Street address
                  <textarea
                    name="address"
                    defaultValue={delivery.address}
                    minLength={5}
                    maxLength={300}
                    required
                  />
                </label>
                <label>
                  Landmark or entrance note
                  <textarea
                    name="landmark"
                    defaultValue={delivery.landmark}
                    maxLength={300}
                  />
                </label>
                <button className="primary-button" disabled={saving}>
                  {saving ? "Sending…" : "Send address correction"}
                </button>
              </form>
            ) : (
              <>
                <p>{delivery.address}</p>
                <p>{delivery.landmark || "No entrance note."}</p>
                <p>
                  For changes now, contact the shop that accepted your order.
                </p>
              </>
            )}
          </section>
          {message && (
            <p className="tracking-notice" role="status">
              {message}
            </p>
          )}
        </div>
      )}
    </main>
  );
}
