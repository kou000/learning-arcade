import { randInt } from "@/domain/generator/rng";
import type { Problem } from "@/domain/generator/types";
import type { DenpyoSpec } from "@/domain/specs/types";
import { formatNumber, padLeft, widthForDigits } from "@/domain/generator/format";

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
