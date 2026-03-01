import type { Grade } from "@/domain/specs/types";
import {
  buildSnackBadgeId,
  parseSnackBadgeId,
  rankScore as snackRankScore,
  type SnackDifficulty,
  type SnackRank,
} from "@/features/soroban/snackBadges";

export type RegisterBadgeSubject = "mitori" | "mul" | "div";
export type RegisterBadgeRank = "bronze" | "silver" | "gold";

const REGISTER_BADGE_RANK_SCORE: Record<RegisterBadgeRank, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
};

function registerBadgeRankScore(rank: RegisterBadgeRank): number {
  return REGISTER_BADGE_RANK_SCORE[rank];
}

export function registerBadgeRankLabel(rank: RegisterBadgeRank): string {
  if (rank === "gold") return "ゴールド";
  if (rank === "silver") return "シルバー";
  return "ブロンズ";
}

export function buildRegisterBadgeId(
  grade: Grade,
  subject: RegisterBadgeSubject,
  rank: RegisterBadgeRank,
): string {
  return `register:g${grade}:${subject}:rank:${rank}`;
}

export function parseRegisterBadgeId(
  badgeId: string,
): { grade: Grade; subject: RegisterBadgeSubject; rank: RegisterBadgeRank } | null {
  const m = /^register:g(\d+):(mitori|mul|div):rank:(bronze|silver|gold)$/.exec(
    badgeId,
  );
  if (!m) return null;
  const grade = Number(m[1]);
  if (!Number.isFinite(grade)) return null;
  const subject = m[2];
  const rank = m[3];
  if (
    (subject === "mitori" || subject === "mul" || subject === "div") &&
    (rank === "bronze" || rank === "silver" || rank === "gold")
  ) {
    return { grade: grade as Grade, subject, rank };
  }
  return null;
}

export function toBestRegisterBadgeIds(badgeIds: string[]): string[] {
  const bestByKey: Record<string, RegisterBadgeRank> = {};
  badgeIds.forEach((badgeId) => {
    const parsed = parseRegisterBadgeId(badgeId);
    if (!parsed) return;
    const key = `${parsed.grade}:${parsed.subject}`;
    const current = bestByKey[key];
    if (!current || registerBadgeRankScore(parsed.rank) > registerBadgeRankScore(current)) {
      bestByKey[key] = parsed.rank;
    }
  });

  return Object.entries(bestByKey)
    .sort((a, b) => {
      const [gradeA, subjectA] = a[0].split(":");
      const [gradeB, subjectB] = b[0].split(":");
      const gA = Number(gradeA);
      const gB = Number(gradeB);
      if (gA !== gB) return gB - gA;
      return subjectA.localeCompare(subjectB);
    })
    .map(([key, rank]) => {
      const [grade, subject] = key.split(":");
      return buildRegisterBadgeId(
        Number(grade) as Grade,
        subject as RegisterBadgeSubject,
        rank,
      );
    });
}

export function getBestRegisterBadgeByKey(
  badgeIds: string[],
): Partial<Record<string, RegisterBadgeRank>> {
  const best: Partial<Record<string, RegisterBadgeRank>> = {};
  toBestRegisterBadgeIds(badgeIds).forEach((badgeId) => {
    const parsed = parseRegisterBadgeId(badgeId);
    if (!parsed) return;
    best[`${parsed.grade}:${parsed.subject}`] = parsed.rank;
  });
  return best;
}

export function toBestGameBadgeIds(badgeIds: string[]): string[] {
  const snackBestByDifficulty: Partial<Record<SnackDifficulty, SnackRank>> = {};
  const registerCandidates: string[] = [];

  badgeIds.forEach((badgeId) => {
    const snack = parseSnackBadgeId(badgeId);
    if (snack) {
      const current = snackBestByDifficulty[snack.difficulty];
      if (!current || snackRankScore(snack.rank) > snackRankScore(current)) {
        snackBestByDifficulty[snack.difficulty] = snack.rank;
      }
      return;
    }
    if (parseRegisterBadgeId(badgeId)) {
      registerCandidates.push(badgeId);
    }
  });

  const snackBadgeIds = (["easy", "normal", "hard"] as const).flatMap(
    (difficulty) => {
      const rank = snackBestByDifficulty[difficulty];
      return rank ? [buildSnackBadgeId(difficulty, rank)] : [];
    },
  );
  const registerBadgeIds = toBestRegisterBadgeIds(registerCandidates);
  return [...snackBadgeIds, ...registerBadgeIds];
}
