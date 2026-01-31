export function randInt(min: number, maxInclusive: number): number {
  return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
}
