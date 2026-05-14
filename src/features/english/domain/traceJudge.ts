import type { Point } from "@/features/english/domain/letterGuides";

export type JudgeGrade = "great" | "good" | "retry";

export type StrokeJudgeResult = {
  index: number;
  grade: JudgeGrade;
  ok: boolean;
  points: number;
  score: number;
  start: number;
  end: number;
  lengthRate: number;
  direction: number;
  coverage: number;
  message: string;
};

export type TraceJudgeResult = {
  strokeCountOk: boolean;
  grade: JudgeGrade;
  allOk: boolean;
  results: StrokeJudgeResult[];
};

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function pathLength(points: Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += distance(points[i - 1], points[i]);
  return total;
}

export function smoothPoints(points: Point[], passes: number): Point[] {
  let result = points.slice();
  for (let p = 0; p < passes; p++) {
    if (result.length < 3) return result;
    const next = [result[0]];
    for (let i = 1; i < result.length - 1; i++) {
      next.push({
        x: (result[i - 1].x + result[i].x * 2 + result[i + 1].x) / 4,
        y: (result[i - 1].y + result[i].y * 2 + result[i + 1].y) / 4,
      });
    }
    next.push(result[result.length - 1]);
    result = next;
  }
  return result;
}

function resamplePoints(points: Point[], targetCount: number): Point[] {
  if (points.length === 0) return [];
  if (points.length === 1) return Array.from({ length: targetCount }, () => points[0]);

  const totalLength = pathLength(points);
  if (totalLength === 0) return Array.from({ length: targetCount }, () => points[0]);

  const interval = totalLength / (targetCount - 1);
  const result: Point[] = [{ ...points[0] }];
  let accumulated = 0;
  let previous = { ...points[0] };
  let i = 1;

  while (i < points.length) {
    const current = points[i];
    const segmentLength = distance(previous, current);
    if (segmentLength === 0) {
      i++;
      continue;
    }
    if (accumulated + segmentLength >= interval) {
      const t = (interval - accumulated) / segmentLength;
      const newPoint = {
        x: previous.x + t * (current.x - previous.x),
        y: previous.y + t * (current.y - previous.y),
      };
      result.push(newPoint);
      previous = newPoint;
      accumulated = 0;
    } else {
      accumulated += segmentLength;
      previous = current;
      i++;
    }
  }

  while (result.length < targetCount) result.push({ ...points[points.length - 1] });
  return result.slice(0, targetCount);
}

function dtwDistance(a: Point[], b: Point[]): number {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(Infinity));
  dp[0][0] = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = distance(a[i - 1], b[j - 1]);
      dp[i][j] = cost + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[n][m] / (n + m);
}

function directionSimilarity(guide: Point[], drawn: Point[]): number {
  const n = Math.min(guide.length, drawn.length);
  if (n < 3) return 0;
  let total = 0;
  let count = 0;
  for (let i = 1; i < n; i++) {
    const gv = { x: guide[i].x - guide[i - 1].x, y: guide[i].y - guide[i - 1].y };
    const dv = { x: drawn[i].x - drawn[i - 1].x, y: drawn[i].y - drawn[i - 1].y };
    const gl = Math.hypot(gv.x, gv.y);
    const dl = Math.hypot(dv.x, dv.y);
    if (gl === 0 || dl === 0) continue;
    const cos = (gv.x * dv.x + gv.y * dv.y) / (gl * dl);
    total += Math.max(-1, Math.min(1, cos));
    count++;
  }
  if (count === 0) return 0;
  return (total / count + 1) / 2;
}

function guideCoverage(guide: Point[], drawn: Point[], tolerance: number): number {
  if (guide.length === 0 || drawn.length === 0) return 0;
  let covered = 0;
  for (const gp of guide) {
    let min = Infinity;
    for (const dp of drawn) {
      const d = distance(gp, dp);
      if (d < min) min = d;
    }
    if (min <= tolerance) covered++;
  }
  return covered / guide.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function tracePoints(params: {
  score: number;
  start: number;
  end: number;
  lengthRate: number;
  direction: number;
  coverage: number;
  threshold: number;
}): number {
  const { score, start, end, lengthRate, direction, coverage, threshold } = params;
  const dtwPart = clamp(1 - score / (threshold * 1.6), 0, 1) * 35;
  const startPart = clamp(1 - start / (threshold * 2), 0, 1) * 15;
  const endPart = clamp(1 - end / (threshold * 2), 0, 1) * 15;
  const lengthPart = clamp(1 - Math.abs(1 - lengthRate) / 0.9, 0, 1) * 10;
  const directionPart = clamp(direction, 0, 1) * 10;
  const coveragePart = clamp(coverage, 0, 1) * 15;
  return Math.round(dtwPart + startPart + endPart + lengthPart + directionPart + coveragePart);
}

export function judgeTrace(params: {
  guideStrokes: Point[][];
  drawnStrokes: Point[][];
  threshold: number;
  requireStrictStrokeCount: boolean;
}): TraceJudgeResult {
  const { guideStrokes, drawnStrokes, threshold, requireStrictStrokeCount } = params;

  const results = guideStrokes.map((guideStroke, index) => {
    const drawn = drawnStrokes[index];
    if (!drawn) {
      return {
        index,
        grade: "retry",
        ok: false,
        points: 0,
        score: Infinity,
        start: Infinity,
        end: Infinity,
        lengthRate: 0,
        direction: 0,
        coverage: 0,
        message: "未入力",
      };
    }

    const guideNorm = resamplePoints(guideStroke, 80);
    const drawnNorm = resamplePoints(drawn, 80);
    const score = dtwDistance(guideNorm, drawnNorm);
    const start = distance(drawnNorm[0], guideNorm[0]);
    const end = distance(drawnNorm[drawnNorm.length - 1], guideNorm[guideNorm.length - 1]);
    const lengthRate = pathLength(drawn) / Math.max(pathLength(guideStroke), 1);
    const direction = directionSimilarity(guideNorm, drawnNorm);
    const coverage = guideCoverage(guideNorm, drawnNorm, threshold * 1.25);

    const great =
      score <= threshold &&
      start <= threshold * 1.55 &&
      end <= threshold * 1.55 &&
      lengthRate >= 0.55 &&
      lengthRate <= 1.85 &&
      direction >= 0.45 &&
      coverage >= 0.72;
    const good =
      great ||
      (score <= threshold * 1.35 &&
        start <= threshold * 1.9 &&
        end <= threshold * 1.9 &&
        lengthRate >= 0.45 &&
        lengthRate <= 2.1 &&
        direction >= 0.32 &&
        coverage >= 0.58);
    const grade: JudgeGrade = great ? "great" : good ? "good" : "retry";
    const points = tracePoints({ score, start, end, lengthRate, direction, coverage, threshold });

    return {
      index,
      grade,
      ok: great,
      points,
      score,
      start,
      end,
      lengthRate,
      direction,
      coverage,
      message: great ? "たいへんよくできました" : good ? "いい感じ" : "もう一度",
    };
  });

  const strokeCountOk = !requireStrictStrokeCount || drawnStrokes.length === guideStrokes.length;
  const grade: JudgeGrade = !strokeCountOk
    ? "retry"
    : results.every((result) => result.grade === "great")
      ? "great"
      : results.every((result) => result.grade !== "retry")
        ? "good"
        : "retry";
  return {
    strokeCountOk,
    grade,
    allOk: strokeCountOk && results.every((result) => result.ok),
    results,
  };
}
