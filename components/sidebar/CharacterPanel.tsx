"use client";

import { useEffect, useState } from "react";

interface CharacterInfo {
  name: string; age: string; occupation: string;
  personality: string; speech: string; scene: string; innerWeather: string;
}

export default function CharacterPanel() {
  const [info, setInfo] = useState<CharacterInfo | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then(() => {
        setInfo({
          name: "沈砚",
          age: "37岁 · 男",
          occupation: "旧书店店主",
          personality: "内敛、敏感、克制、温柔但疏离。习惯用沉默保护自己，面对冲突倾向于回避。",
          speech: "温和低沉，语速偏慢，偏书面语，不说不真诚的话。",
          scene: "傍晚的旧书店，窗外小雨，刚送走一位常客。",
          innerWeather: "多云。表面安静，内里有轻微波动。",
        });
      })
      .catch(() => setInfo(null));
  }, []);

  if (!info) return <div className="p-4"><div className="text-vcs-text-muted text-xs">Loading…</div></div>;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-vcs-gold text-sm font-semibold">{info.name}</h3>
        <p className="text-vcs-text-muted text-xs mt-0.5">{info.age} · {info.occupation}</p>
      </div>
      <div><h4 className="text-vcs-text-secondary text-xs font-medium mb-1">Personality</h4><p className="text-vcs-text text-xs leading-relaxed">{info.personality}</p></div>
      <div><h4 className="text-vcs-text-secondary text-xs font-medium mb-1">Speech Style</h4><p className="text-vcs-text text-xs leading-relaxed">{info.speech}</p></div>
      <div><h4 className="text-vcs-text-secondary text-xs font-medium mb-1">Current Scene</h4><p className="text-vcs-text text-xs leading-relaxed">{info.scene}</p></div>
      <div><h4 className="text-vcs-text-secondary text-xs font-medium mb-1">Inner Weather</h4><p className="text-vcs-text text-xs leading-relaxed italic text-vcs-text-secondary">&ldquo;{info.innerWeather}&rdquo;</p></div>
    </div>
  );
}
