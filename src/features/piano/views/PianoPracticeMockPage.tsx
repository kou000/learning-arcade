import { useEffect, useMemo, useRef, useState } from "react";

import { PianoAudioEngine } from "@/features/piano/audio/audioEngine";
import { PIANO_SONGS, flattenSongNotes } from "@/features/piano/domain/score";

type PianoPracticeMockPageProps = {
  onBackHome: () => void;
};

type PianoKey = {
  id: string;
  type: "white" | "black";
  label?: string;
  finger?: string;
  hand?: "left" | "right";
};

type TempoId = "slow" | "normal" | "fast";

type RecordedNote = {
  noteId: string;
  atMs: number;
};

const PIANO_KEYS: PianoKey[] = [
  { id: "c4", type: "white", label: "ド", finger: "1", hand: "left" },
  { id: "c4s", type: "black" },
  { id: "d4", type: "white", label: "レ", finger: "2", hand: "left" },
  { id: "d4s", type: "black" },
  { id: "e4", type: "white", label: "ミ", finger: "3", hand: "left" },
  { id: "f4", type: "white", label: "ファ", finger: "4", hand: "left" },
  { id: "f4s", type: "black" },
  { id: "g4", type: "white", label: "ソ", finger: "5", hand: "left" },
  { id: "g4s", type: "black" },
  { id: "a4", type: "white", label: "ラ", finger: "1", hand: "right" },
  { id: "a4s", type: "black" },
  { id: "b4", type: "white", label: "シ", finger: "2", hand: "right" },
  { id: "c5", type: "white", label: "ド", finger: "1", hand: "right" },
  { id: "c5s", type: "black" },
  { id: "d5", type: "white", label: "レ", finger: "2", hand: "right" },
  { id: "d5s", type: "black" },
  { id: "e5", type: "white", label: "ミ", finger: "3", hand: "right" },
  { id: "f5", type: "white", label: "ファ", finger: "4", hand: "right" },
  { id: "f5s", type: "black" },
  { id: "g5", type: "white", label: "ソ", finger: "5", hand: "right" },
  { id: "g5s", type: "black" },
  { id: "a5", type: "white", label: "ラ", finger: "3", hand: "right" },
  { id: "a5s", type: "black" },
  { id: "b5", type: "white", label: "シ", finger: "4", hand: "right" },
];

const TEMPO_OPTIONS = [
  { id: "slow", label: "おそい", icon: "🐌", stepMs: 900 },
  { id: "normal", label: "ふつう", icon: "🎵", stepMs: 650 },
  { id: "fast", label: "はやい", icon: "🚀", stepMs: 430 },
] as const;

const ACTION_BUTTONS = [
  { id: "model", label: "おてほん", icon: "▶️", color: "bg-cyan-300 text-cyan-900 shadow-cyan-400" },
  { id: "record", label: "ろくおん", icon: "🎙️", color: "bg-rose-300 text-rose-900 shadow-rose-400" },
  { id: "listen", label: "きく", icon: "🎧", color: "bg-violet-300 text-violet-900 shadow-violet-400" },
] as const;

const STAFF_LINES = [16, 30, 44, 58, 72];

const NOTE_STAFF_POSITION: Record<string, number> = {
  c4: 82,
  c4s: 82,
  d4: 76,
  d4s: 76,
  e4: 72,
  f4: 66,
  f4s: 66,
  g4: 58,
  g4s: 58,
  a4: 52,
  a4s: 52,
  b4: 44,
  c5: 38,
  c5s: 38,
  d5: 30,
  d5s: 30,
  e5: 24,
  f5: 16,
  f5s: 16,
  g5: 10,
  g5s: 10,
  a5: 6,
  a5s: 6,
  b5: 2,
};

const durationToDenominator = (durationBeat: number) => {
  if (durationBeat >= 4) return 1;
  if (durationBeat >= 2) return 2;
  if (durationBeat >= 1) return 4;
  if (durationBeat >= 0.5) return 8;
  return 16;
};

export function PianoPracticeMockPage({ onBackHome }: PianoPracticeMockPageProps) {
  const [selectedSongId, setSelectedSongId] = useState<string>(PIANO_SONGS[0].id);
  const [selectedTempo, setSelectedTempo] = useState<TempoId>("normal");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPracticeCompleted, setIsPracticeCompleted] = useState(false);
  const [encouragement, setEncouragement] = useState("さいごまで ひいてみよう！");
  const [activeNoteIds, setActiveNoteIds] = useState<string[]>([]);
  const [isModelPlaying, setIsModelPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayback, setIsPlayback] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<RecordedNote[]>([]);
  const [recordedDurationMs, setRecordedDurationMs] = useState(0);
  const [rewardStars, setRewardStars] = useState(12);
  const [volumePercent, setVolumePercent] = useState(80);

  const audioEngineRef = useRef<PianoAudioEngine>(new PianoAudioEngine());
  const recordingStartAtRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);

  const selectedSong = useMemo(
    () => PIANO_SONGS.find((song) => song.id === selectedSongId) ?? PIANO_SONGS[0],
    [selectedSongId],
  );
  const practiceNotes = useMemo(() => flattenSongNotes(selectedSong), [selectedSong]);
  const whiteKeys = useMemo(() => PIANO_KEYS.filter((key) => key.type === "white"), []);
  const selectedTempoConfig = useMemo(
    () => TEMPO_OPTIONS.find((tempo) => tempo.id === selectedTempo) ?? TEMPO_OPTIONS[1],
    [selectedTempo],
  );
  const visibleStart = Math.floor(currentStep / 8) * 8;
  const visibleNotes = useMemo(() => practiceNotes.slice(visibleStart, visibleStart + 8), [practiceNotes, visibleStart]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
      void audioEngineRef.current.dispose();
    };
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const resetSessionState = () => {
    clearTimers();
    setCurrentStep(0);
    setIsPracticeCompleted(false);
    setEncouragement("さいごまで ひいてみよう！");
    setActiveNoteIds([]);
    setIsModelPlaying(false);
    setIsRecording(false);
    setIsPlayback(false);
    setRecordedNotes([]);
    setRecordedDurationMs(0);
  };

  const selectSong = (songId: string) => {
    if (songId === selectedSongId) return;
    setSelectedSongId(songId);
    resetSessionState();
    setEncouragement("きょくを えらんだよ！おてほんを きいてみよう");
  };

  const playTone = async (noteId: string, durationMs = 260) => {
    const volume = Math.max(0, Math.min(1, volumePercent / 100));
    await audioEngineRef.current.playOneShot(noteId, durationMs, volume);
  };

  const pulseKey = (noteId: string, pulseMs = 240) => {
    setActiveNoteIds((prev) => (prev.includes(noteId) ? prev : [...prev, noteId]));
    const timer = window.setTimeout(() => {
      setActiveNoteIds((prev) => prev.filter((id) => id !== noteId));
    }, pulseMs);
    timersRef.current.push(timer);
  };

  const updateProgressByInput = (noteId: string) => {
    const expectedIndex = practiceNotes.findIndex((note, index) => index >= currentStep && note.requiresInput);
    if (expectedIndex < 0) return;

    const expected = practiceNotes[expectedIndex]?.noteId;
    if (!expected) return;

    if (noteId !== expected) {
      setEncouragement("そのおとじゃないよ。つぎはピカッとかがやくキー！");
      return;
    }

    const nextStep = expectedIndex + 1;

    if (nextStep >= practiceNotes.length) {
      setCurrentStep(practiceNotes.length - 1);
      if (!isPracticeCompleted) {
        setRewardStars((prev) => prev + 1);
      }
      setIsPracticeCompleted(true);
      setEncouragement("やったー！ほしを1こゲット✨ つぎのきょくにいこう！");
      return;
    }

    setCurrentStep(nextStep);
    setEncouragement("そのちょうし！");
  };

  const onPlayNote = async (noteId: string, options?: { fromAuto?: boolean; skipProgress?: boolean }) => {
    pulseKey(noteId);
    await playTone(noteId);

    if (isRecording && !options?.fromAuto) {
      const atMs = Math.max(0, Date.now() - recordingStartAtRef.current);
      setRecordedNotes((prev) => [...prev, { noteId, atMs }]);
      setRecordedDurationMs(atMs);
    }

    if (!options?.skipProgress && !options?.fromAuto) {
      updateProgressByInput(noteId);
    }
  };

  const startModelPlay = () => {
    if (isModelPlaying || isPlayback) return;
    clearTimers();
    setIsModelPlaying(true);
    setEncouragement("おてほん さいせいちゅう");

    practiceNotes.forEach((note, index) => {
      const timer = window.setTimeout(() => {
        void onPlayNote(note.noteId, { fromAuto: true, skipProgress: true });
        if (index === practiceNotes.length - 1) {
          setIsModelPlaying(false);
          setEncouragement("まねして ひいてみよう！");
        }
      }, index * selectedTempoConfig.stepMs);
      timersRef.current.push(timer);
    });
  };

  const toggleRecording = () => {
    if (isModelPlaying || isPlayback) return;

    if (isRecording) {
      const duration = Math.max(0, Date.now() - recordingStartAtRef.current);
      setRecordedDurationMs(duration);
      setIsRecording(false);
      setEncouragement(recordedNotes.length > 0 ? "ろくおん できた！「きく」をおしてね" : "おとをならして みよう");
      return;
    }

    setRecordedNotes([]);
    setRecordedDurationMs(0);
    recordingStartAtRef.current = Date.now();
    setIsRecording(true);
    setEncouragement("ろくおんちゅう... けんばんをひいてね");
  };

  const playRecording = () => {
    if (isModelPlaying || isRecording || isPlayback || recordedNotes.length === 0) return;
    clearTimers();
    setIsPlayback(true);
    setEncouragement("ろくおんを さいせいちゅう");

    recordedNotes.forEach((item, index) => {
      const timer = window.setTimeout(() => {
        void onPlayNote(item.noteId, { fromAuto: true, skipProgress: true });
        if (index === recordedNotes.length - 1) {
          const finishTimer = window.setTimeout(() => {
            setIsPlayback(false);
            setEncouragement("もういちど ひいてみよう！");
          }, 250);
          timersRef.current.push(finishTimer);
        }
      }, item.atMs);
      timersRef.current.push(timer);
    });
  };

  const restartPractice = () => {
    clearTimers();
    setCurrentStep(0);
    setIsPracticeCompleted(false);
    setEncouragement("よーい、スタート！");
    setActiveNoteIds([]);
    setIsModelPlaying(false);
    setIsRecording(false);
    setIsPlayback(false);
  };



  const progressPercent = ((currentStep + 1) / Math.max(practiceNotes.length, 1)) * 100;
  const currentPracticeNote = practiceNotes[currentStep] ?? practiceNotes[0];

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-pink-50 p-6 text-slate-700">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 rounded-[2rem] bg-white/90 p-6 shadow-[0_16px_40px_rgba(148,163,184,0.24)]">
        <header className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackHome}
            className="rounded-full bg-sky-200 px-6 py-3 text-2xl font-black text-sky-800 shadow-[0_4px_0_#7dd3fc] transition active:translate-y-[2px] active:shadow-none"
          >
            くもどる
          </button>
          <div className="rounded-2xl bg-white px-4 py-2 shadow-sm">
            <label className="sr-only" htmlFor="song-select">
              きょくをえらぶ
            </label>
            <select
              id="song-select"
              value={selectedSong.id}
              onChange={(event) => selectSong(event.target.value)}
              className="rounded-xl border border-indigo-200 bg-white px-4 py-3 text-3xl font-black tracking-wide text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {PIANO_SONGS.map((song) => (
                <option key={song.id} value={song.id}>
                  {song.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-2 shadow-sm">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-2xl">🐻</div>
            <div>
              <p className="text-sm font-bold text-amber-700">ごほうび</p>
              <p className="text-xl font-black text-amber-600">⭐️ {rewardStars} / 🏅 4</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-3xl bg-emerald-50 p-4 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
              <span className="rounded-full bg-white px-3 py-1">しょうせつ {currentPracticeNote?.measureIndex ?? 1}</span>
              <span>{selectedSong.beatsPerMeasure}/4</span>
            </div>
            <div className="h-5 w-full overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-lg font-bold text-emerald-700">
              {Math.min(currentStep + 1, practiceNotes.length)} / {practiceNotes.length}
            </p>
            <p className="inline-flex rounded-full bg-white px-4 py-2 text-lg font-bold text-emerald-700">{encouragement}</p>
          </div>
          <div className="grid place-items-center gap-1">
            <div className="text-5xl">🐰</div>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-emerald-700">がんばれ〜</span>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-4">
          {ACTION_BUTTONS.map((action) => {
            const isActive =
              (action.id === "model" && isModelPlaying) ||
              (action.id === "record" && isRecording) ||
              (action.id === "listen" && isPlayback);

            const onClick =
              action.id === "model" ? startModelPlay : action.id === "record" ? toggleRecording : playRecording;

            return (
              <button
                key={action.id}
                type="button"
                onClick={onClick}
                disabled={(action.id !== "record" && isRecording) || isModelPlaying || isPlayback}
                className={`rounded-[2rem] px-6 py-5 text-3xl font-black ${action.color} shadow-[0_6px_0] transition disabled:opacity-70 active:translate-y-[2px] active:shadow-[0_2px_0] ${
                  isActive ? "ring-4 ring-white" : ""
                }`}
              >
                <span className="mr-2">{action.icon}</span>
                {action.label}
              </button>
            );
          })}
        </section>

        <section className="rounded-3xl bg-indigo-50 p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl font-black text-indigo-700">いま ひく おと</h2>
            <p className="rounded-full bg-white px-3 py-1 text-sm font-bold text-indigo-500">
              {Math.min(currentStep + 1, practiceNotes.length)} / {practiceNotes.length}
            </p>
          </div>
          <div className="mb-3 grid grid-cols-8 gap-2">
            {visibleNotes.map((note, index) => {
              const absoluteIndex = visibleStart + index;
              const isCurrent = absoluteIndex === currentStep;
              return (
                <div
                  key={`${note.lyric}-${absoluteIndex}`}
                  className={`rounded-2xl px-2 py-3 text-center text-2xl font-black transition ${
                    isCurrent
                      ? "scale-105 bg-fuchsia-300 text-fuchsia-900 shadow-[0_6px_0_#e879f9]"
                      : "bg-white text-indigo-500 shadow-sm"
                  }`}
                >
                  {note.lyric}
                </div>
              );
            })}
          </div>
          <div className="relative h-24 rounded-2xl bg-white/80 px-3 py-2 shadow-inner">
            {STAFF_LINES.map((lineTop) => (
              <div
                key={lineTop}
                className="absolute left-3 right-3 border-t border-indigo-200"
                style={{ top: `${lineTop}%` }}
              />
            ))}
            <div className="relative grid h-full grid-cols-8 gap-2">
              {visibleNotes.map((note, index) => {
                const absoluteIndex = visibleStart + index;
                const isCurrent = absoluteIndex === currentStep;
                const top = NOTE_STAFF_POSITION[note.noteId] ?? 72;
                const denominator = durationToDenominator(note.durationBeat);
                const isWhole = denominator === 1;
                const isHalf = denominator === 2;
                const flagCount = denominator >= 16 ? 2 : denominator >= 8 ? 1 : 0;

                return (
                  <div key={`${note.noteId}-${absoluteIndex}`} className="relative h-full">
                    <div
                      className={`absolute left-1/2 h-3.5 w-5 -translate-x-1/2 rounded-full border-2 ${
                        isCurrent
                          ? isHalf || isWhole
                            ? "border-fuchsia-700 bg-white"
                            : "border-fuchsia-700 bg-fuchsia-400"
                          : isHalf || isWhole
                            ? "border-indigo-600 bg-white"
                            : "border-indigo-500 bg-indigo-300"
                      }`}
                      style={{ top: `${top}%` }}
                    />
                    {!isWhole ? (
                      <div
                        className={`absolute left-[57%] w-0.5 ${isCurrent ? "bg-fuchsia-700" : "bg-indigo-600"}`}
                        style={{ top: `${top - 22}%`, height: "22%" }}
                      >
                        {flagCount > 0 ? (
                          <>
                            <div className={`absolute right-0 top-0 h-2 w-3 rounded-tr-full border-t-2 border-r-2 ${isCurrent ? "border-fuchsia-700" : "border-indigo-600"}`} />
                            {flagCount > 1 ? (
                              <div className={`absolute right-0 top-1.5 h-2 w-3 rounded-tr-full border-t-2 border-r-2 ${isCurrent ? "border-fuchsia-700" : "border-indigo-600"}`} />
                            ) : null}
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-slate-100 p-4 shadow-inner">
          <h2 className="mb-3 text-center text-2xl font-black text-slate-700">けんばん</h2>
          <div className="relative mx-auto flex h-52 w-full max-w-[1060px] rounded-2xl bg-slate-200 p-2">
            {whiteKeys.map((key) => {
              const isTarget = key.id === currentPracticeNote?.noteId;
              const isActive = activeNoteIds.includes(key.id);

              return (
                <button
                  key={key.id}
                  type="button"
                  onClick={() => void onPlayNote(key.id)}
                  className={`relative flex-1 rounded-b-2xl border border-slate-300 px-1 pb-3 pt-24 text-center shadow-[inset_0_-8px_0_rgba(148,163,184,0.2)] transition ${
                    isTarget
                      ? "bg-gradient-to-b from-yellow-100 via-yellow-200 to-amber-200 ring-4 ring-yellow-300"
                      : isActive
                        ? "bg-yellow-100"
                        : "bg-white"
                  } ${key.hand === "left" ? "hover:bg-pink-50" : "hover:bg-sky-50"}`}
                >
                  <div className="text-2xl font-black text-slate-700">{key.label}</div>
                </button>
              );
            })}

            {PIANO_KEYS.map((key, index) => {
              if (key.type !== "black") return null;
              const leftIndex = PIANO_KEYS.slice(0, index).filter((item) => item.type === "white").length - 1;
              const left = `${(leftIndex + 1) * (100 / whiteKeys.length) - 2.5}%`;
              const isActive = activeNoteIds.includes(key.id);
              const isTarget = key.id === currentPracticeNote?.noteId;

              return (
                <button
                  key={key.id}
                  type="button"
                  onClick={() => void onPlayNote(key.id)}
                  className={`absolute top-2 h-24 w-[3.8%] -translate-x-1/2 rounded-b-xl shadow-lg transition ${
                    isTarget
                      ? "bg-gradient-to-b from-yellow-200 to-amber-400 ring-4 ring-yellow-300"
                      : isActive
                        ? "bg-violet-500"
                        : "bg-slate-800 hover:bg-slate-700"
                  }`}
                  style={{ left }}
                />
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-orange-50 p-4 shadow-sm">
          <h2 className="mb-3 text-center text-2xl font-black text-orange-700">テンポ</h2>
          <div className="grid grid-cols-3 gap-3">
            {TEMPO_OPTIONS.map((tempo) => {
              const isSelected = selectedTempo === tempo.id;
              return (
                <button
                  key={tempo.id}
                  type="button"
                  onClick={() => setSelectedTempo(tempo.id)}
                  className={`rounded-3xl px-4 py-4 text-2xl font-black transition ${
                    isSelected
                      ? "bg-orange-300 text-orange-900 shadow-[0_6px_0_#fdba74]"
                      : "bg-white text-orange-600 shadow-sm"
                  }`}
                >
                  <span className="mr-2">{tempo.icon}</span>
                  {tempo.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-cyan-50 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-black text-cyan-700">おと の おおきさ</h2>
            <p className="rounded-full bg-white px-3 py-1 text-lg font-black text-cyan-700">{volumePercent}%</p>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={volumePercent}
            onChange={(event) => setVolumePercent(Number(event.target.value))}
            className="h-3 w-full cursor-pointer appearance-none rounded-full bg-cyan-200 accent-cyan-500"
            aria-label="おとのおおきさ"
          />
        </section>

        <footer className="pt-1">
          <button
            type="button"
            onClick={restartPractice}
            className="rounded-[2rem] bg-slate-200 px-6 py-4 text-3xl font-black text-slate-700 shadow-[0_6px_0_#cbd5e1] transition active:translate-y-[2px] active:shadow-[0_2px_0_#cbd5e1]"
          >
            🔁 もういっかい
          </button>
        </footer>

        <p className="text-center text-sm font-bold text-slate-500">
          ろくおん: {recordedNotes.length} おと / {Math.round(recordedDurationMs / 100) / 10}びょう
        </p>
      </div>
    </main>
  );
}
