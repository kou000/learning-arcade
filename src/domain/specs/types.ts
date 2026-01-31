export type Grade = 1|2|3|4|5|6|7|8|9|10;
export type Subject = "mul" | "div" | "mitori" | "denpyo";

export type MulSpec = { digitsSum: number; count: number; minutes: number };
export type DivSpec = { digitsSum: number; count: number; minutes: number };
export type MitoriSpec = { digitsMin: number; digitsMax: number; count: number; minutes: number; terms: number };
export type DenpyoSpec = { digitsMin: number; digitsMax: number; count: number; minutes: number; terms: number; chars?: number };

export type GradeSpec = {
  mul: MulSpec;
  div: DivSpec;
  mitori: MitoriSpec;
  denpyo?: DenpyoSpec;
};
