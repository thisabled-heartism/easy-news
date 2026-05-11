"use client";

import { useState } from "react";

export function TtsButton({ bodyId }: { bodyId: string }) {
  const [playing, setPlaying] = useState(false);

  const handleClick = () => {
    if (typeof window === "undefined") return;
    if (playing) {
      speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const el = document.getElementById(bodyId);
    if (!el) return;
    const u = new SpeechSynthesisUtterance(el.innerText);
    u.lang = "ko-KR";
    u.rate = 0.9;
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
    setPlaying(true);
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-black px-5 py-3 rounded-full text-sm mb-8 shadow-sm"
    >
      {playing ? "⏸ 잠시 멈춤" : "🔊 읽어 주기"}
    </button>
  );
}
