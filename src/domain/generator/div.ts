import { randInt } from "@/domain/generator/rng";
import type { Problem } from "@/domain/generator/types";
import type { DivSpec } from "@/domain/specs/types";
import { formatNumber } from "@/domain/generator/format";

function pairPlan(spec: DivSpec): Array<[number, number]> {
  if (!spec.digitsPairs || spec.digitsPairs.length === 0) return [];
  const pairs = spec.digitsPairs.flatMap(([d, q, count]) =>
    Array.from({ length: count ?? 1 }, () => [d, q] as [number, number]),
  );
  if (pairs.length >= spec.count) return pairs.slice(0, spec.count);
  return Array.from({ length: spec.count }, (_, i) => pairs[i % pairs.length]);
}

function needsBorrow(minuend: number, subtrahend: number): boolean {
  let a = minuend;
  let b = subtrahend;
  let carry = 0;
  while (a > 0 || b > 0) {
    const aDigit = a % 10;
    const bDigit = b % 10;
    if (aDigit - carry < bDigit) return true;
    carry = 0;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

function hasDivisionBorrow(dividend: number, divisor: number): boolean {
  const digits = String(dividend).split("").map((d) => Number(d));
  let remainder = 0;
  for (const digit of digits) {
    const partial = remainder * 10 + digit;
    const quotientDigit = Math.floor(partial / divisor);
    if (quotientDigit > 0) {
      const subtrahend = divisor * quotientDigit;
      if (needsBorrow(partial, subtrahend)) return true;
    }
    remainder = partial - divisor * quotientDigit;
  }
  return false;
}

function generateCandidateWithPair(
  spec: DivSpec,
  pair?: [number, number],
  questionIndex = 0,
): {
  divisor: number;
  dividend: number;
  quotient: number;
} {
  let divisorDigits: number;
  let quotientDigits: number;
  if (pair) {
    const [d, q] = pair;
    divisorDigits = d;
    quotientDigits = q;
  } else if (spec.digitsPairs && spec.digitsPairs.length > 0) {
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
  let quotient = randInt(qMin, qMax);
  for (let attempt = 0; attempt < 100; attempt++) {
    const needsZero =
      spec.quotientZeroMode === "alternate" && questionIndex % 2 === 1;
    const needsOnesZero =
      spec.quotientZeroMode === "everyOtherOnesZero" &&
      questionIndex % 2 === 1;
    if (needsOnesZero && quotient % 10 !== 0) {
      quotient = randInt(qMin, qMax);
      continue;
    }
    if (needsZero && !String(quotient).includes("0")) {
      quotient = randInt(qMin, qMax);
      continue;
    }
    break;
  }
  const dividend = divisor * quotient;
  return { divisor, quotient, dividend };
}

export function generateDiv(spec: DivSpec): Problem[] {
  const out: Problem[] = [];
  const plannedPairs = pairPlan(spec);
  const borrowRatio = Math.min(1, Math.max(0, spec.borrowMixRatio ?? 0));
  const targetBorrowCount =
    borrowRatio > 0 ? Math.max(1, Math.round(spec.count * borrowRatio)) : 0;
  let borrowCount = 0;

  for (let i = 0; i < spec.count; i++) {
    const remaining = spec.count - i;
    const neededBorrow = Math.max(0, targetBorrowCount - borrowCount);
    const needBorrowInThisQuestion =
      neededBorrow > 0 &&
      (remaining === neededBorrow || randInt(1, remaining) <= neededBorrow);

    const pair = plannedPairs[i];
    let candidate = generateCandidateWithPair(spec, pair, i);
    let candidateBorrow = hasDivisionBorrow(candidate.dividend, candidate.divisor);
    for (let attempt = 0; attempt < 100; attempt++) {
      if (candidateBorrow === needBorrowInThisQuestion) break;
      candidate = generateCandidateWithPair(spec, pair, i);
      candidateBorrow = hasDivisionBorrow(candidate.dividend, candidate.divisor);
    }
    if (candidateBorrow) borrowCount += 1;

    out.push({
      kind: "inline",
      question: `${formatNumber(candidate.dividend)} ÷ ${formatNumber(candidate.divisor)}`,
      answer: String(candidate.quotient),
    });
  }

  return out;
}
