"use client";

import { useEffect } from "react";
import StatusBadge from "./StatusBadge";
import { useAppStore } from "@/lib/store";

export default function TopBar() {
  const llmConfig = useAppStore((s) => s.llmConfig);
  const setLLMConfig = useAppStore((s) => s.setLLMConfig);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => setLLMConfig(data))
      .catch(() =>
        setLLMConfig({
          configured: false, model: null, mock: false,
          error: "Failed to fetch config",
        })
      );
  }, [setLLMConfig]);

  const status = llmConfig.mock ? "mock"
    : llmConfig.configured ? "connected"
    : llmConfig.error ? "error" : "disconnected";

  return (
    <header className="h-12 bg-vcs-card border-b border-vcs-border flex items-center justify-between px-5 flex-shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold text-vcs-gold tracking-wide">Virtual Character Studio</h1>
        <span className="text-xs text-vcs-text-muted hidden lg:block">
          Node-based MVP for psychologically continuous characters
        </span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-xs text-vcs-text-secondary">
          <span>Character: <span className="text-vcs-text">character_001 / 沈砚</span></span>
          <span className="text-vcs-border">|</span>
          <span>Session: <span className="text-vcs-text">default</span></span>
          <span className="text-vcs-border">|</span>
          <span>LLM: <span className="text-vcs-text">{llmConfig.model || "—"}</span></span>
        </div>
        <StatusBadge status={status} />
      </div>
    </header>
  );
}
