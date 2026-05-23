"use client";

interface CharacterOutputCardProps { action: string; dialogue: string; characterName?: string; }

export default function CharacterOutputCard({ action, dialogue, characterName = "沈砚" }: CharacterOutputCardProps) {
  if (!action && !dialogue) {
    return (<div className="p-4 rounded-lg bg-vcs-card border border-vcs-border"><p className="text-xs text-vcs-text-muted italic">Waiting for response…</p></div>);
  }
  return (
    <div className="p-4 rounded-lg bg-vcs-card border border-vcs-border space-y-3">
      <div className="flex items-center gap-2"><span className="text-xs font-semibold text-vcs-gold">{characterName}</span></div>
      {action && (<div><span className="text-[10px] uppercase tracking-wider text-vcs-text-muted font-medium">Action</span><p className="text-sm text-vcs-text-secondary leading-relaxed mt-0.5 italic">{action}</p></div>)}
      {dialogue && (<div><span className="text-[10px] uppercase tracking-wider text-vcs-text-muted font-medium">Dialogue</span><p className="text-sm text-vcs-text leading-relaxed mt-0.5 font-medium">&ldquo;{dialogue}&rdquo;</p></div>)}
    </div>
  );
}
