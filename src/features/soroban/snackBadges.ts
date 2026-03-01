export type SnackDifficulty = "easy" | "normal" | "hard";
export type SnackRank = "A" | "B" | "C" | "D" | "E" | "F";
export type SnackBadgeRank = "A" | "B" | "C";

const RANK_SCORE: Record<SnackRank, number> = {
  A: 6,
  B: 5,
  C: 4,
  D: 3,
  E: 2,
  F: 1,
};

const DIFFICULTY_ORDER: SnackDifficulty[] = ["easy", "normal", "hard"];

export function isSnackBadgeRank(rank: SnackRank): rank is SnackBadgeRank {
  return rank === "A" || rank === "B" || rank === "C";
}

export function difficultyLabel(difficulty: SnackDifficulty): string {
  if (difficulty === "hard") return "むずかしい";
  if (difficulty === "normal") return "ふつう";
  return "かんたん";
}

export function rankScore(rank: SnackRank): number {
  return RANK_SCORE[rank];
}

export function buildSnackBadgeId(
  difficulty: SnackDifficulty,
  rank: SnackRank,
): string {
  return `snack:${difficulty}:rank:${rank}`;
}

export function parseSnackBadgeId(
  badgeId: string,
): { difficulty: SnackDifficulty; rank: SnackRank } | null {
  const m = /^snack:(easy|normal|hard):rank:([A-F])$/.exec(badgeId);
  if (!m) return null;
  const difficulty = m[1];
  const rank = m[2];
  if (
    (difficulty === "easy" ||
      difficulty === "normal" ||
      difficulty === "hard") &&
    (rank === "A" ||
      rank === "B" ||
      rank === "C" ||
      rank === "D" ||
      rank === "E" ||
      rank === "F")
  ) {
    return { difficulty, rank };
  }
  return null;
}

export function toBestSnackBadgeIds(badgeIds: string[]): string[] {
  const bestByDifficulty: Partial<Record<SnackDifficulty, SnackBadgeRank>> = {};
  badgeIds.forEach((badgeId) => {
    const parsed = parseSnackBadgeId(badgeId);
    if (!parsed) return;
    if (!isSnackBadgeRank(parsed.rank)) return;
    const current = bestByDifficulty[parsed.difficulty];
    if (!current || rankScore(parsed.rank) > rankScore(current)) {
      bestByDifficulty[parsed.difficulty] = parsed.rank;
    }
  });
  return DIFFICULTY_ORDER.flatMap((difficulty) => {
    const rank = bestByDifficulty[difficulty];
    return rank ? [buildSnackBadgeId(difficulty, rank)] : [];
  });
}

export function getBestRankByDifficulty(
  badgeIds: string[],
): Partial<Record<SnackDifficulty, SnackBadgeRank>> {
  const best: Partial<Record<SnackDifficulty, SnackBadgeRank>> = {};
  toBestSnackBadgeIds(badgeIds).forEach((badgeId) => {
    const parsed = parseSnackBadgeId(badgeId);
    if (!parsed || !isSnackBadgeRank(parsed.rank)) return;
    best[parsed.difficulty] = parsed.rank;
  });
  return best;
}
