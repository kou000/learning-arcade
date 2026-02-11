const DIGITS = ["", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"];
const LARGE_UNITS = ["", "まん", "おく", "ちょう"];

function fourDigitsToKana(value: number): string {
  const thousands = Math.floor(value / 1000) % 10;
  const hundreds = Math.floor(value / 100) % 10;
  const tens = Math.floor(value / 10) % 10;
  const ones = value % 10;
  let text = "";

  if (thousands > 0) {
    if (thousands === 1) text += "せん";
    else if (thousands === 3) text += "さんぜん";
    else if (thousands === 8) text += "はっせん";
    else text += `${DIGITS[thousands]}せん`;
  }

  if (hundreds > 0) {
    if (hundreds === 1) text += "ひゃく";
    else if (hundreds === 3) text += "さんびゃく";
    else if (hundreds === 6) text += "ろっぴゃく";
    else if (hundreds === 8) text += "はっぴゃく";
    else text += `${DIGITS[hundreds]}ひゃく`;
  }

  if (tens > 0) {
    if (tens === 1) text += "じゅう";
    else text += `${DIGITS[tens]}じゅう`;
  }

  if (ones > 0) text += DIGITS[ones];
  return text;
}

export function toKanaNumber(value: number): string {
  if (!Number.isFinite(value)) return "ぜろ";
  const floored = Math.floor(Math.abs(value));
  if (floored === 0) return "ぜろ";

  const parts: string[] = [];
  let remaining = floored;
  let unitIndex = 0;

  while (remaining > 0 && unitIndex < LARGE_UNITS.length) {
    const chunk = remaining % 10000;
    if (chunk > 0) {
      const chunkText = fourDigitsToKana(chunk);
      parts.unshift(`${chunkText}${LARGE_UNITS[unitIndex]}`);
    }
    remaining = Math.floor(remaining / 10000);
    unitIndex += 1;
  }

  const base = parts.join("");
  return value < 0 ? `まいなす${base}` : base;
}
