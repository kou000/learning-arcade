import React, { useEffect, useMemo, useRef, useState } from "react";
import { generateProblems, subjectMinutes } from "@/domain/generator";
import type { Problem } from "@/domain/generator/types";
import type { Grade } from "@/domain/specs/types";
import { getGradeSpec } from "@/domain/specs/kenteiSpec";
import { DogSpeechBubble } from "@/features/soroban/components/DogSpeechBubble";
import { CoinValue } from "@/features/soroban/components/CoinValue";
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
  const base = subject === "mitori" ? 4 : 2;
  const gradeBonus = Math.max(0, Math.ceil((9 - grade) / 2));
  return base + gradeBonus;
}

const STAGE_CLEAR_REWARD: Record<RegisterStage, number> = {
  1: 12,
  2: 20,
  3: 36,
  4: 56,
  5: 84,
  6: 120,
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
  const roundStartCoinsRef = useRef<number>(progress.coins);
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

  const [stageProblems] = useState<Problem[]>(() =>
    generateProblems(playGrade, playSubject, config.examBody).slice(
      0,
      questionCount,
    ),
  );
  const [problems, setProblems] = useState<Problem[]>(stageProblems);
  const [problemSourceIndexes, setProblemSourceIndexes] = useState<number[]>(
    () => stageProblems.map((_, problemIndex) => problemIndex),
  );
  const [index, setIndex] = useState(0);
  const [bubbleStep, setBubbleStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [quotient, setQuotient] = useState("");
  const [isReadingPaused, setIsReadingPaused] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState<number>(playConfig.readingSpeed);
  const [isRoundFinished, setIsRoundFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    timeLimitSeconds,
  );
  const [wrongQuestionsCount, setWrongQuestionsCount] = useState(0);
  const [mistakeIndexes, setMistakeIndexes] = useState<number[]>([]);
  const [skippedIndexes, setSkippedIndexes] = useState<number[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewSelection, setReviewSelection] = useState<number[]>([]);
  const [isReviewSelectorOpen, setIsReviewSelectorOpen] = useState(false);
  const [hasMistakeOnCurrentQuestion, setHasMistakeOnCurrentQuestion] =
    useState(false);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [clerkEcho, setClerkEcho] = useState<string | null>(null);
  const [dogReply, setDogReply] = useState<string | null>(null);
  const [showCorrectFlash, setShowCorrectFlash] = useState(false);
  const [animatedCoins, setAnimatedCoins] = useState<number>(progress.coins);
  const [isCoinAnimating, setIsCoinAnimating] = useState(false);
  const thankYouTimer = useRef<number | null>(null);
  const flashTimer = useRef<number | null>(null);
  const feedbackTimer = useRef<number | null>(null);
  const dogReplyTimer = useRef<number | null>(null);
  const autoNextTimer = useRef<number | null>(null);
  const coinAnimFrameRef = useRef<number | null>(null);
  const coinAnimDelayTimerRef = useRef<number | null>(null);
  const hasStartedCoinAnimRef = useRef(false);
  const rewardedReviewSourceIndexesRef = useRef<Set<number>>(new Set());
  const reviewTargetSourceIndexesRef = useRef<Set<number> | null>(null);
  const hasAwardedReviewClearBonusRef = useRef(false);

  const current = problems[index];
  const currentSourceIndex = problemSourceIndexes[index] ?? index;
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
      readingSpeed,
    });
  }, [playGrade, playSubject, playStage, readingSpeed]);

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
    const remainingIndexes = Array.from(
      { length: Math.max(0, problems.length - index) },
      (_, offset) => index + offset,
    );
    setSkippedIndexes((prev) => {
      if (remainingIndexes.length === 0) return prev;
      const merged = new Set(prev);
      for (const problemIndex of remainingIndexes) {
        merged.add(problemIndex);
      }
      return Array.from(merged).sort((a, b) => a - b);
    });
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
      setMistakeIndexes((prev) =>
        prev.includes(index) ? prev : [...prev, index],
      );
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
    if (isReviewMode) {
      if (!rewardedReviewSourceIndexesRef.current.has(currentSourceIndex)) {
        rewardedReviewSourceIndexesRef.current.add(currentSourceIndex);
        setProgress((prevProgress) =>
          saveRegisterProgress({
            ...prevProgress,
            coins: prevProgress.coins + currentReward,
          }),
        );
      }
      const isLastQuestion = index >= problems.length - 1;
      if (isLastQuestion) {
        const reviewTargets = reviewTargetSourceIndexesRef.current;
        const hasSolvedAllReviewTargets =
          reviewTargets != null &&
          reviewTargets.size > 0 &&
          Array.from(reviewTargets).every((sourceIndex) =>
            rewardedReviewSourceIndexesRef.current.has(sourceIndex),
          );
        const canGetReviewClearBonus =
          hasSolvedAllReviewTargets && !hasAwardedReviewClearBonusRef.current;
        const reviewClearBonus = Math.floor(stageClearReward(playStage) / 2);

        if (canGetReviewClearBonus && reviewClearBonus > 0) {
          hasAwardedReviewClearBonusRef.current = true;
          setProgress((prevProgress) =>
            saveRegisterProgress({
              ...prevProgress,
              coins: prevProgress.coins + reviewClearBonus,
            }),
          );
        }

        clearFeedbackTimers();
        setDogReply("ふくしゅうおつかれさま！");
        thankYouTimer.current = window.setTimeout(() => {
          setDogReply(
            canGetReviewClearBonus && reviewClearBonus > 0
              ? `ぜんぶ とけたね！ ごほうびで コインを すこし もらえたよ！
もういちど もんだいをえらべるよ！`
              : "ふくしゅうがおわったよ。\nもういちど もんだいをえらべるよ！",
          );
          setIsRoundFinished(true);
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
      return;
    }

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
            `おつかれさま！\n${stageSummary}\n${resultSummary}${unlockSummary}`,
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

  const onSkipQuestion = () => {
    if (!hasMistakeOnCurrentQuestion) return;
    if (isRoundFinished) return;
    clearFeedbackTimers();
    setSkippedIndexes((prev) =>
      prev.includes(index) ? prev : [...prev, index],
    );
    const isLastQuestion = index >= problems.length - 1;
    if (isLastQuestion) {
      const finalCorrectCount = Math.max(
        0,
        problems.length - wrongQuestionsCount,
      );
      setStatus("wrong");
      setDogReply(
        `おつかれさま！\n${registerStageLabel(playStage)} しっぱい…\nけっか ${finalCorrectCount}/${problems.length}もん せいかい\nまちがえたもんだいを ふくしゅうしよう！`,
      );
      setIsRoundFinished(true);
      return;
    }
    moveNext();
  };

  const openReviewSelector = () => {
    const defaults = Array.from(
      new Set([...mistakeIndexes, ...skippedIndexes]),
    ).sort((a, b) => a - b);
    setReviewSelection(defaults.length > 0 ? defaults : [0]);
    setIsReviewSelectorOpen(true);
  };

  const toggleReviewSelection = (problemIndex: number) => {
    setReviewSelection((prev) =>
      prev.includes(problemIndex)
        ? prev.filter((value) => value !== problemIndex)
        : [...prev, problemIndex].sort((a, b) => a - b),
    );
  };

  const startReview = () => {
    if (reviewSelection.length === 0) return;
    if (reviewTargetSourceIndexesRef.current == null) {
      reviewTargetSourceIndexesRef.current = new Set([
        ...mistakeIndexes,
        ...skippedIndexes,
      ]);
    }
    const reviewSourceIndexes = reviewSelection.filter(
      (selectedIndex) => stageProblems[selectedIndex] != null,
    );
    const reviewProblems = reviewSourceIndexes.map(
      (selectedIndex) => stageProblems[selectedIndex],
    );
    if (reviewProblems.length === 0) return;

    clearFeedbackTimers();
    setProblems(reviewProblems);
    setProblemSourceIndexes(reviewSourceIndexes);
    setIsReviewMode(true);
    setIsReviewSelectorOpen(false);
    roundStartCoinsRef.current = progress.coins;
    hasStartedCoinAnimRef.current = false;
    setAnimatedCoins(progress.coins);
    setIsCoinAnimating(false);
    setIndex(0);
    setWrongQuestionsCount(0);
    setMistakeIndexes([]);
    setSkippedIndexes([]);
    setSecondsLeft(null);
    resetInputs();
  };

  const buildClerkEcho = () => {
    if (playSubject === "div") {
      return `ひとり ${quotient || "0"}こで ふくろにわけますね。`;
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
      if (coinAnimDelayTimerRef.current != null) {
        window.clearTimeout(coinAnimDelayTimerRef.current);
        coinAnimDelayTimerRef.current = null;
      }
      if (coinAnimFrameRef.current != null) {
        window.cancelAnimationFrame(coinAnimFrameRef.current);
        coinAnimFrameRef.current = null;
      }
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
  const showCoinGainPanel = isRoundFinished && Boolean(dogReply);
  const reviewTargetSourceIndexes =
    reviewTargetSourceIndexesRef.current ??
    new Set([...mistakeIndexes, ...skippedIndexes]);
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

  useEffect(() => {
    if (!showCoinGainPanel) return;
    if (hasStartedCoinAnimRef.current) return;
    hasStartedCoinAnimRef.current = true;
    const from = roundStartCoinsRef.current;
    const to = progress.coins;
    setAnimatedCoins(from);
    setIsCoinAnimating(false);

    if (coinAnimDelayTimerRef.current != null) {
      window.clearTimeout(coinAnimDelayTimerRef.current);
      coinAnimDelayTimerRef.current = null;
    }
    coinAnimDelayTimerRef.current = window.setTimeout(() => {
      if (from === to) {
        setAnimatedCoins(to);
        setIsCoinAnimating(false);
        coinAnimDelayTimerRef.current = null;
        return;
      }
      const duration = 1400;
      const startedAt = performance.now();
      setIsCoinAnimating(true);

      const tick = (now: number) => {
        const elapsed = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        const next = Math.round(from + (to - from) * eased);
        setAnimatedCoins(next);
        if (elapsed < 1) {
          coinAnimFrameRef.current = window.requestAnimationFrame(tick);
          return;
        }
        setAnimatedCoins(to);
        setIsCoinAnimating(false);
        coinAnimFrameRef.current = null;
      };

      if (coinAnimFrameRef.current != null) {
        window.cancelAnimationFrame(coinAnimFrameRef.current);
        coinAnimFrameRef.current = null;
      }
      coinAnimFrameRef.current = window.requestAnimationFrame(tick);
      coinAnimDelayTimerRef.current = null;
    }, 1000);
  }, [showCoinGainPanel, progress.coins]);

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
            {isReviewMode ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 whitespace-nowrap text-amber-800">
                ふくしゅうモード
              </span>
            ) : null}
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
                {clerkEcho && !isRoundFinished ? (
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
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs text-slate-600">
                        おきゃくさん（しばいぬ）
                      </div>
                      <div className="rounded-full border border-sky-400/70 bg-white/90 px-3 py-1 text-xs font-bold tabular-nums text-sky-900 shadow-sm">
                        もんだい {index + 1}/{problems.length}
                      </div>
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
                <div className="grid gap-2">
                  <button
                    className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
                    onClick={onTellAmount}
                    disabled={!receiptReady || isRoundFinished}
                  >
                    {isDivMode ? "ひとりぶんをつたえる" : "きんがくをつたえる"}
                  </button>
                  {isAdminMode ? (
                    <button
                      className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={onTimeoutFail}
                      disabled={isRoundFinished}
                    >
                      じかんぎれにする
                    </button>
                  ) : null}
                </div>
                {isAdminMode ? (
                  <button
                    className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-100"
                    onClick={onAdminFillAnswer}
                  >
                    こたえをにゅうりょく
                  </button>
                ) : null}
                {hasMistakeOnCurrentQuestion ? (
                  <button
                    className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm hover:bg-amber-100"
                    onClick={onSkipQuestion}
                  >
                    このもんだいをスキップ
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {!isDialogMode ? (
            <div className="self-end rounded-2xl border-2 border-sky-300 bg-sky-100/95 p-4 shadow-[0_8px_20px_rgba(14,116,144,0.25)]">
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
                    className="rounded-xl border border-[#15212c] bg-gradient-to-b from-[#f8fbff] to-[#dce7f3] px-4 py-3 text-xl font-black text-[#172533] shadow-[0_2px_0_#8ba2ba,0_5px_10px_rgba(5,20,36,0.35)] transition active:translate-y-[1px] active:shadow-[0_1px_0_#8ba2ba,0_2px_6px_rgba(5,20,36,0.35)] hover:brightness-105"
                    onClick={() => appendDigit(d)}
                  >
                    {d}
                  </button>
                ))}
                <button
                  className="rounded-xl border border-[#15212c] bg-gradient-to-b from-[#f8fbff] to-[#dce7f3] px-4 py-3 text-base font-black text-[#172533] shadow-[0_2px_0_#8ba2ba,0_5px_10px_rgba(5,20,36,0.35)] transition active:translate-y-[1px] active:shadow-[0_1px_0_#8ba2ba,0_2px_6px_rgba(5,20,36,0.35)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={toggleSign}
                  disabled={isDivMode}
                >
                  ±
                </button>
                <button
                  className="rounded-xl border border-[#15212c] bg-gradient-to-b from-[#f8fbff] to-[#dce7f3] px-4 py-3 text-xl font-black text-[#172533] shadow-[0_2px_0_#8ba2ba,0_5px_10px_rgba(5,20,36,0.35)] transition active:translate-y-[1px] active:shadow-[0_1px_0_#8ba2ba,0_2px_6px_rgba(5,20,36,0.35)] hover:brightness-105"
                  onClick={() => appendDigit("0")}
                >
                  0
                </button>
                <button
                  className="rounded-xl border border-[#15212c] bg-gradient-to-b from-[#f8fbff] to-[#dce7f3] px-4 py-3 text-base font-black text-[#172533] shadow-[0_2px_0_#8ba2ba,0_5px_10px_rgba(5,20,36,0.35)] transition active:translate-y-[1px] active:shadow-[0_1px_0_#8ba2ba,0_2px_6px_rgba(5,20,36,0.35)] hover:brightness-105"
                  onClick={backspace}
                >
                  ←
                </button>
              </div>
              <button
                className="mt-2 w-full rounded-xl border border-[#15212c] bg-gradient-to-b from-[#f8fbff] to-[#dce7f3] px-4 py-3 text-base font-black text-[#172533] shadow-[0_2px_0_#8ba2ba,0_5px_10px_rgba(5,20,36,0.35)] transition active:translate-y-[1px] active:shadow-[0_1px_0_#8ba2ba,0_2px_6px_rgba(5,20,36,0.35)] hover:brightness-105"
                onClick={clearInput}
              >
                クリア
              </button>
              <button
                className="mt-2 w-full rounded-xl border border-[#3f1300] bg-gradient-to-b from-[#ff9a52] to-[#d64f16] px-4 py-4 text-lg font-black text-[#fff8ef] shadow-[0_3px_0_#7d2b07,0_8px_14px_rgba(70,18,0,0.45)] transition active:translate-y-[1px] active:shadow-[0_1px_0_#7d2b07,0_3px_8px_rgba(70,18,0,0.4)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={onTellAmount}
                disabled={!receiptReady || isRoundFinished}
              >
                {isDivMode ? "ひとりぶんをつたえる" : "かいとうする"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {showCorrectFlash ? (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 backdrop-blur-[1px]">
          <div className="flash-good flex items-center gap-8">
            <img
              src={arkSuccess}
              alt="せいかい"
              className="h-56 w-56 rounded-full bg-white object-cover shadow-sm"
            />
            <div className="rounded-2xl bg-white/92 px-6 py-4 shadow-[0_6px_18px_rgba(0,0,0,0.25)]">
              <span
                className="text-7xl font-extrabold tracking-wide text-amber-300 font-[var(--pop-font)]"
                style={{
                  textShadow:
                    "0 2px 0 rgba(25,45,35,0.45), 0 6px 10px rgba(0,0,0,0.25)",
                }}
              >
                せいかい
              </span>
            </div>
          </div>
        </div>
      ) : null}
      {isRoundFinished ? (
        <div className="fixed bottom-6 right-6 z-40 flex gap-2">
          {!isReviewMode ? (
            <button
              className="rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-100"
              onClick={openReviewSelector}
            >
              ふくしゅうする
            </button>
          ) : (
            <button
              className="rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-100"
              onClick={openReviewSelector}
            >
              もういちど えらぶ
            </button>
          )}
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
            onClick={onGoRegisterStage}
          >
            ステージせんたくへ
          </button>
        </div>
      ) : null}
      {showCoinGainPanel ? (
        <div className="pointer-events-none fixed left-6 top-24 z-40 w-[18.5rem] rounded-2xl border border-amber-200 bg-white/95 p-4 shadow-xl">
          <div className="text-xs font-bold tracking-wide text-amber-700">
            ほうしゅう
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-600">
            かいしまえのコイン: {roundStartCoinsRef.current}
          </div>
          <div className="text-sm font-semibold text-emerald-700">
            かくとくしたコイン: +{progress.coins - roundStartCoinsRef.current}
          </div>
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500">
              げんざいのコイン
            </div>
            <div className="text-right text-3xl font-black tabular-nums text-slate-800">
              <CoinValue
                amount={animatedCoins}
                amountClassName="font-black tabular-nums tracking-[0.05em] text-slate-800 [text-shadow:0_1px_0_rgba(255,255,255,0.7),0_3px_6px_rgba(0,0,0,0.18)]"
                unitClassName="font-black text-base text-slate-700 [text-shadow:0_1px_0_rgba(255,255,255,0.65)]"
                iconClassName="h-9 w-9 drop-shadow-[0_3px_6px_rgba(0,0,0,0.35)]"
              />
            </div>
          </div>
          {isCoinAnimating ? (
            <div className="mt-1 text-right text-[10px] font-bold text-amber-700">
              かさんちゅう...
            </div>
          ) : null}
        </div>
      ) : null}
      {isReviewSelectorOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="text-lg font-black text-slate-800">
              ふくしゅう もんだいをえらぶ
            </div>
            <div className="mt-1 text-sm text-slate-600">
              ときなおしたい もんだいを えらんでね。
            </div>
            <div className="mt-4 grid max-h-80 gap-2 overflow-y-auto pr-1">
              {stageProblems.map((problem, problemIndex) => (
                <label
                  key={`${problem.question}-${problemIndex}`}
                  className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={reviewSelection.includes(problemIndex)}
                    onChange={() => toggleReviewSelection(problemIndex)}
                    className="mt-1"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                      <span>{problemIndex + 1}もんめ</span>
                      {reviewTargetSourceIndexes.has(problemIndex) ? (
                        rewardedReviewSourceIndexesRef.current.has(
                          problemIndex,
                        ) ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                            ふくしゅうでせいかいできた
                          </span>
                        ) : (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                            まだせいかいしてない
                          </span>
                        )
                      ) : (
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-700">
                          せいかい
                        </span>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap break-words text-sm text-slate-800">
                      {problem.question}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                onClick={() => setIsReviewSelectorOpen(false)}
              >
                とじる
              </button>
              <button
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                onClick={startReview}
                disabled={reviewSelection.length === 0}
              >
                ふくしゅうスタート
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </SceneFrame>
  );
}
