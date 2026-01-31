import { randInt } from "./rng";
import type { Problem } from "./types";
import type { MitoriSpec } from "../specs/types";

function padLeft(s: string, len: number): string {
  return s.length >= len ? s : " ".repeat(len - s.length) + s;
}

export function generateMitori(spec: MitoriSpec): Problem[] {
  const out: Problem[] = [];
  const allowFrom = spec.allowNegativeFromTerm ?? Math.floor(spec.terms / 3) + 1;

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

    const lines = nums.map((x, idx) => {
      const sign = x < 0 ? "-" : idx === 0 ? " " : "+";
      return `${sign} ${padLeft(String(Math.abs(x)), spec.digitsMax)}`;
    });

    out.push({ kind: "vertical", question: lines.join("\n"), answer: String(total) });
  }
  return out;
}
