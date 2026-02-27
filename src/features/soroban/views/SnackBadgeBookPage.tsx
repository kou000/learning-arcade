import React, { useMemo } from "react";
import registerGameTop from "@/assets/register-game-top.png";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import {
  difficultyLabel,
  getBestRankByDifficulty,
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

function medalGradientByRank(rank: string | undefined): string {
  if (rank === "A") return "from-amber-300 via-yellow-300 to-amber-500";
  if (rank === "B") return "from-slate-200 via-zinc-100 to-slate-400";
  if (rank === "C") return "from-amber-700 via-amber-500 to-orange-700";
  if (rank === "D") return "from-indigo-300 via-indigo-200 to-indigo-500";
  if (rank === "E") return "from-emerald-300 via-emerald-200 to-emerald-500";
  if (rank === "F") return "from-rose-300 via-rose-200 to-rose-500";
  return "from-slate-300 via-slate-200 to-slate-400";
}

function medalRingByRank(rank: string | undefined): string {
  if (rank === "A") return "border-amber-100";
  if (rank === "B") return "border-slate-100";
  if (rank === "C") return "border-orange-200";
  if (rank === "D") return "border-indigo-100";
  if (rank === "E") return "border-emerald-100";
  if (rank === "F") return "border-rose-100";
  return "border-slate-100";
}

function ribbonGradientByRank(rank: string | undefined): string {
  if (rank === "A") return "from-amber-500 to-yellow-600";
  if (rank === "B") return "from-slate-500 to-zinc-600";
  if (rank === "C") return "from-amber-700 to-orange-800";
  if (rank === "D") return "from-indigo-500 to-indigo-700";
  if (rank === "E") return "from-emerald-500 to-emerald-700";
  if (rank === "F") return "from-rose-500 to-rose-700";
  return "from-slate-500 to-slate-700";
}

export function SnackBadgeBookPage({ onGoRegister }: Props) {
  const progress = loadRegisterProgress();
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
              const isGlossyMedal =
                bestRank === "A" || bestRank === "B" || bestRank === "C";
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
                          <div className="absolute left-1/2 top-[5.1rem] z-0 flex -translate-x-1/2 gap-2">
                            <div
                              className={`h-14 w-7 bg-gradient-to-b ${ribbonGradientByRank(bestRank)}`}
                              style={{
                                clipPath:
                                  "polygon(0 0, 100% 0, 100% 82%, 50% 100%, 0 82%)",
                              }}
                            />
                            <div
                              className={`h-14 w-7 bg-gradient-to-b ${ribbonGradientByRank(bestRank)}`}
                              style={{
                                clipPath:
                                  "polygon(0 0, 100% 0, 100% 82%, 50% 100%, 0 82%)",
                              }}
                            />
                          </div>
                          <div
                            className={`absolute left-1/2 top-[4.7rem] z-[1] h-5 w-10 -translate-x-1/2 rounded-md bg-gradient-to-b ${ribbonGradientByRank(bestRank)}`}
                          />
                          <div
                            className={`absolute left-1/2 top-0 z-10 h-28 w-28 -translate-x-1/2 rounded-full border-4 border-white bg-gradient-to-br ${medalGradientByRank(bestRank)} shadow-[0_8px_20px_rgba(0,0,0,0.18)]`}
                          />
                          {isGlossyMedal ? (
                            <>
                              <div className="pointer-events-none absolute left-1/2 top-[5px] z-[12] h-[102px] w-[102px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.32),rgba(255,255,255,0.08)_42%,rgba(0,0,0,0.06)_100%)]" />
                              <div
                                className="pointer-events-none absolute left-[44%] top-2 z-20 h-9 w-14 -translate-x-1/2 -rotate-[20deg] rounded-full"
                                style={{
                                  background:
                                    "linear-gradient(125deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.38) 46%, rgba(255,255,255,0.03) 82%, rgba(255,255,255,0) 100%)",
                                  filter: "blur(0.5px)",
                                }}
                              />
                              <div
                                className="pointer-events-none absolute left-[43%] top-[1.9rem] z-20 h-2.5 w-6 -translate-x-1/2 -rotate-[20deg] rounded-full bg-white/22"
                                style={{ filter: "blur(0.6px)" }}
                              />
                              <div
                                className={`pointer-events-none absolute left-1/2 top-[6px] z-20 h-[100px] w-[100px] -translate-x-1/2 rounded-full border ${medalRingByRank(bestRank)} opacity-80`}
                              />
                              <div className="pointer-events-none absolute left-1/2 top-[10px] z-20 h-[92px] w-[92px] -translate-x-1/2 rounded-full shadow-[inset_0_5px_10px_rgba(255,255,255,0.30),inset_0_-12px_16px_rgba(0,0,0,0.17)]" />
                            </>
                          ) : null}
                          <div className="absolute left-1/2 top-0 z-30 grid h-28 w-28 -translate-x-1/2 place-items-center text-4xl font-black text-white drop-shadow">
                            {bestRank}
                          </div>
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
