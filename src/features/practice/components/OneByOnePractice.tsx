import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import arkSuccess from "../../../assets/ark_success.png";
import arfBad from "../../../assets/arf_bad.png";
import arkHandsUp from "../../../assets/ark_hands_up.png";
import type { Problem } from "../../../domain/generator/types";

type Props = {
  problems: Problem[];
  onRegenerate: () => void;
};

export function OneByOnePractice({ problems, onRegenerate }: Props) {
  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);
  const autoNextTimer = useRef<number | null>(null);
  const flashTimer = useRef<number | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<Array<"correct" | "wrong" | null>>([]);

  const current = problems[index];
  const isLast = index >= problems.length - 1;

  const normalizedAnswer = useMemo(() => current?.answer?.replace(/\s+/g, "") ?? "", [current]);
  const input = answers[index] ?? "";
  const normalizedInput = useMemo(() => input.replace(/\s+/g, ""), [input]);
  const isCorrect = lastResult === "correct";
  const correctCount = useMemo(() => results.filter((r) => r === "correct").length, [results]);

  const appendDigit = (digit: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      const currentValue = next[index] ?? "";
      next[index] = currentValue === "0" ? digit : `${currentValue}${digit}`;
      return next;
    });
    setChecked(false);
  };

  const backspace = () => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = (next[index] ?? "").slice(0, -1);
      return next;
    });
    setChecked(false);
  };

  const clearInput = () => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
    setChecked(false);
  };

  const toggleSign = () => {
    setAnswers((prev) => {
      const next = [...prev];
      const currentValue = next[index] ?? "";
      if (!currentValue) {
        next[index] = "-";
      } else {
        next[index] = currentValue.startsWith("-") ? currentValue.slice(1) : `-${currentValue}`;
      }
      return next;
    });
    setChecked(false);
  };

  const onCheck = () => {
    if (!current) return;
    const isNowCorrect = normalizedInput === normalizedAnswer && normalizedInput.length > 0;
    const prevResult = results[index];
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    setLastResult(isNowCorrect ? "correct" : "wrong");
    setFlashVisible(true);
    flashTimer.current = window.setTimeout(() => {
      setFlashVisible(false);
    }, 2000);
    if (isNowCorrect && prevResult !== "correct") {
      if (autoNextTimer.current) window.clearTimeout(autoNextTimer.current);
      autoNextTimer.current = window.setTimeout(() => {
        onNext({ forceCheck: false, markWrong: false });
      }, 2000);
    }
    setResults((prev) => {
      const next = [...prev];
      next[index] = isNowCorrect ? "correct" : "wrong";
      return next;
    });
    setChecked(true);
  };

  const onRevealAnswer = () => {
    if (!current) return;
    setRevealAnswer(true);
  };

  const onNext = ({ forceCheck, markWrong }: { forceCheck: boolean; markWrong: boolean }) => {
    if (!current) return;
    if (autoNextTimer.current) {
      window.clearTimeout(autoNextTimer.current);
      autoNextTimer.current = null;
    }
    if (flashTimer.current) {
      window.clearTimeout(flashTimer.current);
      flashTimer.current = null;
      setFlashVisible(false);
    }
    if (forceCheck && !checked) onCheck();
    if (markWrong && results[index] == null) {
      setResults((prev) => {
        const next = [...prev];
        next[index] = "wrong";
        return next;
      });
      setLastResult("wrong");
    }
    if (!isLast) {
      setIndex((v) => v + 1);
      setChecked(false);
      setRevealAnswer(false);
      setLastResult(null);
    }
  };

  const onRestart = () => {
    onRegenerate();
  };

  useEffect(() => {
    setIndex(0);
    setChecked(false);
    setRevealAnswer(false);
    setAnswers(Array.from({ length: problems.length }, () => ""));
    setResults(Array.from({ length: problems.length }, () => null));
    setLastResult(null);
    if (autoNextTimer.current) window.clearTimeout(autoNextTimer.current);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    setFlashVisible(false);
  }, [problems]);

  useEffect(() => {
    return () => {
      if (autoNextTimer.current) window.clearTimeout(autoNextTimer.current);
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    };
  }, []);

  if (!current) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
        問題がありません。
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm text-slate-600">進行 {index + 1} / {problems.length}</div>
        <div className="ml-auto text-sm text-slate-600">正解 {correctCount}</div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {problems.map((_, i) => {
          const r = results[i];
          const isActive = i === index;
          const color =
            r === "correct"
              ? "border-emerald-400 bg-emerald-200 text-emerald-900"
              : r === "wrong"
                ? "border-rose-300 bg-rose-50 text-rose-700"
                : "border-slate-200 bg-white text-slate-600";
          return (
            <button
              key={i}
              className={`h-8 w-8 rounded-full border text-xs font-semibold ${color} ${isActive ? "ring-2 ring-sky-300" : ""}`}
              onClick={() => {
                setIndex(i);
                setChecked(false);
                setRevealAnswer(false);
                setLastResult(null);
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="relative mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-center">
        <div className={`md:w-1/2 md:mx-auto ${current.kind === "inline" ? "py-8" : ""}`}>
          {current.kind === "vertical" ? (
            <div className="border border-slate-800 bg-white">
              <div className="border-b border-slate-800 py-1 text-center text-xs">
                {index + 1}
              </div>
              <pre className="whitespace-pre-wrap px-4 py-2 text-right text-sm leading-6 font-[var(--sheet-font)]">
                {current.question}
              </pre>
              <div className="h-8 border-t border-slate-800" />
            </div>
          ) : (
            <div className="grid grid-cols-[42px_1fr] border border-slate-800 bg-white">
              <div className="flex items-center justify-center border-r border-slate-800 text-xs">
                {index + 1}
              </div>
              <div className="px-4 py-2 text-base font-[var(--sheet-font)]">
                {current.question} ＝
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center md:absolute md:right-0 md:bottom-0">
          <img
            src={arkHandsUp}
            alt="アーク"
            width={140}
            height={140}
            draggable={false}
            className="select-none drop-shadow"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-700">こたえ</span>
          <input
            className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
            value={input}
            onChange={(e) => {
              setAnswers((prev) => {
                const next = [...prev];
                next[index] = e.target.value;
                return next;
              });
              setChecked(false);
              setLastResult(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onNext({ forceCheck: true, markWrong: false });
            }}
            placeholder="数字を入力"
          />
        </label>

        <button
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50 md:mt-6"
          onClick={onCheck}
        >
          かいとうする
        </button>

        <button
          className="rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 md:mt-6"
          onClick={() => onNext({ forceCheck: false, markWrong: true })}
        >
          {isLast ? "おわり" : "わからない"}
        </button>
      </div>

      {flashVisible && typeof document !== "undefined"
        ? createPortal(
            <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
              <div className={`flex items-center gap-8 transition-all duration-300 ${flashVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"} ${isCorrect ? "flash-good" : "flash-bad"}`}>
                <img
                  src={isCorrect ? arkSuccess : arfBad}
                  alt={isCorrect ? "せいかい" : "ふせいかい"}
                  className="h-56 w-56 rounded-full bg-white object-cover shadow-sm"
                />
                <span className={`text-7xl font-black tracking-wide drop-shadow-sm font-[var(--pop-font)] ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                  {isCorrect ? "せいかい" : "ふせいかい"}
                </span>
              </div>
            </div>,
            document.body
          )
        : null}

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
            >
              {d}
            </button>
          ))}
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50 disabled:opacity-40"
            onClick={toggleSign}
          >
            ±
          </button>
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg font-semibold shadow-sm hover:bg-slate-50 disabled:opacity-40"
            onClick={() => appendDigit("0")}
          >
            0
          </button>
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50 disabled:opacity-40"
            onClick={backspace}
          >
            けす
          </button>
        </div>
        <button
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 disabled:opacity-40"
          onClick={clearInput}
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
