import React, { useLayoutEffect, useRef, useState } from "react";

export function RegisterDisplay({ value }: { value: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measurementRef = useRef<HTMLSpanElement>(null);
  const [fontScale, setFontScale] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measurement = measurementRef.current;
    if (!container || !measurement) return;

    const fitText = () => {
      const availableWidth = container.clientWidth;
      const textWidth = measurement.getBoundingClientRect().width;
      if (availableWidth > 0 && textWidth > 0) {
        // Leave one pixel for rounding at fractional font sizes.
        setFontScale(Math.min(1, (availableWidth - 1) / textWidth));
      }
    };

    fitText();
    const observer = new ResizeObserver(fitText);
    observer.observe(container);
    // Also remeasure when responsive font sizes or loaded fonts change.
    observer.observe(measurement);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[1em] min-w-0 items-center justify-end overflow-hidden text-right text-5xl font-black leading-none tabular-nums text-[#f5ffbd] drop-shadow-[0_0_8px_rgba(215,255,131,0.55)] sm:text-6xl"
    >
      <span
        ref={measurementRef}
        aria-hidden="true"
        className="invisible absolute whitespace-nowrap tracking-[0.08em]"
      >
        {value}
      </span>
      <span
        className="shrink-0 whitespace-nowrap tracking-[0.08em]"
        style={{ fontSize: `${fontScale}em` }}
      >
        {value}
      </span>
    </div>
  );
}
