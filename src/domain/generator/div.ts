import { randInt } from "./rng";
import type { Problem } from "./types";
import type { DivSpec } from "../specs/types";

export function generateDiv(spec: DivSpec): Problem[] {
  const out: Problem[] = [];

  for (let i = 0; i < spec.count; i++) {
    let divisorDigits: number;
    let quotientDigits: number;
    if (spec.digitsPairs && spec.digitsPairs.length > 0) {
      const [d, q] = spec.digitsPairs[randInt(0, spec.digitsPairs.length - 1)];
      divisorDigits = d;
      quotientDigits = q;
    } else {
      divisorDigits = randInt(1, Math.max(1, spec.digitsSum - 1));
      quotientDigits = Math.max(1, spec.digitsSum - divisorDigits);
    }

    const dMin = divisorDigits === 1 ? 1 : 10 ** (divisorDigits - 1);
    const dMax = 10 ** divisorDigits - 1;
    const qMin = quotientDigits === 1 ? 1 : 10 ** (quotientDigits - 1);
    const qMax = 10 ** quotientDigits - 1;

    const divisor = randInt(dMin, dMax);
    const quotient = randInt(qMin, qMax);
    const dividend = divisor * quotient;

    out.push({
      kind: "inline",
      question: `${dividend} ÷ ${divisor}`,
      answer: String(quotient),
    });
  }

  return out;
}
