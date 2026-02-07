import React, { useEffect, useMemo, useRef, useState } from "react";
import { generateProblems } from "../../domain/generator";
import type { Problem } from "../../domain/generator/types";
import type { Grade } from "../../domain/specs/types";
import { SceneFrame } from "./SceneFrame";
import registerGameBg from "../../assets/register-game-bg.png";
import arkSuccess from "../../assets/ark_success.png";
import {
  loadPracticeConfig,
  loadRegisterProgress,
  saveRegisterProgress,
  type PracticeConfig,
} from "./state";

type Props = {
  onGoRegister: () => void;
};

type RegisterSubject = "mitori" | "mul" | "div";

type ParsedMitoriLine = {
  sign: 1 | -1;
  value: number;
};

const RECEIPT_NAMES = [
  "りんご",
  "パン",
  "ジュース",
  "おかし",
  "ノート",
  "えんぴつ",
  "せっけん",
];
const MUL_NAMES = ["ガム", "あめ", "シール", "カード", "クッキー", "えんぴつ"];

function parseNumber(text: string): number {
  const cleaned = text.replace(/[^0-9-]/g, "");
  return Number(cleaned || "0");
}

function parseMitoriLines(problem: Problem): ParsedMitoriLine[] {
  return problem.question
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const sign: 1 | -1 = line.startsWith("-") ? -1 : 1;
      return { sign, value: Math.abs(parseNumber(line)) };
    });
}

function parseMul(problem: Problem): { price: number; count: number } {
  const [left, right] = problem.question.split("×").map((part) => part.trim());
  return {
    price: parseNumber(left ?? "0"),
    count: parseNumber(right ?? "0"),
  };
}

function parseDiv(problem: Problem): { total: number; people: number } {
  const [left, right] = problem.question.split("÷").map((part) => part.trim());
  return {
    total: parseNumber(left ?? "0"),
    people: parseNumber(right ?? "1"),
  };
}

function rewardFor(subject: RegisterSubject, grade: Grade): number {
  const base = subject === "mitori" ? 6 : 5;
  return base + Math.max(0, 11 - grade);
}

function toRegisterSubject(config: PracticeConfig): RegisterSubject {
  if (
    config.subject === "mul" ||
    config.subject === "div" ||
    config.subject === "mitori"
  ) {
    return config.subject;
  }
  return "mitori";
}

function subjectLabel(subject: RegisterSubject): string {
  if (subject === "mitori") return "見取り算";
  if (subject === "mul") return "掛け算";
  return "割り算";
}

export function RegisterGamePage({ onGoRegister }: Props) {
  const config = loadPracticeConfig();
  const registerSubject = toRegisterSubject(config);

  const [progress, setProgress] = useState(() => loadRegisterProgress());
  const [problems, setProblems] = useState<Problem[]>(() =>
    generateProblems(config.grade, registerSubject, config.examBody),
  );
  const [index, setIndex] = useState(0);
  const [bubbleStep, setBubbleStep] = useState(
    registerSubject === "mitori" ? 0 : 1,
  );
  const [answer, setAnswer] = useState("");
  const [quotient, setQuotient] = useState("");
  const [remainder, setRemainder] = useState("");
  const [isReadingPaused, setIsReadingPaused] = useState(false);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [clerkEcho, setClerkEcho] = useState<string | null>(null);
  const [dogReply, setDogReply] = useState<string | null>(null);
  const [showCorrectFlash, setShowCorrectFlash] = useState(false);
  const thankYouTimer = useRef<number | null>(null);
  const flashTimer = useRef<number | null>(null);
  const feedbackTimer = useRef<number | null>(null);
  const dogReplyTimer = useRef<number | null>(null);

  const current = problems[index];
  const mitoriLines = useMemo(
    () =>
      current && registerSubject === "mitori" ? parseMitoriLines(current) : [],
    [current, registerSubject],
  );
  const currentReward = rewardFor(registerSubject, config.grade);

  useEffect(() => {
    if (registerSubject !== "mitori") return;
    if (bubbleStep > mitoriLines.length) return;
    if (isReadingPaused) return;
    const timer = window.setTimeout(
      () => {
        setBubbleStep((prev) => prev + 1);
      },
      bubbleStep === 0 ? 3000 : 1000,
    );
    return () => window.clearTimeout(timer);
  }, [registerSubject, bubbleStep, mitoriLines.length, index, isReadingPaused]);

  const clearFeedbackTimers = () => {
    if (thankYouTimer.current) {
      window.clearTimeout(thankYouTimer.current);
      thankYouTimer.current = null;
    }
    if (flashTimer.current) {
      window.clearTimeout(flashTimer.current);
      flashTimer.current = null;
    }
    if (feedbackTimer.current) {
      window.clearTimeout(feedbackTimer.current);
      feedbackTimer.current = null;
    }
    if (dogReplyTimer.current) {
      window.clearTimeout(dogReplyTimer.current);
      dogReplyTimer.current = null;
    }
  };

  const resetInputs = () => {
    setBubbleStep(registerSubject === "mitori" ? 0 : 1);
    setIsReadingPaused(false);
    setAnswer("");
    setQuotient("");
    setRemainder("");
    clearFeedbackTimers();
    setStatus("idle");
    setClerkEcho(null);
    setDogReply(null);
    setShowCorrectFlash(false);
  };

  const resetRound = () => {
    setProblems(
      generateProblems(config.grade, registerSubject, config.examBody),
    );
    setIndex(0);
    resetInputs();
  };

  const updateCoins = (amount: number) => {
    setProgress((prev) => {
      const next = saveRegisterProgress({
        ...prev,
        coins: prev.coins + amount,
      });
      return next;
    });
  };

  const moveNext = () => {
    if (index >= problems.length - 1) {
      resetRound();
      return;
    }
    setIndex((prev) => prev + 1);
    resetInputs();
  };

  const onCorrect = () => {
    setStatus("correct");
    setDogReply("ありがとう！");
    updateCoins(currentReward);
    clearFeedbackTimers();
    thankYouTimer.current = window.setTimeout(() => {
      setClerkEcho(null);
      setDogReply(null);
      setShowCorrectFlash(true);
      flashTimer.current = window.setTimeout(() => {
        setShowCorrectFlash(false);
      }, 1600);
    }, 700);
  };

  const buildClerkEcho = () => {
    if (registerSubject === "div") {
      return `しょう ${quotient || "0"}、あまり ${remainder || "0"} ですね。`;
    }
    return `${answer || "0"} えんですね。`;
  };

  const onTellAmount = () => {
    if (!current) return;
    if (status === "correct") return;
    setShowCorrectFlash(false);
    setClerkEcho(buildClerkEcho());
    setDogReply(null);
    clearFeedbackTimers();

    const showWrongReply = () => {
      setStatus("wrong");
      setDogReply("ちがうよ");
      feedbackTimer.current = window.setTimeout(() => {
        setClerkEcho(null);
        setDogReply(null);
      }, 1200);
    };

    if (registerSubject === "div") {
      const expectedQ = parseNumber(current.answer);
      const expectedR = 0;
      const inputQ = parseNumber(quotient);
      const inputR = parseNumber(remainder);
      if (inputQ === expectedQ && inputR === expectedR) {
        dogReplyTimer.current = window.setTimeout(() => {
          onCorrect();
        }, 1000);
      } else {
        dogReplyTimer.current = window.setTimeout(() => {
          showWrongReply();
        }, 1000);
      }
      return;
    }

    const expected = parseNumber(current.answer);
    const input = parseNumber(answer);
    if (input === expected && answer.trim().length > 0) {
      dogReplyTimer.current = window.setTimeout(() => {
        onCorrect();
      }, 1000);
    } else {
      dogReplyTimer.current = window.setTimeout(() => {
        showWrongReply();
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      clearFeedbackTimers();
    };
  }, []);

  if (!current) {
    return (
      <SceneFrame
        title="そろばんレジゲーム"
        subtitle="問題を作成できませんでした"
        backgroundImage={registerGameBg}
        outsideTopLeft={
          <button
            className="w-fit rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
            onClick={onGoRegister}
          >
            ← ゲームモードTOP
          </button>
        }
      >
        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-center text-slate-700">
            設定を見直してください。
          </div>
        </div>
      </SceneFrame>
    );
  }

  const mul = registerSubject === "mul" ? parseMul(current) : null;
  const div = registerSubject === "div" ? parseDiv(current) : null;
  const receiptReady =
    registerSubject !== "mitori" || bubbleStep > mitoriLines.length;
  const isReadingItems =
    registerSubject === "mitori" && bubbleStep <= mitoriLines.length;
  const isFeedbackDialogue = Boolean(clerkEcho || dogReply);
  const isDialogMode = isReadingItems || isFeedbackDialogue;
  const currentLine = bubbleStep > 0 ? mitoriLines[bubbleStep - 1] : null;

  return (
    <SceneFrame
      title="そろばんレジゲーム"
      subtitle="練習モード設定で出題中"
      backgroundImage={registerGameBg}
      outsideTopLeft={
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <button
              className="w-fit rounded-xl border border-slate-200 bg-white/92 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
              onClick={onGoRegister}
            >
              ← ゲームモードTOP
            </button>
            {isReadingItems ? (
              <button
                className="w-fit rounded-xl border border-slate-200 bg-white/92 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
                onClick={() => setIsReadingPaused((prev) => !prev)}
              >
                {isReadingPaused ? "読み上げ再開" : "読み上げ一時停止"}
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/92 px-3 py-2 text-sm text-slate-600 shadow-sm">
            <span>
              問題 {index + 1} / {problems.length}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">
              {subjectLabel(registerSubject)}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">
              {config.grade}級
            </span>
            <button
              className="ml-auto rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold hover:bg-slate-50"
              onClick={onGoRegister}
            >
              条件を変える
            </button>
          </div>
        </div>
      }
    >
      <div className="grid h-full grid-rows-[1fr] gap-3">
        <div className="grid min-h-0 gap-3">
          <div
            className={`rounded-2xl ${isDialogMode ? "w-full bg-transparent p-0 shadow-none border-none" : "w-full lg:w-1/2 border border-slate-200 bg-white/92 p-4 shadow-sm"}`}
          >
            {isFeedbackDialogue ? (
              <div className="relative min-h-[360px]">
                {clerkEcho ? (
                  <div className="absolute left-[calc(50%-260px)] top-[85%] w-[min(440px,calc(100%-24px))] -translate-x-1/2 -translate-y-1/2">
                    <div className="relative rounded-[24px] border-2 border-slate-200 bg-white/95 px-5 py-4 text-slate-800 shadow-lg">
                      <div className="text-xs font-semibold text-slate-500">
                        店員さん
                      </div>
                      <div className="mt-1 text-xl font-black leading-relaxed">
                        {clerkEcho}
                      </div>
                      <div className="absolute -bottom-3 right-[96px] h-6 w-6 rotate-45 border-b-2 border-r-2 border-slate-200 bg-white/95" />
                    </div>
                  </div>
                ) : null}
                {dogReply ? (
                  <div className="absolute left-[calc(50%+100px)] top-6 w-[min(480px,calc(100%-24px))] -translate-x-1/2">
                    <div className="relative rounded-[24px] border-2 border-sky-200 bg-sky-100/95 px-5 py-4 text-sky-900 shadow-lg">
                      <div className="text-xs font-semibold text-sky-700">
                        おきゃくさん（しばいぬ）
                      </div>
                      <div className="mt-1 text-xl font-black leading-relaxed">
                        {dogReply}
                      </div>
                      <div className="absolute -bottom-3 right-[164px] h-6 w-6 rotate-45 border-b-2 border-r-2 border-sky-200 bg-sky-100/95" />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {registerSubject === "mitori" && !isFeedbackDialogue ? (
              <div className="grid gap-3">
                {isReadingItems ? (
                  <div className="relative min-h-[360px]">
                    <div className="absolute left-[calc(50%+100px)] top-6 w-[min(480px,calc(100%-24px))] -translate-x-1/2 rounded-[24px] border-2 border-slate-200 bg-white/95 px-5 py-4 text-slate-800 shadow-lg">
                      <div className="text-xs font-semibold text-slate-500">
                        おきゃくさん（しばいぬ）
                      </div>
                      <div className="mt-1 text-xl font-black leading-relaxed">
                        {bubbleStep === 0
                          ? "おかいけいおねがいします！"
                          : currentLine?.sign === -1
                            ? `${RECEIPT_NAMES[(bubbleStep - 1) % RECEIPT_NAMES.length]} クーポン ${currentLine?.value}円引き`
                            : `${RECEIPT_NAMES[(bubbleStep - 1) % RECEIPT_NAMES.length]} ${currentLine?.value}円`}
                      </div>
                      <div className="absolute -bottom-3 right-[164px] h-6 w-6 rotate-45 border-b-2 border-r-2 border-slate-200 bg-white/95" />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-sky-100/90 p-3 text-slate-800">
                    {bubbleStep <= mitoriLines.length ? (
                      <>
                        <div className="text-xs text-slate-600">
                          おきゃくさん（しばいぬ）
                        </div>
                        <div className="mt-1 text-lg font-bold">
                          {mitoriLines[bubbleStep - 1]?.sign === -1
                            ? `${RECEIPT_NAMES[(bubbleStep - 1) % RECEIPT_NAMES.length]} クーポン ${mitoriLines[bubbleStep - 1]?.value}円引き`
                            : `${RECEIPT_NAMES[(bubbleStep - 1) % RECEIPT_NAMES.length]} ${mitoriLines[bubbleStep - 1]?.value}円`}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xs text-slate-600">
                          おきゃくさん（しばいぬ）
                        </div>
                        <div className="mt-1 text-lg font-bold">
                          合計いくらですか
                        </div>
                      </>
                    )}
                  </div>
                )}

                {receiptReady && !isFeedbackDialogue ? (
                  <div className="grid gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-4">
                    <div className="text-sm font-bold text-slate-700">
                      レシート
                    </div>
                    {mitoriLines.map((line, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm font-[var(--sheet-font)]"
                      >
                        <span>
                          {line.sign === -1
                            ? `${RECEIPT_NAMES[i % RECEIPT_NAMES.length]} クーポン`
                            : RECEIPT_NAMES[i % RECEIPT_NAMES.length]}
                        </span>
                        <span>
                          {line.sign === -1 ? "-" : ""}
                          {line.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {registerSubject === "mul" && mul && !isFeedbackDialogue ? (
              <div className="grid gap-3">
                <div className="rounded-2xl bg-sky-100/90 p-3 text-slate-800">
                  <div className="text-xs text-slate-600">
                    おきゃくさん（しばいぬ）
                  </div>
                  <div className="mt-1 text-lg font-bold">
                    {MUL_NAMES[index % MUL_NAMES.length]} {mul.price}円 ×{" "}
                    {mul.count}こ
                  </div>
                </div>
              </div>
            ) : null}

            {registerSubject === "div" && div && !isFeedbackDialogue ? (
              <div className="grid gap-3">
                <div className="rounded-2xl bg-sky-100/90 p-3 text-slate-800">
                  <div className="text-xs text-slate-600">
                    おきゃくさん（しばいぬ）
                  </div>
                  <div className="mt-1 text-lg font-bold">
                    あめが {div.total}こ、{div.people}にんに分ける
                  </div>
                </div>
              </div>
            ) : null}

            {!isDialogMode ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {registerSubject === "div" ? (
                  <>
                    <label className="grid gap-1 text-sm">
                      <span className="text-slate-700">しょう</span>
                      <input
                        className="rounded-xl border border-slate-200 px-3 py-2"
                        value={quotient}
                        onChange={(e) => {
                          setQuotient(e.target.value);
                          clearFeedbackTimers();
                          setStatus("idle");
                          setClerkEcho(null);
                          setDogReply(null);
                          setShowCorrectFlash(false);
                        }}
                        placeholder="しょう"
                      />
                    </label>
                    <label className="grid gap-1 text-sm">
                      <span className="text-slate-700">あまり</span>
                      <input
                        className="rounded-xl border border-slate-200 px-3 py-2"
                        value={remainder}
                        onChange={(e) => {
                          setRemainder(e.target.value);
                          clearFeedbackTimers();
                          setStatus("idle");
                          setClerkEcho(null);
                          setDogReply(null);
                          setShowCorrectFlash(false);
                        }}
                        placeholder="あまり"
                      />
                    </label>
                  </>
                ) : (
                  <label className="grid gap-1 text-sm md:col-span-2">
                    <span className="text-white">ごうけい</span>
                    <input
                      className="rounded-xl border border-slate-200 px-3 py-2"
                      value={answer}
                      onChange={(e) => {
                        setAnswer(e.target.value);
                        clearFeedbackTimers();
                        setStatus("idle");
                        setClerkEcho(null);
                        setDogReply(null);
                        setShowCorrectFlash(false);
                      }}
                      placeholder="数字を入力"
                    />
                  </label>
                )}
              </div>
            ) : null}

            {!isDialogMode ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
                  onClick={onTellAmount}
                  disabled={!receiptReady}
                >
                  きんがくをつたえる
                </button>

                {status === "correct" ? (
                  <button
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-sm hover:bg-emerald-100"
                    onClick={moveNext}
                  >
                    {index >= problems.length - 1
                      ? "つぎのセットへ"
                      : "つぎの問題へ"}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

        </div>
      </div>
      {showCorrectFlash ? (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <div className="flash-good flex items-center gap-8">
            <img
              src={arkSuccess}
              alt="せいかい"
              className="h-56 w-56 rounded-full bg-white object-cover shadow-sm"
            />
            <span className="text-7xl font-black tracking-wide text-emerald-600 drop-shadow-sm font-[var(--pop-font)]">
              せいかい
            </span>
          </div>
        </div>
      ) : null}
    </SceneFrame>
  );
}
