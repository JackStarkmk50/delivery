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
  location_latitude: number | null;
  location_longitude: number | null;
  location_accuracy_m: number | null;
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
  const [pin, setPin] = useState<{ latitude: number; longitude: number; accuracy_m: number } | null>(null);
  function locate() {
    if (!navigator.geolocation) { setMessage('Location is unavailable in this browser.'); return; }
    setSaving(true);
    navigator.geolocation.getCurrentPosition(position => {
      const accuracy_m = position.coords.accuracy;
      setSaving(false);
      if (accuracy_m > 1000) { setMessage('Location is too imprecise. Try again near the entrance.'); return; }
      setPin({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy_m });
      setMessage(`Location ready (about ${Math.round(accuracy_m)} m accuracy). Send it with the address below.`);
    }, () => { setSaving(false); setMessage('Location permission was denied or unavailable.'); }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  }
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
          ...(pin ?? {}),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setDelivery(result.delivery);
      setPin(null);
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
                <button type="button" className="secondary-button" disabled={saving} onClick={locate}>{pin ? 'Update location pin' : 'Use my current location'}</button>
                <p>Optional. Share your location while you are at the entrance. The dispatcher will review it.</p>
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
            {delivery.location_latitude !== null && <p>Location pin shared · accuracy about {Math.round(delivery.location_accuracy_m ?? 0)} m. The entrance note is still important.</p>}
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
