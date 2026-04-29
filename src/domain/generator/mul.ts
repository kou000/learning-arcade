import { randInt } from "@/domain/generator/rng";
import type { Problem } from "@/domain/generator/types";
import type { MulSpec } from "@/domain/specs/types";
import { formatNumber } from "@/domain/generator/format";

function pairPlan(spec: MulSpec): Array<[number, number]> {
  if (!spec.digitsPairs || spec.digitsPairs.length === 0) return [];
  const pairs = spec.digitsPairs.flatMap(([a, b, count]) =>
    Array.from({ length: count ?? 1 }, () => [a, b] as [number, number]),
  );
  if (pairs.length >= spec.count) return pairs.slice(0, spec.count);
  return Array.from({ length: spec.count }, (_, i) => pairs[i % pairs.length]);
}

function hasZeroDigit(value: number): boolean {
  return String(value).includes("0");
}

function buildNumberWithOptionalZero(
  digits: number,
  options: { noZero?: boolean; onesZero?: boolean; requireZero?: boolean },
): number {
  const min = digits === 1 ? 1 : 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  for (let attempt = 0; attempt < 100; attempt++) {
    const value = randInt(min, max);
    if (options.onesZero && value % 10 !== 0) continue;
    if (options.noZero && hasZeroDigit(value)) continue;
    if (options.requireZero && !hasZeroDigit(value)) continue;
    return value;
  }
  if (options.onesZero && digits > 1) {
    const base = randInt(10 ** (digits - 2), 10 ** (digits - 1) - 1);
    return base * 10;
  }
  if (options.noZero) {
    const digitsText = Array.from({ length: digits }, (_, idx) => {
      const minDigit = idx === 0 && digits > 1 ? 1 : 1;
      return String(randInt(minDigit, 9));
    }).join("");
    return Number(digitsText);
  }
  return randInt(min, max);
}

export function generateMul(spec: MulSpec): Problem[] {
  const out: Problem[] = [];
  const plannedPairs = pairPlan(spec);

  for (let i = 0; i < spec.count; i++) {
    let aDigits: number;
    let bDigits: number;
    if (plannedPairs.length > 0) {
      const [a, b] = plannedPairs[i];
      aDigits = a;
      bDigits = b;
    } else {
      aDigits = randInt(1, Math.max(1, spec.digitsSum - 1));
      bDigits = Math.max(1, spec.digitsSum - aDigits);
    }

    const aMin = aDigits === 1 ? 1 : 10 ** (aDigits - 1);
    const aMax = 10 ** aDigits - 1;

    const a = randInt(aMin, aMax);
    const b = buildNumberWithOptionalZero(bDigits, {
      noZero: spec.rightOperandZeroMode === "none",
      requireZero:
        spec.rightOperandZeroMode === "alternate" && i % 2 === 1,
      onesZero:
        spec.rightOperandZeroMode === "everyOtherOnesZero" && i % 2 === 1,
    });

    out.push({
      kind: "inline",
      question: `${formatNumber(a)} × ${formatNumber(b)}`,
      answer: String(a * b),
    });
  }

  return out;
}
