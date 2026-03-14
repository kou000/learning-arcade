import { useEffect, useMemo, useRef, useState } from "react";

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

type SongConfig = {
  id: string;
  title: string;
  noteBlocks: string[];
  sequence: string[];
  sectionLabel: string;
};

const SONGS: SongConfig[] = [
  {
    id: "twinkle",
    title: "きらきらぼし",
    noteBlocks: ["ド", "ド", "ソ", "ソ", "ラ", "ラ", "ソ", "ー"],
    sequence: ["c4", "c4", "g4", "g4", "a4", "a4", "g4", "g4"],
    sectionLabel: "みぎて れんしゅう 2しょうせつめ",
  },
  {
    id: "frog",
    title: "かえるのうた",
    noteBlocks: ["ド", "レ", "ミ", "ファ", "ミ", "レ", "ド", "ー"],
    sequence: ["c4", "d4", "e4", "f4", "e4", "d4", "c4", "c4"],
    sectionLabel: "りょうて れんしゅう 1しょうせつめ",
  },
  {
    id: "chopsticks",
    title: "ねこふんじゃった",
    noteBlocks: ["ソ", "ラ", "ソ", "ミ", "ファ", "ミ", "ド", "ー"],
    sequence: ["g4", "a4", "g4", "e4", "f4", "e4", "c4", "c4"],
    sectionLabel: "ひだりて れんしゅう 3しょうせつめ",
  },
];

const NOTE_FREQUENCIES: Record<string, number> = {
  c4: 261.63,
  c4s: 277.18,
  d4: 293.66,
  d4s: 311.13,
  e4: 329.63,
  f4: 349.23,
  f4s: 369.99,
  g4: 392,
  g4s: 415.3,
  a4: 440,
  a4s: 466.16,
  b4: 493.88,
  c5: 523.25,
  c5s: 554.37,
  d5: 587.33,
  d5s: 622.25,
  e5: 659.25,
  f5: 698.46,
  f5s: 739.99,
  g5: 783.99,
  g5s: 830.61,
  a5: 880,
  a5s: 932.33,
  b5: 987.77,
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

export function PianoPracticeMockPage({ onBackHome }: PianoPracticeMockPageProps) {
  const [selectedSongId, setSelectedSongId] = useState<string>(SONGS[0].id);
  const [selectedTempo, setSelectedTempo] = useState<TempoId>("normal");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedRounds, setCompletedRounds] = useState(0);
  const [encouragement, setEncouragement] = useState("あと1かいでクリア！");
  const [activeNoteIds, setActiveNoteIds] = useState<string[]>([]);
  const [isModelPlaying, setIsModelPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayback, setIsPlayback] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<RecordedNote[]>([]);
  const [recordedDurationMs, setRecordedDurationMs] = useState(0);
  const [rewardStars, setRewardStars] = useState(12);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const recordingStartAtRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);

  const selectedSong = useMemo(
    () => SONGS.find((song) => song.id === selectedSongId) ?? SONGS[0],
    [selectedSongId],
  );
  const whiteKeys = useMemo(() => PIANO_KEYS.filter((key) => key.type === "white"), []);
  const selectedTempoConfig = useMemo(
    () => TEMPO_OPTIONS.find((tempo) => tempo.id === selectedTempo) ?? TEMPO_OPTIONS[1],
    [selectedTempo],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const resetSessionState = () => {
    clearTimers();
    setCurrentStep(0);
    setCompletedRounds(0);
    setEncouragement("あと1かいでクリア！");
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

  const getAudioContext = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playTone = async (noteId: string, durationMs = 260) => {
    const freq = NOTE_FREQUENCIES[noteId];
    if (!freq) return;
    const context = await getAudioContext();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.value = 0.0001;

    osc.connect(gain);
    gain.connect(context.destination);

    const now = context.currentTime;
    const end = now + durationMs / 1000;

    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.start(now);
    osc.stop(end + 0.02);
  };

  const pulseKey = (noteId: string, pulseMs = 240) => {
    setActiveNoteIds((prev) => (prev.includes(noteId) ? prev : [...prev, noteId]));
    const timer = window.setTimeout(() => {
      setActiveNoteIds((prev) => prev.filter((id) => id !== noteId));
    }, pulseMs);
    timersRef.current.push(timer);
  };

  const updateProgressByInput = (noteId: string) => {
    const expected = selectedSong.sequence[currentStep];
    if (noteId !== expected) {
      setEncouragement("そのおとじゃないよ。つぎはピカッとかがやくキー！");
      return;
    }

    const nextStep = currentStep + 1;
    if (nextStep >= selectedSong.sequence.length) {
      const nextRounds = Math.min(completedRounds + 1, 5);
      setCompletedRounds(nextRounds);
      setCurrentStep(0);
      if (nextRounds >= 5) {
        setEncouragement("すごい！「できた！」をおしてね");
      } else {
        setEncouragement(`いいね！あと${5 - nextRounds}かい`);
      }
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

  const startModelPlay = async () => {
    if (isModelPlaying || isPlayback) return;
    clearTimers();
    setIsModelPlaying(true);
    setEncouragement("おてほん さいせいちゅう");

    selectedSong.sequence.forEach((noteId, index) => {
      const timer = window.setTimeout(() => {
        void onPlayNote(noteId, { fromAuto: true, skipProgress: true });
        if (index === selectedSong.sequence.length - 1) {
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
    setCompletedRounds(0);
    setEncouragement("よーい、スタート！");
    setActiveNoteIds([]);
    setIsModelPlaying(false);
    setIsRecording(false);
    setIsPlayback(false);
  };

  const onComplete = () => {
    if (completedRounds < 5) {
      setEncouragement("もうすこし！5かいクリアで「できた！」");
      return;
    }
    setRewardStars((prev) => prev + 1);
    setEncouragement("やったー！ほしを1こゲット✨");
    setCompletedRounds(0);
    setCurrentStep(0);
  };

  const progressPercent = (completedRounds / 5) * 100;

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
          <h1 className="rounded-2xl bg-white px-8 py-3 text-4xl font-black tracking-wide text-indigo-600 shadow-sm">
            {selectedSong.title}
          </h1>
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-2 shadow-sm">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-2xl">🐻</div>
            <div>
              <p className="text-sm font-bold text-amber-700">ごほうび</p>
              <p className="text-xl font-black text-amber-600">⭐️ {rewardStars} / 🏅 4</p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl bg-pink-50 p-4 shadow-sm">
          <h2 className="mb-3 text-xl font-black text-pink-700">きょくをえらぶ</h2>
          <div className="grid grid-cols-3 gap-3">
            {SONGS.map((song) => {
              const isSelected = song.id === selectedSong.id;
              return (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => selectSong(song.id)}
                  className={`rounded-2xl px-3 py-3 text-xl font-black transition ${
                    isSelected
                      ? "bg-fuchsia-300 text-fuchsia-900 shadow-[0_6px_0_#e879f9]"
                      : "bg-white text-pink-600 shadow-sm"
                  }`}
                >
                  {song.title}
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-3xl bg-emerald-50 p-4 shadow-sm">
          <div className="space-y-3">
            <p className="text-2xl font-black text-emerald-700">{selectedSong.sectionLabel}</p>
            <div className="h-5 w-full overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-lg font-bold text-emerald-700">{completedRounds} / 5</p>
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
              {Math.min(currentStep + 1, selectedSong.noteBlocks.length)} / {selectedSong.noteBlocks.length}
            </p>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {selectedSong.noteBlocks.map((note, index) => {
              const isCurrent = index === currentStep;
              return (
                <div
                  key={`${note}-${index}`}
                  className={`rounded-2xl px-2 py-3 text-center text-2xl font-black transition ${
                    isCurrent
                      ? "scale-105 bg-fuchsia-300 text-fuchsia-900 shadow-[0_6px_0_#e879f9]"
                      : "bg-white text-indigo-500 shadow-sm"
                  }`}
                >
                  {note}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-slate-100 p-4 shadow-inner">
          <h2 className="mb-3 text-center text-2xl font-black text-slate-700">けんばん</h2>
          <div className="relative mx-auto flex h-52 w-full max-w-[1060px] rounded-2xl bg-slate-200 p-2">
            {whiteKeys.map((key) => {
              const isTarget = key.id === selectedSong.sequence[currentStep];
              const isActive = activeNoteIds.includes(key.id);

              return (
                <button
                  key={key.id}
                  type="button"
                  onClick={() => void onPlayNote(key.id)}
                  className={`relative flex-1 rounded-b-2xl border border-slate-300 bg-white px-1 pb-3 pt-24 text-center shadow-[inset_0_-8px_0_rgba(148,163,184,0.2)] transition ${
                    isActive
                      ? "bg-yellow-100"
                      : key.hand === "left"
                        ? "hover:bg-pink-50"
                        : "hover:bg-sky-50"
                  }`}
                >
                  {isTarget ? (
                    <span
                      className={`absolute left-1/2 top-2 -translate-x-1/2 rounded-full px-3 py-1 text-base font-black ${
                        key.hand === "left" ? "bg-pink-300 text-pink-900" : "bg-sky-300 text-sky-900"
                      }`}
                    >
                      ひかる
                    </span>
                  ) : null}
                  <div className="text-2xl font-black text-slate-700">{key.label}</div>
                  <div className="text-lg font-bold text-slate-500">ゆび {key.finger}</div>
                </button>
              );
            })}

            {PIANO_KEYS.map((key, index) => {
              if (key.type !== "black") return null;
              const leftIndex = PIANO_KEYS.slice(0, index).filter((item) => item.type === "white").length - 1;
              const left = `${(leftIndex + 1) * (100 / whiteKeys.length) - 2.5}%`;
              const isActive = activeNoteIds.includes(key.id);

              return (
                <button
                  key={key.id}
                  type="button"
                  onClick={() => void onPlayNote(key.id)}
                  className={`absolute top-2 h-24 w-[3.8%] -translate-x-1/2 rounded-b-xl shadow-lg transition ${
                    isActive ? "bg-violet-500" : "bg-slate-800 hover:bg-slate-700"
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

        <footer className="grid grid-cols-2 gap-4 pt-1">
          <button
            type="button"
            onClick={restartPractice}
            className="rounded-[2rem] bg-slate-200 px-6 py-4 text-3xl font-black text-slate-700 shadow-[0_6px_0_#cbd5e1] transition active:translate-y-[2px] active:shadow-[0_2px_0_#cbd5e1]"
          >
            🔁 もういっかい
          </button>
          <button
            type="button"
            onClick={onComplete}
            className="rounded-[2rem] bg-lime-300 px-6 py-4 text-4xl font-black text-lime-900 shadow-[0_8px_0_#84cc16] transition active:translate-y-[2px] active:shadow-[0_2px_0_#84cc16]"
          >
            🎉 できた！
          </button>
        </footer>

        <p className="text-center text-sm font-bold text-slate-500">
          ろくおん: {recordedNotes.length} おと / {Math.round(recordedDurationMs / 100) / 10}びょう
        </p>
      </div>
    </main>
  );
}
