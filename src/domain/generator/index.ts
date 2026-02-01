import type { ExamBody, Grade, Subject } from "../specs/types";
import { getGradeSpec } from "../specs/kenteiSpec";
import type { Problem } from "./types";
import { generateMul } from "./mul";
import { generateDiv } from "./div";
import { generateMitori } from "./mitori";
import { generateDenpyo } from "./denpyo";

export function subjectLabel(subject: Subject): string {
  switch (subject) {
    case "mul": return "乗算";
    case "div": return "除算";
    case "mitori": return "見取算";
    case "denpyo": return "伝票算";
  }
}

export function generateProblems(grade: Grade, subject: Subject, examBody: ExamBody): Problem[] {
  const spec = getGradeSpec(examBody, grade);
  if (!spec) return [];
  if (subject === "mul") return generateMul(spec.mul);
  if (subject === "div") return generateDiv(spec.div);
  if (subject === "mitori") return generateMitori(spec.mitori);
  if (subject === "denpyo") return spec.denpyo ? generateDenpyo(spec.denpyo) : [];
  return [];
}

export function subjectMinutes(grade: Grade, subject: Subject, examBody: ExamBody): number {
  const spec = getGradeSpec(examBody, grade);
  if (!spec) return 0;
  if (subject === "mul") return spec.mul.minutes;
  if (subject === "div") return spec.div.minutes;
  if (subject === "mitori") return spec.mitori.minutes;
  if (subject === "denpyo") return spec.denpyo?.minutes ?? 0;
  return 0;
}
