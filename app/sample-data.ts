import type { Delivery, Driver } from "./delivery-types";

export const sampleDrivers: Driver[] = [
  { id: "rahul", name: "Rahul Kumar", phone: "+91 98400 10421", vehicle: "Scooter · TN 09 AB 2148", availability: "On route", area: "T. Nagar" },
  { id: "meena", name: "Meena Prakash", phone: "+91 98400 10422", vehicle: "Scooter · TN 09 CD 3182", availability: "On route", area: "Nungambakkam" },
  { id: "surya", name: "Surya Joseph", phone: "+91 98400 10423", vehicle: "Motorbike · TN 07 EF 6721", availability: "On route", area: "Mylapore" },
  { id: "farah", name: "Farah Ahmed", phone: "+91 98400 10424", vehicle: "Scooter · TN 09 GH 4095", availability: "Available", area: "Alwarpet" },
  { id: "karthik", name: "Karthik Raj", phone: "+91 98400 10425", vehicle: "Bicycle · TN 09 JK 1150", availability: "Off shift", area: "Adyar" },
];

export const sampleDeliveries: Delivery[] = [
  { id: "MD-2048", customer: "Priya Raman", phone: "+91 98765 43001", address: "12/4, Venkata Narayana Road", locality: "T. Nagar", postalCode: "600017", landmark: "Landmark needed before dispatch", window: "11:30 AM – 12:00 PM", driverId: "meena", status: "Address check", note: "Confirm the correct apartment entrance.", createdAt: "10:24 AM" },
  { id: "MD-2047", customer: "Arjun Srinivasan", phone: "+91 98765 43002", address: "Flat 3B, Lake View Apartments", locality: "Chetpet", postalCode: "600031", landmark: "Opposite the community park", window: "12:00 PM – 1:00 PM", driverId: "", status: "Ready to assign", note: "Call on arrival.", createdAt: "10:12 AM" },
  { id: "MD-2046", customer: "Divya Narayanan", phone: "+91 98765 43003", address: "8, 2nd Main Road", locality: "Alwarpet", postalCode: "600018", landmark: "Blue gate, beside the pharmacy", window: "11:00 AM – 11:30 AM", driverId: "rahul", status: "On the way", note: "Customer prefers a call at the gate.", createdAt: "9:58 AM" },
  { id: "MD-2045", customer: "Vikram Balaji", phone: "+91 98765 43004", address: "29, Sterling Road", locality: "Nungambakkam", postalCode: "600034", landmark: "Reception at the east entrance", window: "11:30 AM – 12:30 PM", driverId: "surya", status: "Picked up", note: "Leave with reception if permitted.", createdAt: "9:44 AM" },
  { id: "MD-2044", customer: "Lakshmi Iyer", phone: "+91 98765 43005", address: "6, Kamarajar Salai", locality: "Mylapore", postalCode: "600004", landmark: "Near the temple tank", window: "10:30 AM – 11:30 AM", driverId: "surya", status: "Delivered", note: "Handed to recipient.", createdAt: "9:26 AM" },
  { id: "MD-2043", customer: "Naveen Kumar", phone: "+91 98765 43006", address: "14, 3rd Cross Street", locality: "Adyar", postalCode: "600020", landmark: "Green house after the bus stop", window: "10:00 AM – 11:00 AM", driverId: "rahul", status: "Failed", note: "Recipient was not available. Retry needs dispatcher approval.", createdAt: "9:02 AM" },
];

export const sampleAreas = [
  { name: "T. Nagar", postalCodes: "600017, 600018", hours: "8:00 AM – 8:00 PM", status: "Active" },
  { name: "Nungambakkam", postalCodes: "600034, 600006", hours: "8:00 AM – 8:00 PM", status: "Active" },
  { name: "Mylapore", postalCodes: "600004, 600028", hours: "9:00 AM – 7:00 PM", status: "Active" },
  { name: "Adyar", postalCodes: "600020, 600041", hours: "9:00 AM – 7:00 PM", status: "Active" },
];
