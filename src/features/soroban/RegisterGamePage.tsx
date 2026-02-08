import React, { useEffect, useMemo, useRef, useState } from "react";
import { generateProblems } from "../../domain/generator";
import type { Problem } from "../../domain/generator/types";
import type { Grade } from "../../domain/specs/types";
import { SceneFrame } from "./SceneFrame";
import registerGameBg from "../../assets/register-game-bg.png";
import arkSuccess from "../../assets/ark_success.png";
import {
  advanceRegisterProgressOnClear,
  clampRegisterSelection,
  getRegisterUnlockedGrades,
  getRegisterUnlockedSubjects,
  loadPracticeConfig,
  loadRegisterProgress,
  saveRegisterProgress,
  type PracticeConfig, type RegisterSubject,
} from "./state";

type Props = {
  onGoRegister: () => void;
};

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
const REGISTER_PASS_RATE = 0.7;
const READING_SPEED_OPTIONS = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
  { label: "5x", value: 5 },
  { label: "10x", value: 10 },
] as const;

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

function peopleLabel(people: number): string {
  if (people === 1) return "ひとり";
  if (people === 2) return "ふたり";
  return `${people}にん`;
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

function isAdminModeFromEnv(): boolean {
  const raw = String(import.meta.env.VITE_REGISTER_ADMIN_MODE ?? "").toLowerCase();
  return raw === "1" || raw === "true" || raw === "on";
}

function subjectUnlockLabel(subject: RegisterSubject): string {
  if (subject === "mitori") return "みとりざん";
  if (subject === "mul") return "かけざん";
  return "わりざん";
}

function buildUnlockMessage(
  prev: ReturnType<typeof loadRegisterProgress>,
  next: ReturnType<typeof loadRegisterProgress>,
  playedGrade: Grade,
): string | null {
  const prevGrades = getRegisterUnlockedGrades(prev);
  const nextGrades = getRegisterUnlockedGrades(next);
  const newlyUnlockedGrade = nextGrades.find((grade) => !prevGrades.includes(grade));
  if (newlyUnlockedGrade != null) {
    return `${newlyUnlockedGrade}きゅうが かいほうされたよ！`;
  }

  const prevSubjects = getRegisterUnlockedSubjects(prev, playedGrade);
  const nextSubjects = getRegisterUnlockedSubjects(next, playedGrade);
  if (nextSubjects.length > prevSubjects.length) {
    const unlockedSubject = nextSubjects[nextSubjects.length - 1];
    return `${subjectUnlockLabel(unlockedSubject)}が かいほうされたよ！`;
  }
  return null;
}

export function RegisterGamePage({ onGoRegister }: Props) {
  const [isAdminMode] = useState(() => isAdminModeFromEnv());
  const [progress, setProgress] = useState(() => loadRegisterProgress());
  const config = loadPracticeConfig();
  const registerSubject = toRegisterSubject(config);
  const selection = clampRegisterSelection(progress, config.grade, registerSubject);
  const playGrade = selection.grade;
  const playSubject = selection.subject;

  const [problems, setProblems] = useState<Problem[]>(() =>
    generateProblems(playGrade, playSubject, config.examBody),
  );
  const [index, setIndex] = useState(0);
  const [bubbleStep, setBubbleStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [quotient, setQuotient] = useState("");
  const [wrongProblemIndexes, setWrongProblemIndexes] = useState<Set<number>>(new Set());
  const [isReadingPaused, setIsReadingPaused] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState<number>(1);
  const [isRoundFinished, setIsRoundFinished] = useState(false);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [clerkEcho, setClerkEcho] = useState<string | null>(null);
  const [dogReply, setDogReply] = useState<string | null>(null);
  const [showCorrectFlash, setShowCorrectFlash] = useState(false);
  const thankYouTimer = useRef<number | null>(null);
  const flashTimer = useRef<number | null>(null);
  const feedbackTimer = useRef<number | null>(null);
  const dogReplyTimer = useRef<number | null>(null);
  const autoNextTimer = useRef<number | null>(null);

  const current = problems[index];
  const mitoriLines = useMemo(
    () =>
      current && playSubject === "mitori" ? parseMitoriLines(current) : [],
    [current, playSubject],
  );
  const currentReward = rewardFor(playSubject, playGrade);

  useEffect(() => {
    if (isReadingPaused) return;

    const shouldAutoStep =
      playSubject === "mitori"
        ? bubbleStep <= mitoriLines.length
        : bubbleStep === 0;
    if (!shouldAutoStep) return;

    const timer = window.setTimeout(
      () => {
        setBubbleStep((prev) => prev + 1);
      },
      Math.max(150, Math.floor((bubbleStep === 0 ? 3000 : 1000) / readingSpeed)),
    );
    return () => window.clearTimeout(timer);
  }, [playSubject, bubbleStep, mitoriLines.length, isReadingPaused, readingSpeed]);

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
    if (autoNextTimer.current) {
      window.clearTimeout(autoNextTimer.current);
      autoNextTimer.current = null;
    }
  };

  const clearAnswerFeedback = () => {
    clearFeedbackTimers();
    setStatus("idle");
    setClerkEcho(null);
    setDogReply(null);
    setShowCorrectFlash(false);
    setIsRoundFinished(false);
  };

  const resetInputs = () => {
    setBubbleStep(0);
    setIsReadingPaused(false);
    setAnswer("");
    setQuotient("");
    clearFeedbackTimers();
    setStatus("idle");
    setClerkEcho(null);
    setDogReply(null);
    setShowCorrectFlash(false);
    setIsRoundFinished(false);
  };

  const resetRound = () => {
    setProblems(
      generateProblems(playGrade, playSubject, config.examBody),
    );
    setIndex(0);
    setWrongProblemIndexes(new Set());
    resetInputs();
  };

  const moveNext = () => {
    setIndex((prev) => prev + 1);
    resetInputs();
  };

  const onCorrect = () => {
    setStatus("correct");
    let unlockMessage: string | null = null;
    let passMessage: string | null = null;
    const isLastQuestion = index >= problems.length - 1;
    const passLine = Math.ceil(problems.length * REGISTER_PASS_RATE);
    const finalCorrectCount = problems.length - wrongProblemIndexes.size;
    const passed = finalCorrectCount >= passLine;
    setProgress((prevProgress) => {
      let next = saveRegisterProgress({
        ...prevProgress,
        coins: prevProgress.coins + currentReward,
      });
      if (isLastQuestion && passed) {
        const advanced = advanceRegisterProgressOnClear(next, playGrade, playSubject);
        unlockMessage = buildUnlockMessage(prevProgress, advanced, playGrade);
        next = saveRegisterProgress(advanced);
      }
      return next;
    });
    if (isLastQuestion && !passed) {
      passMessage = `せいとうりつ ${finalCorrectCount}/${problems.length}（ごうかく ${passLine} もん）で、かいほうは つぎのかいにちょうせんしてね。`;
    }

    if (isLastQuestion) {
      const resultSummary = `けっか ${finalCorrectCount}/${problems.length}もん せいかい`;
      const unlockSummary = unlockMessage ? `\n${unlockMessage}` : "";
      const passSummary = passMessage ? `\n${passMessage}` : (passed ? "\nごうかく！" : "");
      setClerkEcho(null);
      setDogReply(`おつかれさま！\n${resultSummary}${unlockSummary}${passSummary}`);
      setIsRoundFinished(true);
      return;
    }

    setDogReply("ありがとう！");
    clearFeedbackTimers();
    thankYouTimer.current = window.setTimeout(() => {
      setClerkEcho(null);
      setDogReply(null);
      setShowCorrectFlash(true);
      flashTimer.current = window.setTimeout(() => {
        setShowCorrectFlash(false);
      }, 1600);
      autoNextTimer.current = window.setTimeout(() => {
        moveNext();
      }, 1700);
    }, 700);
  };

  const buildClerkEcho = () => {
    if (playSubject === "div") {
      return `ふくろ ${quotient || "0"}こにわけますね。`;
    }
    return `${answer || "0"} えんですね。`;
  };

  const onTellAmount = () => {
    if (!current) return;
    if (status === "correct") return;
    if (isRoundFinished) return;
    setShowCorrectFlash(false);
    setClerkEcho(buildClerkEcho());
    setDogReply(null);
    clearFeedbackTimers();

    const showWrongReply = () => {
      setStatus("wrong");
      setWrongProblemIndexes((prev) => {
        if (prev.has(index)) return prev;
        const next = new Set(prev);
        next.add(index);
        return next;
      });
      setDogReply("ちがうよ");
      feedbackTimer.current = window.setTimeout(() => {
        setClerkEcho(null);
        setDogReply(null);
      }, 1200);
    };

    if (playSubject === "div") {
      const expectedQ = parseNumber(current.answer);
      const inputQ = parseNumber(quotient);
      if (inputQ === expectedQ) {
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

  const onAdminFillAnswer = () => {
    if (!current) return;
    clearAnswerFeedback();
    if (isDivMode) {
      setQuotient(current.answer);
    } else {
      setAnswer(current.answer);
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

  const mul = playSubject === "mul" ? parseMul(current) : null;
  const div = playSubject === "div" ? parseDiv(current) : null;
  const isDivMode = playSubject === "div";
  const receiptReady =
    playSubject === "mitori"
      ? bubbleStep > mitoriLines.length
      : bubbleStep > 0;
  const isReadingItems =
    playSubject === "mitori"
      ? bubbleStep <= mitoriLines.length
      : bubbleStep === 0;
  const isFeedbackDialogue = Boolean(clerkEcho || dogReply);
  const isDialogMode = isReadingItems || isFeedbackDialogue || isRoundFinished;
  const currentLine = bubbleStep > 0 ? mitoriLines[bubbleStep - 1] : null;
  const activeInput = isDivMode ? quotient : answer;

  const setActiveInput = (value: string) => {
    clearAnswerFeedback();
    if (isDivMode) {
      setQuotient(value);
    } else {
      setAnswer(value);
    }
  };

  const appendDigit = (digit: string) => {
    const next = activeInput === "0" ? digit : `${activeInput}${digit}`;
    setActiveInput(next);
  };

  const backspace = () => {
    setActiveInput(activeInput.slice(0, -1));
  };

  const clearInput = () => {
    setActiveInput("");
  };

  const toggleSign = () => {
    if (isDivMode) return;
    if (!activeInput) {
      setActiveInput("-");
      return;
    }
    setActiveInput(
      activeInput.startsWith("-") ? activeInput.slice(1) : `-${activeInput}`,
    );
  };
  const promptText = (() => {
    if (playSubject === "mitori") {
      if (bubbleStep === 0) return "おかいけいおねがいします！";
      if (currentLine) {
        return currentLine.sign === -1
          ? `${RECEIPT_NAMES[(bubbleStep - 1) % RECEIPT_NAMES.length]} クーポン ${currentLine.value}円引き`
          : `${RECEIPT_NAMES[(bubbleStep - 1) % RECEIPT_NAMES.length]} ${currentLine.value}円`;
      }
      return "合計いくらですか";
    }
    if (playSubject === "mul" && mul) {
      return `${MUL_NAMES[index % MUL_NAMES.length]} ${mul.price}円 を ${mul.count} こ ください！`;
    }
    if (playSubject === "div" && div) {
      return `あめを ${div.total} こ、${peopleLabel(div.people)}にわけたいです！`;
    }
    return "";
  })();

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
            <button
              className="w-fit rounded-xl border border-slate-200 bg-white/92 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
              onClick={() => setIsReadingPaused((prev) => !prev)}
            >
              {isReadingPaused ? "読み上げ再開" : "読み上げ一時停止"}
            </button>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/92 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              <span>よみあげ速度</span>
              <select
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                value={String(readingSpeed)}
                onChange={(e) => setReadingSpeed(Number(e.target.value))}
              >
                {READING_SPEED_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/92 px-3 py-2 text-sm text-slate-600 shadow-sm">
            <span>
              問題 {index + 1} / {problems.length}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">
              {subjectLabel(playSubject)}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">
              {playGrade}級
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
        <div
          className={`grid min-h-0 gap-3 ${isDialogMode ? "" : "lg:grid-cols-[1fr_320px]"}`}
        >
          <div
            className={`rounded-2xl ${isDialogMode ? "w-full bg-transparent p-0 shadow-none border-none" : "w-full border border-slate-200 bg-white/92 p-4 shadow-sm"}`}
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
                      <div className="mt-1 whitespace-pre-line text-xl font-black leading-relaxed">
                        {dogReply}
                      </div>
                      <div className="absolute -bottom-3 right-[164px] h-6 w-6 rotate-45 border-b-2 border-r-2 border-sky-200 bg-sky-100/95" />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {!isFeedbackDialogue ? (
              <div className="grid gap-3">
                {isReadingItems ? (
                  <div className="relative min-h-[360px]">
                    <div className="absolute left-[calc(50%+100px)] top-6 w-[min(480px,calc(100%-24px))] -translate-x-1/2 rounded-[24px] border-2 border-slate-200 bg-white/95 px-5 py-4 text-slate-800 shadow-lg">
                      <div className="text-xs font-semibold text-slate-500">
                        おきゃくさん（しばいぬ）
                      </div>
                      <div className="mt-1 text-xl font-black leading-relaxed">
                        {promptText}
                      </div>
                      <div className="absolute -bottom-3 right-[164px] h-6 w-6 rotate-45 border-b-2 border-r-2 border-slate-200 bg-white/95" />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-sky-100/90 p-3 text-slate-800">
                    <div className="text-xs text-slate-600">
                      おきゃくさん（しばいぬ）
                    </div>
                    <div className="mt-1 text-lg font-bold">{promptText}</div>
                  </div>
                )}

                {playSubject === "mitori" && receiptReady ? (
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

                {playSubject !== "mitori" && receiptReady ? (
                  <div className="grid gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-4">
                    <div className="text-sm font-bold text-slate-700">問題</div>
                    <div className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-[var(--sheet-font)] text-slate-900">
                      {current.question}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {!isDialogMode ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {playSubject === "div" ? (
                  <label className="grid gap-1 text-sm md:col-span-2">
                    <span className="text-slate-700">しょう</span>
                    <input
                      className="rounded-xl border border-slate-200 px-3 py-2"
                      value={quotient}
                      onChange={(e) => setActiveInput(e.target.value)}
                      placeholder="しょう"
                    />
                  </label>
                ) : (
                  <label className="grid gap-1 text-sm md:col-span-2">
                    <span className="text-white">ごうけい</span>
                    <input
                      className="rounded-xl border border-slate-200 px-3 py-2"
                      value={answer}
                      onChange={(e) => setActiveInput(e.target.value)}
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
                  disabled={!receiptReady || isRoundFinished}
                >
                  {isDivMode ? "ふくろのかずをつたえる" : "きんがくをつたえる"}
                </button>
                {isAdminMode ? (
                  <button
                    className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-100"
                    onClick={onAdminFillAnswer}
                  >
                    こたえをにゅうりょく
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {!isDialogMode ? (
            <div className="self-end rounded-2xl border border-slate-200 bg-white/92 p-4 shadow-sm">
              <div className="text-sm font-bold text-slate-700 text-white">
                レジ
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                  <button
                    key={d}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg font-semibold shadow-sm hover:bg-slate-50"
                    onClick={() => appendDigit(d)}
                  >
                    {d}
                  </button>
                ))}
                <button
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50 disabled:opacity-40"
                  onClick={toggleSign}
                  disabled={isDivMode}
                >
                  ±
                </button>
                <button
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg font-semibold shadow-sm hover:bg-slate-50"
                  onClick={() => appendDigit("0")}
                >
                  0
                </button>
                <button
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50"
                  onClick={backspace}
                >
                  ←
                </button>
              </div>
              <button
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50"
                onClick={clearInput}
              >
                クリア
              </button>
            </div>
          ) : null}
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
      {isRoundFinished ? (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
            onClick={onGoRegister}
          >
            ゲームモードTOPへ
          </button>
        </div>
      ) : null}
    </SceneFrame>
  );
}
