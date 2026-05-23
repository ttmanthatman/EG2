"use client";

import { useState, useRef, useEffect } from "react";

interface ComposerProps { onSend: (message: string) => void; disabled: boolean; }

export default function Composer({ onSend, disabled }: ComposerProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!disabled && inputRef.current) inputRef.current.focus(); }, [disabled]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed); setText("");
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-vcs-card border-t border-vcs-border">
      <input ref={inputRef} type="text" value={text} onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        placeholder={disabled ? "Running…" : "Send a message to the character…"} disabled={disabled}
        className="flex-1 px-4 py-2.5 rounded-lg bg-vcs-bg border border-vcs-border text-sm text-vcs-text placeholder-vcs-text-muted focus:outline-none focus:border-vcs-gold disabled:opacity-50" />
      <button onClick={handleSend} disabled={disabled || !text.trim()}
        className="px-5 py-2.5 rounded-lg bg-vcs-gold text-vcs-bg text-sm font-semibold hover:bg-vcs-gold/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
        Run Turn
      </button>
    </div>
  );
}
