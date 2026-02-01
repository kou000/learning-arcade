import React, { useEffect, useMemo, useState } from "react";
import type { Problem } from "../../../domain/generator/types";

type Props = {
  problems: Problem[];
  onRegenerate: () => void;
};

export function OneByOnePractice({ problems, onRegenerate }: Props) {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const current = problems[index];
  const isLast = index >= problems.length - 1;

  const normalizedAnswer = useMemo(() => current?.answer?.replace(/\s+/g, "") ?? "", [current]);
  const normalizedInput = useMemo(() => input.replace(/\s+/g, ""), [input]);
  const isCorrect = checked && normalizedInput.length > 0 && normalizedInput === normalizedAnswer;

  const appendDigit = (digit: string) => {
    if (checked) return;
    setInput((prev) => (prev === "0" ? digit : `${prev}${digit}`));
  };

  const backspace = () => {
    if (checked) return;
    setInput((prev) => prev.slice(0, -1));
  };

  const clearInput = () => {
    if (checked) return;
    setInput("");
  };

  const toggleSign = () => {
    if (checked) return;
    setInput((prev) => {
      if (!prev) return "-";
      return prev.startsWith("-") ? prev.slice(1) : `-${prev}`;
    });
  };

  const onCheck = () => {
    if (!current) return;
    if (!checked && normalizedInput === normalizedAnswer) setCorrectCount((v) => v + 1);
    setChecked(true);
  };

  const onRevealAnswer = () => {
    if (!current) return;
    setRevealAnswer(true);
  };

  const onNext = () => {
    if (!current) return;
    if (!checked) onCheck();
    if (!isLast) {
      setIndex((v) => v + 1);
      setInput("");
      setChecked(false);
      setRevealAnswer(false);
    }
  };

  const onRestart = () => {
    onRegenerate();
  };

  useEffect(() => {
    setIndex(0);
    setInput("");
    setChecked(false);
    setRevealAnswer(false);
    setCorrectCount(0);
  }, [problems]);

  if (!current) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
        問題がありません。
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm text-slate-600">進行 {index + 1} / {problems.length}</div>
        <div className="ml-auto text-sm text-slate-600">正解 {correctCount}</div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-50 p-6">
        {current.kind === "vertical" ? (
          <pre className="whitespace-pre-wrap text-right text-2xl leading-10 font-[var(--sheet-font)]">
            {current.question}
          </pre>
        ) : (
          <div className="text-center text-3xl font-[var(--sheet-font)]">
            {current.question}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-700">こたえ</span>
          <input
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onNext();
            }}
            disabled={checked}
            placeholder="数字を入力"
          />
        </label>

        <button
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50"
          onClick={onCheck}
        >
          かいとうする
        </button>

        <button
          className="rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
          onClick={onNext}
        >
          {isLast ? "おわり" : "つぎへ"}
        </button>
      </div>

      {checked ? (
        <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {isCorrect ? "正解！" : "まちがい。"}
        </div>
      ) : null}

      <div className="mt-3">
        <button
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
          onClick={onRevealAnswer}
        >
          こたえ
        </button>
      </div>

      {revealAnswer ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          答え：{current.answer}
        </div>
      ) : null}

      <div className="mt-6 grid gap-2">
        <div className="grid grid-cols-3 gap-2">
          {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((d) => (
            <button
              key={d}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg font-semibold shadow-sm hover:bg-slate-50 disabled:opacity-40"
              onClick={() => appendDigit(d)}
              disabled={checked}
            >
              {d}
            </button>
          ))}
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50 disabled:opacity-40"
            onClick={toggleSign}
            disabled={checked}
          >
            ±
          </button>
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg font-semibold shadow-sm hover:bg-slate-50 disabled:opacity-40"
            onClick={() => appendDigit("0")}
            disabled={checked}
          >
            0
          </button>
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50 disabled:opacity-40"
            onClick={backspace}
            disabled={checked}
          >
            けす
          </button>
        </div>
        <button
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 disabled:opacity-40"
          onClick={clearInput}
          disabled={checked}
        >
          クリア
        </button>
      </div>

      {isLast && checked ? (
        <div className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="font-semibold">結果</div>
          <div>正解数：{correctCount} / {problems.length}</div>
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-100"
            onClick={onRestart}
          >
            もう一度（問題を作り直す）
          </button>
        </div>
      ) : null}
    </div>
  );
}
