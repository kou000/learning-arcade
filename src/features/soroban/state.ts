import type { ExamBody, Grade, Subject } from "../../domain/specs/types";
import { getAvailableGrades, getGradeSpec } from "../../domain/specs/kenteiSpec";
import type { PracticeMode } from "../practice/types";

const STORAGE_KEY = "learning-arcade:soroban-state";

export type PracticeConfig = {
  grade: Grade;
  subject: Subject;
  examBody: ExamBody;
  mode: PracticeMode;
  sets: number;
  showAnswers: boolean;
};

export type RegisterProgress = {
  coins: number;
  purchasedItemIds: string[];
  shelfRows: number;
  shelfCols: number;
  shelfSlots: Array<string | null>;
};

type SorobanSaveData = {
  practiceConfig: PracticeConfig;
  registerProgress: RegisterProgress;
};

export const DEFAULT_PRACTICE_CONFIG: PracticeConfig = {
  grade: 7,
  subject: "mitori",
  examBody: "zenshugakuren",
  mode: "test",
  sets: 1,
  showAnswers: false,
};

export const DEFAULT_REGISTER_PROGRESS: RegisterProgress = {
  coins: 0,
  purchasedItemIds: [],
  shelfRows: 2,
  shelfCols: 4,
  shelfSlots: Array.from({ length: 8 }, () => null),
};

function normalizePracticeConfig(input: Partial<PracticeConfig> | undefined): PracticeConfig {
  const examBody = input?.examBody === "zenshuren" || input?.examBody === "zenshugakuren"
    ? input.examBody
    : DEFAULT_PRACTICE_CONFIG.examBody;

  const availableGrades = getAvailableGrades(examBody);
  const grade = availableGrades.includes(input?.grade as Grade)
    ? (input?.grade as Grade)
    : (availableGrades[0] ?? DEFAULT_PRACTICE_CONFIG.grade);

  const gradeSpec = getGradeSpec(examBody, grade);
  const hasDenpyo = Boolean(gradeSpec?.denpyo);
  const subject = (() => {
    const next = input?.subject;
    if (next === "mul" || next === "div" || next === "mitori") return next;
    if (next === "denpyo" && hasDenpyo) return next;
    return "mitori";
  })();

  const mode = input?.mode === "one-by-one" ? "one-by-one" : "test";
  const sets = Math.max(1, Math.min(10, Math.floor(input?.sets ?? DEFAULT_PRACTICE_CONFIG.sets)));

  return {
    examBody,
    grade,
    subject,
    mode,
    sets,
    showAnswers: Boolean(input?.showAnswers),
  };
}

function normalizeRegisterProgress(input: Partial<RegisterProgress> | undefined): RegisterProgress {
  const rows = Math.max(1, Math.floor(input?.shelfRows ?? DEFAULT_REGISTER_PROGRESS.shelfRows));
  const cols = Math.max(1, Math.floor(input?.shelfCols ?? DEFAULT_REGISTER_PROGRESS.shelfCols));
  const size = rows * cols;
  const slotsInput = Array.isArray(input?.shelfSlots) ? input?.shelfSlots : [];

  return {
    coins: Math.max(0, Math.floor(input?.coins ?? DEFAULT_REGISTER_PROGRESS.coins)),
    purchasedItemIds: Array.from(new Set((input?.purchasedItemIds ?? []).filter((id): id is string => typeof id === "string"))),
    shelfRows: rows,
    shelfCols: cols,
    shelfSlots: Array.from({ length: size }, (_, idx) => {
      const id = slotsInput[idx];
      return typeof id === "string" ? id : null;
    }),
  };
}

function readAll(): SorobanSaveData {
  if (typeof window === "undefined") {
    return {
      practiceConfig: DEFAULT_PRACTICE_CONFIG,
      registerProgress: DEFAULT_REGISTER_PROGRESS,
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        practiceConfig: DEFAULT_PRACTICE_CONFIG,
        registerProgress: DEFAULT_REGISTER_PROGRESS,
      };
    }
    const parsed = JSON.parse(raw) as Partial<SorobanSaveData>;
    return {
      practiceConfig: normalizePracticeConfig(parsed.practiceConfig),
      registerProgress: normalizeRegisterProgress(parsed.registerProgress),
    };
  } catch {
    return {
      practiceConfig: DEFAULT_PRACTICE_CONFIG,
      registerProgress: DEFAULT_REGISTER_PROGRESS,
    };
  }
}

function writeAll(data: SorobanSaveData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadPracticeConfig(): PracticeConfig {
  return readAll().practiceConfig;
}

export function savePracticeConfig(input: Partial<PracticeConfig>): PracticeConfig {
  const current = readAll();
  const next = normalizePracticeConfig({ ...current.practiceConfig, ...input });
  writeAll({ ...current, practiceConfig: next });
  return next;
}

export function loadRegisterProgress(): RegisterProgress {
  return readAll().registerProgress;
}

export function saveRegisterProgress(input: Partial<RegisterProgress>): RegisterProgress {
  const current = readAll();
  const next = normalizeRegisterProgress({ ...current.registerProgress, ...input });
  writeAll({ ...current, registerProgress: next });
  return next;
}
