import React, { useEffect, useMemo, useState } from "react";
import gachaBg from "@/assets/gacha.png";
import gachaSpin01 from "@/assets/gacha/gacha-spin-01.png";
import gachaSpin02 from "@/assets/gacha/gacha-spin-02.png";
import gachaSpin03 from "@/assets/gacha/gacha-spin-03.png";
import gachaSpin04 from "@/assets/gacha/gacha-spin-04.png";
import { KEIMARUKUN_CARDS, type CardItem } from "@/features/soroban/cardCatalog";
import { CoinValue } from "@/features/soroban/components/CoinValue";
import { LongPressPreviewImage } from "@/features/soroban/components/LongPressPreviewImage";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import { loadRegisterProgress, saveRegisterProgress } from "@/features/soroban/state";

const GACHA_COST = 300;
const GACHA_SPIN_FRAMES = [
  gachaSpin01,
  gachaSpin02,
  gachaSpin03,
  gachaSpin04,
] as const;
const GACHA_SPIN_FRAME_MS = 520;
const GACHA_CONFETTI = [
  { left: "8%", color: "bg-rose-400", delay: "0ms" },
  { left: "15%", color: "bg-amber-300", delay: "120ms" },
  { left: "23%", color: "bg-sky-300", delay: "40ms" },
  { left: "31%", color: "bg-emerald-300", delay: "210ms" },
  { left: "40%", color: "bg-fuchsia-400", delay: "90ms" },
  { left: "49%", color: "bg-orange-300", delay: "170ms" },
  { left: "58%", color: "bg-cyan-300", delay: "20ms" },
  { left: "67%", color: "bg-lime-300", delay: "250ms" },
  { left: "76%", color: "bg-pink-300", delay: "70ms" },
  { left: "85%", color: "bg-yellow-300", delay: "150ms" },
  { left: "92%", color: "bg-indigo-300", delay: "230ms" },
] as const;

type Props = {
  onGoRegister: () => void;
  onGoCards: () => void;
};

function drawCard(cards: CardItem[]): CardItem {
  const index = Math.floor(Math.random() * cards.length);
  return cards[Math.max(0, Math.min(cards.length - 1, index))];
}

export function GachaPage({ onGoRegister, onGoCards }: Props) {
  const [progress, setProgress] = useState(() => loadRegisterProgress());
  const [resultCard, setResultCard] = useState<CardItem | null>(null);
  const [queuedResultCard, setQueuedResultCard] = useState<CardItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinFrameIndex, setSpinFrameIndex] = useState(0);
  const [message, setMessage] = useState("けいまるくん かーど がちゃ");

  const ownedCardIds = useMemo(
    () => new Set(progress.purchasedItemIds),
    [progress.purchasedItemIds],
  );
  const missingCards = useMemo(
    () => KEIMARUKUN_CARDS.filter((card) => !ownedCardIds.has(card.id)),
    [ownedCardIds],
  );
  const ownedCount = KEIMARUKUN_CARDS.length - missingCards.length;
  const canDraw =
    !isSpinning && progress.coins >= GACHA_COST && missingCards.length > 0;
  const backgroundImage = isSpinning
    ? GACHA_SPIN_FRAMES[spinFrameIndex] ?? GACHA_SPIN_FRAMES[0]
    : gachaBg;

  useEffect(() => {
    if (!isSpinning) return undefined;
    const timers = GACHA_SPIN_FRAMES.map((_, index) =>
      window.setTimeout(() => {
        setSpinFrameIndex(index);
      }, index * GACHA_SPIN_FRAME_MS),
    );
    const finishTimer = window.setTimeout(() => {
      setIsSpinning(false);
      setResultCard(queuedResultCard);
      setQueuedResultCard(null);
      setMessage("あたらしい かーどを げっと");
    }, GACHA_SPIN_FRAMES.length * GACHA_SPIN_FRAME_MS + 120);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(finishTimer);
    };
  }, [isSpinning, queuedResultCard]);

  const onDraw = () => {
    if (isSpinning) return;
    const latestProgress = loadRegisterProgress();
    const latestOwnedIds = new Set(latestProgress.purchasedItemIds);
    const latestMissingCards = KEIMARUKUN_CARDS.filter(
      (card) => !latestOwnedIds.has(card.id),
    );
    if (latestMissingCards.length === 0) {
      setProgress(latestProgress);
      setResultCard(null);
      setMessage("ぜんぶ あつまったよ");
      return;
    }
    if (latestProgress.coins < GACHA_COST) {
      setProgress(latestProgress);
      setResultCard(null);
      setMessage("コインが たりないよ");
      return;
    }

    const nextCard = drawCard(latestMissingCards);
    const nextProgress = saveRegisterProgress({
      ...latestProgress,
      coins: latestProgress.coins - GACHA_COST,
      purchasedItemIds: [...latestProgress.purchasedItemIds, nextCard.id],
    });
    setProgress(nextProgress);
    setResultCard(null);
    setQueuedResultCard(nextCard);
    setSpinFrameIndex(0);
    setIsSpinning(true);
    setMessage("ガチャガチャ...");
  };

  return (
    <SceneFrame
      backgroundImage={backgroundImage}
      fullscreenBackground
      outsideTopLeft={
        <div className="flex flex-wrap items-center gap-2 px-2">
          <button
            className="rounded-xl bg-transparent px-4 py-3 text-base font-semibold text-white hover:bg-white/10"
            onClick={onGoRegister}
          >
            ← ゲームモードTOP
          </button>
          <button
            className="rounded-xl bg-transparent px-4 py-3 text-base font-semibold text-white hover:bg-white/10"
            onClick={onGoCards}
          >
            カードずかん
          </button>
        </div>
      }
    >
      <div
        className="relative h-full"
        style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}
      >
        <div className="absolute right-[4%] top-[3%] flex flex-wrap justify-end gap-2">
          <span className="rounded-full border-2 border-amber-300 bg-white/90 px-4 py-2 text-sm font-black text-amber-900 shadow-lg backdrop-blur-sm">
            てもち <CoinValue amount={progress.coins} amountClassName="font-black" unitClassName="font-black" />
          </span>
          <span className="rounded-full border-2 border-sky-200 bg-white/90 px-4 py-2 text-sm font-black text-sky-800 shadow-lg backdrop-blur-sm">
            かくとく {ownedCount} / {KEIMARUKUN_CARDS.length}
          </span>
        </div>

        {!isSpinning ? (
          <div className="absolute left-[27%] top-[74%] grid w-[min(18rem,32vw)] gap-2">
            <button
              className={`rounded-full border-4 px-5 py-4 text-xl font-black shadow-[0_10px_0_rgba(120,53,15,0.45)] transition active:translate-y-1 active:shadow-[0_6px_0_rgba(120,53,15,0.45)] ${
                canDraw
                  ? "border-orange-200 bg-gradient-to-b from-red-500 to-orange-600 text-white hover:from-red-600 hover:to-orange-700"
                  : "cursor-not-allowed border-slate-200 bg-slate-200 text-slate-500 shadow-[0_10px_0_rgba(71,85,105,0.25)]"
              }`}
              onClick={onDraw}
              disabled={!canDraw}
            >
              {missingCards.length === 0
                ? "コンプリート"
                : progress.coins < GACHA_COST
                  ? "コインがたりない"
                  : resultCard
                    ? "もういっかい"
                    : "まわす"}
            </button>
            <div className="rounded-full border-2 border-amber-200 bg-white/90 px-3 py-1.5 text-center text-sm font-black text-amber-900 shadow-lg backdrop-blur-sm">
              {message}
            </div>
          </div>
        ) : null}

        {resultCard ? (
          <div
            key={resultCard.id}
            className="gacha-result-pop absolute inset-0 z-30 grid place-items-center bg-slate-950/30 px-4 backdrop-blur-[1px]"
          >
            <div className="pointer-events-none absolute inset-x-[8%] top-[4%] h-[42%] overflow-hidden">
              {GACHA_CONFETTI.map((piece, index) => (
                <span
                  key={`${piece.left}-${index}`}
                  className={`gacha-confetti absolute top-0 h-3 w-3 rounded-sm ${piece.color}`}
                  style={{
                    left: piece.left,
                    ["--delay" as string]: piece.delay,
                  }}
                />
              ))}
            </div>
            <section className="relative grid w-[min(54rem,88vw)] gap-4 overflow-hidden rounded-[2rem] border-4 border-amber-200 bg-white/94 p-5 text-center shadow-[0_24px_80px_rgba(120,53,15,0.45)]">
              <div className="gacha-starburst pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70" />
              <div className="relative z-10 grid items-center gap-5 md:grid-cols-[18rem_1fr]">
                <div className="relative mx-auto grid place-items-center">
                  <div className="gacha-card-glow absolute h-80 w-64 rounded-[2rem]" />
                  <div className="gacha-card-float relative rounded-[1.35rem] bg-white p-2 shadow-[0_18px_38px_rgba(15,23,42,0.34)]">
                    <LongPressPreviewImage
                      src={resultCard.image}
                      alt={resultCard.name}
                      title={resultCard.name}
                      imageClassName="h-80 w-56 rounded-xl object-contain"
                      missingClassName="grid h-80 w-56 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-500"
                    />
                    <div className="gacha-card-shine pointer-events-none absolute inset-2 overflow-hidden rounded-xl">
                      <span className="absolute inset-y-[-20%] left-0 w-1/3 bg-white/65 blur-sm" />
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 text-left">
                  <div className="rounded-3xl border-2 border-amber-200 bg-amber-50/95 p-5 shadow-lg">
                    <div className="text-3xl font-black leading-tight text-amber-950">
                      {resultCard.name}
                    </div>
                    <div className="mt-3 rounded-2xl bg-white/90 px-4 py-3 text-lg font-black leading-relaxed text-rose-800">
                      {resultCard.description}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className={`rounded-2xl px-6 py-3 text-base font-black shadow-lg transition ${
                        canDraw
                          ? "bg-rose-600 text-white hover:bg-rose-700"
                          : "cursor-not-allowed bg-slate-200 text-slate-500"
                      }`}
                      onClick={onDraw}
                      disabled={!canDraw}
                    >
                      {missingCards.length === 0
                        ? "コンプリート"
                        : progress.coins < GACHA_COST
                          ? "コインがたりない"
                          : "もういっかい"}
                    </button>
                    <button
                      className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-base font-black text-slate-700 shadow-lg hover:bg-slate-50"
                      onClick={onGoCards}
                    >
                      カードずかんへ
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </SceneFrame>
  );
}
