import React from "react";

type Props = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  className?: string;
};

export function NumberInput({ label, value, min, max, step = 1, onChange, className }: Props) {
  return (
    <label className={`grid gap-1 text-sm ${className ?? ""}`}>
      <span className="text-slate-700">{label}</span>
      <input
        type="number"
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
