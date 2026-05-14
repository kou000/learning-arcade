import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { ALPHABET_PRACTICE_GROUPS, type PracticeItem } from "@/features/english/domain/practiceItems";
import {
  judgeTrace,
  smoothPoints,
  type JudgeGrade,
  type StrokeJudgeResult,
  type TraceJudgeResult,
} from "@/features/english/domain/traceJudge";
import type { LetterCase, LetterGuide, Point, StrokeNumberPosition } from "@/features/english/domain/letterGuides";

type AlphabetPracticePageProps = {
  onBackHome: () => void;
};

const CANVAS_SIZE = 520;
const FIXED_TRACE_THRESHOLD = 20;
const SHOW_LETTER_CASE_TOGGLE = false;

type StatusKind = "neutral" | JudgeGrade;

function statusClassName(kind: StatusKind): string {
  if (kind === "great") return "text-emerald-700";
  if (kind === "good") return "text-amber-700";
  if (kind === "retry") return "text-rose-700";
  return "text-slate-800";
}

function gradeClassName(grade: JudgeGrade): string {
  if (grade === "great") return "text-emerald-700";
  if (grade === "good") return "text-amber-700";
  return "text-rose-700";
}

function canUseSpeechSynthesis(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function findPreferredEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  if (englishVoices.length === 0) return null;

  const preferredVoiceNames = [
    "google us english",
    "microsoft jenny",
    "microsoft aria",
    "google uk english female",
    "nicky",
    "aaron",
    "eddy",
    "sandy",
    "shelley",
    "daniel",
    "karen",
    "alex",
    "samantha",
  ];

  for (const preferredName of preferredVoiceNames) {
    const voice = englishVoices.find((candidate) => candidate.name.toLowerCase().includes(preferredName));
    if (voice) return voice;
  }

  return (
    englishVoices.find((voice) => voice.lang.toLowerCase() === "en-us") ??
    englishVoices.find((voice) => voice.lang.toLowerCase() === "en-gb") ??
    englishVoices[0]
  );
}

function setupCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = CANVAS_SIZE * ratio;
  canvas.height = CANVAS_SIZE * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

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
    const first = stroke[0];
    const last = stroke[stroke.length - 1];
    drawEndpoint(ctx, first, "start", index + 1);
    drawEndpoint(ctx, last, "end", null);
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

export function AlphabetPracticePage({ onBackHome }: AlphabetPracticePageProps) {
  const [selectedLetterCase, setSelectedLetterCase] = useState<LetterCase>("uppercase");
  const [selectedItemId, setSelectedItemId] = useState(ALPHABET_PRACTICE_GROUPS.uppercase[0].id);
  const [drawnStrokes, setDrawnStrokes] = useState<Point[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [judgeResult, setJudgeResult] = useState<TraceJudgeResult | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [speechVoices, setSpeechVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [status, setStatus] = useState<{ text: string; kind: StatusKind }>(() => {
    const guide = ALPHABET_PRACTICE_GROUPS.uppercase[0].units[0].guide;
    return { text: `${guide.label}を${guide.strokes.length}画でなぞってね`, kind: "neutral" };
  });

  const guideCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const guideCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Point[]>([]);
  const drawnStrokesRef = useRef<Point[][]>([]);

  const practiceItems = ALPHABET_PRACTICE_GROUPS[selectedLetterCase];
  const selectedItem = useMemo(
    () => practiceItems.find((item) => item.id === selectedItemId) ?? practiceItems[0],
    [practiceItems, selectedItemId],
  );
  const selectedUnit = selectedItem.units[0];
  const selectedGuide = selectedUnit.guide;
  const activeThreshold = FIXED_TRACE_THRESHOLD;

  useEffect(() => {
    if (!canUseSpeechSynthesis()) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setSpeechVoices(voices);
      setSpeechAvailable(voices.some((voice) => voice.lang.toLowerCase().startsWith("en")));
    };

    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const resetDrawingState = (item: PracticeItem = selectedItem) => {
    const guide = item.units[0].guide;
    drawnStrokesRef.current = [];
    currentStrokeRef.current = [];
    setDrawnStrokes([]);
    setCurrentStroke([]);
    setJudgeResult(null);
    setStatus({ text: `${guide.label}を${guide.strokes.length}画でなぞってね`, kind: "neutral" });
  };

  const runJudge = (nextDrawnStrokes: Point[][] = drawnStrokesRef.current, updateMainStatus = true) => {
    const result = judgeTrace({
      guideStrokes: selectedGuide.strokes,
      drawnStrokes: nextDrawnStrokes,
      threshold: activeThreshold,
      requireStrictStrokeCount: true,
    });
    setJudgeResult(result);

    if (!updateMainStatus && nextDrawnStrokes.length === 0) return;
    if (result.grade === "great") {
      setStatus({ text: "たいへんよくできました！", kind: "great" });
    } else if (result.grade === "good") {
      setStatus({ text: "いい感じ！もう少しきれいになぞれるよ", kind: "good" });
    } else if (!result.strokeCountOk) {
      setStatus({ text: `画数が違います。${selectedGuide.strokes.length}画で書いてね`, kind: "retry" });
    } else {
      setStatus({ text: "点線にそってもう一度", kind: "retry" });
    }
  };

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
      drawGuide(guideCtx, selectedGuide);
      drawInput(drawCtx, drawnStrokesRef.current, currentStrokeRef.current);
    };

    redrawAll();
    window.addEventListener("resize", redrawAll);
    return () => window.removeEventListener("resize", redrawAll);
  }, [selectedGuide]);

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

  const selectItem = (item: PracticeItem) => {
    if (item.id === selectedItemId) return;
    setSelectedItemId(item.id);
    resetDrawingState(item);
  };

  const selectLetterCase = (letterCase: LetterCase) => {
    if (letterCase === selectedLetterCase) return;
    const nextItem = ALPHABET_PRACTICE_GROUPS[letterCase][0];
    setSelectedLetterCase(letterCase);
    setSelectedItemId(nextItem.id);
    resetDrawingState(nextItem);
  };

  const getCanvasPoint = (event: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
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
      if (nextDrawnStrokes.length >= selectedGuide.strokes.length) {
        runJudge(nextDrawnStrokes);
      } else {
        setJudgeResult(null);
        setStatus({
          text: `${selectedGuide.label}を${selectedGuide.strokes.length}画でなぞってね。現在: ${nextDrawnStrokes.length}画`,
          kind: "neutral",
        });
      }
    }
    currentStrokeRef.current = [];
    setCurrentStroke([]);
  };

  const clearDrawing = () => {
    resetDrawingState();
    const drawCtx = drawCtxRef.current;
    if (drawCtx) drawInput(drawCtx, [], []);
  };

  const speakSelectedLetter = () => {
    if (!canUseSpeechSynthesis()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedGuide.label.toUpperCase());
    const voice = findPreferredEnglishVoice(speechVoices.length > 0 ? speechVoices : window.speechSynthesis.getVoices());
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }
    utterance.rate = 0.68;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <main className="min-h-screen bg-[#fff7df] px-3 py-4 text-[#3b2f2f]">
      <div className="mx-auto max-w-6xl">
        <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-amber-700">えいごれんしゅう</p>
            <h1 className="font-[var(--pop-font)] text-3xl font-black text-slate-800 sm:text-4xl">
              アルファベットを なぞろう
            </h1>
          </div>
          <button
            type="button"
            onClick={onBackHome}
            className="self-start rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-base font-black text-slate-700 shadow-sm transition active:translate-y-0.5 sm:self-auto"
          >
            トップへ
          </button>
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(300px,560px)_1fr]">
          <section className="rounded-[24px] border-[3px] border-[#f1d28a] bg-white p-3 shadow-[0_8px_0_rgba(150,110,40,0.12)]">
            {SHOW_LETTER_CASE_TOGGLE ? (
              <div className="mb-3 grid grid-cols-2 gap-2 rounded-2xl bg-[#fff2c6] p-1">
                {([
                  { key: "uppercase", label: "大文字" },
                  { key: "lowercase", label: "小文字" },
                ] satisfies { key: LetterCase; label: string }[]).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => selectLetterCase(item.key)}
                    className={`rounded-xl px-3 py-2 text-sm font-black transition active:translate-y-0.5 ${
                      item.key === selectedLetterCase ? "bg-[#ffb84d] text-[#3b2f2f]" : "text-[#6b4f28]"
                    }`}
                    aria-pressed={item.key === selectedLetterCase}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mb-3 flex flex-wrap gap-1.5">
              {practiceItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={`min-w-9 rounded-xl px-2.5 py-1.5 text-base font-black shadow-[0_3px_0_rgba(150,110,40,0.2)] transition active:translate-y-0.5 ${
                    item.id === selectedItem.id ? "bg-[#ffb84d] text-[#3b2f2f]" : "bg-[#fff2c6] text-[#6b4f28]"
                  }`}
                  aria-pressed={item.id === selectedItem.id}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="relative aspect-square w-full overflow-hidden rounded-[20px] border-2 border-[#f3d996] bg-[#fffdf7] touch-none">
              <canvas ref={guideCanvasRef} className="absolute inset-0 h-full w-full touch-none" aria-hidden="true" />
              <canvas
                ref={drawCanvasRef}
                className="absolute inset-0 h-full w-full touch-none"
                onPointerDown={startStroke}
                onPointerMove={moveStroke}
                onPointerUp={finishStroke}
                onPointerCancel={finishStroke}
                onPointerLeave={finishStroke}
                aria-label={`${selectedUnit.label}を書くキャンバス`}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={speakSelectedLetter}
                disabled={!speechAvailable}
                className="rounded-full bg-[#ffb84d] px-6 py-3 text-lg font-black text-[#3b2f2f] shadow-[0_5px_0_#d78c28] transition active:translate-y-0.5 active:shadow-[0_2px_0_#d78c28] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                aria-label={`${selectedUnit.label}を音声で読む`}
              >
                よむ
              </button>
              <button
                type="button"
                onClick={clearDrawing}
                className="rounded-full bg-[#b7e4ff] px-6 py-3 text-lg font-black text-[#3b2f2f] shadow-[0_5px_0_#74b7dd] transition active:translate-y-0.5 active:shadow-[0_2px_0_#74b7dd]"
              >
                消す
              </button>
            </div>
          </section>

          <aside className="rounded-[24px] border-[3px] border-[#f1d28a] bg-white p-3 shadow-[0_8px_0_rgba(150,110,40,0.12)]">
            <p className={`mb-3 text-2xl font-black ${statusClassName(status.kind)}`}>{status.text}</p>

            <div className="grid gap-3">
              {judgeResult?.results.map((result) => (
                <ScoreItem key={result.index} result={result} />
              ))}
            </div>

            <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold leading-7 text-slate-600">
              {selectedGuide.note}
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ScoreItem({ result }: { result: StrokeJudgeResult }) {
  return (
    <div className="rounded-2xl border-2 border-[#f1d28a] bg-[#fff7df] p-3 text-sm font-bold leading-7 text-slate-700">
      <div className={`text-base font-black ${gradeClassName(result.grade)}`}>
        {result.index + 1}画目: {result.message}
      </div>
      <div className="text-2xl font-black text-slate-800">{result.points}点</div>
    </div>
  );
}
