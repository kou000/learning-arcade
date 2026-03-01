import React, { useEffect, useMemo, useRef, useState } from "react";
import shopTopBg from "@/assets/shop-top.png";
import arkSuccess from "@/assets/ark_success.png";
import arfBad from "@/assets/arf_bad.png";
import snackBadgeBronze from "@/assets/badge/snack-bronze.png";
import snackBadgeSilver from "@/assets/badge/snack-silver.png";
import snackBadgeGold from "@/assets/badge/snack-gold.png";
import { DogSpeechBubble } from "@/features/soroban/components/DogSpeechBubble";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import { SNACK_SEEDS } from "@/features/soroban/snackCatalog";
import {
  buildSnackBadgeId,
  difficultyLabel,
  getBestRankByDifficulty,
  rankScore,
  type SnackDifficulty,
  type SnackRank,
} from "@/features/soroban/snackBadges";
import { toBestGameBadgeIds } from "@/features/soroban/registerBadges";
import {
  loadRegisterProgress,
  saveRegisterProgress,
} from "@/features/soroban/state";

const TARGET_YEN = 300;

function scoreResult(total: number): { rank: SnackRank; comment: string } {
  const diff = Math.abs(TARGET_YEN - total);
  const over = total > TARGET_YEN;
  if (over) return { rank: "F", comment: "300えんを こえちゃった！" };
  if (diff === 0) return { rank: "A", comment: "ぴったり！ すごい！" };
  if (diff <= 10) return { rank: "B", comment: "おしい！ あとすこし！" };
  if (diff <= 30) return { rank: "C", comment: "かなり ちかい！" };
  if (diff <= 50) return { rank: "D", comment: "つぎは もっと ちかづけよう" };
  return { rank: "E", comment: "つぎは もうすこし えらんでみよう！" };
}

type Props = {
  total: number | null;
  difficulty: SnackDifficulty;
  items: Array<{ id: string; price: number; quantity: number }>;
  onGoSnack: () => void;
  onGoRegister: () => void;
};

function badgeImageByRank(rank: SnackRank): string {
  if (rank === "A") return snackBadgeGold;
  if (rank === "B") return snackBadgeSilver;
  return snackBadgeBronze;
}

const BADGE_CONFETTI = [
  { left: 6, color: "bg-rose-300", delay: 0 },
  { left: 14, color: "bg-amber-300", delay: 220 },
  { left: 22, color: "bg-sky-300", delay: 420 },
  { left: 31, color: "bg-emerald-300", delay: 640 },
  { left: 40, color: "bg-violet-300", delay: 900 },
  { left: 50, color: "bg-yellow-300", delay: 1080 },
  { left: 60, color: "bg-cyan-300", delay: 1260 },
  { left: 69, color: "bg-pink-300", delay: 1500 },
  { left: 77, color: "bg-lime-300", delay: 1720 },
  { left: 86, color: "bg-orange-300", delay: 1920 },
  { left: 94, color: "bg-blue-300", delay: 2140 },
];

export function SnackBudgetResultPage({
  total,
  difficulty,
  items,
  onGoSnack,
  onGoRegister,
}: Props) {
  const snackMetaById = useMemo(
    () =>
      Object.fromEntries(
        SNACK_SEEDS.map((seed) => [
          seed.id,
          { name: seed.name, image: seed.image },
        ]),
      ),
    [],
  );
  const result = useMemo(() => {
    if (total == null || !Number.isFinite(total)) return null;
    const scored = scoreResult(total);
    return {
      total,
      diff: Math.abs(TARGET_YEN - total),
      over: total > TARGET_YEN,
      ...scored,
    };
  }, [total]);

  const speechLines = useMemo(() => {
    if (!result) return ["けっかが よみこめなかったよ"];
    const itemLines = items.map(
      (item) =>
        `${snackMetaById[item.id]?.name ?? item.id} ${item.price}えんを ${item.quantity}こ`,
    );
    return [
      "おかいけいします！",
      ...itemLines,
      "ごうけいは・・・",
      `${result.total}えんです！`,
      `らんく ${result.rank}！ ${result.comment}`,
    ];
  }, [items, result, snackMetaById]);
  const [speechIndex, setSpeechIndex] = useState(0);

  useEffect(() => {
    setSpeechIndex(0);
    if (speechLines.length <= 1) return;
    let timeoutId: number | null = null;
    const delayForLine = (line: string) =>
      line.includes("ごうけいは・・・") ? 2200 : 1200;
    const tick = (index: number) => {
      timeoutId = window.setTimeout(
        () => {
          const next = index + 1;
          if (next >= speechLines.length) return;
          setSpeechIndex(next);
          tick(next);
        },
        delayForLine(speechLines[index] ?? ""),
      );
    };
    tick(0);
    return () => {
      if (timeoutId != null) window.clearTimeout(timeoutId);
    };
  }, [speechLines]);

  const speech = speechLines[Math.min(speechIndex, speechLines.length - 1)];
  const isFinished = speechIndex >= speechLines.length - 1;
  const canGetReward =
    result?.rank === "A" || result?.rank === "B" || result?.rank === "C";
  const rewardCandidates = useMemo(
    () =>
      items.reduce<Array<{ id: string; name: string; image: string | null }>>(
        (acc, item) => {
          if (acc.some((picked) => picked.id === item.id)) return acc;
          acc.push({
            id: item.id,
            name: snackMetaById[item.id]?.name ?? item.id,
            image: snackMetaById[item.id]?.image ?? null,
          });
          return acc;
        },
        [],
      ),
    [items, snackMetaById],
  );
  const [rewardItemId, setRewardItemId] = useState<string | null>(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isResultPopupOpen, setIsResultPopupOpen] = useState(false);
  const hasResultPopupShownRef = useRef(false);
  const [ownedRewardIds, setOwnedRewardIds] = useState<string[]>(
    () => loadRegisterProgress().purchasedItemIds,
  );
  const [rewardImageErrorMap, setRewardImageErrorMap] = useState<
    Record<string, boolean>
  >({});
  const [rewardMessage, setRewardMessage] = useState<string>("");
  const [postRewardSpeech, setPostRewardSpeech] = useState<string | null>(null);
  const [badgeMessage, setBadgeMessage] = useState<string>("");
  const [badgeModal, setBadgeModal] = useState<{
    name: string;
    rank: SnackRank;
    image: string;
  } | null>(null);
  const [badgeImageBroken, setBadgeImageBroken] = useState(false);
  const awardedBadgeIdRef = useRef<string | null>(null);
  const badgeModalRef = useRef<{
    name: string;
    rank: SnackRank;
    image: string;
  } | null>(null);
  const canGetRewardRef = useRef(false);
  const rewardItemIdRef = useRef<string | null>(null);

  badgeModalRef.current = badgeModal;
  canGetRewardRef.current = canGetReward;
  rewardItemIdRef.current = rewardItemId;

  useEffect(() => {
    if (!isFinished || !result) return;
    const badgeId = buildSnackBadgeId(difficulty, result.rank);
    if (awardedBadgeIdRef.current === badgeId) return;
    awardedBadgeIdRef.current = badgeId;
    const current = loadRegisterProgress();
    const badgeName = `${difficultyLabel(difficulty)} ランク${result.rank}`;
    const bestRankByDifficulty = getBestRankByDifficulty(current.badgeIds);
    const currentBestRank = bestRankByDifficulty[difficulty];
    const canUpgrade =
      !currentBestRank || rankScore(result.rank) > rankScore(currentBestRank);
    if (canUpgrade) {
      saveRegisterProgress({
        ...current,
        badgeIds: toBestGameBadgeIds([...current.badgeIds, badgeId]),
      });
      setBadgeModal({
        name: badgeName,
        rank: result.rank,
        image: badgeImageByRank(result.rank),
      });
      setBadgeImageBroken(false);
    }
    setBadgeMessage(
      canUpgrade
        ? `バッジ「${badgeName}」を かくとく！`
        : `このなんいどは ランク${currentBestRank}を もってるよ！`,
    );
  }, [difficulty, isFinished, result]);

  useEffect(() => {
    if (!isFinished || hasResultPopupShownRef.current) return;
    if (canGetRewardRef.current && rewardItemIdRef.current != null) return;
    hasResultPopupShownRef.current = true;
    setIsResultPopupOpen(true);
    const timeoutId = window.setTimeout(() => {
      setIsResultPopupOpen(false);
      if (badgeModalRef.current) {
        setIsBadgeModalOpen(true);
        return;
      }
      if (canGetRewardRef.current && rewardItemIdRef.current == null) {
        setIsRewardModalOpen(true);
      }
    }, 1800);
    return () => window.clearTimeout(timeoutId);
  }, [isFinished]);

  const closeBadgeModal = () => {
    setIsBadgeModalOpen(false);
    if (canGetReward && rewardItemId == null) {
      setIsRewardModalOpen(true);
    }
  };

  const claimReward = (item: { id: string; name: string }) => {
    if (!canGetReward || rewardItemId != null) return;
    const current = loadRegisterProgress();
    const alreadyOwned = current.purchasedItemIds.includes(item.id);
    saveRegisterProgress({
      ...current,
      purchasedItemIds: Array.from(
        new Set([...current.purchasedItemIds, item.id]),
      ),
    });
    setOwnedRewardIds((prev) => Array.from(new Set([...prev, item.id])));
    setRewardItemId(item.id);
    setRewardMessage(
      alreadyOwned
        ? `「${item.name}」は もう もってるよ！`
        : `「${item.name}」プレゼント！たなにかざってね！`,
    );
    setPostRewardSpeech(
      alreadyOwned
        ? `${item.name}は もう もってるね！\nほかのおかしも みにいこう！`
        : `いいえらび！ ${item.name}を あげるね！\nたなに かざって たのしんでね！`,
    );
    setIsRewardModalOpen(false);
  };

  const speechToShow = postRewardSpeech ?? speech;

  return (
    <SceneFrame
      backgroundImage={shopTopBg}
      fullscreenBackground
      outsideTopLeft={
        <button
          className="rounded-xl bg-transparent px-4 py-3 text-base font-semibold text-white hover:bg-white/10"
          onClick={onGoRegister}
        >
          ← ゲームモードTOP
        </button>
      }
    >
      <div
        className="relative grid h-full grid-rows-[1fr_auto] gap-3 p-3 sm:p-4"
        style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}
      >
        <div className="relative min-h-0">
          <div className="pointer-events-none absolute left-[23%] top-[10%] z-20 w-[min(30rem,48vw)]">
            <DogSpeechBubble text={speechToShow} preserveLineBreaks />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          {rewardMessage || badgeMessage ? (
            <div className="mr-auto grid gap-2">
              {rewardMessage ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-xs font-bold text-emerald-700">
                  {rewardMessage}
                </div>
              ) : null}
              {badgeMessage ? (
                <div className="rounded-xl border border-sky-200 bg-sky-50/90 px-3 py-2 text-xs font-bold text-sky-700">
                  {badgeMessage}
                </div>
              ) : null}
            </div>
          ) : null}
          <button
            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
            onClick={onGoRegister}
          >
            ゲームモードTOPへ
          </button>
          <button
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60"
            onClick={onGoSnack}
            disabled={!isFinished || (canGetReward && rewardItemId == null)}
          >
            もういちど あそぶ
          </button>
        </div>
      </div>
      {isRewardModalOpen && isFinished && canGetReward ? (
        <div className="absolute inset-0 z-[60] grid place-items-center bg-slate-900/45 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="text-base font-black text-slate-800">
              ほうしゅうを 1こ えらんでね
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {rewardCandidates.map((item) => (
                <button
                  key={item.id}
                  className={`relative rounded-xl border p-2 text-left hover:bg-slate-50 ${ownedRewardIds.includes(item.id) ? "border-amber-300 bg-amber-50/60" : "border-slate-200 bg-white"}`}
                  onClick={() => claimReward(item)}
                >
                  {ownedRewardIds.includes(item.id) ? (
                    <span className="absolute right-2 top-2 rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-900">
                      もってる
                    </span>
                  ) : null}
                  {item.image && !rewardImageErrorMap[item.id] ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={() =>
                        setRewardImageErrorMap((prev) => ({
                          ...prev,
                          [item.id]: true,
                        }))
                      }
                      className="h-24 w-full rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-500">
                      がぞうなし
                    </div>
                  )}
                  <div className="mt-1 text-xs font-bold text-slate-700">
                    {item.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {isBadgeModalOpen && isFinished && badgeModal ? (
        <div className="absolute inset-0 z-[65] grid place-items-center bg-slate-900/45 p-4">
          <div className="badge-modal-pop relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50 via-white to-sky-50 p-5 shadow-[0_24px_50px_rgba(15,23,42,0.38)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.45)_0%,_rgba(251,191,36,0)_70%)]" />
            {BADGE_CONFETTI.map((piece) => (
              <span
                key={`${piece.left}-${piece.delay}`}
                className={`badge-confetti pointer-events-none absolute top-2 h-2.5 w-2.5 rounded-sm ${piece.color}`}
                style={
                  {
                    left: `${piece.left}%`,
                    "--delay": `${piece.delay}ms`,
                  } as React.CSSProperties
                }
              />
            ))}

            <div className="relative text-center text-xl font-black tracking-wide text-amber-700">
              バッジをゲットしたよ!
            </div>
            <div className="mt-1 text-center text-xs font-black text-slate-600">
              {badgeModal.name}
            </div>
            <div className="mt-4 grid place-items-center">
              {!badgeImageBroken ? (
                <div className="badge-float relative">
                  <img
                    src={badgeModal.image}
                    alt={`${badgeModal.name} ランク${badgeModal.rank}`}
                    className="h-52 w-40 object-contain drop-shadow-[0_14px_14px_rgba(0,0,0,0.22)]"
                    onError={() => setBadgeImageBroken(true)}
                  />
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                    <div className="badge-shine absolute -left-10 top-0 h-full w-12 bg-white/65 blur-[1px]" />
                  </div>
                </div>
              ) : (
                <div className="grid h-52 w-40 place-items-center rounded-xl border-4 border-dashed border-slate-300 bg-slate-100 text-5xl font-black text-slate-400">
                  {badgeModal.rank}
                </div>
              )}
            </div>
            <div className="mt-2 text-center">
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                ランク {badgeModal.rank}
              </span>
            </div>
            <button
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2 text-sm font-black text-white shadow-[0_8px_18px_rgba(16,185,129,0.35)] hover:from-emerald-700 hover:to-cyan-700"
              onClick={closeBadgeModal}
            >
              とじる
            </button>
          </div>
        </div>
      ) : null}
      {isResultPopupOpen && isFinished ? (
        <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/35 backdrop-blur-[1px]">
          <div className="flash-good flex items-center gap-8">
            <img
              src={canGetReward ? arkSuccess : arfBad}
              alt={canGetReward ? "ほうしゅう" : "しっぱい"}
              className="h-56 w-56 rounded-full bg-white object-cover shadow-sm"
            />
            <div className="rounded-2xl bg-white/92 px-6 py-4 shadow-[0_6px_18px_rgba(0,0,0,0.25)]">
              <span
                className="text-5xl font-extrabold tracking-wide text-amber-300 font-[var(--pop-font)]"
                style={{
                  textShadow:
                    "0 2px 0 rgba(25,45,35,0.45), 0 6px 10px rgba(0,0,0,0.25)",
                }}
              >
                {canGetReward
                  ? `ランク${result?.rank ?? ""}！ せいこう`
                  : `ランク${result?.rank ?? ""} しっぱい！`}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </SceneFrame>
  );
}
