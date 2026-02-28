import React, { useMemo } from "react";
import registerGameTop from "@/assets/register-game-top.png";
import snackBadgeBronze from "@/assets/badge/snack-bronze.png";
import snackBadgeSilver from "@/assets/badge/snack-silver.png";
import snackBadgeGold from "@/assets/badge/snack-gold.png";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import {
  difficultyLabel,
  getBestRankByDifficulty,
  type SnackRank,
  type SnackDifficulty,
} from "@/features/soroban/snackBadges";
import { loadRegisterProgress } from "@/features/soroban/state";

const DIFFICULTIES: SnackDifficulty[] = ["easy", "normal", "hard"];

type Props = {
  onGoRegister: () => void;
};

function badgeTheme(difficulty: SnackDifficulty): {
  frame: string;
} {
  if (difficulty === "hard") {
    return {
      frame: "border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-rose-50",
    };
  }
  if (difficulty === "normal") {
    return {
      frame: "border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50",
    };
  }
  return {
    frame: "border-emerald-200 bg-gradient-to-r from-emerald-50 to-lime-50",
  };
}

function gameBadgeLabel(difficulty: SnackDifficulty): string {
  return `あんざんゲーム ${difficultyLabel(difficulty)}`;
}

function badgeImageByRank(rank: SnackRank): string {
  if (rank === "A") return snackBadgeGold;
  if (rank === "B") return snackBadgeSilver;
  return snackBadgeBronze;
}

export function SnackBadgeBookPage({ onGoRegister }: Props) {
  const progress = loadRegisterProgress();
  const [badgeImageErrorMap, setBadgeImageErrorMap] = React.useState<
    Partial<Record<SnackDifficulty, boolean>>
  >({});
  const bestByDifficulty = useMemo(
    () => getBestRankByDifficulty(progress.badgeIds),
    [progress.badgeIds],
  );
  const ownedCount = Object.keys(bestByDifficulty).length;

  return (
    <SceneFrame
      backgroundImage={registerGameTop}
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
        className="relative h-full p-3 sm:p-4"
        style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}
      >
        <section className="mx-auto flex h-full max-w-5xl flex-col rounded-2xl border border-white/40 bg-white/80 p-4 shadow-xl backdrop-blur-sm">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-black text-slate-800">バッジずかん</h1>
            <div className="rounded-full bg-sky-100 px-3 py-1 text-sm font-bold text-sky-700">
              かくとく {ownedCount} / {DIFFICULTIES.length}
            </div>
          </header>
          <div className="mt-4 grid min-h-0 flex-1 gap-3 overflow-y-auto">
            {DIFFICULTIES.map((difficulty) => {
              const bestRank = bestByDifficulty[difficulty];
              const theme = badgeTheme(difficulty);
              const badgeImage = bestRank ? badgeImageByRank(bestRank) : null;
              const isImageBroken = badgeImageErrorMap[difficulty] === true;
              return (
                <section
                  key={difficulty}
                  className={`rounded-xl border p-3 ${theme.frame}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-base font-black text-slate-800">
                      {gameBadgeLabel(difficulty)}
                    </h2>
                    <span className="text-xs font-bold text-slate-600">
                      {bestRank
                        ? `いまのバッジ: ランク${bestRank}`
                        : "みかくとく"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[240px_1fr]">
                    {bestRank ? (
                      <div className="grid place-items-center rounded-lg bg-white/75 px-3 py-4">
                        <div className="relative h-40 w-32">
                          {badgeImage && !isImageBroken ? (
                            <img
                              src={badgeImage}
                              alt={`${gameBadgeLabel(difficulty)} ランク${bestRank}`}
                              className="absolute left-1/2 top-0 h-40 w-32 -translate-x-1/2 object-contain"
                              onError={() =>
                                setBadgeImageErrorMap((prev) => ({
                                  ...prev,
                                  [difficulty]: true,
                                }))
                              }
                            />
                          ) : (
                            <div className="grid h-40 w-32 place-items-center rounded-lg border-4 border-dashed border-slate-300 bg-slate-100 text-4xl font-black text-slate-400">
                              {bestRank}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid place-items-center rounded-lg bg-white/75 px-3 py-4">
                        <div className="grid h-28 w-28 place-items-center rounded-full border-4 border-dashed border-slate-300 bg-slate-100 text-3xl font-black text-slate-400">
                          ?
                        </div>
                      </div>
                    )}
                    {bestRank ? (
                      <div className="rounded-lg bg-white/75 px-3 py-4 text-slate-700">
                        <div className="text-xs font-bold">いまのバッジ</div>
                        <div className="mt-1 text-2xl font-black">
                          {gameBadgeLabel(difficulty)} ランク{bestRank}
                        </div>
                        <div className="mt-2 text-xs font-bold text-emerald-700">
                          かくとくずみ
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-white/75 px-3 py-4 text-slate-500">
                        <div className="text-xs font-bold">いまのバッジ</div>
                        <div className="mt-1 text-2xl font-black">
                          みかくとく
                        </div>
                        <div className="mt-2 text-xs font-bold">
                          このなんいどで あそんで かくとくしよう
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </section>
      </div>
    </SceneFrame>
  );
}
