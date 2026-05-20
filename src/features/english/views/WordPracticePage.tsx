import { useEffect, useMemo, useState } from "react";

import { ScoreItem, WordTraceCanvas } from "@/features/english/components/WordTraceCanvas";
import { WORD_PRACTICE_ITEMS } from "@/features/english/domain/wordPracticeItems";
import type { TraceJudgeResult } from "@/features/english/domain/traceJudge";

type WordPracticePageProps = {
  onBackHome: () => void;
  onGoAlphabet?: () => void;
  onGoGame?: () => void;
};

type StatusKind = "neutral" | "great" | "good" | "retry";

function statusClassName(kind: StatusKind): string {
  if (kind === "great") return "text-emerald-700";
  if (kind === "good") return "text-amber-700";
  if (kind === "retry") return "text-rose-700";
  return "text-slate-800";
}

function canUseSpeechSynthesis(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function findPreferredEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  if (englishVoices.length === 0) return null;
  const preferredVoiceNames = ["google us english", "microsoft jenny", "microsoft aria", "google uk english female", "nicky", "aaron", "eddy", "sandy", "shelley", "daniel", "karen", "alex", "samantha"];
  for (const preferredName of preferredVoiceNames) {
    const voice = englishVoices.find((candidate) => candidate.name.toLowerCase().includes(preferredName));
    if (voice) return voice;
  }
  return englishVoices.find((voice) => voice.lang.toLowerCase() === "en-us") ?? englishVoices.find((voice) => voice.lang.toLowerCase() === "en-gb") ?? englishVoices[0];
}

export function WordPracticePage({ onBackHome, onGoAlphabet, onGoGame }: WordPracticePageProps) {
  const [selectedItemId, setSelectedItemId] = useState(WORD_PRACTICE_ITEMS[0].id);
  const [judgeResult, setJudgeResult] = useState<TraceJudgeResult | null>(null);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [speechVoices, setSpeechVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [status, setStatus] = useState<{ text: string; kind: StatusKind }>(() => ({
    text: `${WORD_PRACTICE_ITEMS[0].label}をじゅんばんになぞってね`,
    kind: "neutral",
  }));

  const selectedItem = useMemo(
    () => WORD_PRACTICE_ITEMS.find((item) => item.id === selectedItemId) ?? WORD_PRACTICE_ITEMS[0],
    [selectedItemId],
  );
  const selectedGuide = selectedItem.units[0].guide;

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

  const speakSelectedWord = () => {
    if (!canUseSpeechSynthesis()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedItem.label.toLowerCase());
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

  const selectItem = (item: typeof WORD_PRACTICE_ITEMS[number]) => {
    setSelectedItemId(item.id);
    setJudgeResult(null);
    setStatus({ text: `${item.label}をじゅんばんになぞってね`, kind: "neutral" });
  };

  const handleJudge = (result: TraceJudgeResult) => {
    setJudgeResult(result.results.length > 0 ? result : null);
    if (result.results.length === 0) {
      setStatus({ text: `${selectedItem.label}をじゅんばんになぞってね`, kind: "neutral" });
    } else if (result.grade === "great") {
      setStatus({ text: "たいへんよくできました！", kind: "great" });
    } else if (result.grade === "good") {
      setStatus({ text: "いい感じ！もう少しきれいになぞれるよ", kind: "good" });
    } else if (!result.strokeCountOk) {
      setStatus({ text: "書く順番をもう一度見てね", kind: "retry" });
    } else {
      setStatus({ text: "点線にそってもう一度", kind: "retry" });
    }
  };

  return (
    <main className="min-h-screen bg-[#fff7df] px-3 py-4 text-[#3b2f2f]">
      <div className="mx-auto max-w-6xl">
        <header className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-amber-700">えいごれんしゅう ・ ことば</p>
            <h1 className="font-[var(--pop-font)] text-3xl font-black text-slate-800 sm:text-4xl">えいごの ことばを なぞろう</h1>
          </div>
          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            {onGoGame ? <button type="button" onClick={onGoGame} className="rounded-2xl bg-orange-400 px-5 py-3 text-base font-black text-white shadow-sm transition active:translate-y-0.5">ゲームへ</button> : null}
            {onGoAlphabet ? <button type="button" onClick={onGoAlphabet} className="rounded-2xl bg-emerald-400 px-5 py-3 text-base font-black text-white shadow-sm transition active:translate-y-0.5">ABCへ</button> : null}
            <button type="button" onClick={onBackHome} className="rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-base font-black text-slate-700 shadow-sm transition active:translate-y-0.5">トップへ</button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(300px,560px)_1fr]">
          <section className="rounded-[24px] border-[3px] border-[#f1d28a] bg-white p-3 shadow-[0_8px_0_rgba(150,110,40,0.12)]">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {WORD_PRACTICE_ITEMS.map((item) => (
                <button key={item.id} type="button" onClick={() => selectItem(item)} className={`min-w-9 rounded-xl px-2.5 py-1.5 text-base font-black shadow-[0_3px_0_rgba(150,110,40,0.2)] transition active:translate-y-0.5 ${item.id === selectedItem.id ? "bg-[#ffb84d] text-[#3b2f2f]" : "bg-[#fff2c6] text-[#6b4f28]"}`} aria-pressed={item.id === selectedItem.id}>
                  {item.emoji} {item.label}
                </button>
              ))}
            </div>

            <WordTraceCanvas guide={selectedGuide} resetKey={selectedItem.id} onJudge={handleJudge} />

            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" onClick={speakSelectedWord} disabled={!speechAvailable} className="rounded-full bg-[#ffb84d] px-6 py-3 text-lg font-black text-[#3b2f2f] shadow-[0_5px_0_#d78c28] transition active:translate-y-0.5 active:shadow-[0_2px_0_#d78c28] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none" aria-label={`${selectedItem.label}を音声で読む`}>よむ</button>
            </div>
          </section>

          <aside className="rounded-[24px] border-[3px] border-[#f1d28a] bg-white p-3 shadow-[0_8px_0_rgba(150,110,40,0.12)]">
            <div className="mb-4 rounded-[22px] bg-gradient-to-br from-amber-50 to-emerald-50 p-5 text-center shadow-inner">
              <div className="text-6xl" aria-hidden="true">{selectedItem.emoji}</div>
              <div className="mt-2 font-[var(--pop-font)] text-5xl font-black tracking-wide text-slate-800">{selectedItem.label}</div>
              <div className="mt-3 rounded-2xl bg-white/85 px-4 py-4 text-5xl font-black text-emerald-700 shadow-sm">{selectedItem.meaning}</div>
            </div>
            <p className={`mb-3 text-2xl font-black ${statusClassName(status.kind)}`}>{status.text}</p>
            <div className="grid gap-3">{judgeResult?.results.map((result) => <ScoreItem key={result.index} result={result} />)}</div>
            <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold leading-7 text-slate-600">{selectedGuide.note}</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
