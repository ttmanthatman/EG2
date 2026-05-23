"use client";

interface StatusBadgeProps { status: "connected" | "disconnected" | "error" | "mock"; }

const statusConfig = {
  connected: { dot: "bg-vcs-success", label: "Connected" },
  disconnected: { dot: "bg-vcs-text-muted", label: "Disconnected" },
  error: { dot: "bg-vcs-error", label: "Config Error" },
  mock: { dot: "bg-vcs-warning", label: "Mock Mode" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className="text-xs text-vcs-text-secondary">{config.label}</span>
    </div>
  );
}
