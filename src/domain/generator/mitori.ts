import { randInt } from "./rng";
import type { Problem } from "./types";
import type { MitoriSpec } from "../specs/types";
import { formatNumber, padLeft, widthForDigits } from "./format";

export function generateMitori(spec: MitoriSpec): Problem[] {
  const out: Problem[] = [];
  const allowFrom = spec.allowNegativeFromTerm ?? Math.floor(spec.terms / 3) + 1;
  const width = widthForDigits(spec.digitsMax);

  for (let i = 0; i < spec.count; i++) {
    const nums: number[] = [];
    let total = 0;

    for (let t = 0; t < spec.terms; t++) {
      const d = randInt(spec.digitsMin, spec.digitsMax);
      const min = d === 1 ? 0 : 10 ** (d - 1);
      const max = 10 ** d - 1;
      const n = randInt(min, max);

      const allowMinus = t + 1 >= allowFrom;
      const sign = allowMinus && total - n >= 0 && Math.random() < 0.4 ? -1 : 1;

      nums.push(sign * n);
      total += sign * n;
    }

    const lines = nums.map((x) => {
      const sign = x < 0 ? "-" : " ";
      return `${sign} ${padLeft(formatNumber(Math.abs(x)), width)}`;
    });

    out.push({ kind: "vertical", question: lines.join("\n"), answer: String(total) });
  }
  return out;
}
