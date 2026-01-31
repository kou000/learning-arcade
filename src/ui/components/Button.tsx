import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" };

export function Button({ variant = "primary", className, ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-sky-600 text-white hover:bg-sky-700"
      : "bg-white text-slate-800 hover:bg-slate-100 border border-slate-200";
  return <button className={`${base} ${styles} ${className ?? ""}`} {...props} />;
}
