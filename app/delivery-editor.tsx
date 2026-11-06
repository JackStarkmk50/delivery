"use client";

import { FormEvent, useState } from "react";
import type { Delivery, Driver } from "./delivery-types";

export function DeliveryEditor({ delivery, drivers, onSave }: {
  delivery: Delivery; drivers: Driver[]; onSave: (delivery: Delivery) => void;
}) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const landmark = value("landmark");
    const driverId = value("driverId");
    const status = ["Address check", "Ready to assign", "Assigned"].includes(delivery.status)
      ? (!landmark ? "Address check" : driverId ? "Assigned" : "Ready to assign") : delivery.status;
    if (["Picked up", "On the way"].includes(delivery.status) && (!driverId || !landmark)) {
      setError("An active delivery needs its driver and landmark. Keep both details before saving.");
      return;
    }
    onSave({ ...delivery, customer: value("customer"), phone: value("phone"), address: value("address"),
      locality: value("locality"), postalCode: value("postalCode"), landmark, driverId,
      note: value("note"), status, history: [...(delivery.history ?? []),
        { at: new Date().toISOString(), message: "Delivery details updated" }] });
    setSaved(true);
  }
  return <section className="delivery-editor"><h3>Correct delivery details</h3>
    <form onSubmit={save} onChange={() => setSaved(false)}>
      <div className="form-grid">
        <label>Customer<input name="customer" defaultValue={delivery.customer} required maxLength={120}/></label>
        <label>Phone<input name="phone" defaultValue={delivery.phone} required type="tel" maxLength={30}/></label>
        <label className="full-width">Street address<input name="address" defaultValue={delivery.address} required maxLength={300}/></label>
        <label>Locality<input name="locality" defaultValue={delivery.locality} required maxLength={120}/></label>
        <label>Postal code<input name="postalCode" defaultValue={delivery.postalCode} maxLength={20}/></label>
        <label className="full-width">Landmark or entrance<input name="landmark" defaultValue={delivery.landmark} maxLength={300}/></label>
        <label className="full-width">Driver<select name="driverId" defaultValue={delivery.driverId}><option value="">Unassigned</option>{drivers.map(driver => <option key={driver.id} value={driver.id} disabled={driver.availability === "Off shift" && driver.id !== delivery.driverId}>{driver.name} ({driver.availability})</option>)}</select></label>
        <label className="full-width">Delivery note<textarea name="note" defaultValue={delivery.note} maxLength={1000}/></label>
      </div><button className="primary-button" type="submit">Save delivery details</button>
      {saved && <p role="status">Delivery details saved.</p>}
      {error && <p role="alert">{error}</p>}
    </form>
    <h3>Activity history</h3>
    {delivery.history?.length ? <ol className="delivery-history">{[...delivery.history].reverse().map((entry, index) => <li key={`${entry.at}-${index}`}><strong>{entry.message}</strong><time dateTime={entry.at}>{new Date(entry.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</time></li>)}</ol> : <p>No recorded changes for this sample delivery.</p>}
  </section>;
}

export function exportDeliveries(deliveries: Delivery[], drivers: Driver[]) {
  const cell = (value: string) => `"${(/^[\s]*[=+@-]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`;
  const rows = [["Order", "Customer", "Phone", "Address", "Locality", "Postal code", "Landmark", "Window", "Driver", "Status", "Note"],
    ...deliveries.map(item => [item.id, item.customer, item.phone, item.address, item.locality, item.postalCode, item.landmark, item.window, drivers.find(driver => driver.id === item.driverId)?.name ?? "", item.status, item.note])];
  const url = URL.createObjectURL(new Blob(["\uFEFF" + rows.map(row => row.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = `miledesk-deliveries-${new Date().toISOString().slice(0, 10)}.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
