import { subjectMinutes } from "@/domain/generator";
import { getGradeSpec } from "@/domain/specs/kenteiSpec";
import type { Grade } from "@/domain/specs/types";
import type { RegisterStage, RegisterSubject } from "@/features/soroban/state";

const STAGE_ALPHA_SECONDS = 15;
const BASE_STAGE_QUESTION_COUNT: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 3,
  2: 3,
  3: 5,
  4: 7,
  5: 10,
};
const MITORI_STAGE_QUESTION_COUNT: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 2,
  2: 2,
  3: 3,
  4: 5,
  5: 7,
};

function questionCountFromSpec(grade: Grade, subject: RegisterSubject): number {
  const spec = getGradeSpec("zenshugakuren", grade);
  if (!spec) return 1;
  if (subject === "mitori") return Math.max(1, spec.mitori.count);
  if (subject === "mul") return Math.max(1, spec.mul.count);
  if (subject === "div") return Math.max(1, spec.div.count);
  if (subject === "mentalMitori") return Math.max(1, spec.mentalMitori?.count ?? 1);
  if (subject === "mentalMul") return Math.max(1, spec.mentalMul?.count ?? 1);
  return Math.max(1, spec.mentalDiv?.count ?? 1);
}

export function stageQuestionCount(
  grade: Grade,
  subject: RegisterSubject,
  stage: RegisterStage,
): number {
  if (stage !== 6) {
    if (subject === "mitori" || subject === "mentalMitori") {
      return MITORI_STAGE_QUESTION_COUNT[stage];
    }
    return BASE_STAGE_QUESTION_COUNT[stage];
  }
  return questionCountFromSpec(grade, subject);
}

export function buildTimeLimitSeconds(
  grade: Grade,
  subject: RegisterSubject,
  stage: RegisterStage,
  questionCount: number,
): number | null {
  if (stage === 1) return null;
  const minutes = subjectMinutes(grade, subject, "zenshugakuren");
  const specCount = questionCountFromSpec(grade, subject);
  const perQ = Math.max(1, Math.ceil((minutes * 60) / specCount));
  if (stage === 2) return (perQ + STAGE_ALPHA_SECONDS) * questionCount;
  return perQ * questionCount;
}
