import React from "react";

type Props = { label: string; checked: boolean; onChange: (v: boolean) => void; className?: string };

export function Toggle({ label, checked, onChange, className }: Props) {
  return (
    <label className={`flex items-center gap-2 text-sm ${className ?? ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-200"
      />
      <span className="text-slate-700">{label}</span>
    </label>
  );
}
