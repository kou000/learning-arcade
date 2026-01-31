import React from "react";
import type { Problem } from "../../../domain/generator/types";

export function AnswerSheet({ problems }: { problems: Problem[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-700">解答</div>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
        {problems.map((p, idx) => (
          <div key={idx} className="text-sm">
            <span className="font-semibold">{idx + 1}.</span> {p.answer}
          </div>
        ))}
      </div>
    </div>
  );
}
