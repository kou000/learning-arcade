import { randInt } from "./rng";
import type { Problem } from "./types";
import type { MulSpec } from "../specs/types";

export function generateMul(spec: MulSpec): Problem[] {
  const out: Problem[] = [];
  for (let i = 0; i < spec.count; i++) {
    const aDigits = randInt(1, Math.max(1, spec.digitsSum - 1));
    const bDigits = Math.max(1, spec.digitsSum - aDigits);

    const aMin = aDigits === 1 ? 0 : 10 ** (aDigits - 1);
    const aMax = 10 ** aDigits - 1;
    const bMin = bDigits === 1 ? 1 : 10 ** (bDigits - 1);
    const bMax = 10 ** bDigits - 1;

    const a = randInt(aMin, aMax);
    const b = randInt(bMin, bMax);

    out.push({ kind: "inline", question: `${a} × ${b}`, answer: String(a * b) });
  }
  return out;
}
