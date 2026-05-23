import type { Metadata } from "next";
import "./globals.css";
import Heartbeat from "@/components/app-shell/Heartbeat";

export const metadata: Metadata = {
  title: "Virtual Character Studio",
  description: "Node-based MVP for psychologically continuous virtual characters",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Heartbeat />
      </body>
    </html>
  );
}
