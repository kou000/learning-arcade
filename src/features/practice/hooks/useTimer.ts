import { useEffect, useMemo, useRef, useState } from "react";

export function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

export function useTimer(initialSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setIsRunning(false);
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;
    if (tickRef.current != null) return;

    tickRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (tickRef.current != null) {
            window.clearInterval(tickRef.current);
            tickRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (tickRef.current != null) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [isRunning]);

  return useMemo(() => ({
    secondsLeft,
    isRunning,
    start: () => setIsRunning(true),
    pause: () => setIsRunning(false),
    reset: () => {
      setSecondsLeft(initialSeconds);
      setIsRunning(false);
    },
  }), [secondsLeft, isRunning, initialSeconds]);
}
