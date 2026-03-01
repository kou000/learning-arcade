import React, { useMemo } from "react";
import registerGameTop from "@/assets/register-game-top.png";
import snackBadgeBronze from "@/assets/badge/snack-bronze.png";
import snackBadgeSilver from "@/assets/badge/snack-silver.png";
import snackBadgeGold from "@/assets/badge/snack-gold.png";
import registerBadgeBronze from "@/assets/badge/regi-bronze.png";
import registerBadgeSilver from "@/assets/badge/regi-silver.png";
import registerBadgeGold from "@/assets/badge/regi-gold.png";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import {
  getBestRegisterBadgeByKey,
  registerBadgeRankLabel,
  type RegisterBadgeRank,
} from "@/features/soroban/registerBadges";
import {
  difficultyLabel,
  getBestRankByDifficulty,
  type SnackDifficulty,
  type SnackRank,
} from "@/features/soroban/snackBadges";
import {
  getRegisterGradeOrder,
  loadRegisterProgress,
  type RegisterSubject,
} from "@/features/soroban/state";

const DIFFICULTIES: SnackDifficulty[] = ["easy", "normal", "hard"];
const REGISTER_SUBJECTS: RegisterSubject[] = ["mitori", "mul", "div"];

type Props = {
  onGoRegister: () => void;
};

type BadgeRowCardProps = {
  title: string;
  currentLabel: string;
  image: string | null;
  placeholderText: string;
  isImageBroken: boolean;
  onImageError: () => void;
  isOwned: boolean;
  acquiredText: string;
  missingText: string;
  containerClassName: string;
};

function badgeTheme(difficulty: SnackDifficulty): { frame: string } {
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

function snackBadgeImageByRank(rank: SnackRank): string {
  if (rank === "A") return snackBadgeGold;
  if (rank === "B") return snackBadgeSilver;
  return snackBadgeBronze;
}

function registerBadgeImageByRank(rank: RegisterBadgeRank): string {
  if (rank === "gold") return registerBadgeGold;
  if (rank === "silver") return registerBadgeSilver;
  return registerBadgeBronze;
}

function registerSubjectLabel(subject: RegisterSubject): string {
  if (subject === "mitori") return "みとりざん";
  if (subject === "mul") return "かけざん";
  return "わりざん";
}

function BadgeRowCard({
  title,
  currentLabel,
  image,
  placeholderText,
  isImageBroken,
  onImageError,
  isOwned,
  acquiredText,
  missingText,
  containerClassName,
}: BadgeRowCardProps) {
  return (
    <section className={containerClassName}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-black text-slate-800">{title}</h3>
        <span className="text-xs font-bold text-slate-600">{currentLabel}</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[240px_1fr]">
        {image ? (
          <div className="grid place-items-center rounded-lg bg-white/75 px-3 py-4">
            {!isImageBroken ? (
              <img
                src={image}
                alt={title}
                className="h-40 w-32 object-contain"
                onError={onImageError}
              />
            ) : (
              <div className="grid h-40 w-32 place-items-center rounded-lg border-4 border-dashed border-slate-300 bg-slate-100 text-3xl font-black text-slate-400">
                {placeholderText}
              </div>
            )}
          </div>
        ) : (
          <div className="grid place-items-center rounded-lg bg-white/75 px-3 py-4">
            <div className="grid h-28 w-28 place-items-center rounded-full border-4 border-dashed border-slate-300 bg-slate-100 text-3xl font-black text-slate-400">
              ?
            </div>
          </div>
        )}
        <div className={`rounded-lg bg-white/75 px-3 py-4 ${isOwned ? "text-slate-700" : "text-slate-500"}`}>
          <div className="text-xs font-bold">いまのバッジ</div>
          <div className="mt-1 text-2xl font-black">{isOwned ? title : "みかくとく"}</div>
          <div className={`mt-2 text-xs font-bold ${isOwned ? "text-emerald-700" : "text-slate-500"}`}>
            {isOwned ? acquiredText : missingText}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SnackBadgeBookPage({ onGoRegister }: Props) {
  const progress = loadRegisterProgress();
  const [badgeImageErrorMap, setBadgeImageErrorMap] = React.useState<
    Record<string, boolean>
  >({});
  const snackBestByDifficulty = useMemo(
    () => getBestRankByDifficulty(progress.badgeIds),
    [progress.badgeIds],
  );
  const registerBestByKey = useMemo(
    () => getBestRegisterBadgeByKey(progress.badgeIds),
    [progress.badgeIds],
  );
  const registerGradeOrder = useMemo(() => getRegisterGradeOrder(), []);
  const registerEntries = useMemo(
    () =>
      registerGradeOrder.flatMap((grade) =>
        REGISTER_SUBJECTS.map((subject) => {
          const key = `${grade}:${subject}`;
          const rank = registerBestByKey[key];
          return { grade, subject, key, rank };
        }),
      ),
    [registerBestByKey, registerGradeOrder],
  );

  const ownedSnackCount = Object.keys(snackBestByDifficulty).length;
  const ownedRegisterCount = registerEntries.filter((entry) =>
    Boolean(entry.rank),
  ).length;
  const totalBadgeCount = ownedSnackCount + ownedRegisterCount;
  const totalSlotCount = DIFFICULTIES.length + registerEntries.length;

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
              かくとく {totalBadgeCount} / {totalSlotCount}
            </div>
          </header>

          <div className="mt-3 text-xs font-bold text-slate-600">
            あんざんゲーム {ownedSnackCount}/{DIFFICULTIES.length} ・ レジゲーム
            {" "}
            {ownedRegisterCount}/{registerEntries.length}
          </div>

          <div className="mt-4 grid min-h-0 flex-1 gap-3 overflow-y-auto">
            {DIFFICULTIES.map((difficulty) => {
              const bestRank = snackBestByDifficulty[difficulty];
              const imageKey = `snack:${difficulty}`;
              const isImageBroken = badgeImageErrorMap[imageKey] === true;
              return (
                <BadgeRowCard
                  key={difficulty}
                  title={
                    bestRank
                      ? `${gameBadgeLabel(difficulty)} ランク${bestRank}`
                      : gameBadgeLabel(difficulty)
                  }
                  currentLabel={
                    bestRank ? `いまのバッジ: ランク${bestRank}` : "みかくとく"
                  }
                  image={bestRank ? snackBadgeImageByRank(bestRank) : null}
                  placeholderText={bestRank ?? "?"}
                  isImageBroken={isImageBroken}
                  onImageError={() =>
                    setBadgeImageErrorMap((prev) => ({ ...prev, [imageKey]: true }))
                  }
                  isOwned={Boolean(bestRank)}
                  acquiredText="かくとくずみ"
                  missingText="このなんいどで あそんで かくとくしよう"
                  containerClassName={`rounded-xl border p-3 ${badgeTheme(difficulty).frame}`}
                />
              );
            })}

            <section className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-base font-black text-slate-800">
                  レジゲーム バッジ
                </h2>
                <span className="text-xs font-bold text-slate-600">
                  かくとく {ownedRegisterCount} / {registerEntries.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {registerEntries.map((entry) => {
                  const imageKey = `register:${entry.key}`;
                  const isImageBroken = badgeImageErrorMap[imageKey] === true;
                  const subject = registerSubjectLabel(entry.subject);
                  const fullTitle = entry.rank
                    ? `${entry.grade}きゅう ${subject} ${registerBadgeRankLabel(entry.rank)}`
                    : `${entry.grade}きゅう ${subject}`;
                  return (
                    <BadgeRowCard
                      key={entry.key}
                      title={fullTitle}
                      currentLabel={
                        entry.rank
                          ? `いまのバッジ: ${registerBadgeRankLabel(entry.rank)}`
                          : "みかくとく"
                      }
                      image={entry.rank ? registerBadgeImageByRank(entry.rank) : null}
                      placeholderText={entry.rank ? registerBadgeRankLabel(entry.rank) : "?"}
                      isImageBroken={isImageBroken}
                      onImageError={() =>
                        setBadgeImageErrorMap((prev) => ({
                          ...prev,
                          [imageKey]: true,
                        }))
                      }
                      isOwned={Boolean(entry.rank)}
                      acquiredText="かくとくずみ"
                      missingText="このきゅう・しゅもくで あそんで かくとくしよう"
                      containerClassName="rounded-lg border border-amber-200 bg-white/85 p-3"
                    />
                  );
                })}
              </div>
            </section>
          </div>
        </section>
      </div>
    </SceneFrame>
  );
}
