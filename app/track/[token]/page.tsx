import Tracking from "./tracking";
import "./tracking.css";

export const metadata = {
  title: "MileDesk | Delivery status",
  referrer: "no-referrer",
};
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <Tracking token={token} />;
}
