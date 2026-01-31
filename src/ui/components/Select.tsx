import React from "react";

type Option<T extends string | number> = { value: T; label: string };

type Props<T extends string | number> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  className?: string;
};

export function Select<T extends string | number>({ label, value, options, onChange, className }: Props<T>) {
  return (
    <label className={`grid gap-1 text-sm ${className ?? ""}`}>
      <span className="text-slate-700">{label}</span>
      <select
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
        value={String(value)}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
