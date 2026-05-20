import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import type { LetterGuide, Point, StrokeNumberPosition } from "@/features/english/domain/letterGuides";
import {
  judgeTrace,
  smoothPoints,
  type StrokeJudgeResult,
  type TraceJudgeResult,
} from "@/features/english/domain/traceJudge";

const CANVAS_SIZE = 520;
const FIXED_TRACE_THRESHOLD = 20;

function drawSmoothPolyline(ctx: CanvasRenderingContext2D, points: Point[]) {
  if (points.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length < 3) {
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  } else {
    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
  }
  ctx.stroke();
}

function drawEndpoint(ctx: CanvasRenderingContext2D, point: Point, kind: "start" | "end", number: number | null) {
  ctx.beginPath();
  ctx.arc(point.x, point.y, kind === "start" ? 10 : 7, 0, Math.PI * 2);
  ctx.fillStyle = kind === "start" ? "rgba(255, 120, 80, 0.95)" : "rgba(80, 160, 220, 0.95)";
  ctx.fill();
  if (number !== null) {
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(String(number), point.x, point.y);
  }
}

function drawStrokeNumbers(ctx: CanvasRenderingContext2D, positions: StrokeNumberPosition[]) {
  ctx.save();
  ctx.font = "bold 28px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const p of positions) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffb84d";
    ctx.stroke();
    ctx.fillStyle = "#8a5522";
    ctx.fillText(p.n, p.x, p.y + 1);
  }
  ctx.restore();
}

function drawGuide(ctx: CanvasRenderingContext2D, guide: LetterGuide) {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 48;
  ctx.strokeStyle = "rgba(255, 184, 77, 0.22)";
  for (const stroke of guide.strokes) drawSmoothPolyline(ctx, stroke);
  ctx.restore();

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 7;
  ctx.setLineDash([10, 13]);
  ctx.strokeStyle = "rgba(214, 126, 35, 0.9)";
  for (const stroke of guide.strokes) drawSmoothPolyline(ctx, stroke);
  ctx.restore();

  ctx.save();
  guide.strokes.forEach((stroke, index) => {
    drawEndpoint(ctx, stroke[0], "start", index + 1);
    drawEndpoint(ctx, stroke[stroke.length - 1], "end", null);
  });
  ctx.restore();
  drawStrokeNumbers(ctx, guide.numberPositions);
}

function drawInput(ctx: CanvasRenderingContext2D, drawnStrokes: Point[][], currentStroke: Point[]) {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 14;
  ctx.strokeStyle = "#4aa3df";
  for (const stroke of drawnStrokes) drawSmoothPolyline(ctx, stroke);
  if (currentStroke.length > 0) drawSmoothPolyline(ctx, currentStroke);
  ctx.restore();
}

function setupCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = CANVAS_SIZE * ratio;
  canvas.height = CANVAS_SIZE * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

export type WordTraceCanvasHandle = {
  clear: () => void;
};

type Props = {
  guide: LetterGuide;
  resetKey?: string | number;
  onJudge?: (result: TraceJudgeResult) => void;
  onSuccess?: (result: TraceJudgeResult) => void;
  className?: string;
};

export function WordTraceCanvas({ guide, resetKey, onJudge, onSuccess, className }: Props) {
  const [drawnStrokes, setDrawnStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const guideCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const guideCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Point[]>([]);
  const drawnStrokesRef = useRef<Point[][]>([]);
  const successNotifiedRef = useRef(false);

  const clearDrawing = () => {
    drawnStrokesRef.current = [];
    currentStrokeRef.current = [];
    successNotifiedRef.current = false;
    setDrawnStrokes([]);
    setCurrentStroke([]);
    const drawCtx = drawCtxRef.current;
    if (drawCtx) drawInput(drawCtx, [], []);
  };

  useEffect(() => {
    clearDrawing();
  }, [guide, resetKey]);

  useEffect(() => {
    const guideCanvas = guideCanvasRef.current;
    const drawCanvas = drawCanvasRef.current;
    const guideCtx = guideCanvas?.getContext("2d") ?? null;
    const drawCtx = drawCanvas?.getContext("2d") ?? null;
    if (!guideCanvas || !drawCanvas || !guideCtx || !drawCtx) return;
    guideCtxRef.current = guideCtx;
    drawCtxRef.current = drawCtx;
    const redrawAll = () => {
      setupCanvas(guideCanvas, guideCtx);
      setupCanvas(drawCanvas, drawCtx);
      drawGuide(guideCtx, guide);
      drawInput(drawCtx, drawnStrokesRef.current, currentStrokeRef.current);
    };
    redrawAll();
    window.addEventListener("resize", redrawAll);
    return () => window.removeEventListener("resize", redrawAll);
  }, [guide]);

  useEffect(() => {
    const drawCtx = drawCtxRef.current;
    if (!drawCtx) return;
    drawInput(drawCtx, drawnStrokes, currentStroke);
  }, [drawnStrokes, currentStroke]);

  useEffect(() => {
    drawnStrokesRef.current = drawnStrokes;
  }, [drawnStrokes]);

  useEffect(() => {
    currentStrokeRef.current = currentStroke;
  }, [currentStroke]);

  const getCanvasPoint = (event: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (CANVAS_SIZE / rect.width),
      y: (event.clientY - rect.top) * (CANVAS_SIZE / rect.height),
    };
  };

  const appendPoint = (point: Point) => {
    const stroke = currentStrokeRef.current;
    const last = stroke[stroke.length - 1];
    if (!last || Math.hypot(last.x - point.x, last.y - point.y) >= 2.2) {
      const next = [...stroke, point];
      currentStrokeRef.current = next;
      setCurrentStroke(next);
    }
  };

  const runJudge = (nextDrawnStrokes: Point[][]) => {
    const result = judgeTrace({
      guideStrokes: guide.strokes,
      drawnStrokes: nextDrawnStrokes,
      threshold: FIXED_TRACE_THRESHOLD,
      requireStrictStrokeCount: true,
    });
    onJudge?.(result);
    if (result.allOk && !successNotifiedRef.current) {
      successNotifiedRef.current = true;
      onSuccess?.(result);
    }
  };

  const startStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    currentStrokeRef.current = [];
    setCurrentStroke([]);
    appendPoint(getCanvasPoint(event));
  };

  const moveStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    event.preventDefault();
    appendPoint(getCanvasPoint(event));
  };

  const finishStroke = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    event.preventDefault();
    isDrawingRef.current = false;
    const stroke = currentStrokeRef.current;
    if (stroke.length >= 2) {
      const nextDrawnStrokes = [...drawnStrokesRef.current, smoothPoints(stroke, 2)];
      drawnStrokesRef.current = nextDrawnStrokes;
      setDrawnStrokes(nextDrawnStrokes);
      if (nextDrawnStrokes.length >= guide.strokes.length) runJudge(nextDrawnStrokes);
      else onJudge?.({ strokeCountOk: false, grade: "retry", allOk: false, results: [] });
    }
    currentStrokeRef.current = [];
    setCurrentStroke([]);
  };

  return (
    <div className={`relative aspect-square w-full overflow-hidden rounded-[20px] border-2 border-[#f3d996] bg-[#fffdf7] touch-none ${className ?? ""}`}>
      <canvas ref={guideCanvasRef} className="absolute inset-0 h-full w-full touch-none" aria-hidden="true" />
      <canvas
        ref={drawCanvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        onPointerDown={startStroke}
        onPointerMove={moveStroke}
        onPointerUp={finishStroke}
        onPointerCancel={finishStroke}
        onPointerLeave={finishStroke}
        aria-label={`${guide.label}を書くキャンバス`}
      />
      <button
        type="button"
        onClick={clearDrawing}
        className="absolute bottom-3 right-3 rounded-full bg-[#b7e4ff] px-4 py-2 text-sm font-black text-[#3b2f2f] shadow-[0_4px_0_#74b7dd] transition active:translate-y-0.5 active:shadow-[0_2px_0_#74b7dd]"
      >
        消す
      </button>
    </div>
  );
}

export function gradeClassName(grade: "great" | "good" | "retry"): string {
  if (grade === "great") return "text-emerald-700";
  if (grade === "good") return "text-amber-700";
  return "text-rose-700";
}

export function ScoreItem({ result }: { result: StrokeJudgeResult }) {
  return (
    <div className="rounded-2xl border-2 border-[#f1d28a] bg-[#fff7df] p-3 text-sm font-bold leading-7 text-slate-700">
      <div className={`text-base font-black ${gradeClassName(result.grade)}`}>
        {result.index + 1}画目: {result.message}
      </div>
      <div className="text-2xl font-black text-slate-800">{result.points}点</div>
    </div>
  );
}
