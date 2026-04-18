"use client";

import { useEffect, useState } from "react";

export function MobileBlocker() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060d1a] px-8 text-center">
      <div className="text-6xl mb-6">⚓</div>
      <h1 className="text-2xl font-black text-white mb-3">Desktop Only</h1>
      <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
        Pirate Academy requires a desktop browser. Open this page on your laptop or PC.
      </p>
    </div>
  );
}
