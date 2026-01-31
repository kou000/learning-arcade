import { randInt } from "./rng";
import type { Problem } from "./types";
import type { DenpyoSpec } from "../specs/types";

function padLeft(s: string, len: number): string {
  return s.length >= len ? s : " ".repeat(len - s.length) + s;
}

export function generateDenpyo(spec: DenpyoSpec): Problem[] {
  const out: Problem[] = [];
  for (let i = 0; i < spec.count; i++) {
    const d = randInt(spec.digitsMin, spec.digitsMax);
    const min = d === 1 ? 0 : 10 ** (d - 1);
    const max = 10 ** d - 1;

    const nums: number[] = [];
    let total = 0;
    for (let t = 0; t < spec.terms; t++) {
      const n = randInt(min, max);
      nums.push(n);
      total += n;
    }

    const lines = nums.map((n, idx) => {
      const sign = idx === 0 ? " " : "+";
      return `${sign} ${padLeft(String(n), d)}`;
    });

    out.push({ kind: "vertical", question: lines.join("\n"), answer: String(total) });
  }
  return out;
}
