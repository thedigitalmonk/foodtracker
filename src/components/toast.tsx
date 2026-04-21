"use client";

import { useEffect, useRef } from "react";

interface ToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, onUndo, onDismiss, duration = 5000 }: ToastProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    // Trigger animation after mount
    const raf = requestAnimationFrame(() => {
      bar.style.transition = `width ${duration}ms linear`;
      bar.style.width = "0%";
    });
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[343px] z-50">
      <div className="bg-foreground text-background rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 gap-3">
          <span className="text-[13px] font-medium truncate">{message}</span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onUndo}
              className="text-[13px] font-semibold text-[#FCD34D] px-2 py-1"
            >
              Undo
            </button>
            <button
              onClick={onDismiss}
              className="text-[13px] text-background/60 px-2 py-1"
            >
              ✕
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-[3px] bg-background/20">
          <div
            ref={barRef}
            className="h-full bg-[#FCD34D] w-full"
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
