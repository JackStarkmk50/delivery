import type { Metadata } from "next";
import "./globals.css";
import "./interface.css";
import "./workspace.css";
import "./design-system.css";

export const metadata: Metadata = {
  title: "MileDesk — Local delivery, under control",
  description: "A clear dispatch workspace for local delivery teams.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
