import React, { useEffect, useMemo, useRef, useState } from "react";
import shopTopBg from "@/assets/shop-top.png";
import arkSuccess from "@/assets/ark_success.png";
import arfBad from "@/assets/arf_bad.png";
import { DogSpeechBubble } from "@/features/soroban/components/DogSpeechBubble";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import { SNACK_SEEDS } from "@/features/soroban/snackCatalog";
import {
  loadRegisterProgress,
  saveRegisterProgress,
} from "@/features/soroban/state";

const TARGET_YEN = 300;

function scoreResult(total: number): { rank: string; comment: string } {
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
  items: Array<{ id: string; price: number; quantity: number }>;
  onGoSnack: () => void;
  onGoRegister: () => void;
};

export function SnackBudgetResultPage({
  total,
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
  const canGetReward = result?.rank === "A" || result?.rank === "B";
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

  useEffect(() => {
    if (!isFinished || hasResultPopupShownRef.current) return;
    if (canGetReward && rewardItemId != null) return;
    hasResultPopupShownRef.current = true;
    setIsResultPopupOpen(true);
    const timeoutId = window.setTimeout(() => {
      setIsResultPopupOpen(false);
      if (canGetReward && rewardItemId == null) {
        setIsRewardModalOpen(true);
      }
    }, 1800);
    return () => window.clearTimeout(timeoutId);
  }, [canGetReward, isFinished, rewardItemId]);

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
          {rewardMessage ? (
            <div className="mr-auto rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-xs font-bold text-emerald-700">
              {rewardMessage}
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
