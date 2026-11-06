export type DeliveryStatus =
  | "Address check"
  | "Ready to assign"
  | "Assigned"
  | "Picked up"
  | "On the way"
  | "Delivered"
  | "Failed";

export type Delivery = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  locality: string;
  postalCode: string;
  landmark: string;
  window: string;
  driverId: string;
  status: DeliveryStatus;
  note: string;
  createdAt: string;
  history?: { at: string; message: string }[];
};

export type Driver = {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  availability: "On route" | "Available" | "Off shift";
  area: string;
};
