import { randInt } from "./rng";
import type { Problem } from "./types";
import type { DenpyoSpec } from "../specs/types";
import { formatNumber, padLeft, widthForDigits } from "./format";

export function generateDenpyo(spec: DenpyoSpec): Problem[] {
  const out: Problem[] = [];
  for (let i = 0; i < spec.count; i++) {
    const d = randInt(spec.digitsMin, spec.digitsMax);
    const min = d === 1 ? 0 : 10 ** (d - 1);
    const max = 10 ** d - 1;
    const width = widthForDigits(d);

    const nums: number[] = [];
    let total = 0;
    for (let t = 0; t < spec.terms; t++) {
      const n = randInt(min, max);
      nums.push(n);
      total += n;
    }

    const lines = nums.map((n) => {
      const sign = " ";
      return `${sign} ${padLeft(formatNumber(n), width)}`;
    });

    out.push({ kind: "vertical", question: lines.join("\n"), answer: String(total) });
  }
  return out;
}
