import type { ExamBody, Grade, Subject } from "@/domain/specs/types";
import { getAvailableGrades, getGradeSpec } from "@/domain/specs/kenteiSpec";
import type { PracticeMode } from "@/features/practice/types";
import { toBestGameBadgeIds } from "@/features/soroban/registerBadges";
import {
  ALL_SHELF_IDS,
  DEFAULT_SHELF_ID,
  isShelfId,
  type ShelfId,
} from "@/features/soroban/shelfCatalog";
import {
  STICKER_PAGE_COUNT,
  isStickerId,
  normalizeStickerId,
} from "@/features/soroban/stickerCatalog";

export const SOROBAN_STORAGE_KEY = "learning-arcade:soroban-state";
const SHOP_LAST_OPENED_ON_FALLBACK = "2026-02-27";
const GACHA_LAST_OPENED_ON_FALLBACK = "2026-05-06";
const REGISTER_EXAM_BODY: ExamBody = "zenshugakuren";
const REGISTER_GRADE_ORDER: Grade[] = [
  ...getAvailableGrades(REGISTER_EXAM_BODY),
].sort((a, b) => b - a);
const REGISTER_START_GRADE: Grade = REGISTER_GRADE_ORDER[0] ?? 8;
const REGISTER_CORE_SUBJECT_ORDER = ["mitori", "mul", "div"] as const;
const REGISTER_SUBJECT_ORDER = [
  ...REGISTER_CORE_SUBJECT_ORDER,
  "mentalMitori",
  "mentalMul",
  "mentalDiv",
] as const;

export type RegisterSubject = (typeof REGISTER_SUBJECT_ORDER)[number];
export type RegisterStage = 1 | 2 | 3 | 4 | 5 | 6;
type ClearedStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PracticeConfig = {
  grade: Grade;
  subject: Subject;
  examBody: ExamBody;
  mode: PracticeMode;
  sets: number;
  showAnswers: boolean;
};

export type StickerPlacement = {
  instanceId: string;
  stickerId: string;
  pageIndex: number;
  x: number;
  y: number;
  rotation: number;
};

export type RegisterProgress = {
  coins: number;
  purchasedItemIds: string[];
  badgeIds: string[];
  ownedStickerCounts: Record<string, number>;
  stickerPlacements: StickerPlacement[];
  activeShelfId: ShelfId;
  shelfLayouts: Partial<Record<ShelfId, Array<string | null>>>;
  shelfRows: number;
  shelfCols: number;
  shelfSlots: Array<string | null>;
  unlockedGrades: Grade[];
  unlockedStageByGrade: Partial<Record<Grade, number>>;
  stageClearByGradeSubject: Partial<
    Record<Grade, Partial<Record<RegisterSubject, ClearedStage>>>
  >;
};

export type RegisterPlayConfig = {
  grade: Grade;
  subject: RegisterSubject;
  stage: RegisterStage;
  readingSpeed: number;
};

export type EnglishWordProgress = {
  unlockedStage: number;
  clearedStages: Record<number, boolean>;
};

export type EnglishWordPlayConfig = {
  stage: number;
};

export type ProblemLogResult = "correct" | "wrong";

export type ProblemLogEntry = {
  id: string;
  answeredOn: string;
  grade: Grade;
  subject: RegisterSubject;
  stage: RegisterStage;
  isReview: boolean;
  result: ProblemLogResult;
  wrongAttemptCount: number;
};

type SorobanSaveData = {
  practiceConfig: PracticeConfig;
  registerProgress: RegisterProgress;
  registerPlayConfig: RegisterPlayConfig;
  englishWordProgress: EnglishWordProgress;
  englishWordPlayConfig: EnglishWordPlayConfig;
  shopLastOpenedOn: string | null;
  gachaLastOpenedOn: string | null;
  problemLogs: ProblemLogEntry[];
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
  badgeIds: [],
  ownedStickerCounts: {},
  stickerPlacements: [],
  activeShelfId: DEFAULT_SHELF_ID,
  shelfLayouts: { [DEFAULT_SHELF_ID]: Array.from({ length: 8 }, () => null) },
  shelfRows: 2,
  shelfCols: 4,
  shelfSlots: Array.from({ length: 8 }, () => null),
  unlockedGrades: [REGISTER_START_GRADE],
  unlockedStageByGrade: { [REGISTER_START_GRADE]: 0 },
  stageClearByGradeSubject: {},
};

export const DEFAULT_REGISTER_PLAY_CONFIG: RegisterPlayConfig = {
  grade: REGISTER_START_GRADE,
  subject: "mitori",
  stage: 1,
  readingSpeed: 1,
};

export const DEFAULT_ENGLISH_WORD_PROGRESS: EnglishWordProgress = {
  unlockedStage: 1,
  clearedStages: {},
};

export const DEFAULT_ENGLISH_WORD_PLAY_CONFIG: EnglishWordPlayConfig = {
  stage: 1,
};

function normalizeReadingSpeed(value: unknown): number {
  const speed = Number(value);
  if (
    speed === 0.5 ||
    speed === 1 ||
    speed === 1.5 ||
    speed === 2 ||
    speed === 5 ||
    speed === 10
  ) {
    return speed;
  }
  return DEFAULT_REGISTER_PLAY_CONFIG.readingSpeed;
}

function normalizePracticeConfig(
  input: Partial<PracticeConfig> | undefined,
): PracticeConfig {
  const examBody =
    input?.examBody === "zenshuren" || input?.examBody === "zenshugakuren"
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
    if (next === "mentalMul" && gradeSpec?.mentalMul) return next;
    if (next === "mentalDiv" && gradeSpec?.mentalDiv) return next;
    if (next === "mentalMitori" && gradeSpec?.mentalMitori) return next;
    if (next === "denpyo" && hasDenpyo) return next;
    return "mitori";
  })();

  const mode = input?.mode === "one-by-one" ? "one-by-one" : "test";
  const sets = Math.max(
    1,
    Math.min(10, Math.floor(input?.sets ?? DEFAULT_PRACTICE_CONFIG.sets)),
  );

  return {
    examBody,
    grade,
    subject,
    mode,
    sets,
    showAnswers: Boolean(input?.showAnswers),
  };
}

function normalizeRegisterProgress(
  input: Partial<RegisterProgress> | undefined,
): RegisterProgress {
  const rows = Math.max(
    1,
    Math.floor(input?.shelfRows ?? DEFAULT_REGISTER_PROGRESS.shelfRows),
  );
  const cols = Math.max(
    1,
    Math.floor(input?.shelfCols ?? DEFAULT_REGISTER_PROGRESS.shelfCols),
  );
  const size = rows * cols;
  const unlockedGradesInput = Array.isArray(input?.unlockedGrades)
    ? input.unlockedGrades
    : [];
  const unlockedGrades = REGISTER_GRADE_ORDER.filter((grade) =>
    unlockedGradesInput.includes(grade),
  );
  if (unlockedGrades.length === 0) unlockedGrades.push(REGISTER_START_GRADE);

  const stageInput = input?.unlockedStageByGrade ?? {};
  const unlockedStageByGrade: Partial<Record<Grade, number>> = {};
  unlockedGrades.forEach((grade) => {
    const raw = stageInput[grade];
    const stage = Number.isFinite(raw)
      ? Number(raw)
      : grade === REGISTER_START_GRADE
        ? 0
        : 2;
    unlockedStageByGrade[grade] = Math.max(0, Math.min(2, Math.floor(stage)));
  });

  const stageClearInput = input?.stageClearByGradeSubject ?? {};
  const stageClearByGradeSubject: Partial<
    Record<Grade, Partial<Record<RegisterSubject, ClearedStage>>>
  > = {};
  REGISTER_GRADE_ORDER.forEach((grade) => {
    const subjectMap = stageClearInput[grade];
    if (!subjectMap) return;
    const next: Partial<Record<RegisterSubject, ClearedStage>> = {};
    REGISTER_SUBJECT_ORDER.forEach((subject) => {
      const raw = subjectMap[subject];
      const value = Number.isFinite(raw) ? Number(raw) : 0;
      next[subject] = Math.max(
        0,
        Math.min(6, Math.floor(value)),
      ) as ClearedStage;
    });
    stageClearByGradeSubject[grade] = next;
  });

  const shelfLayoutsInput =
    input?.shelfLayouts && typeof input.shelfLayouts === "object"
      ? input.shelfLayouts
      : {};
  const normalizeSlots = (slots: unknown): Array<string | null> => {
    const source = Array.isArray(slots) ? slots : [];
    return Array.from({ length: size }, (_, idx) => {
      const id = source[idx];
      return typeof id === "string" ? id : null;
    });
  };
  const legacySlots = normalizeSlots(input?.shelfSlots);
  const shelfLayouts: Partial<Record<ShelfId, Array<string | null>>> = {};
  ALL_SHELF_IDS.forEach((shelfId) => {
    if (shelfId === DEFAULT_SHELF_ID) {
      shelfLayouts[shelfId] = normalizeSlots(
        shelfLayoutsInput[shelfId] ?? legacySlots,
      );
      return;
    }
    shelfLayouts[shelfId] = normalizeSlots(shelfLayoutsInput[shelfId]);
  });
  const requestedActiveShelf = isShelfId(input?.activeShelfId)
    ? input.activeShelfId
    : DEFAULT_SHELF_ID;
  const activeShelfId = shelfLayouts[requestedActiveShelf]
    ? requestedActiveShelf
    : DEFAULT_SHELF_ID;
  const activeShelfSlots =
    shelfLayouts[activeShelfId] ??
    shelfLayouts[DEFAULT_SHELF_ID] ??
    legacySlots;
  const ownedStickerCounts = normalizeStickerCounts(
    input?.ownedStickerCounts,
  );
  const stickerPlacements = normalizeStickerPlacements(
    input?.stickerPlacements,
    ownedStickerCounts,
  );

  return {
    coins: Math.max(
      0,
      Math.floor(input?.coins ?? DEFAULT_REGISTER_PROGRESS.coins),
    ),
    purchasedItemIds: Array.from(
      new Set(
        (input?.purchasedItemIds ?? []).filter(
          (id): id is string => typeof id === "string",
        ),
      ),
    ),
    badgeIds: toBestGameBadgeIds(
      Array.from(
        new Set(
          (input?.badgeIds ?? []).filter(
            (id): id is string => typeof id === "string",
          ),
        ),
      ),
    ),
    ownedStickerCounts,
    stickerPlacements,
    activeShelfId,
    shelfLayouts,
    shelfRows: rows,
    shelfCols: cols,
    shelfSlots: activeShelfSlots,
    unlockedGrades,
    unlockedStageByGrade,
    stageClearByGradeSubject,
  };
}

function normalizeStickerCounts(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const counts: Record<string, number> = {};
  Object.entries(value as Record<string, unknown>).forEach(
    ([rawStickerId, rawCount]) => {
      const stickerId = normalizeStickerId(rawStickerId);
      if (!stickerId) return;
      const count = Math.max(0, Math.floor(Number(rawCount)));
      if (count > 0) counts[stickerId] = (counts[stickerId] ?? 0) + count;
    },
  );
  return counts;
}

function normalizeStickerRotation(value: unknown): number {
  const rotation = Number(value);
  if (!Number.isFinite(rotation)) return 0;
  return Math.max(-180, Math.min(180, Math.round(rotation)));
}

function normalizeStickerPlacements(
  value: unknown,
  ownedStickerCounts: Record<string, number>,
): StickerPlacement[] {
  if (!Array.isArray(value)) return [];
  const usedInstanceIds = new Set<string>();
  const placedCountByStickerId: Record<string, number> = {};
  const placements: StickerPlacement[] = [];

  value.forEach((rawPlacement, index) => {
    if (!rawPlacement || typeof rawPlacement !== "object") return;
    const placement = rawPlacement as Partial<StickerPlacement>;
    const rawStickerId = placement.stickerId;
    if (typeof rawStickerId !== "string" || !isStickerId(rawStickerId)) return;
    const stickerId = normalizeStickerId(rawStickerId);
    if (!stickerId) return;
    const ownedCount = ownedStickerCounts[stickerId] ?? 0;
    const placedCount = placedCountByStickerId[stickerId] ?? 0;
    if (placedCount >= ownedCount) return;

    const pageIndex = Math.floor(Number(placement.pageIndex));
    if (pageIndex < 0 || pageIndex >= STICKER_PAGE_COUNT) return;
    const x = Number(placement.x);
    const y = Number(placement.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    const rawInstanceId =
      typeof placement.instanceId === "string" &&
      placement.instanceId.length > 0
        ? placement.instanceId
        : `${stickerId}-${index}`;
    const instanceId = usedInstanceIds.has(rawInstanceId)
      ? `${rawInstanceId}-${index}`
      : rawInstanceId;
    usedInstanceIds.add(instanceId);
    placedCountByStickerId[stickerId] = placedCount + 1;
    placements.push({
      instanceId,
      stickerId,
      pageIndex,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      rotation: normalizeStickerRotation(placement.rotation),
    });
  });

  return placements;
}

function normalizeRegisterPlayConfig(
  input: Partial<RegisterPlayConfig> | undefined,
): RegisterPlayConfig {
  const grade = REGISTER_GRADE_ORDER.includes(input?.grade as Grade)
    ? (input?.grade as Grade)
    : DEFAULT_REGISTER_PLAY_CONFIG.grade;
  const subject =
    input?.subject === "mitori" ||
    input?.subject === "mul" ||
    input?.subject === "div" ||
    input?.subject === "mentalMitori" ||
    input?.subject === "mentalMul" ||
    input?.subject === "mentalDiv"
      ? input.subject
      : DEFAULT_REGISTER_PLAY_CONFIG.subject;
  const stage = input?.stage;
  const normalizedStage =
    stage === 1 ||
    stage === 2 ||
    stage === 3 ||
    stage === 4 ||
    stage === 5 ||
    stage === 6
      ? stage
      : 1;
  return {
    grade,
    subject,
    stage: normalizedStage,
    readingSpeed: normalizeReadingSpeed(input?.readingSpeed),
  };
}

function normalizeEnglishWordProgress(
  input: Partial<EnglishWordProgress> | undefined,
): EnglishWordProgress {
  const rawUnlockedStage = Number(input?.unlockedStage ?? DEFAULT_ENGLISH_WORD_PROGRESS.unlockedStage);
  const unlockedStage = Number.isFinite(rawUnlockedStage)
    ? Math.max(1, Math.floor(rawUnlockedStage))
    : DEFAULT_ENGLISH_WORD_PROGRESS.unlockedStage;
  const clearedStagesInput =
    input?.clearedStages && typeof input.clearedStages === "object" && !Array.isArray(input.clearedStages)
      ? input.clearedStages
      : {};
  const clearedStages: Record<number, boolean> = {};
  Object.entries(clearedStagesInput as Record<string, unknown>).forEach(([rawStage, cleared]) => {
    const rawStageNumber = Number(rawStage);
    const stage = Number.isFinite(rawStageNumber) ? Math.max(1, Math.floor(rawStageNumber)) : null;
    if (stage != null && cleared === true) clearedStages[stage] = true;
  });
  return { unlockedStage, clearedStages };
}

function normalizeEnglishWordPlayConfig(
  input: Partial<EnglishWordPlayConfig> | undefined,
): EnglishWordPlayConfig {
  const rawStage = Number(input?.stage ?? DEFAULT_ENGLISH_WORD_PLAY_CONFIG.stage);
  return {
    stage: Number.isFinite(rawStage) ? Math.max(1, Math.floor(rawStage)) : DEFAULT_ENGLISH_WORD_PLAY_CONFIG.stage,
  };
}

function normalizeDateOnly(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function formatLocalDateOnly(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

function problemLogCutoffDate(now = new Date()): string {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 179);
  return formatLocalDateOnly(cutoff);
}

function normalizeRegisterStage(value: unknown): RegisterStage | null {
  return value === 1 ||
    value === 2 ||
    value === 3 ||
    value === 4 ||
    value === 5 ||
    value === 6
    ? value
    : null;
}

function normalizeRegisterSubject(value: unknown): RegisterSubject | null {
  return value === "mitori" ||
    value === "mul" ||
    value === "div" ||
    value === "mentalMitori" ||
    value === "mentalMul" ||
    value === "mentalDiv"
    ? value
    : null;
}

function normalizeProblemLogs(value: unknown): ProblemLogEntry[] {
  if (!Array.isArray(value)) return [];
  const cutoff = problemLogCutoffDate();
  const entries: ProblemLogEntry[] = [];
  const usedIds = new Set<string>();

  value.forEach((rawEntry, index) => {
    if (!rawEntry || typeof rawEntry !== "object") return;
    const entry = rawEntry as Partial<ProblemLogEntry>;
    const answeredOn = normalizeDateOnly(entry.answeredOn);
    if (!answeredOn || answeredOn < cutoff) return;
    const availableGrades = getAvailableGrades(REGISTER_EXAM_BODY);
    const grade = availableGrades.includes(entry.grade as Grade)
      ? (entry.grade as Grade)
      : null;
    if (grade == null) return;
    const subject = normalizeRegisterSubject(entry.subject);
    if (!subject) return;
    const stage = normalizeRegisterStage(entry.stage);
    if (!stage) return;
    const result =
      entry.result === "correct" || entry.result === "wrong"
        ? entry.result
        : null;
    if (!result) return;
    const rawId =
      typeof entry.id === "string" && entry.id.length > 0
        ? entry.id
        : `${answeredOn}-${index}`;
    const id = usedIds.has(rawId) ? `${rawId}-${index}` : rawId;
    usedIds.add(id);
    entries.push({
      id,
      answeredOn,
      grade,
      subject,
      stage,
      isReview: Boolean(entry.isReview),
      result,
      wrongAttemptCount: Math.max(
        0,
        Math.floor(Number(entry.wrongAttemptCount ?? 0)),
      ),
    });
  });

  return entries.sort((a, b) =>
    a.answeredOn === b.answeredOn
      ? a.id.localeCompare(b.id)
      : a.answeredOn.localeCompare(b.answeredOn),
  );
}

function defaultSaveData(): SorobanSaveData {
  return {
    practiceConfig: DEFAULT_PRACTICE_CONFIG,
    registerProgress: DEFAULT_REGISTER_PROGRESS,
    registerPlayConfig: DEFAULT_REGISTER_PLAY_CONFIG,
    englishWordProgress: DEFAULT_ENGLISH_WORD_PROGRESS,
    englishWordPlayConfig: DEFAULT_ENGLISH_WORD_PLAY_CONFIG,
    shopLastOpenedOn: null,
    gachaLastOpenedOn: null,
    problemLogs: [],
  };
}

function readAll(): SorobanSaveData {
  if (typeof window === "undefined") {
    return defaultSaveData();
  }

  try {
    const raw = window.localStorage.getItem(SOROBAN_STORAGE_KEY);
    if (!raw) {
      return defaultSaveData();
    }
    const parsed = JSON.parse(raw) as Partial<SorobanSaveData> & {
      shopFirstOpenedOn?: unknown;
    };
    return {
      practiceConfig: normalizePracticeConfig(parsed.practiceConfig),
      registerProgress: normalizeRegisterProgress(parsed.registerProgress),
      registerPlayConfig: normalizeRegisterPlayConfig(
        parsed.registerPlayConfig,
      ),
      englishWordProgress: normalizeEnglishWordProgress(parsed.englishWordProgress),
      englishWordPlayConfig: normalizeEnglishWordPlayConfig(parsed.englishWordPlayConfig),
      shopLastOpenedOn: normalizeDateOnly(
        parsed.shopLastOpenedOn ?? parsed.shopFirstOpenedOn,
      ),
      gachaLastOpenedOn: normalizeDateOnly(parsed.gachaLastOpenedOn),
      problemLogs: normalizeProblemLogs(parsed.problemLogs),
    };
  } catch {
    return defaultSaveData();
  }
}

function writeAll(data: SorobanSaveData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SOROBAN_STORAGE_KEY, JSON.stringify(data));
}

export function loadPracticeConfig(): PracticeConfig {
  return readAll().practiceConfig;
}

export function savePracticeConfig(
  input: Partial<PracticeConfig>,
): PracticeConfig {
  const current = readAll();
  const next = normalizePracticeConfig({ ...current.practiceConfig, ...input });
  writeAll({ ...current, practiceConfig: next });
  return next;
}

export function loadRegisterProgress(): RegisterProgress {
  return readAll().registerProgress;
}

export function saveRegisterProgress(
  input: Partial<RegisterProgress>,
): RegisterProgress {
  const current = readAll();
  const next = normalizeRegisterProgress({
    ...current.registerProgress,
    ...input,
  });
  writeAll({ ...current, registerProgress: next });
  return next;
}

export function loadRegisterPlayConfig(): RegisterPlayConfig {
  return readAll().registerPlayConfig;
}

export function saveRegisterPlayConfig(
  input: Partial<RegisterPlayConfig>,
): RegisterPlayConfig {
  const current = readAll();
  const next = normalizeRegisterPlayConfig({
    ...current.registerPlayConfig,
    ...input,
  });
  writeAll({ ...current, registerPlayConfig: next });
  return next;
}

export function loadEnglishWordProgress(): EnglishWordProgress {
  return readAll().englishWordProgress;
}

export function saveEnglishWordProgress(
  input: Partial<EnglishWordProgress>,
): EnglishWordProgress {
  const current = readAll();
  const next = normalizeEnglishWordProgress({
    ...current.englishWordProgress,
    ...input,
  });
  writeAll({ ...current, englishWordProgress: next });
  return next;
}

export function loadEnglishWordPlayConfig(): EnglishWordPlayConfig {
  return readAll().englishWordPlayConfig;
}

export function saveEnglishWordPlayConfig(
  input: Partial<EnglishWordPlayConfig>,
): EnglishWordPlayConfig {
  const current = readAll();
  const next = normalizeEnglishWordPlayConfig({
    ...current.englishWordPlayConfig,
    ...input,
  });
  writeAll({ ...current, englishWordPlayConfig: next });
  return next;
}

export function loadShopLastOpenedOn(): string {
  return readAll().shopLastOpenedOn ?? SHOP_LAST_OPENED_ON_FALLBACK;
}

export function saveShopLastOpenedOn(dateOn: string): string | null {
  const current = readAll();
  const normalized = normalizeDateOnly(dateOn);
  if (!normalized) return current.shopLastOpenedOn;
  writeAll({ ...current, shopLastOpenedOn: normalized });
  return normalized;
}

export function loadGachaLastOpenedOn(): string {
  return readAll().gachaLastOpenedOn ?? GACHA_LAST_OPENED_ON_FALLBACK;
}

export function saveGachaLastOpenedOn(dateOn: string): string | null {
  const current = readAll();
  const normalized = normalizeDateOnly(dateOn);
  if (!normalized) return current.gachaLastOpenedOn;
  writeAll({ ...current, gachaLastOpenedOn: normalized });
  return normalized;
}

export function loadProblemLogs(): ProblemLogEntry[] {
  return readAll().problemLogs;
}

export function appendProblemLog(input: {
  grade: Grade;
  subject: RegisterSubject;
  stage: RegisterStage;
  isReview: boolean;
  result: ProblemLogResult;
  wrongAttemptCount: number;
}): ProblemLogEntry | null {
  const current = readAll();
  const now = new Date();
  const entry: ProblemLogEntry = {
    id: `problem-log:${now.getTime()}:${Math.random().toString(36).slice(2, 9)}`,
    answeredOn: formatLocalDateOnly(now),
    grade: input.grade,
    subject: input.subject,
    stage: input.stage,
    isReview: input.isReview,
    result: input.result,
    wrongAttemptCount: Math.max(0, Math.floor(input.wrongAttemptCount)),
  };
  const nextLogs = normalizeProblemLogs([...current.problemLogs, entry]);
  const saved = nextLogs.find((log) => log.id === entry.id) ?? null;
  writeAll({ ...current, problemLogs: nextLogs });
  return saved;
}

function stageFromSubject(subject: RegisterSubject): number {
  return REGISTER_CORE_SUBJECT_ORDER.indexOf(
    subject as (typeof REGISTER_CORE_SUBJECT_ORDER)[number],
  );
}

export function getRegisterGradeOrder(): Grade[] {
  return [...REGISTER_GRADE_ORDER];
}

export function getRegisterUnlockedGrades(progress: RegisterProgress): Grade[] {
  return REGISTER_GRADE_ORDER.filter((grade) =>
    progress.unlockedGrades.includes(grade),
  );
}

export function getRegisterUnlockedSubjects(
  progress: RegisterProgress,
  grade: Grade,
): RegisterSubject[] {
  const stage = Math.max(
    0,
    Math.min(2, Math.floor(progress.unlockedStageByGrade[grade] ?? 0)),
  );
  const gradeSpec = getGradeSpec(REGISTER_EXAM_BODY, grade);
  const mentalSubjects: RegisterSubject[] = [];
  if (stage >= 2) {
    if (gradeSpec?.mentalMitori) mentalSubjects.push("mentalMitori");
    if (gradeSpec?.mentalMul) mentalSubjects.push("mentalMul");
    if (gradeSpec?.mentalDiv) mentalSubjects.push("mentalDiv");
  }
  return [
    ...REGISTER_CORE_SUBJECT_ORDER.slice(0, stage + 1),
    ...mentalSubjects,
  ];
}

export function clampRegisterSelection(
  progress: RegisterProgress,
  grade: Grade,
  subject: RegisterSubject,
): { grade: Grade; subject: RegisterSubject } {
  const unlockedGrades = getRegisterUnlockedGrades(progress);
  const nextGrade = unlockedGrades.includes(grade)
    ? grade
    : (unlockedGrades[0] ?? REGISTER_START_GRADE);
  const unlockedSubjects = getRegisterUnlockedSubjects(progress, nextGrade);
  const nextSubject = unlockedSubjects.includes(subject)
    ? subject
    : unlockedSubjects[0];
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

  const currentStage = Math.max(
    0,
    Math.min(2, Math.floor(normalized.unlockedStageByGrade[grade] ?? 0)),
  );
  const playedStage = stageFromSubject(subject);
  if (playedStage < 0) return normalized;
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

export function getClearedStage(
  progress: RegisterProgress,
  grade: Grade,
  subject: RegisterSubject,
): ClearedStage {
  const normalized = normalizeRegisterProgress(progress);
  return normalized.stageClearByGradeSubject[grade]?.[subject] ?? 0;
}

export function canPlayStage(
  progress: RegisterProgress,
  grade: Grade,
  subject: RegisterSubject,
  stage: RegisterStage,
): boolean {
  const selection = clampRegisterSelection(progress, grade, subject);
  if (selection.grade !== grade || selection.subject !== subject) return false;
  if (stage === 1) return true;
  const cleared = getClearedStage(progress, grade, subject);
  return cleared >= stage - 1;
}

export function markStageCleared(
  progress: RegisterProgress,
  grade: Grade,
  subject: RegisterSubject,
  stage: RegisterStage,
): RegisterProgress {
  const normalized = normalizeRegisterProgress(progress);
  const current = getClearedStage(normalized, grade, subject);
  const nextStage = Math.max(current, stage) as ClearedStage;
  const nextByGrade = { ...(normalized.stageClearByGradeSubject[grade] ?? {}) };
  nextByGrade[subject] = nextStage;
  const next: RegisterProgress = {
    ...normalized,
    stageClearByGradeSubject: {
      ...normalized.stageClearByGradeSubject,
      [grade]: nextByGrade,
    },
  };
  return normalizeRegisterProgress(next);
}
