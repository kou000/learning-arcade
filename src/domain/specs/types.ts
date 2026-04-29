export type Grade = 1|2|3|4|5|6|7|8|9|10;
export type Subject =
  | "mul"
  | "div"
  | "mitori"
  | "denpyo"
  | "mentalMul"
  | "mentalDiv"
  | "mentalMitori";
export type ExamBody = "zenshuren" | "zenshugakuren";

type CountedDigitsPair = [number, number] | [number, number, number];

export type MulSpec = {
  digitsSum: number;
  count: number;
  minutes: number;
  digitsPairs?: CountedDigitsPair[];
  rightOperandZeroMode?: "none" | "alternate" | "everyOtherOnesZero";
};
export type DivSpec = {
  digitsSum: number;
  count: number;
  minutes: number;
  digitsPairs?: CountedDigitsPair[];
  borrowMixRatio?: number;
  quotientZeroMode?: "alternate" | "everyOtherOnesZero";
};
export type MitoriSpec = {
  digitsMin: number;
  digitsMax: number;
  count: number;
  minutes: number;
  terms: number;
  allowNegativeFromTerm?: number;
  chars?: number;
  makeTenPairs?: boolean;
};
export type DenpyoSpec = { digitsMin: number; digitsMax: number; count: number; minutes: number; terms: number; chars?: number };

export type GradeSpec = {
  mul: MulSpec;
  div: DivSpec;
  mitori: MitoriSpec;
  denpyo?: DenpyoSpec;
  mentalMul?: MulSpec;
  mentalDiv?: DivSpec;
  mentalMitori?: MitoriSpec;
};
