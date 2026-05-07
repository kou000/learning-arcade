import React, { useEffect, useMemo, useState } from "react";
import gachaBg from "@/assets/gacha.png";
import gachaSealBg from "@/assets/gacha-seal.png";
import gachaSpin01 from "@/assets/gacha/gacha-spin-01.png";
import gachaSpin02 from "@/assets/gacha/gacha-spin-02.png";
import gachaSpin03 from "@/assets/gacha/gacha-spin-03.png";
import gachaSpin04 from "@/assets/gacha/gacha-spin-04.png";
import {
  CARD_GACHA_DEFINITIONS,
  KEIMARUKUN_CARDS,
  getCardGachaDefinition,
  getCardsByGachaId,
  type CardGachaId,
  type CardItem,
} from "@/features/soroban/cardCatalog";
import { CoinValue } from "@/features/soroban/components/CoinValue";
import { LongPressPreviewImage } from "@/features/soroban/components/LongPressPreviewImage";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import {
  loadRegisterProgress,
  loadGachaLastOpenedOn,
  saveGachaLastOpenedOn,
  saveRegisterProgress,
} from "@/features/soroban/state";
import {
  STICKER_GACHA_DEFINITIONS,
  STICKERS,
  getStickerGachaDefinition,
  getStickersByGachaId,
  type StickerGachaId,
  type StickerItem,
} from "@/features/soroban/stickerCatalog";

const GACHA_COST = 200;
const STICKER_GACHA_COST = 50;
const STICKER_COPIES_PER_POOL = 3;
const GACHA_SPIN_FRAMES = [
  gachaSpin01,
  gachaSpin02,
  gachaSpin03,
  gachaSpin04,
] as const;
const GACHA_SPIN_FRAME_MS = 700;
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
  onGoStickers: () => void;
};

type GachaMode = "cards" | "stickers";

function formatLocalDateOnly(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

function hasNewItem(items: Array<{ addedOn: string }>, lastOpenedOn: string) {
  return items.some((item) => item.addedOn > lastOpenedOn);
}

function drawCard(cards: CardItem[]): CardItem {
  const index = Math.floor(Math.random() * cards.length);
  return cards[Math.max(0, Math.min(cards.length - 1, index))];
}

function drawSticker(
  stickers: StickerItem[],
  ownedStickerCounts: Record<string, number>,
): StickerItem {
  const completedPoolCount = countCompletedStickerPools(
    stickers,
    ownedStickerCounts,
  );
  const remainingPool = stickers.flatMap((sticker) => {
    const ownedInCurrentPool = Math.max(
      0,
      (ownedStickerCounts[sticker.id] ?? 0) -
        completedPoolCount * STICKER_COPIES_PER_POOL,
    );
    const remaining = Math.max(0, STICKER_COPIES_PER_POOL - ownedInCurrentPool);
    return Array.from({ length: remaining }, () => sticker);
  });

  const pool = remainingPool.length > 0 ? remainingPool : stickers;
  const index = Math.floor(Math.random() * pool.length);
  return pool[Math.max(0, Math.min(pool.length - 1, index))];
}

function countCompletedStickerPools(
  stickers: StickerItem[],
  ownedStickerCounts: Record<string, number>,
): number {
  const stickersPerPool = stickers.length * STICKER_COPIES_PER_POOL;
  if (stickersPerPool <= 0) return 0;
  const ownedInSeries = stickers.reduce(
    (sum, sticker) => sum + (ownedStickerCounts[sticker.id] ?? 0),
    0,
  );
  return Math.floor(ownedInSeries / stickersPerPool);
}

function countRemainingStickersInPool(
  stickers: StickerItem[],
  ownedStickerCounts: Record<string, number>,
): number {
  const completedPoolCount = countCompletedStickerPools(
    stickers,
    ownedStickerCounts,
  );
  return stickers.reduce((sum, sticker) => {
    const ownedInCurrentPool = Math.max(
      0,
      (ownedStickerCounts[sticker.id] ?? 0) -
        completedPoolCount * STICKER_COPIES_PER_POOL,
    );
    return sum + Math.max(0, STICKER_COPIES_PER_POOL - ownedInCurrentPool);
  }, 0);
}


export function GachaPage({ onGoRegister, onGoCards, onGoStickers }: Props) {
  const [progress, setProgress] = useState(() => loadRegisterProgress());
  const [gachaLastOpenedOn] = useState(() => loadGachaLastOpenedOn());
  const [gachaMode, setGachaMode] = useState<GachaMode>("cards");
  const [selectedGachaId, setSelectedGachaId] =
    useState<CardGachaId>("classic");
  const [selectedStickerGachaId, setSelectedStickerGachaId] =
    useState<StickerGachaId>("sticker-set-1");
  const [resultCard, setResultCard] = useState<CardItem | null>(null);
  const [resultSticker, setResultSticker] = useState<StickerItem | null>(null);
  const [queuedResultCard, setQueuedResultCard] = useState<CardItem | null>(
    null,
  );
  const [queuedResultSticker, setQueuedResultSticker] =
    useState<StickerItem | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinFrameIndex, setSpinFrameIndex] = useState(0);
  const [message, setMessage] = useState("けいまるくん かーど がちゃ");

  const ownedCardIds = useMemo(
    () => new Set(progress.purchasedItemIds),
    [progress.purchasedItemIds],
  );
  const selectedGacha = getCardGachaDefinition(selectedGachaId);
  const selectedStickerGacha =
    getStickerGachaDefinition(selectedStickerGachaId);
  const selectedCards = useMemo(
    () => getCardsByGachaId(selectedGachaId),
    [selectedGachaId],
  );
  const selectedStickers = useMemo(
    () => getStickersByGachaId(selectedStickerGachaId),
    [selectedStickerGachaId],
  );
  const selectedStickerRemainingCount = useMemo(
    () =>
      countRemainingStickersInPool(
        selectedStickers,
        progress.ownedStickerCounts,
      ),
    [progress.ownedStickerCounts, selectedStickers],
  );
  const missingCards = useMemo(
    () => selectedCards.filter((card) => !ownedCardIds.has(card.id)),
    [ownedCardIds, selectedCards],
  );
  const ownedCount = KEIMARUKUN_CARDS.filter((card) =>
    ownedCardIds.has(card.id),
  ).length;
  const ownedStickerKindCount = STICKERS.filter(
    (sticker) => (progress.ownedStickerCounts[sticker.id] ?? 0) > 0,
  ).length;
  const ownedStickerTotalCount = Object.values(
    progress.ownedStickerCounts,
  ).reduce((sum, count) => sum + count, 0);
  const selectedOwnedCount = selectedCards.length - missingCards.length;
  const currentCost = gachaMode === "cards" ? GACHA_COST : STICKER_GACHA_COST;
  const canDraw =
    !isSpinning &&
    progress.coins >= currentCost &&
    (gachaMode === "stickers" || missingCards.length > 0);
  const previousSpinFrameImage =
    GACHA_SPIN_FRAMES[Math.max(0, spinFrameIndex - 1)] ??
    GACHA_SPIN_FRAMES[0];
  const spinFrameImage =
    GACHA_SPIN_FRAMES[spinFrameIndex] ?? GACHA_SPIN_FRAMES[0];

  useEffect(() => {
    saveGachaLastOpenedOn(formatLocalDateOnly(new Date()));
  }, []);

  useEffect(() => {
    if (!isSpinning) return undefined;
    const timers = GACHA_SPIN_FRAMES.map((_, index) =>
      window.setTimeout(() => {
        setSpinFrameIndex(index);
      }, index * GACHA_SPIN_FRAME_MS),
    );
    const finishTimer = window.setTimeout(
      () => {
        setIsSpinning(false);
        setResultCard(queuedResultCard);
        setResultSticker(queuedResultSticker);
        setQueuedResultCard(null);
        setQueuedResultSticker(null);
        setMessage(
          queuedResultSticker ? "シールを げっと" : "あたらしい かーどを げっと",
        );
      },
      GACHA_SPIN_FRAMES.length * GACHA_SPIN_FRAME_MS + 120,
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(finishTimer);
    };
  }, [isSpinning, queuedResultCard, queuedResultSticker]);

  const onDraw = () => {
    if (isSpinning) return;
    const latestProgress = loadRegisterProgress();
    if (gachaMode === "stickers") {
      if (latestProgress.coins < STICKER_GACHA_COST) {
        setProgress(latestProgress);
        setResultCard(null);
        setResultSticker(null);
        setMessage("コインが たりないよ");
        return;
      }

      const latestSelectedStickers = getStickersByGachaId(
        selectedStickerGachaId,
      );
      const nextSticker = drawSticker(
        latestSelectedStickers,
        latestProgress.ownedStickerCounts,
      );
      const nextProgress = saveRegisterProgress({
        ...latestProgress,
        coins: latestProgress.coins - STICKER_GACHA_COST,
        ownedStickerCounts: {
          ...latestProgress.ownedStickerCounts,
          [nextSticker.id]:
            (latestProgress.ownedStickerCounts[nextSticker.id] ?? 0) + 1,
        },
      });
      setProgress(nextProgress);
      setResultCard(null);
      setResultSticker(null);
      setQueuedResultCard(null);
      setQueuedResultSticker(nextSticker);
      setSpinFrameIndex(0);
      setIsSpinning(true);
      setMessage("ガチャガチャ...");
      return;
    }

    const latestOwnedIds = new Set(latestProgress.purchasedItemIds);
    const latestSelectedCards = getCardsByGachaId(selectedGachaId);
    const latestMissingCards = latestSelectedCards.filter(
      (card) => !latestOwnedIds.has(card.id),
    );
    if (latestMissingCards.length === 0) {
      setProgress(latestProgress);
      setResultCard(null);
      setResultSticker(null);
      setMessage("ぜんぶ あつまったよ");
      return;
    }
    if (latestProgress.coins < GACHA_COST) {
      setProgress(latestProgress);
      setResultCard(null);
      setResultSticker(null);
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
    setResultSticker(null);
    setQueuedResultCard(nextCard);
    setQueuedResultSticker(null);
    setSpinFrameIndex(0);
    setIsSpinning(true);
    setMessage("ガチャガチャ...");
  };

  const onSelectMode = (mode: GachaMode) => {
    if (isSpinning) return;
    setGachaMode(mode);
    setResultCard(null);
    setResultSticker(null);
    setQueuedResultCard(null);
    setQueuedResultSticker(null);
    setMessage(
      mode === "cards" ? "けいまるくん かーど がちゃ" : "シール がちゃ",
    );
  };

  const onSelectGacha = (gachaId: CardGachaId) => {
    if (isSpinning) return;
    setSelectedGachaId(gachaId);
    setResultCard(null);
    setResultSticker(null);
    setQueuedResultCard(null);
    setQueuedResultSticker(null);
    setMessage("けいまるくん かーど がちゃ");
  };

  const onSelectStickerGacha = (gachaId: StickerGachaId) => {
    if (isSpinning) return;
    setSelectedStickerGachaId(gachaId);
    setResultCard(null);
    setResultSticker(null);
    setQueuedResultCard(null);
    setQueuedResultSticker(null);
    setMessage("シール がちゃ");
  };

  const onCloseResult = () => {
    setResultCard(null);
    setResultSticker(null);
    setMessage(
      gachaMode === "cards" ? "けいまるくん かーど がちゃ" : "シール がちゃ",
    );
  };

  return (
    <SceneFrame
      backgroundImage={gachaMode === "stickers" ? gachaSealBg : gachaBg}
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
          <button
            className="rounded-xl bg-transparent px-4 py-3 text-base font-semibold text-white hover:bg-white/10"
            onClick={onGoStickers}
          >
            シールちょう
          </button>
        </div>
      }
    >
      <div
        className="relative h-full"
        style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}
      >
        {isSpinning ? (
          <div className="pointer-events-none absolute inset-0">
            <img
              src={previousSpinFrameImage}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
            {spinFrameIndex > 0 ? (
              <img
                key={spinFrameIndex}
                src={spinFrameImage}
                alt=""
                aria-hidden
                className="gacha-spin-frame absolute inset-0 h-full w-full object-cover object-top"
              />
            ) : null}
          </div>
        ) : null}

        <div className="absolute right-[4%] top-[3%] flex flex-wrap justify-end gap-2">
          <span className="rounded-full border-2 border-amber-300 bg-white/90 px-4 py-2 text-sm font-black text-amber-900 shadow-lg backdrop-blur-sm">
            てもち{" "}
            <CoinValue
              amount={progress.coins}
              amountClassName="font-black"
              unitClassName="font-black"
            />
          </span>
          <span className="rounded-full border-2 border-sky-200 bg-white/90 px-4 py-2 text-sm font-black text-sky-800 shadow-lg backdrop-blur-sm">
            {gachaMode === "cards"
              ? `かくとく ${ownedCount} / ${KEIMARUKUN_CARDS.length}`
              : `シール ${ownedStickerKindCount} / ${STICKERS.length} (${ownedStickerTotalCount}まい)`}
          </span>
        </div>

        {!isSpinning ? (
          <div className="absolute left-[20%] top-[14%] z-10 flex w-[min(20rem,32vw)] gap-2 rounded-full border-2 border-amber-200 bg-white/90 p-1 shadow-lg">
            <button
              className={`flex-1 rounded-full px-3 py-2 text-sm font-black ${
                gachaMode === "cards"
                  ? "bg-rose-600 text-white"
                  : "text-amber-900 hover:bg-amber-50"
              }`}
              onClick={() => onSelectMode("cards")}
            >
              カード
              {hasNewItem(KEIMARUKUN_CARDS, gachaLastOpenedOn) ? (
                <span className="ml-1 rounded-full bg-amber-300 px-1.5 py-0.5 text-[10px] font-black text-rose-800">
                  NEW
                </span>
              ) : null}
            </button>
            <button
              className={`flex-1 rounded-full px-3 py-2 text-sm font-black ${
                gachaMode === "stickers"
                  ? "bg-rose-600 text-white"
                  : "text-amber-900 hover:bg-amber-50"
              }`}
              onClick={() => onSelectMode("stickers")}
            >
              シール
              {hasNewItem(STICKERS, gachaLastOpenedOn) ? (
                <span className="ml-1 rounded-full bg-amber-300 px-1.5 py-0.5 text-[10px] font-black text-rose-800">
                  NEW
                </span>
              ) : null}
            </button>
          </div>
        ) : null}

        {!isSpinning ? (
          <div className="absolute left-[54%] top-[15%] z-10 grid w-[27%] place-items-center rounded-[1.75rem] border-4 border-yellow-300 bg-white/95 px-5 py-4 text-center text-amber-950 shadow-[0_8px_0_rgba(120,53,15,0.3),0_14px_28px_rgba(120,53,15,0.28)]">
            <div className="rounded-full bg-rose-600 px-4 py-1 text-xl font-black leading-none text-white shadow-sm">
              1かい
            </div>
            <div className="mt-2 flex items-end justify-center gap-2 text-7xl font-black leading-none text-rose-700 drop-shadow-[0_2px_0_rgba(255,255,255,0.95)]">
              <span>{currentCost}</span>
              <span className="pb-2 text-3xl text-amber-950">こいん</span>
            </div>
          </div>
        ) : null}

        {!isSpinning ? (
          <div className="absolute left-[57%] top-[46.5%] z-10 w-[38%]">
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/95 px-3 py-2 text-center text-sm font-black text-amber-950 shadow-md">
              {gachaMode === "cards"
                ? `${selectedGacha.name} ・ ${selectedOwnedCount}/${selectedCards.length}`
                : `${selectedStickerGacha.name} ・ あと${selectedStickerRemainingCount}まい`}
            </div>
          </div>
        ) : null}

        {!isSpinning && !resultCard && !resultSticker ? (
          <div
            className={`absolute left-[55%] z-10 w-[42%] ${
              gachaMode === "cards" ? "top-[50%]" : "top-[52%]"
            }`}
          >
            {gachaMode === "cards" ? (
              <div className="grid grid-cols-5 gap-1 px-1">
                {selectedCards.slice(0, 5).map((card) => {
                  const owned = ownedCardIds.has(card.id);
                  return (
                    <div key={card.id} className="grid place-items-center">
                      <LongPressPreviewImage
                        src={card.image}
                        alt={card.name}
                        title={card.name}
                        imageClassName={`h-[clamp(8.25rem,15.5vw,12rem)] w-full rounded-lg object-contain drop-shadow-[0_10px_12px_rgba(120,53,15,0.35)] ${
                          owned ? "" : "opacity-95"
                        }`}
                        missingClassName="grid h-[clamp(8.25rem,15.5vw,12rem)] w-full place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-500"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-1 px-1">
                {selectedStickers.slice(0, 5).map((sticker) => {
                  const stickerCount =
                    progress.ownedStickerCounts[sticker.id] ?? 0;
                  return (
                    <div key={sticker.id} className="grid place-items-center">
                      <LongPressPreviewImage
                        src={sticker.image}
                        alt={sticker.name}
                        title={sticker.name}
                        imageClassName="h-[clamp(5.25rem,8.5vw,7rem)] w-[clamp(5.25rem,8.5vw,7rem)] rounded-full object-contain drop-shadow-[0_10px_12px_rgba(120,53,15,0.35)]"
                        missingClassName="grid h-[clamp(5.25rem,8.5vw,7rem)] w-[clamp(5.25rem,8.5vw,7rem)] place-items-center rounded-full border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-500"
                      />
                      <div className="mt-0.5 grid min-w-[4.5rem] place-items-center rounded-xl border-2 border-amber-200 bg-white/95 px-2 py-1 leading-none text-amber-950 shadow-md">
                        <span className="text-sm font-black">
                          {stickerCount}まい
                        </span>
                        <span className="mt-0.5 text-[10px] font-black">
                          もってる
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {!isSpinning ? (
          <div className="absolute left-[20%] top-[67%] grid w-[min(20rem,32vw)] gap-2">
            <button
              className={`rounded-full border-4 px-5 py-4 text-xl font-black shadow-[0_10px_0_rgba(120,53,15,0.45)] transition active:translate-y-1 active:shadow-[0_6px_0_rgba(120,53,15,0.45)] ${
                canDraw
                  ? "border-orange-200 bg-gradient-to-b from-red-500 to-orange-600 text-white hover:from-red-600 hover:to-orange-700"
                  : "cursor-not-allowed border-slate-200 bg-slate-200 text-slate-500 shadow-[0_10px_0_rgba(71,85,105,0.25)]"
              }`}
              onClick={onDraw}
              disabled={!canDraw}
            >
              {gachaMode === "cards" && missingCards.length === 0
                ? "コンプリート"
                : progress.coins < currentCost
                  ? "コインがたりない"
                  : "まわす"}
            </button>
            <div className="rounded-full border-2 border-amber-200 bg-white/90 px-3 py-1.5 text-center text-sm font-black text-amber-900 shadow-lg backdrop-blur-sm">
              {gachaMode === "cards"
                ? selectedGacha.description
                : selectedStickerGacha.description}
            </div>
            {gachaMode === "cards" ? (
              <div className="grid grid-cols-5 gap-1.5">
                {CARD_GACHA_DEFINITIONS.map((gacha) => {
                  const active = gacha.id === selectedGachaId;
                  const newGacha = hasNewItem(
                    getCardsByGachaId(gacha.id),
                    gachaLastOpenedOn,
                  );
                  return (
                    <button
                      key={gacha.id}
                      className={`relative rounded-2xl border-2 px-1.5 py-2 text-xs font-black shadow-[0_4px_0_rgba(120,53,15,0.35)] transition active:translate-y-0.5 ${
                        active
                          ? "border-yellow-200 bg-gradient-to-b from-rose-500 to-red-700 text-white"
                          : "border-amber-300 bg-gradient-to-b from-amber-100 to-orange-200 text-amber-950 hover:from-amber-50 hover:to-orange-100"
                      }`}
                      onClick={() => onSelectGacha(gacha.id)}
                    >
                      {gacha.shortName}
                      {newGacha ? (
                        <span className="absolute -right-1.5 -top-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                          NEW
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {STICKER_GACHA_DEFINITIONS.map((gacha) => {
                  const active = gacha.id === selectedStickerGachaId;
                  const newGacha = hasNewItem(
                    getStickersByGachaId(gacha.id),
                    gachaLastOpenedOn,
                  );
                  return (
                    <button
                      key={gacha.id}
                      className={`relative rounded-2xl border-2 px-1.5 py-2 text-xs font-black shadow-[0_4px_0_rgba(120,53,15,0.35)] transition active:translate-y-0.5 ${
                        active
                          ? "border-yellow-200 bg-gradient-to-b from-rose-500 to-red-700 text-white"
                          : "border-amber-300 bg-gradient-to-b from-amber-100 to-orange-200 text-amber-950 hover:from-amber-50 hover:to-orange-100"
                      }`}
                      onClick={() => onSelectStickerGacha(gacha.id)}
                    >
                      {gacha.shortName}
                      {newGacha ? (
                        <span className="absolute -right-1.5 -top-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                          NEW
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {resultCard || resultSticker ? (
          <div
            key={resultCard?.id ?? resultSticker?.id}
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
                      src={(resultCard ?? resultSticker)?.image ?? ""}
                      alt={(resultCard ?? resultSticker)?.name ?? ""}
                      title={(resultCard ?? resultSticker)?.name ?? ""}
                      imageClassName={`h-80 w-56 object-contain ${
                        resultSticker ? "rounded-full" : "rounded-xl"
                      }`}
                      missingClassName={`grid h-80 w-56 place-items-center border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-500 ${
                        resultSticker ? "rounded-full" : "rounded-xl"
                      }`}
                    />
                    <div className="gacha-card-shine pointer-events-none absolute inset-2 overflow-hidden rounded-xl">
                      <span className="absolute inset-y-[-20%] left-0 w-1/3 bg-white/65 blur-sm" />
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 text-left">
                  <div className="rounded-3xl border-2 border-amber-200 bg-amber-50/95 p-5 shadow-lg">
                    <div className="text-3xl font-black leading-tight text-amber-950">
                      {(resultCard ?? resultSticker)?.name}
                    </div>
                    <div className="mt-3 rounded-2xl bg-white/90 px-4 py-3 text-lg font-black leading-relaxed text-rose-800">
                      {resultCard
                        ? resultCard.description
                        : resultSticker?.description}
                      {resultSticker ? (
                        <div className="mt-2 text-base text-amber-800">
                          これで{" "}
                          {progress.ownedStickerCounts[resultSticker.id] ?? 0}
                          まいめ
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="rounded-2xl bg-rose-600 px-6 py-3 text-base font-black text-white shadow-lg transition hover:bg-rose-700"
                      onClick={onCloseResult}
                    >
                      とじる
                    </button>
                    <button
                      className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-base font-black text-slate-700 shadow-lg hover:bg-slate-50"
                      onClick={resultCard ? onGoCards : onGoStickers}
                    >
                      {resultCard ? "カードずかんへ" : "シールちょうへ"}
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
