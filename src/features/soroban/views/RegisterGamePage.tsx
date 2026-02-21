import React, { useEffect, useMemo, useRef, useState } from "react";
import { generateProblems, subjectMinutes } from "@/domain/generator";
import type { Problem } from "@/domain/generator/types";
import type { Grade } from "@/domain/specs/types";
import { getGradeSpec } from "@/domain/specs/kenteiSpec";
import { DogSpeechBubble } from "@/features/soroban/components/DogSpeechBubble";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import registerGameBg from "@/assets/register-game-bg.png";
import arkSuccess from "@/assets/ark_success.png";
import {
  advanceRegisterProgressOnClear,
  canPlayStage,
  clampRegisterSelection,
  getClearedStage,
  getRegisterUnlockedGrades,
  getRegisterUnlockedSubjects,
  loadPracticeConfig,
  loadRegisterPlayConfig,
  markStageCleared,
  loadRegisterProgress,
  saveRegisterPlayConfig,
  saveRegisterProgress,
  type RegisterStage,
  type RegisterSubject,
} from "@/features/soroban/state";

type Props = {
  onGoRegister: () => void;
  onGoRegisterStage: () => void;
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
const READING_SPEED_OPTIONS = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
  { label: "5x", value: 5 },
  { label: "10x", value: 10 },
] as const;
const STAGE_ALPHA_SECONDS = 15;

const BASE_STAGE_QUESTION_COUNT: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 3,
  2: 3,
  3: 5,
  4: 7,
  5: 10,
};
const MITORI_STAGE_QUESTION_COUNT: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 2,
  2: 2,
  3: 3,
  4: 5,
  5: 7,
};

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
  const base = subject === "mitori" ? 3 : 1;
  const gradeBonus = Math.max(0, Math.ceil((9 - grade) / 2));
  return base + gradeBonus;
}

const STAGE_CLEAR_REWARD: Record<RegisterStage, number> = {
  1: 6,
  2: 10,
  3: 18,
  4: 28,
  5: 42,
  6: 60,
};

function stageClearReward(stage: RegisterStage): number {
  return STAGE_CLEAR_REWARD[stage];
}

function registerStageLabel(stage: RegisterStage): string {
  return `すてーじ ${stage}`;
}

function questionCountFromSpec(grade: Grade, subject: RegisterSubject): number {
  const spec = getGradeSpec("zenshugakuren", grade);
  if (!spec) return 1;
  if (subject === "mitori") return Math.max(1, spec.mitori.count);
  if (subject === "mul") return Math.max(1, spec.mul.count);
  return Math.max(1, spec.div.count);
}

function stageQuestionCount(
  grade: Grade,
  subject: RegisterSubject,
  stage: RegisterStage,
): number {
  if (stage !== 6) {
    if (subject === "mitori") return MITORI_STAGE_QUESTION_COUNT[stage];
    return BASE_STAGE_QUESTION_COUNT[stage];
  }
  return questionCountFromSpec(grade, subject);
}

function buildTimeLimitSeconds(
  grade: Grade,
  subject: RegisterSubject,
  stage: RegisterStage,
  questionCount: number,
): number | null {
  if (stage === 1) return null;
  const minutes = subjectMinutes(grade, subject, "zenshugakuren");
  const specCount = questionCountFromSpec(grade, subject);
  const perQ = Math.max(1, Math.ceil((minutes * 60) / specCount));
  if (stage === 2) return (perQ + STAGE_ALPHA_SECONDS) * questionCount;
  return perQ * questionCount;
}

function subjectLabel(subject: RegisterSubject): string {
  if (subject === "mitori") return "見取り算";
  if (subject === "mul") return "掛け算";
  return "割り算";
}

function isAdminModeFromEnv(): boolean {
  const raw = String(
    import.meta.env.VITE_REGISTER_ADMIN_MODE ?? "",
  ).toLowerCase();
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
  const newlyUnlockedGrade = nextGrades.find(
    (grade) => !prevGrades.includes(grade),
  );
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

export function RegisterGamePage({ onGoRegister, onGoRegisterStage }: Props) {
  const [isAdminMode] = useState(() => isAdminModeFromEnv());
  const [progress, setProgress] = useState(() => loadRegisterProgress());
  const config = loadPracticeConfig();
  const playConfig = loadRegisterPlayConfig();
  const registerSubject = playConfig.subject;
  const selection = clampRegisterSelection(
    progress,
    playConfig.grade,
    registerSubject,
  );
  const playStage: RegisterStage = canPlayStage(
    progress,
    selection.grade,
    selection.subject,
    playConfig.stage,
  )
    ? playConfig.stage
    : 1;
  const playGrade = selection.grade;
  const playSubject = selection.subject;
  const questionCount = stageQuestionCount(playGrade, playSubject, playStage);
  const timeLimitSeconds = buildTimeLimitSeconds(
    playGrade,
    playSubject,
    playStage,
    questionCount,
  );

  const [problems, setProblems] = useState<Problem[]>(() =>
    generateProblems(playGrade, playSubject, config.examBody).slice(
      0,
      questionCount,
    ),
  );
  const [index, setIndex] = useState(0);
  const [bubbleStep, setBubbleStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [quotient, setQuotient] = useState("");
  const [isReadingPaused, setIsReadingPaused] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState<number>(1);
  const [isRoundFinished, setIsRoundFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    timeLimitSeconds,
  );
  const [wrongQuestionsCount, setWrongQuestionsCount] = useState(0);
  const [hasMistakeOnCurrentQuestion, setHasMistakeOnCurrentQuestion] =
    useState(false);
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
  const isReadingDialogueForTimer =
    playSubject === "mitori"
      ? bubbleStep <= mitoriLines.length
      : bubbleStep === 0;
  const isFeedbackDialogueForTimer = Boolean(clerkEcho || dogReply);
  const shouldPauseCountdownForDialogue =
    isReadingDialogueForTimer || isFeedbackDialogueForTimer;

  useEffect(() => {
    saveRegisterPlayConfig({
      grade: playGrade,
      subject: playSubject,
      stage: playStage,
    });
  }, [playGrade, playSubject, playStage]);

  useEffect(() => {
    if (secondsLeft == null) return;
    if (secondsLeft <= 0) return;
    if (isRoundFinished) return;
    if (shouldPauseCountdownForDialogue) return;

    const timer = window.setTimeout(() => {
      setSecondsLeft((prev) => (prev == null ? null : Math.max(0, prev - 1)));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft, isRoundFinished, shouldPauseCountdownForDialogue]);

  useEffect(() => {
    if (secondsLeft == null) return;
    if (secondsLeft > 0) return;
    if (isRoundFinished) return;
    onTimeoutFail();
  }, [secondsLeft, isRoundFinished, index, wrongQuestionsCount]);

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
      Math.max(
        150,
        Math.floor((bubbleStep === 0 ? 3000 : 1000) / readingSpeed),
      ),
    );
    return () => window.clearTimeout(timer);
  }, [
    playSubject,
    bubbleStep,
    mitoriLines.length,
    isReadingPaused,
    readingSpeed,
  ]);

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
    setHasMistakeOnCurrentQuestion(false);
    clearFeedbackTimers();
    setStatus("idle");
    setClerkEcho(null);
    setDogReply(null);
    setShowCorrectFlash(false);
    setIsRoundFinished(false);
  };

  const moveNext = () => {
    setIndex((prev) => prev + 1);
    resetInputs();
  };

  const onTimeoutFail = () => {
    clearFeedbackTimers();
    setStatus("wrong");
    const correctCount = Math.max(0, index - wrongQuestionsCount);
    setDogReply(
      `じかんぎれ…\nけっか ${correctCount}/${problems.length}もん せいかい\nこのステージはしっぱい！`,
    );
    setIsRoundFinished(true);
  };

  const onWrongAnswer = () => {
    clearFeedbackTimers();
    if (!hasMistakeOnCurrentQuestion) {
      setHasMistakeOnCurrentQuestion(true);
      setWrongQuestionsCount((prev) => prev + 1);
    }
    setStatus("wrong");
    setDogReply("ちがうよ");
    setIsRoundFinished(false);
    feedbackTimer.current = window.setTimeout(() => {
      setStatus("idle");
      setClerkEcho(null);
      setDogReply(null);
    }, 900);
  };

  const onCorrect = () => {
    setStatus("correct");
    let unlockMessage: string | null = null;
    const stageName = registerStageLabel(playStage);
    const isLastQuestion = index >= problems.length - 1;
    const finalCorrectCount = Math.max(
      0,
      problems.length - wrongQuestionsCount,
    );
    const stagePassed = wrongQuestionsCount === 0;
    setProgress((prevProgress) => {
      let next = saveRegisterProgress({
        ...prevProgress,
        coins: prevProgress.coins + currentReward,
      });
      if (isLastQuestion && stagePassed) {
        next = saveRegisterProgress({
          ...next,
          coins: next.coins + stageClearReward(playStage),
        });
        const stageMarked = markStageCleared(
          next,
          playGrade,
          playSubject,
          playStage,
        );
        next = saveRegisterProgress(stageMarked);
        if (playStage === 3) {
          const advanced = advanceRegisterProgressOnClear(
            next,
            playGrade,
            playSubject,
          );
          unlockMessage = buildUnlockMessage(prevProgress, advanced, playGrade);
          next = saveRegisterProgress(advanced);
        }
      }
      return next;
    });

    if (isLastQuestion) {
      const resultSummary = `けっか ${finalCorrectCount}/${problems.length}もん せいかい`;
      const stageSummary = stagePassed
        ? `${stageName} くりあ！`
        : `${stageName} しっぱい…`;
      const clearReward = stagePassed ? stageClearReward(playStage) : 0;
      const totalReward = problems.length * currentReward + clearReward;
      const rewardSummary =
        clearReward > 0
          ? `ほうしゅう +${totalReward}コイン（せいかい ${problems.length} + くりあ ${clearReward}）`
          : `ほうしゅう +${totalReward}コイン`;
      const unlockSummary =
        stagePassed && unlockMessage ? `\n${unlockMessage}` : "";
      clearFeedbackTimers();
      setDogReply("ありがとう！");
      thankYouTimer.current = window.setTimeout(() => {
        setDogReply(null);
        setShowCorrectFlash(true);
        flashTimer.current = window.setTimeout(() => {
          setShowCorrectFlash(false);
        }, 1600);
        feedbackTimer.current = window.setTimeout(() => {
          setDogReply(
            `おつかれさま！\n${stageSummary}\n${resultSummary}\n${rewardSummary}${unlockSummary}`,
          );
          setIsRoundFinished(true);
        }, 1700);
      }, 700);
      return;
    }

    setDogReply("ありがとう！");
    clearFeedbackTimers();
    thankYouTimer.current = window.setTimeout(() => {
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
      onWrongAnswer();
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
        backgroundImage={registerGameBg}
        fullscreenBackground
        outsideTopLeft={
          <button
            className="w-fit rounded-xl bg-transparent px-4 py-3 text-base font-semibold text-white hover:bg-white/10"
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
    playSubject === "mitori" ? bubbleStep > mitoriLines.length : bubbleStep > 0;
  const isReadingItems =
    playSubject === "mitori"
      ? bubbleStep <= mitoriLines.length
      : bubbleStep === 0;
  const isFeedbackDialogue = Boolean(clerkEcho || dogReply);
  const isDialogMode = isReadingItems || isFeedbackDialogue || isRoundFinished;
  const currentLine = bubbleStep > 0 ? mitoriLines[bubbleStep - 1] : null;
  const activeInput = isDivMode ? quotient : answer;
  const registerDisplayValue = activeInput.length > 0 ? activeInput : "0";

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
      return "ごうけいいくらですか";
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
      backgroundImage={registerGameBg}
      fullscreenBackground
      outsideTopLeft={
        <div className="grid gap-2">
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto rounded-xl px-3 py-0.5 text-sm text-slate-800 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0">
            <button
              className="h-12 w-fit rounded-xl bg-transparent px-4 text-sm font-semibold text-white hover:bg-white/10"
              onClick={onGoRegister}
            >
              ← ゲームモードTOP
            </button>
            <button
              className="h-12 w-24 rounded-xl border border-white/60 bg-white/55 px-2 text-center text-sm font-semibold leading-tight text-slate-800 shadow-sm backdrop-blur-sm hover:bg-white/70"
              onClick={() => setIsReadingPaused((prev) => !prev)}
            >
              {isReadingPaused ? (
                <span className="inline-block whitespace-pre-line">
                  読み上げ 再開
                </span>
              ) : (
                <span className="inline-block whitespace-pre-line">
                  読み上げ 一時停止
                </span>
              )}
            </button>
            <label className="flex h-12 items-center gap-1.5 rounded-xl border border-white/60 bg-white/55 px-3 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-sm">
              <span>よみあげ速度</span>
              <select
                className="h-8 rounded-md border border-white/70 bg-white/75 px-2 text-sm leading-tight text-slate-800"
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
            <span className="whitespace-nowrap">
              問題 {index + 1} / {problems.length}
            </span>
            <span className="rounded-full bg-white/70 px-2 py-0.5 whitespace-nowrap">
              {subjectLabel(playSubject)}
            </span>
            <span className="rounded-full bg-white/70 px-2 py-0.5 whitespace-nowrap">
              {playGrade}級
            </span>
            <span className="rounded-full bg-white/70 px-2 py-0.5 whitespace-nowrap">
              {registerStageLabel(playStage)}
            </span>
            {secondsLeft != null ? (
              <span className="inline-flex h-7 w-[9rem] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white/70 px-2 py-0.5 text-center font-bold tabular-nums">
                のこり {secondsLeft}s
              </span>
            ) : (
              <span className="inline-flex h-7 w-[9rem] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-white/70 px-2 py-0.5 text-center">
                じかんせいげんなし
              </span>
            )}
            <button
              className="h-12 w-20 rounded-lg border border-white/60 bg-white/70 px-2 text-center text-sm font-semibold leading-tight text-slate-800 hover:bg-white/85"
              onClick={onGoRegisterStage}
            >
              <span className="inline-block whitespace-pre-line">
                ステージ せんたく
              </span>
            </button>
          </div>
        </div>
      }
    >
      <div
        className="grid h-full grid-rows-[1fr] gap-3 text-lg"
        style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}
      >
        <div
          className={`grid min-h-0 gap-3 ${isDialogMode ? "" : "lg:grid-cols-[1fr_320px]"}`}
        >
          <div
            className={`rounded-2xl ${isDialogMode ? "w-full bg-transparent p-0 shadow-none border-none" : "w-full border border-slate-200 bg-white/92 p-4 shadow-sm"}`}
          >
            {isFeedbackDialogue ? (
              <div className="relative min-h-[360px]">
                {clerkEcho ? (
                  <div className="absolute left-[25%] top-[86%] w-[min(440px,calc(100%-24px))] -translate-x-1/2 -translate-y-1/2">
                    <div className="relative rounded-[24px] border-2 border-slate-200 bg-white/95 px-5 py-4 text-slate-800 shadow-lg">
                      <div className="text-xs font-semibold text-slate-500">
                        てんいんさん
                      </div>
                      <div className="mt-1 text-xl font-black leading-relaxed">
                        {clerkEcho}
                      </div>
                      <div className="absolute -bottom-3 right-[96px] h-6 w-6 rotate-45 border-b-2 border-r-2 border-slate-200 bg-white/95" />
                    </div>
                  </div>
                ) : null}
                {dogReply ? (
                  <div className="absolute left-[60%] top-[17%] w-[min(480px,calc(100%-24px))] -translate-x-1/2">
                    <DogSpeechBubble
                      text={dogReply}
                      tone="reply"
                      preserveLineBreaks
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {!isFeedbackDialogue ? (
              <div className="grid gap-3">
                {isReadingItems ? (
                  <div className="relative min-h-[360px]">
                    <div className="absolute left-[60%] top-[17%] w-[min(480px,calc(100%-24px))] -translate-x-1/2">
                      <DogSpeechBubble text={promptText} />
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
              <div className="mt-2 rounded-2xl border-4 border-[#1b1f24] bg-[#2d391b] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-10px_20px_rgba(0,0,0,0.25)]">
                <div className="mb-1 text-[10px] font-bold tracking-[0.2em] text-[#d4e985]/80">
                  TOTAL
                </div>
                <div className="overflow-hidden text-right text-5xl font-black tabular-nums tracking-[0.08em] text-[#f5ffbd] drop-shadow-[0_0_8px_rgba(215,255,131,0.55)] sm:text-6xl">
                  {registerDisplayValue}
                </div>
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
            onClick={onGoRegisterStage}
          >
            ステージせんたくへ
          </button>
        </div>
      ) : null}
    </SceneFrame>
  );
}
