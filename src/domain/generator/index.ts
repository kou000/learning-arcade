import type { ExamBody, Grade, Subject } from "@/domain/specs/types";
import { getGradeSpec } from "@/domain/specs/kenteiSpec";
import type { Problem } from "@/domain/generator/types";
import { generateMul } from "@/domain/generator/mul";
import { generateDiv } from "@/domain/generator/div";
import { generateMitori } from "@/domain/generator/mitori";
import { generateDenpyo } from "@/domain/generator/denpyo";

export function subjectLabel(subject: Subject): string {
  switch (subject) {
    case "mul": return "じょうざん";
    case "div": return "じょざん";
    case "mitori": return "みとりざん";
    case "denpyo": return "でんぴょうざん";
    case "mentalMul": return "じょうあんざん";
    case "mentalDiv": return "じょあんざん";
    case "mentalMitori": return "みとりあんざん";
  }
}

export function generateProblems(grade: Grade, subject: Subject, examBody: ExamBody): Problem[] {
  const spec = getGradeSpec(examBody, grade);
  if (!spec) return [];
  if (subject === "mul") return generateMul(spec.mul);
  if (subject === "div") return generateDiv(spec.div);
  if (subject === "mitori") return generateMitori(spec.mitori);
  if (subject === "denpyo") return spec.denpyo ? generateDenpyo(spec.denpyo) : [];
  if (subject === "mentalMul") return spec.mentalMul ? generateMul(spec.mentalMul) : [];
  if (subject === "mentalDiv") return spec.mentalDiv ? generateDiv(spec.mentalDiv) : [];
  if (subject === "mentalMitori") return spec.mentalMitori ? generateMitori(spec.mentalMitori) : [];
  return [];
}

export function subjectMinutes(grade: Grade, subject: Subject, examBody: ExamBody): number {
  const spec = getGradeSpec(examBody, grade);
  if (!spec) return 0;
  if (subject === "mul") return spec.mul.minutes;
  if (subject === "div") return spec.div.minutes;
  if (subject === "mitori") return spec.mitori.minutes;
  if (subject === "denpyo") return spec.denpyo?.minutes ?? 0;
  if (subject === "mentalMul") return spec.mentalMul?.minutes ?? 0;
  if (subject === "mentalDiv") return spec.mentalDiv?.minutes ?? 0;
  if (subject === "mentalMitori") return spec.mentalMitori?.minutes ?? 0;
  return 0;
}

export function subjectProblemCount(
  grade: Grade,
  subject: Subject,
  examBody: ExamBody,
): number {
  const spec = getGradeSpec(examBody, grade);
  if (!spec) return 0;
  if (subject === "mul") return spec.mul.count;
  if (subject === "div") return spec.div.count;
  if (subject === "mitori") return spec.mitori.count;
  if (subject === "denpyo") return spec.denpyo?.count ?? 0;
  if (subject === "mentalMul") return spec.mentalMul?.count ?? 0;
  if (subject === "mentalDiv") return spec.mentalDiv?.count ?? 0;
  if (subject === "mentalMitori") return spec.mentalMitori?.count ?? 0;
  return 0;
}
