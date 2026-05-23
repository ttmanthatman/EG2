"use client";

import { useEffect } from "react";

export default function Heartbeat() {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/dev-heartbeat", { method: "POST" }).catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return null;
}
