import { randInt } from "@/domain/generator/rng";
import type { Problem } from "@/domain/generator/types";
import type { DivSpec } from "@/domain/specs/types";
import { formatNumber } from "@/domain/generator/format";

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

function generateCandidate(spec: DivSpec): {
  divisor: number;
  dividend: number;
  quotient: number;
} {
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
  return { divisor, quotient, dividend };
}

export function generateDiv(spec: DivSpec): Problem[] {
  const out: Problem[] = [];
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

    let candidate = generateCandidate(spec);
    let candidateBorrow = hasDivisionBorrow(candidate.dividend, candidate.divisor);
    for (let attempt = 0; attempt < 100; attempt++) {
      if (candidateBorrow === needBorrowInThisQuestion) break;
      candidate = generateCandidate(spec);
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
