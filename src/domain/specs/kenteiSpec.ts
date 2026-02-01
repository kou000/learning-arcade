import type { ExamBody, Grade, GradeSpec } from "./types";

export const KENTEI_SPEC_ZENSHUREN: Record<Grade, GradeSpec> = {
  1:  { mul:{digitsSum:11,count:15,minutes:7}, div:{digitsSum:10,count:15,minutes:7}, mitori:{digitsMin:6,digitsMax:10,count:15,minutes:7,terms:10}, denpyo:{digitsMin:5,digitsMax:9,count:10,minutes:8,terms:10,chars:75}},
  2:  { mul:{digitsSum:9,count:15,minutes:7},  div:{digitsSum:8,count:15,minutes:7},  mitori:{digitsMin:5,digitsMax:7,count:15,minutes:7,terms:10},  denpyo:{digitsMin:5,digitsMax:7,count:10,minutes:8,terms:10,chars:60}},
  3:  { mul:{digitsSum:7,count:15,minutes:7},  div:{digitsSum:6,count:15,minutes:7},  mitori:{digitsMin:3,digitsMax:6,count:15,minutes:7,terms:10},  denpyo:{digitsMin:3,digitsMax:6,count:10,minutes:8,terms:10,chars:40}},
  4:  { mul:{digitsSum:7,count:15,minutes:7},  div:{digitsSum:6,count:15,minutes:7},  mitori:{digitsMin:3,digitsMax:5,count:15,minutes:7,terms:10}},
  5:  { mul:{digitsSum:6,count:15,minutes:7,digitsPairs:[[2,4],[3,3],[4,2]]},  div:{digitsSum:5,count:15,minutes:7,digitsPairs:[[2,3],[3,2]]},  mitori:{digitsMin:3,digitsMax:4,count:15,minutes:7,terms:7,allowNegativeFromTerm:3}},
  6:  { mul:{digitsSum:5,count:15,minutes:7,digitsPairs:[[2,3],[3,2]]},  div:{digitsSum:4,count:15,minutes:7,digitsPairs:[[2,2]]},  mitori:{digitsMin:2,digitsMax:3,count:15,minutes:7,terms:7,allowNegativeFromTerm:2}},
  7:  { mul:{digitsSum:4,count:15,minutes:7,digitsPairs:[[2,2]]},  div:{digitsSum:4,count:15,minutes:7,digitsPairs:[[1,3]]},  mitori:{digitsMin:2,digitsMax:3,count:15,minutes:7,terms:5,allowNegativeFromTerm:3}},
  8:  { mul:{digitsSum:4,count:15,minutes:7},  div:{digitsSum:3,count:15,minutes:7},  mitori:{digitsMin:2,digitsMax:2,count:15,minutes:7,terms:7}},
  9:  { mul:{digitsSum:3,count:15,minutes:7},  div:{digitsSum:3,count:15,minutes:7},  mitori:{digitsMin:1,digitsMax:2,count:15,minutes:7,terms:7}},
  10: { mul:{digitsSum:3,count:15,minutes:7},  div:{digitsSum:3,count:15,minutes:7},  mitori:{digitsMin:1,digitsMax:1,count:15,minutes:7,terms:7}},
};

export const KENTEI_SPEC_ZENSHUGAKUREN: Partial<Record<Grade, GradeSpec>> = {
  4: {
    mul: { digitsSum: 8, count: 20, minutes: 10, digitsPairs: [[5,3],[3,5],[6,2]] },
    div: { digitsSum: 7, count: 20, minutes: 10, digitsPairs: [[3,3],[2,4],[5,2],[3,4]] },
    mitori: { digitsMin: 3, digitsMax: 6, count: 10, minutes: 8, terms: 10, allowNegativeFromTerm: 11 },
  },
  5: {
    mul: { digitsSum: 6, count: 20, minutes: 10, digitsPairs: [[2,4],[3,3],[4,2]] },
    div: { digitsSum: 5, count: 20, minutes: 10, digitsPairs: [[2,3],[3,2]] },
    mitori: { digitsMin: 3, digitsMax: 6, count: 10, minutes: 8, terms: 10, allowNegativeFromTerm: 11 },
  },
  6: {
    mul: { digitsSum: 5, count: 20, minutes: 10, digitsPairs: [[2,3],[3,2]] },
    div: { digitsSum: 5, count: 20, minutes: 10, digitsPairs: [[2,2],[2,3]] },
    mitori: { digitsMin: 2, digitsMax: 4, count: 10, minutes: 8, terms: 10, allowNegativeFromTerm: 11 },
  },
  7: {
    mul: { digitsSum: 4, count: 20, minutes: 10, digitsPairs: [[2,2]] },
    div: { digitsSum: 4, count: 20, minutes: 10, digitsPairs: [[1,3]] },
    mitori: { digitsMin: 2, digitsMax: 3, count: 10, minutes: 8, terms: 10, allowNegativeFromTerm: 11 },
  },
  8: {
    mul: { digitsSum: 4, count: 20, minutes: 10, digitsPairs: [[3,1]] },
    div: { digitsSum: 4, count: 20, minutes: 10, digitsPairs: [[1,2],[1,3]] },
    mitori: { digitsMin: 2, digitsMax: 3, count: 10, minutes: 8, terms: 7, allowNegativeFromTerm: 8 },
  },
};

export const EXAM_BODY_LABELS: Record<ExamBody, string> = {
  zenshuren: "全国珠算教育連盟",
  zenshugakuren: "全国珠算学校連盟",
};

export const KENTEI_SPECS: Record<ExamBody, Partial<Record<Grade, GradeSpec>>> = {
  zenshuren: KENTEI_SPEC_ZENSHUREN,
  zenshugakuren: KENTEI_SPEC_ZENSHUGAKUREN,
};

export function getAvailableGrades(examBody: ExamBody): Grade[] {
  return Object.keys(KENTEI_SPECS[examBody]).map((g) => Number(g) as Grade).sort((a, b) => a - b);
}

export function getGradeSpec(examBody: ExamBody, grade: Grade): GradeSpec | null {
  return KENTEI_SPECS[examBody][grade] ?? null;
}
