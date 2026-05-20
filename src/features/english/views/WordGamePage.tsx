import { useEffect, useRef, useState } from "react";

import registerGameBg from "@/assets/register-game-bg.png";
import { WordTraceCanvas } from "@/features/english/components/WordTraceCanvas";
import { WORD_PRACTICE_ITEMS } from "@/features/english/domain/wordPracticeItems";
import type { TraceJudgeResult } from "@/features/english/domain/traceJudge";
import { CoinValue } from "@/features/soroban/components/CoinValue";
import { DogSpeechBubble } from "@/features/soroban/components/DogSpeechBubble";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import {
  loadEnglishWordPlayConfig,
  loadEnglishWordProgress,
  loadRegisterProgress,
  saveEnglishWordPlayConfig,
  saveEnglishWordProgress,
  saveRegisterProgress,
} from "@/features/soroban/state";

type Props = {
  onGoEnglishHome: () => void;
  onGoPractice: () => void;
};

type DogReply = {
  english: string;
  japanese: string;
};

const ROUND_QUESTION_COUNT = 3;
const CORRECT_REWARD = 3;
const CLEAR_REWARD = 10;

function orderSentence(word: string): string {
  return `I want ${word}.`;
}

function canUseSpeechSynthesis(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function speakEnglish(text: string) {
  if (!canUseSpeechSynthesis()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.toLowerCase());
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((candidate) => candidate.lang.toLowerCase() === "en-us") ?? voices.find((candidate) => candidate.lang.toLowerCase().startsWith("en"));
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "en-US";
  }
  utterance.rate = 0.68;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function pickRoundWords() {
  const shuffled = [...WORD_PRACTICE_ITEMS];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, Math.min(ROUND_QUESTION_COUNT, shuffled.length));
}

export function WordGamePage({ onGoEnglishHome, onGoPractice }: Props) {
  const [progress, setProgress] = useState(() => loadRegisterProgress());
  const [wordProgress, setWordProgress] = useState(() => loadEnglishWordProgress());
  const [playConfig] = useState(() => loadEnglishWordPlayConfig());
  const stage = Math.max(1, playConfig.stage);
  const [roundWords, setRoundWords] = useState(() => pickRoundWords());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<"reading" | "answer" | "feedback">("reading");
  const [judgeResult, setJudgeResult] = useState<TraceJudgeResult | null>(null);
  const [dogReply, setDogReply] = useState<DogReply | null>(null);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [animatedCoins, setAnimatedCoins] = useState<number>(progress.coins);
  const [isCoinAnimating, setIsCoinAnimating] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const coinAnimFrameRef = useRef<number | null>(null);
  const coinAnimDelayTimerRef = useRef<number | null>(null);
  const hasStartedCoinAnimRef = useRef(false);
  const currentWord = roundWords[currentIndex];
  const roundStartCoins = progress.coins - earnedCoins;

  useEffect(() => {
    saveEnglishWordPlayConfig({ stage });
  }, [stage]);

  useEffect(() => {
    setMode("reading");
    speakEnglish(orderSentence(currentWord.label));
    const timer = window.setTimeout(() => setMode("answer"), 2400);
    return () => window.clearTimeout(timer);
  }, [currentWord.id]);

  useEffect(() => {
    if (!isFinished) return;
    if (hasStartedCoinAnimRef.current) return;
    hasStartedCoinAnimRef.current = true;
    const from = roundStartCoins;
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
  }, [isFinished, progress.coins, roundStartCoins]);

  useEffect(() => {
    return () => {
      if (coinAnimFrameRef.current != null) {
        window.cancelAnimationFrame(coinAnimFrameRef.current);
      }
      if (coinAnimDelayTimerRef.current != null) {
        window.clearTimeout(coinAnimDelayTimerRef.current);
      }
    };
  }, []);

  const addCoins = (amount: number) => {
    const latest = loadRegisterProgress();
    const next = saveRegisterProgress({ coins: latest.coins + amount });
    setProgress(next);
    setEarnedCoins((prev) => prev + amount);
  };

  const handleSuccess = () => {
    addCoins(CORRECT_REWARD);
    const reply = { english: "Thank you!", japanese: "ありがとう！" };
    setDogReply(reply);
    speakEnglish(reply.english);
    setMode("feedback");
    window.setTimeout(() => {
      if (currentIndex >= roundWords.length - 1) {
        addCoins(CLEAR_REWARD);
        const nextWordProgress = saveEnglishWordProgress({
          unlockedStage: Math.max(wordProgress.unlockedStage, stage + 1),
          clearedStages: { ...wordProgress.clearedStages, [stage]: true },
        });
        setWordProgress(nextWordProgress);
        setIsFinished(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setJudgeResult(null);
        setDogReply(null);
        setResetCounter((prev) => prev + 1);
      }
    }, 1400);
  };

  const handleJudge = (result: TraceJudgeResult) => {
    setJudgeResult(result.results.length > 0 ? result : null);
    if (result.results.length > 0 && !result.allOk) {
      const reply = { english: "Messy!", japanese: "きたない" };
      setDogReply(reply);
      speakEnglish(reply.english);
      setMode("feedback");
      window.setTimeout(() => {
        setDogReply(null);
        setJudgeResult(null);
        setResetCounter((prev) => prev + 1);
        setMode("answer");
      }, 1400);
    }
  };

  const restart = () => {
    const nextRoundWords = pickRoundWords();
    setRoundWords(nextRoundWords);
    setCurrentIndex(0);
    setJudgeResult(null);
    setEarnedCoins(0);
    setIsFinished(false);
    setMode("reading");
    setDogReply(null);
    setIsCoinAnimating(false);
    hasStartedCoinAnimRef.current = false;
    if (coinAnimFrameRef.current != null) {
      window.cancelAnimationFrame(coinAnimFrameRef.current);
      coinAnimFrameRef.current = null;
    }
    if (coinAnimDelayTimerRef.current != null) {
      window.clearTimeout(coinAnimDelayTimerRef.current);
      coinAnimDelayTimerRef.current = null;
    }
    setResetCounter((prev) => prev + 1);
    const latestProgress = loadRegisterProgress();
    setProgress(latestProgress);
    setAnimatedCoins(latestProgress.coins);
    speakEnglish(orderSentence(nextRoundWords[0].label));
    window.setTimeout(() => setMode("answer"), 2400);
  };

  return (
    <SceneFrame backgroundImage={registerGameBg} fullscreenBackground outsideTopLeft={<button type="button" onClick={onGoEnglishHome} className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-2 text-sm font-black text-slate-700 shadow-sm">えいごトップへ</button>}>
      <div className="relative flex h-full flex-col gap-3 p-3 text-[#3b2f2f] sm:p-5">
        {mode === "answer" || isFinished ? <header className="relative z-20 flex items-center justify-between gap-3 rounded-3xl bg-white/90 px-4 py-3 shadow-lg">
          <div>
            <p className="text-sm font-black text-orange-600">えいごのおみせやさん ・ すてーじ {stage}</p>
            <h1 className="font-[var(--pop-font)] text-3xl font-black text-slate-800">ことばをかいて うろう！</h1>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-2 text-right shadow-inner">
            <p className="text-xs font-black text-amber-700">コイン</p>
            <CoinValue amount={progress.coins} amountClassName="text-2xl font-black" unitClassName="font-black" />
          </div>
        </header> : null}

        {isFinished ? (
          <section className="m-auto max-w-xl rounded-[32px] border-4 border-amber-200 bg-white/95 p-8 text-center shadow-2xl">
            <div className="text-7xl">🎉</div>
            <h2 className="mt-3 text-4xl font-black text-emerald-700">おみせやさん クリア！</h2>
            <div className="mx-auto mt-5 w-full max-w-sm rounded-2xl border border-amber-200 bg-white/95 p-4 text-left shadow-xl">
              <div className="text-xs font-bold tracking-wide text-amber-700">
                ほうしゅう
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-600">
                かいしまえのコイン: {roundStartCoins}
              </div>
              <div className="text-sm font-semibold text-emerald-700">
                かくとくしたコイン: +{progress.coins - roundStartCoins}
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
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={restart} className="rounded-2xl bg-orange-400 px-5 py-4 text-xl font-black text-white shadow-[0_6px_0_rgba(194,65,12,0.35)] active:translate-y-0.5">もういちど</button>
              <button type="button" onClick={onGoPractice} className="rounded-2xl bg-emerald-400 px-5 py-4 text-xl font-black text-white shadow-[0_6px_0_rgba(5,150,105,0.35)] active:translate-y-0.5">れんしゅうへ</button>
            </div>
          </section>
        ) : mode === "reading" || mode === "feedback" ? (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute left-[60%] top-[10%] w-[min(480px,calc(100%-24px))] -translate-x-1/2">
              {mode === "reading" ? (
                <DogSpeechBubble preserveLineBreaks text={<span><span className="font-[var(--pop-font)] text-4xl text-orange-600">{orderSentence(currentWord.label)}</span><br /><span className="text-2xl text-emerald-700">{currentWord.meaning} がほしいです</span></span>} />
              ) : (
                <DogSpeechBubble tone="reply" text={<span><span className="font-[var(--pop-font)] text-4xl text-orange-600">{dogReply?.english ?? "Thank you!"}</span><br /><span className="text-2xl text-emerald-700">{dogReply?.japanese ?? "ありがとう！"}</span></span>} />
              )}
            </div>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(300px,520px)_1fr]">
            <section className="flex min-h-0 flex-col gap-3 rounded-[28px] bg-white/92 p-3 shadow-xl">
              <div className="flex items-center justify-between rounded-2xl bg-orange-50 px-4 py-3">
                <div className="text-lg font-black text-orange-700">{currentIndex + 1} / {roundWords.length} もんめ</div>
                <div className="text-lg font-black text-emerald-700">このもんだい +{CORRECT_REWARD}</div>
              </div>
              <WordTraceCanvas guide={currentWord.units[0].guide} resetKey={`${currentWord.id}-${resetCounter}`} onJudge={handleJudge} onSuccess={handleSuccess} className="max-h-[min(62vh,520px)]" />
              <div className="text-center text-lg font-black text-slate-700">
                {judgeResult?.allOk ? "ありがとう！つぎへすすむよ" : judgeResult ? "点線にそって、もういちどためしてね" : "手本の上をじゅんばんになぞってね"}
              </div>
            </section>

            <aside className="flex min-h-0 flex-col gap-4">
              <div className="rounded-[28px] bg-white/92 p-5 text-center shadow-xl">
                <div className="text-sm font-black text-orange-600">おきゃくさんの注文</div>
                <div className="text-7xl" aria-hidden="true">{currentWord.emoji}</div>
                <div className="mt-2 font-[var(--pop-font)] text-6xl font-black text-slate-800">{currentWord.label}</div>
                <div className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-5xl font-black text-emerald-700">{currentWord.meaning}</div>
                <button type="button" onClick={() => speakEnglish(currentWord.label)} className="mt-5 rounded-full bg-[#ffb84d] px-8 py-4 text-xl font-black text-[#3b2f2f] shadow-[0_5px_0_#d78c28] transition active:translate-y-0.5 active:shadow-[0_2px_0_#d78c28]">よむ</button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </SceneFrame>
  );
}
