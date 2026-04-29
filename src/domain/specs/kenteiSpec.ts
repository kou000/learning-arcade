import type { ExamBody, Grade, GradeSpec } from "@/domain/specs/types";

export const KENTEI_SPEC_ZENSHUREN: Record<Grade, GradeSpec> = {
  1: {
    mul: { digitsSum: 11, count: 15, minutes: 7 },
    div: { digitsSum: 10, count: 15, minutes: 7 },
    mitori: { digitsMin: 6, digitsMax: 10, count: 15, minutes: 7, terms: 10 },
    denpyo: {
      digitsMin: 5,
      digitsMax: 9,
      count: 10,
      minutes: 8,
      terms: 10,
      chars: 75,
    },
  },
  2: {
    mul: { digitsSum: 9, count: 15, minutes: 7 },
    div: { digitsSum: 8, count: 15, minutes: 7 },
    mitori: { digitsMin: 5, digitsMax: 7, count: 15, minutes: 7, terms: 10 },
    denpyo: {
      digitsMin: 5,
      digitsMax: 7,
      count: 10,
      minutes: 8,
      terms: 10,
      chars: 60,
    },
  },
  3: {
    mul: { digitsSum: 7, count: 15, minutes: 7 },
    div: { digitsSum: 6, count: 15, minutes: 7 },
    mitori: { digitsMin: 3, digitsMax: 6, count: 15, minutes: 7, terms: 10 },
    denpyo: {
      digitsMin: 3,
      digitsMax: 6,
      count: 10,
      minutes: 8,
      terms: 10,
      chars: 40,
    },
  },
  4: {
    mul: { digitsSum: 7, count: 15, minutes: 7 },
    div: { digitsSum: 6, count: 15, minutes: 7 },
    mitori: { digitsMin: 3, digitsMax: 5, count: 15, minutes: 7, terms: 10 },
  },
  5: {
    mul: {
      digitsSum: 6,
      count: 15,
      minutes: 7,
      digitsPairs: [
        [2, 4],
        [3, 3],
        [4, 2],
      ],
    },
    div: {
      digitsSum: 5,
      count: 15,
      minutes: 7,
      digitsPairs: [
        [2, 3],
        [3, 2],
      ],
    },
    mitori: {
      digitsMin: 3,
      digitsMax: 4,
      count: 15,
      minutes: 7,
      terms: 7,
      allowNegativeFromTerm: 3,
    },
  },
  6: {
    mul: {
      digitsSum: 5,
      count: 15,
      minutes: 7,
      digitsPairs: [
        [2, 3],
        [3, 2],
      ],
    },
    div: {
      digitsSum: 4,
      count: 15,
      minutes: 7,
      digitsPairs: [[2, 2]],
      borrowMixRatio: 0.2,
    },
    mitori: {
      digitsMin: 2,
      digitsMax: 3,
      count: 15,
      minutes: 7,
      terms: 7,
      allowNegativeFromTerm: 2,
    },
  },
  7: {
    mul: { digitsSum: 4, count: 15, minutes: 7, digitsPairs: [[2, 2]] },
    div: { digitsSum: 4, count: 15, minutes: 7, digitsPairs: [[1, 3]] },
    mitori: {
      digitsMin: 2,
      digitsMax: 3,
      count: 15,
      minutes: 7,
      terms: 5,
      allowNegativeFromTerm: 3,
    },
  },
  8: {
    mul: { digitsSum: 4, count: 15, minutes: 7 },
    div: { digitsSum: 3, count: 15, minutes: 7 },
    mitori: { digitsMin: 2, digitsMax: 2, count: 15, minutes: 7, terms: 7 },
  },
  9: {
    mul: { digitsSum: 3, count: 15, minutes: 7 },
    div: { digitsSum: 3, count: 15, minutes: 7 },
    mitori: { digitsMin: 1, digitsMax: 2, count: 15, minutes: 7, terms: 7 },
  },
  10: {
    mul: { digitsSum: 3, count: 15, minutes: 7 },
    div: { digitsSum: 3, count: 15, minutes: 7 },
    mitori: { digitsMin: 1, digitsMax: 1, count: 15, minutes: 7, terms: 7 },
  },
};

export const KENTEI_SPEC_ZENSHUGAKUREN: Partial<Record<Grade, GradeSpec>> = {
  1: {
    mul: { digitsSum: 11, count: 20, minutes: 10 },
    div: { digitsSum: 10, count: 20, minutes: 10 },
    mitori: {
      digitsMin: 6,
      digitsMax: 10,
      count: 10,
      minutes: 8,
      terms: 10,
      chars: 80,
      allowNegativeFromTerm: 2,
    },
    mentalMul: { digitsSum: 5, count: 30, minutes: 4 },
    mentalDiv: { digitsSum: 5, count: 30, minutes: 4 },
    mentalMitori: {
      digitsMin: 3,
      digitsMax: 4,
      count: 15,
      minutes: 4,
      terms: 7,
      chars: 25,
      allowNegativeFromTerm: 2,
    },
  },
  2: {
    mul: { digitsSum: 9, count: 20, minutes: 10 },
    div: { digitsSum: 8, count: 20, minutes: 10 },
    mitori: {
      digitsMin: 5,
      digitsMax: 8,
      count: 10,
      minutes: 8,
      terms: 10,
      chars: 70,
      allowNegativeFromTerm: 2,
    },
    mentalMul: {
      digitsSum: 4,
      count: 30,
      minutes: 4,
      digitsPairs: [[2, 2, 30]],
    },
    mentalDiv: {
      digitsSum: 4,
      count: 30,
      minutes: 4,
      digitsPairs: [[2, 2, 30]],
    },
    mentalMitori: {
      digitsMin: 2,
      digitsMax: 3,
      count: 15,
      minutes: 4,
      terms: 7,
      chars: 18,
    },
  },
  3: {
    mul: { digitsSum: 7, count: 20, minutes: 10 },
    div: { digitsSum: 6, count: 20, minutes: 10 },
    mitori: {
      digitsMin: 3,
      digitsMax: 6,
      count: 10,
      minutes: 8,
      terms: 10,
      chars: 50,
      allowNegativeFromTerm: 2,
    },
    mentalMul: {
      digitsSum: 4,
      count: 30,
      minutes: 4,
      digitsPairs: [[1, 3, 30]],
    },
    mentalDiv: {
      digitsSum: 4,
      count: 30,
      minutes: 4,
      digitsPairs: [[1, 3, 30]],
    },
    mentalMitori: {
      digitsMin: 2,
      digitsMax: 2,
      count: 15,
      minutes: 4,
      terms: 7,
      chars: 14,
    },
  },
  4: {
    mul: {
      digitsSum: 7,
      count: 20,
      minutes: 10,
      digitsPairs: [
        [4, 3],
        [5, 2],
        [3, 4],
      ],
    },
    div: {
      digitsSum: 6,
      count: 20,
      minutes: 10,
      digitsPairs: [
        [3, 3],
        [2, 4],
        [4, 2],
      ],
    },
    mitori: {
      digitsMin: 3,
      digitsMax: 5,
      count: 10,
      minutes: 8,
      terms: 10,
      chars: 45,
      allowNegativeFromTerm: 2,
    },
    mentalMul: {
      digitsSum: 4,
      count: 30,
      minutes: 4,
      digitsPairs: [
        [1, 2, 15],
        [1, 3, 15],
      ],
    },
    mentalDiv: {
      digitsSum: 4,
      count: 30,
      minutes: 4,
      digitsPairs: [
        [1, 2, 15],
        [1, 3, 15],
      ],
    },
    mentalMitori: {
      digitsMin: 2,
      digitsMax: 2,
      count: 15,
      minutes: 4,
      terms: 6,
      chars: 12,
    },
  },
  5: {
    mul: {
      digitsSum: 6,
      count: 20,
      minutes: 10,
      digitsPairs: [
        [2, 4],
        [3, 3],
        [4, 2],
      ],
    },
    div: {
      digitsSum: 5,
      count: 20,
      minutes: 10,
      digitsPairs: [
        [2, 3],
        [3, 2],
      ],
    },
    mitori: {
      digitsMin: 3,
      digitsMax: 4,
      count: 10,
      minutes: 8,
      terms: 10,
      chars: 35,
      allowNegativeFromTerm: 2,
    },
    mentalMul: {
      digitsSum: 3,
      count: 30,
      minutes: 4,
      digitsPairs: [[1, 2, 30]],
      rightOperandZeroMode: "none",
    },
    mentalDiv: {
      digitsSum: 3,
      count: 30,
      minutes: 4,
      digitsPairs: [[1, 2, 30]],
    },
    mentalMitori: {
      digitsMin: 2,
      digitsMax: 2,
      count: 15,
      minutes: 4,
      terms: 5,
      chars: 10,
    },
  },
  6: {
    mul: {
      digitsSum: 5,
      count: 20,
      minutes: 10,
      digitsPairs: [
        [2, 3],
        [3, 2],
      ],
    },
    div: {
      digitsSum: 4,
      count: 20,
      minutes: 10,
      digitsPairs: [[2, 2]],
      borrowMixRatio: 0.2,
    },
    mitori: {
      digitsMin: 2,
      digitsMax: 3,
      count: 10,
      minutes: 8,
      terms: 10,
      chars: 25,
      allowNegativeFromTerm: 2,
    },
    mentalMul: {
      digitsSum: 3,
      count: 30,
      minutes: 4,
      digitsPairs: [[1, 2, 30]],
      rightOperandZeroMode: "alternate",
    },
    mentalDiv: {
      digitsSum: 3,
      count: 30,
      minutes: 4,
      digitsPairs: [[1, 2, 30]],
      quotientZeroMode: "alternate",
    },
    mentalMitori: {
      digitsMin: 1,
      digitsMax: 2,
      count: 15,
      minutes: 4,
      terms: 4,
      chars: 5,
    },
  },
  7: {
    mul: { digitsSum: 4, count: 20, minutes: 10, digitsPairs: [[2, 2]] },
    div: { digitsSum: 4, count: 20, minutes: 10, digitsPairs: [[1, 3]] },
    mitori: {
      digitsMin: 2,
      digitsMax: 2,
      count: 10,
      minutes: 8,
      terms: 10,
      chars: 20,
      allowNegativeFromTerm: 2,
    },
    mentalMul: {
      digitsSum: 3,
      count: 30,
      minutes: 4,
      digitsPairs: [[1, 2, 30]],
      rightOperandZeroMode: "everyOtherOnesZero",
    },
    mentalDiv: {
      digitsSum: 3,
      count: 30,
      minutes: 4,
      digitsPairs: [[1, 2, 30]],
      quotientZeroMode: "everyOtherOnesZero",
    },
    mentalMitori: {
      digitsMin: 1,
      digitsMax: 2,
      count: 15,
      minutes: 4,
      terms: 3,
      chars: 4,
    },
  },
  8: {
    mul: { digitsSum: 4, count: 20, minutes: 10, digitsPairs: [[3, 1]] },
    div: { digitsSum: 3, count: 20, minutes: 10, digitsPairs: [[1, 2]] },
    mitori: {
      digitsMin: 2,
      digitsMax: 2,
      count: 10,
      minutes: 8,
      terms: 7,
      chars: 14,
      allowNegativeFromTerm: 2,
    },
    mentalMul: {
      digitsSum: 3,
      count: 30,
      minutes: 4,
      digitsPairs: [
        [1, 1, 15],
        [1, 2, 15],
      ],
    },
    mentalDiv: {
      digitsSum: 3,
      count: 30,
      minutes: 4,
      digitsPairs: [
        [1, 1, 15],
        [1, 2, 15],
      ],
    },
    mentalMitori: {
      digitsMin: 1,
      digitsMax: 1,
      count: 15,
      minutes: 4,
      terms: 4,
      chars: 4,
      makeTenPairs: true,
    },
  },
};

export const EXAM_BODY_LABELS: Record<ExamBody, string> = {
  zenshuren: "全国珠算教育連盟",
  zenshugakuren: "全国珠算学校連盟",
};

export const KENTEI_SPECS: Record<
  ExamBody,
  Partial<Record<Grade, GradeSpec>>
> = {
  zenshuren: KENTEI_SPEC_ZENSHUREN,
  zenshugakuren: KENTEI_SPEC_ZENSHUGAKUREN,
};

export function getAvailableGrades(examBody: ExamBody): Grade[] {
  return Object.keys(KENTEI_SPECS[examBody])
    .map((g) => Number(g) as Grade)
    .sort((a, b) => a - b);
}

export function getGradeSpec(
  examBody: ExamBody,
  grade: Grade,
): GradeSpec | null {
  return KENTEI_SPECS[examBody][grade] ?? null;
}
