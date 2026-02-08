import type { ExamBody, Grade, Subject } from "../../domain/specs/types";
import { getAvailableGrades, getGradeSpec } from "../../domain/specs/kenteiSpec";
import type { PracticeMode } from "../practice/types";

const STORAGE_KEY = "learning-arcade:soroban-state";
const REGISTER_EXAM_BODY: ExamBody = "zenshugakuren";
const REGISTER_GRADE_ORDER: Grade[] = [...getAvailableGrades(REGISTER_EXAM_BODY)].sort((a, b) => b - a);
const REGISTER_START_GRADE: Grade = REGISTER_GRADE_ORDER[0] ?? 8;
const REGISTER_SUBJECT_ORDER = ["mitori", "mul", "div"] as const;

export type RegisterSubject = typeof REGISTER_SUBJECT_ORDER[number];

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
  unlockedGrades: Grade[];
  unlockedStageByGrade: Partial<Record<Grade, number>>;
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
  unlockedGrades: [REGISTER_START_GRADE],
  unlockedStageByGrade: { [REGISTER_START_GRADE]: 0 },
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
  const unlockedGradesInput = Array.isArray(input?.unlockedGrades) ? input.unlockedGrades : [];
  const unlockedGrades = REGISTER_GRADE_ORDER.filter((grade) => unlockedGradesInput.includes(grade));
  if (unlockedGrades.length === 0) unlockedGrades.push(REGISTER_START_GRADE);

  const stageInput = input?.unlockedStageByGrade ?? {};
  const unlockedStageByGrade: Partial<Record<Grade, number>> = {};
  unlockedGrades.forEach((grade) => {
    const raw = stageInput[grade];
    const stage = Number.isFinite(raw) ? Number(raw) : (grade === REGISTER_START_GRADE ? 0 : 2);
    unlockedStageByGrade[grade] = Math.max(0, Math.min(2, Math.floor(stage)));
  });

  return {
    coins: Math.max(0, Math.floor(input?.coins ?? DEFAULT_REGISTER_PROGRESS.coins)),
    purchasedItemIds: Array.from(new Set((input?.purchasedItemIds ?? []).filter((id): id is string => typeof id === "string"))),
    shelfRows: rows,
    shelfCols: cols,
    shelfSlots: Array.from({ length: size }, (_, idx) => {
      const id = slotsInput[idx];
      return typeof id === "string" ? id : null;
    }),
    unlockedGrades,
    unlockedStageByGrade,
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

function stageFromSubject(subject: RegisterSubject): number {
  return REGISTER_SUBJECT_ORDER.indexOf(subject);
}

export function getRegisterGradeOrder(): Grade[] {
  return [...REGISTER_GRADE_ORDER];
}

export function getRegisterUnlockedGrades(progress: RegisterProgress): Grade[] {
  return REGISTER_GRADE_ORDER.filter((grade) => progress.unlockedGrades.includes(grade));
}

export function getRegisterUnlockedSubjects(progress: RegisterProgress, grade: Grade): RegisterSubject[] {
  const stage = Math.max(0, Math.min(2, Math.floor(progress.unlockedStageByGrade[grade] ?? 0)));
  return REGISTER_SUBJECT_ORDER.slice(0, stage + 1);
}

export function clampRegisterSelection(progress: RegisterProgress, grade: Grade, subject: RegisterSubject): { grade: Grade; subject: RegisterSubject } {
  const unlockedGrades = getRegisterUnlockedGrades(progress);
  const nextGrade = unlockedGrades.includes(grade) ? grade : (unlockedGrades[0] ?? REGISTER_START_GRADE);
  const unlockedSubjects = getRegisterUnlockedSubjects(progress, nextGrade);
  const nextSubject = unlockedSubjects.includes(subject) ? subject : unlockedSubjects[0];
  return { grade: nextGrade, subject: nextSubject };
}

export function advanceRegisterProgressOnClear(
  progress: RegisterProgress,
  grade: Grade,
  subject: RegisterSubject,
): RegisterProgress {
  const normalized = normalizeRegisterProgress(progress);
  const unlockedGrades = getRegisterUnlockedGrades(normalized);
  if (!unlockedGrades.includes(grade)) return normalized;

  const currentStage = Math.max(0, Math.min(2, Math.floor(normalized.unlockedStageByGrade[grade] ?? 0)));
  const playedStage = stageFromSubject(subject);
  if (playedStage !== currentStage) return normalized;

  const next: RegisterProgress = {
    ...normalized,
    unlockedStageByGrade: { ...normalized.unlockedStageByGrade },
    unlockedGrades: [...normalized.unlockedGrades],
  };

  if (playedStage < 2) {
    next.unlockedStageByGrade[grade] = playedStage + 1;
    return normalizeRegisterProgress(next);
  }

  const order = getRegisterGradeOrder();
  const idx = order.indexOf(grade);
  const nextGrade = idx >= 0 ? order[idx + 1] : undefined;
  if (nextGrade != null && !next.unlockedGrades.includes(nextGrade)) {
    next.unlockedGrades.push(nextGrade);
    next.unlockedStageByGrade[nextGrade] = 0;
  }
  return normalizeRegisterProgress(next);
}
