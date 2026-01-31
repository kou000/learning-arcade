import React from "react";
import type { Problem } from "../../../domain/generator/types";
import type { Subject } from "../../../domain/specs/types";
import { subjectLabel } from "../../../domain/generator";

type Props = {
  problems: Problem[];
  grade: number;
  subject: Subject;
  setNumber: number;
  minutes: number;
};

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function ProblemSheet({ problems, grade, subject, setNumber, minutes }: Props) {
  const isVertical = problems.some((p) => p.kind === "vertical");
  const subjectName = subjectLabel(subject);

  return (
    <div className="rounded-2xl border border-slate-800 bg-white px-6 py-5 text-slate-900 shadow-sm print:rounded-none print:border-slate-900 print:px-4 print:py-4 print:shadow-none">
      <div className="grid items-end gap-3 md:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-end gap-6 text-base font-semibold">
          <div>{grade}級</div>
          <div>第{setNumber}回</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold">{subjectName}</div>
          <div className="mt-1 text-xs">制限時間 {minutes}分</div>
        </div>
        <div className="ml-auto w-40 border border-slate-800 px-3 py-2 text-xs">
          <div className="flex items-center justify-between">
            <span>点数</span>
            <span>1問10点（150点）</span>
          </div>
          <div className="mt-3 h-6 border-t border-slate-800" />
        </div>
      </div>

      {isVertical ? (
        <div className="mt-6 grid gap-6">
          {chunk(problems, 5).map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-5 border border-slate-800">
              {row.map((p, idx) => (
                <div key={idx} className="border-r border-slate-800 last:border-r-0">
                  <div className="flex flex-col">
                    <div className="border-b border-slate-800 py-1 text-center text-xs">
                      {rowIdx * 5 + idx + 1}
                    </div>
                    <pre className="flex-1 whitespace-pre-wrap px-4 py-2 text-right text-sm leading-6 font-[var(--sheet-font)]">
                      {p.question}
                    </pre>
                    <div className="h-8 border-t border-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {chunk(problems, Math.ceil(problems.length / 2)).map((col, colIdx) => (
            <div key={colIdx} className="border border-slate-800">
              {col.map((p, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[42px_1fr] border-b border-slate-800 last:border-b-0"
                >
                  <div className="flex items-center justify-center border-r border-slate-800 text-xs">
                    {colIdx * Math.ceil(problems.length / 2) + idx + 1}
                  </div>
                  <div className="px-4 py-2 text-base font-[var(--sheet-font)]">
                    {p.question} ＝
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
