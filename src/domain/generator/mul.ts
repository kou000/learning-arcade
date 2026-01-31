import { randInt } from "./rng";
import type { Problem } from "./types";
import type { MulSpec } from "../specs/types";

export function generateMul(spec: MulSpec): Problem[] {
  const out: Problem[] = [];

  for (let i = 0; i < spec.count; i++) {
    let aDigits: number;
    let bDigits: number;
    if (spec.digitsPairs && spec.digitsPairs.length > 0) {
      const [a, b] = spec.digitsPairs[randInt(0, spec.digitsPairs.length - 1)];
      aDigits = a;
      bDigits = b;
    } else {
      aDigits = randInt(1, Math.max(1, spec.digitsSum - 1));
      bDigits = Math.max(1, spec.digitsSum - aDigits);
    }

    const aMin = aDigits === 1 ? 0 : 10 ** (aDigits - 1);
    const aMax = 10 ** aDigits - 1;
    const bMin = bDigits === 1 ? 1 : 10 ** (bDigits - 1);
    const bMax = 10 ** bDigits - 1;

    const a = randInt(aMin, aMax);
    const b = randInt(bMin, bMax);

    out.push({
      kind: "inline",
      question: `${a} × ${b}`,
      answer: String(a * b),
    });
  }

  return out;
}
