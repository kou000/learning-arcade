import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import fennecCheering from "@/assets/piano/fennec-cheering.png";
import { PianoAudioEngine } from "@/features/piano/audio/audioEngine";
import { PIANO_SONGS, flattenSongNotes } from "@/features/piano/domain/score";

type PianoPracticePageProps = {
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
type PracticeMode = "free" | "guided";

type RecordedNote = {
  noteId: string;
  startedAtMs: number;
  endedAtMs: number;
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
  { id: "slow", label: "おそい", icon: "🐌", speedRate: 0.75 },
  { id: "normal", label: "ふつう", icon: "🎵", speedRate: 1 },
  { id: "fast", label: "はやい", icon: "🚀", speedRate: 1.3 },
] as const;

const ACTION_BUTTONS = [
] as const;

const STAFF_LINES = [16, 30, 44, 58, 72];
const NOTE_HEAD_LEFT_PADDING_PX = 6;
const MEASURE_VIEW_COUNT = 2;
const MEASURE_INNER_PADDING_PERCENT = 6;
const KEYBOARD_TOUCH_STYLE = {
  WebkitTouchCallout: "none",
  WebkitUserSelect: "none",
  userSelect: "none" as const,
  WebkitTapHighlightColor: "transparent",
  touchAction: "none" as const,
};

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

export function PianoPracticePage({ onBackHome }: PianoPracticePageProps) {
  const [selectedSongId, setSelectedSongId] = useState<string>(PIANO_SONGS[0].id);
  const [selectedTempo, setSelectedTempo] = useState<TempoId>("normal");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("free");
  const [currentStep, setCurrentStep] = useState(0);
  const [isPracticeCompleted, setIsPracticeCompleted] = useState(false);
  const [encouragement, setEncouragement] = useState("さいごまで ひいてみよう！");
  const [activeNoteIds, setActiveNoteIds] = useState<string[]>([]);
  const [isModelPlaying, setIsModelPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayback, setIsPlayback] = useState(false);
  const [isGuidePlaying, setIsGuidePlaying] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<RecordedNote[]>([]);
  const [recordedDurationMs, setRecordedDurationMs] = useState(0);
  const [volumePercent, setVolumePercent] = useState(80);
  const [isAudioReady, setIsAudioReady] = useState(false);

  const audioEngineRef = useRef<PianoAudioEngine>(new PianoAudioEngine());
  const rootRef = useRef<HTMLElement | null>(null);
  const recordingStartAtRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const pressedKeyIdRef = useRef<string | null>(null);
  const modelPlayingNoteIdRef = useRef<string | null>(null);
  const guidedNoteIdRef = useRef<string | null>(null);
  const recordingNoteIndexRef = useRef<number | null>(null);

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
  const beatMs = useMemo(
    () => 60000 / Math.max(40, selectedSong.tempoBpm * selectedTempoConfig.speedRate),
    [selectedSong, selectedTempoConfig],
  );
  const currentPracticeNote = practiceNotes[currentStep] ?? practiceNotes[0];
  const visibleMeasureStart = useMemo(() => {
    const currentMeasureIndex = currentPracticeNote?.measureIndex ?? 1;
    return currentMeasureIndex % 2 === 0 ? currentMeasureIndex - 1 : currentMeasureIndex;
  }, [currentPracticeNote]);
  const visibleNotes = useMemo(
    () =>
      practiceNotes
        .map((note, absoluteIndex) => ({ ...note, absoluteIndex }))
        .filter(
          (note) =>
            note.measureIndex >= visibleMeasureStart && note.measureIndex < visibleMeasureStart + MEASURE_VIEW_COUNT,
        ),
    [practiceNotes, visibleMeasureStart],
  );

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

  useEffect(() => {
    const releasePressedKey = () => {
      const pressedKeyId = pressedKeyIdRef.current;
      if (!pressedKeyId) return;
      pressedKeyIdRef.current = null;
      setActiveNoteIds((prev) => prev.filter((id) => id !== pressedKeyId));
      void audioEngineRef.current.noteOff(pressedKeyId);
    };

    window.addEventListener("pointerup", releasePressedKey);
    window.addEventListener("pointercancel", releasePressedKey);

    return () => {
      window.removeEventListener("pointerup", releasePressedKey);
      window.removeEventListener("pointercancel", releasePressedKey);
    };
  }, []);

  const resetSessionState = () => {
    clearTimers();
    releasePressedKey();
    setCurrentStep(0);
    setIsPracticeCompleted(false);
    setEncouragement("さいごまで ひいてみよう！");
    setActiveNoteIds([]);
    setIsModelPlaying(false);
    setIsRecording(false);
    setIsPlayback(false);
    setIsGuidePlaying(false);
    setRecordedNotes([]);
    setRecordedDurationMs(0);
    recordingNoteIndexRef.current = null;
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

  const enableAudio = async () => {
    const enabled = await audioEngineRef.current.enableAudio();
    setIsAudioReady(enabled);
    return enabled;
  };

  const startHeldTone = async (noteId: string) => {
    const volume = Math.max(0, Math.min(1, volumePercent / 100));
    await audioEngineRef.current.noteOn(noteId, volume);
  };

  const playModelTone = async (noteId: string, sustainMs: number) => {
    const volume = Math.max(0, Math.min(1, volumePercent / 100));
    const previousNoteId = modelPlayingNoteIdRef.current;

    if (previousNoteId) {
      setActiveNoteIds((prev) => prev.filter((id) => id !== previousNoteId));
      void audioEngineRef.current.noteOff(previousNoteId, 30);
      modelPlayingNoteIdRef.current = null;
    }

    modelPlayingNoteIdRef.current = noteId;
    setActiveNoteIds((prev) => (prev.includes(noteId) ? prev : [...prev, noteId]));
    await audioEngineRef.current.noteOn(noteId, volume);

    const releaseTimer = window.setTimeout(() => {
      if (modelPlayingNoteIdRef.current === noteId) {
        modelPlayingNoteIdRef.current = null;
      }
      setActiveNoteIds((prev) => prev.filter((id) => id !== noteId));
      void audioEngineRef.current.noteOff(noteId, 45);
    }, sustainMs);
    timersRef.current.push(releaseTimer);
  };

  const playGuidedToneCue = async (noteId: string, sustainMs: number) => {
    const previousNoteId = guidedNoteIdRef.current;
    if (previousNoteId) {
      setActiveNoteIds((prev) => prev.filter((id) => id !== previousNoteId));
      void audioEngineRef.current.noteOff(previousNoteId, 30);
      guidedNoteIdRef.current = null;
    }

    guidedNoteIdRef.current = noteId;
    setActiveNoteIds((prev) => (prev.includes(noteId) ? prev : [...prev, noteId]));

    const releaseTimer = window.setTimeout(() => {
      if (guidedNoteIdRef.current === noteId) {
        guidedNoteIdRef.current = null;
      }
      setActiveNoteIds((prev) => prev.filter((id) => id !== noteId));
    }, sustainMs);
    timersRef.current.push(releaseTimer);
  };

  const pulseKey = (noteId: string, pulseMs = 240) => {
    setActiveNoteIds((prev) => (prev.includes(noteId) ? prev : [...prev, noteId]));
    const timer = window.setTimeout(() => {
      setActiveNoteIds((prev) => prev.filter((id) => id !== noteId));
    }, pulseMs);
    timersRef.current.push(timer);
  };

  const noteDurationMs = (durationBeat: number) => Math.max(220, beatMs * durationBeat);
  const notePlaybackMs = (durationBeat: number) => {
    const fullDurationMs = noteDurationMs(durationBeat);
    const articulationGapMs = Math.min(140, Math.max(60, beatMs * 0.18));
    return Math.max(180, fullDurationMs - articulationGapMs);
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
      setIsPracticeCompleted(true);
      setEncouragement("やったー！ さいごまで ひけたよ！");
      return;
    }

    setCurrentStep(nextStep);
    setEncouragement("そのちょうし！");
  };

  const onPlayNote = async (
    noteId: string,
    options?: { fromAuto?: boolean; skipProgress?: boolean; durationMs?: number; pulseMs?: number },
  ) => {
    pulseKey(noteId, options?.pulseMs);
    await playTone(noteId, options?.durationMs);

    if (!options?.skipProgress && !options?.fromAuto) {
      updateProgressByInput(noteId);
    }
  };

  const finishRecordedNote = (endedAtMs: number) => {
    const recordingNoteIndex = recordingNoteIndexRef.current;
    if (recordingNoteIndex == null) return;

    setRecordedNotes((prev) =>
      prev.map((note, index) =>
        index === recordingNoteIndex
          ? { ...note, endedAtMs: Math.max(note.startedAtMs + 60, endedAtMs) }
          : note,
      ),
    );
    setRecordedDurationMs((prev) => Math.max(prev, endedAtMs));
    recordingNoteIndexRef.current = null;
  };

  const releasePressedKey = () => {
    const pressedKeyId = pressedKeyIdRef.current;
    if (!pressedKeyId) return;
    pressedKeyIdRef.current = null;
    setActiveNoteIds((prev) => prev.filter((id) => id !== pressedKeyId));
    void audioEngineRef.current.noteOff(pressedKeyId);
    if (isRecording) {
      finishRecordedNote(Math.max(0, Date.now() - recordingStartAtRef.current));
    }
  };

  const onPressKey = async (noteId: string) => {
    if (isModelPlaying || isPlayback) return;
    if (!isAudioReady) {
      const enabled = await enableAudio();
      setEncouragement(enabled ? "おとを だせるようになったよ！" : "うえのボタンで おとを だしてね");
      if (!enabled) return;
    }

    if (pressedKeyIdRef.current && pressedKeyIdRef.current !== noteId) {
      void audioEngineRef.current.noteOff(pressedKeyIdRef.current);
      setActiveNoteIds((prev) => prev.filter((id) => id !== pressedKeyIdRef.current));
    }

    pressedKeyIdRef.current = noteId;
    setActiveNoteIds((prev) => (prev.includes(noteId) ? prev : [...prev, noteId]));
    await startHeldTone(noteId);

    if (isRecording) {
      const startedAtMs = Math.max(0, Date.now() - recordingStartAtRef.current);
      setRecordedNotes((prev) => {
        recordingNoteIndexRef.current = prev.length;
        return [...prev, { noteId, startedAtMs, endedAtMs: startedAtMs }];
      });
      setRecordedDurationMs(startedAtMs);
    }

    if (practiceMode === "free" || !isGuidePlaying) {
      updateProgressByInput(noteId);
    }
  };

  const handleKeyPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, noteId: string) => {
    event.preventDefault();
    void onPressKey(noteId);
  };

  const startModelPlay = async () => {
    if (isModelPlaying || isPlayback) return;
    if (!isAudioReady) {
      const enabled = await enableAudio();
      if (!enabled) {
        setEncouragement("まずは おとを だすボタンを おしてね");
        return;
      }
    }
    clearTimers();
    releasePressedKey();
    setCurrentStep(0);
    setIsPracticeCompleted(false);
    setIsModelPlaying(true);
    setEncouragement("おてほん さいせいちゅう");

    let elapsedMs = 0;

    practiceNotes.forEach((note, index) => {
      const durationMs = noteDurationMs(note.durationBeat);
      const nextNote = index < practiceNotes.length - 1 ? practiceNotes[index + 1] : null;
      const sameNoteRepeatAhead = nextNote?.noteId === note.noteId;
      const repeatGapMs = sameNoteRepeatAhead ? 70 : 0;
      const playbackMs = Math.max(120, notePlaybackMs(note.durationBeat) - repeatGapMs);
      const timer = window.setTimeout(() => {
        setCurrentStep(index);
        void playModelTone(note.noteId, playbackMs);
        if (index === practiceNotes.length - 1) {
          const finishTimer = window.setTimeout(() => {
            setIsModelPlaying(false);
            setEncouragement("まねして ひいてみよう！");
          }, durationMs);
          timersRef.current.push(finishTimer);
        }
      }, elapsedMs);
      timersRef.current.push(timer);
      elapsedMs += durationMs;
    });
  };

  const stopModelPlay = () => {
    clearTimers();
    if (modelPlayingNoteIdRef.current) {
      void audioEngineRef.current.noteOff(modelPlayingNoteIdRef.current, 30);
      modelPlayingNoteIdRef.current = null;
    }
    setIsModelPlaying(false);
    setActiveNoteIds([]);
    setEncouragement("おてほんを とめたよ");
  };

  const stopGuidePlay = () => {
    clearTimers();
    releasePressedKey();
    if (guidedNoteIdRef.current) {
      guidedNoteIdRef.current = null;
    }
    if (isRecording) {
      const duration = Math.max(0, Date.now() - recordingStartAtRef.current);
      setRecordedDurationMs(duration);
      setIsRecording(false);
    }
    setIsGuidePlaying(false);
    setActiveNoteIds([]);
    setEncouragement("テンポれんしゅうを とめたよ");
  };

  const playRecording = async () => {
    if (isModelPlaying || isRecording || isPlayback || isGuidePlaying || recordedNotes.length === 0) return;
    if (!isAudioReady) {
      const enabled = await enableAudio();
      if (!enabled) {
        setEncouragement("まずは おとを だすボタンを おしてね");
        return;
      }
    }
    clearTimers();
    releasePressedKey();
    setIsPlayback(true);
    setEncouragement("ろくおんを さいせいちゅう");

    recordedNotes.forEach((item) => {
      const startTimer = window.setTimeout(() => {
        setActiveNoteIds((prev) => (prev.includes(item.noteId) ? prev : [...prev, item.noteId]));
        void audioEngineRef.current.noteOn(item.noteId, Math.max(0, Math.min(1, volumePercent / 100)));
      }, item.startedAtMs);
      const endTimer = window.setTimeout(() => {
        setActiveNoteIds((prev) => prev.filter((id) => id !== item.noteId));
        void audioEngineRef.current.noteOff(item.noteId, 45);
      }, item.endedAtMs);
      timersRef.current.push(startTimer, endTimer);
    });

    const lastEndedAtMs = recordedNotes.reduce((max, item) => Math.max(max, item.endedAtMs), 0);
    const finishTimer = window.setTimeout(() => {
      setIsPlayback(false);
      setEncouragement("もういちど ひいてみよう！");
    }, lastEndedAtMs + 120);
    timersRef.current.push(finishTimer);
  };

  const startGuidedPractice = async () => {
    if (practiceMode !== "guided" || isModelPlaying || isPlayback || isRecording || isGuidePlaying) return;
    if (!isAudioReady) {
      const enabled = await enableAudio();
      if (!enabled) {
        setEncouragement("まずは おとを だすボタンを おしてね");
        return;
      }
    }
    clearTimers();
    releasePressedKey();
    setRecordedNotes([]);
    setRecordedDurationMs(0);
    recordingNoteIndexRef.current = null;
    recordingStartAtRef.current = Date.now();
    setIsRecording(true);
    setCurrentStep(0);
    setIsPracticeCompleted(false);
    setIsGuidePlaying(true);
    setEncouragement("クリックに あわせて ひこう");

    const totalBeats = practiceNotes.reduce((sum, note) => sum + note.durationBeat, 0);
    const totalDurationMs = totalBeats * beatMs;

    let elapsedNoteMs = 0;
    practiceNotes.forEach((note, index) => {
      const noteDurationMsValue = note.durationBeat * beatMs;
      const noteTimer = window.setTimeout(() => {
        setCurrentStep(index);
        void playGuidedToneCue(note.noteId, Math.max(120, noteDurationMsValue - 40));
      }, elapsedNoteMs);
      timersRef.current.push(noteTimer);
      elapsedNoteMs += noteDurationMsValue;
    });

    for (let beatIndex = 0; beatIndex < totalBeats; beatIndex += 1) {
      const metronomeTimer = window.setTimeout(() => {
        const isAccent = beatIndex % selectedSong.beatsPerMeasure === 0;
        void audioEngineRef.current.playMetronomeClick(isAccent, Math.max(0.2, volumePercent / 100));
      }, beatIndex * beatMs);
      timersRef.current.push(metronomeTimer);
    }

    const finishTimer = window.setTimeout(() => {
      releasePressedKey();
      setIsGuidePlaying(false);
      setIsRecording(false);
      setRecordedDurationMs(totalDurationMs);
      setActiveNoteIds([]);
      setIsPracticeCompleted(true);
      setEncouragement("テンポれんしゅう おわり！「きく」で さいせいできるよ");
      setCurrentStep(practiceNotes.length - 1);
    }, totalDurationMs + 80);
    timersRef.current.push(finishTimer);
  };

  const restartPractice = () => {
    clearTimers();
    releasePressedKey();
    setCurrentStep(0);
    setIsPracticeCompleted(false);
    setEncouragement("よーい、スタート！");
    setActiveNoteIds([]);
    setIsModelPlaying(false);
    setIsRecording(false);
    setIsPlayback(false);
    setIsGuidePlaying(false);
    recordingNoteIndexRef.current = null;
  };



  const progressPercent = ((currentStep + 1) / Math.max(practiceNotes.length, 1)) * 100;
  const beatsPerMeasure = selectedSong.beatsPerMeasure;
  const measureWidthPercent = 100 / MEASURE_VIEW_COUNT;
  const measureContentWidthPercent = measureWidthPercent - MEASURE_INNER_PADDING_PERCENT * 2;
  const getMeasureOffset = (measureIndex: number) => (measureIndex - visibleMeasureStart) * measureWidthPercent;
  const getMeasureContentLeft = (measureIndex: number) => getMeasureOffset(measureIndex) + MEASURE_INNER_PADDING_PERCENT;
  const getNoteCenterPercent = (note: { measureIndex: number; startBeat: number }) =>
    getMeasureContentLeft(note.measureIndex) +
    ((note.startBeat + 0.5) / beatsPerMeasure) * measureContentWidthPercent;

  return (
    <main ref={rootRef} className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-pink-50 p-6 text-slate-700">
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
          <div className="h-20 w-20" />
        </header>

        <section className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-3xl bg-emerald-50 p-4 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
              <span className="rounded-full bg-white px-3 py-1">
                しょうせつ {visibleMeasureStart}-{visibleMeasureStart + 1}
              </span>
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
            <div className="grid place-items-center">
              <img
                src={fennecCheering}
                alt="がんばれとおうえんするフェネック"
                width={120}
                height={120}
                draggable={false}
                className="h-28 w-28 object-contain"
              />
            </div>
        </section>

        <section className="rounded-3xl bg-lime-50 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-lime-700">れんしゅうモード</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={isGuidePlaying ? stopGuidePlay : startGuidedPractice}
                disabled={(!isGuidePlaying && practiceMode !== "guided") || isModelPlaying || isPlayback}
                className={`rounded-[1.5rem] px-5 py-3 text-2xl font-black shadow-[0_6px_0] transition disabled:opacity-60 active:translate-y-[2px] active:shadow-[0_2px_0] ${
                  isGuidePlaying
                    ? "bg-rose-300 text-rose-900 shadow-rose-400"
                    : "bg-lime-300 text-lime-900 shadow-lime-400"
                }`}
              >
                {isGuidePlaying ? "⏹️ とめる" : "🥁 スタート"}
              </button>
              <button
                type="button"
                onClick={restartPractice}
                disabled={isModelPlaying || isRecording || isPlayback || isGuidePlaying}
                className="rounded-[1.5rem] bg-slate-200 px-5 py-3 text-2xl font-black text-slate-700 shadow-[0_6px_0_#cbd5e1] transition disabled:opacity-60 active:translate-y-[2px] active:shadow-[0_2px_0_#cbd5e1]"
              >
                🔁 さいしょから
              </button>
              <button
                type="button"
                onClick={playRecording}
                disabled={isModelPlaying || isRecording || isPlayback || isGuidePlaying || recordedNotes.length === 0}
                className={`rounded-[1.5rem] px-5 py-3 text-2xl font-black shadow-[0_6px_0] transition disabled:opacity-60 active:translate-y-[2px] active:shadow-[0_2px_0] ${
                  isPlayback
                    ? "bg-violet-300 text-violet-900 shadow-violet-400 ring-4 ring-white"
                    : "bg-white text-violet-700 shadow-violet-200"
                }`}
              >
                🎧 きく
              </button>
              <button
                type="button"
                onClick={isModelPlaying ? stopModelPlay : startModelPlay}
                disabled={isRecording || isPlayback || isGuidePlaying}
                className={`rounded-[1.5rem] px-5 py-3 text-2xl font-black shadow-[0_6px_0] transition disabled:opacity-60 active:translate-y-[2px] active:shadow-[0_2px_0] ${
                  isModelPlaying
                    ? "bg-cyan-300 text-cyan-900 shadow-cyan-400 ring-4 ring-white"
                    : "bg-cyan-300 text-cyan-900 shadow-cyan-400"
                }`}
              >
                {isModelPlaying ? "⏹️ とめる" : "▶️ おてほん"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPracticeMode("free")}
              disabled={isGuidePlaying}
              className={`rounded-3xl px-4 py-4 text-2xl font-black transition ${
                practiceMode === "free"
                  ? "bg-lime-300 text-lime-900 shadow-[0_6px_0_#a3e635]"
                  : "bg-white text-lime-700 shadow-sm"
              }`}
            >
              じぶんのペース
            </button>
            <button
              type="button"
              onClick={() => setPracticeMode("guided")}
              disabled={isGuidePlaying}
              className={`rounded-3xl px-4 py-4 text-2xl font-black transition ${
                practiceMode === "guided"
                  ? "bg-lime-300 text-lime-900 shadow-[0_6px_0_#a3e635]"
                  : "bg-white text-lime-700 shadow-sm"
              }`}
            >
              テンポにあわせる
            </button>
          </div>
          <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-lg font-bold text-lime-800">
            {practiceMode === "free"
              ? "じぶんのタイミングで すすめるモード"
              : "クリックに あわせて きいろのキーを おいかけるモード"}
          </p>
        </section>

        <section className="rounded-3xl bg-indigo-50 p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xl font-black text-indigo-700">いま ひく おと</h2>
            <p className="rounded-full bg-white px-3 py-1 text-sm font-bold text-indigo-500">
              {Math.min(currentStep + 1, practiceNotes.length)} / {practiceNotes.length}
            </p>
          </div>
          <div className="relative mb-3 h-16 rounded-2xl bg-indigo-100/70 px-3 py-2">
            <div className="absolute bottom-2 left-1/2 top-2 w-px bg-indigo-200" />
            {visibleNotes.map((note) => {
              const isCurrent = note.absoluteIndex === currentStep;
              const centerPercent = getNoteCenterPercent(note);

              return (
                <div
                  key={`${note.measureIndex}-${note.startBeat}-${note.noteId}-${note.absoluteIndex}`}
                  className={`absolute top-2 flex h-10 items-center justify-center rounded-2xl px-2 text-center text-2xl font-black transition ${
                    isCurrent
                      ? "scale-105 bg-fuchsia-300 text-fuchsia-900 shadow-[0_6px_0_#e879f9]"
                      : "bg-white text-indigo-500 shadow-sm"
                  }`}
                  style={{
                    left: `calc(${centerPercent}% - 1.375rem)`,
                    width: "2.75rem",
                    minWidth: "2.75rem",
                  }}
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
            <div className="absolute bottom-2 top-2 left-1/2 w-px bg-indigo-200" />
            <div className="relative h-full">
              {visibleNotes.map((note) => {
                const isCurrent = note.absoluteIndex === currentStep;
                const top = NOTE_STAFF_POSITION[note.noteId] ?? 72;
                const denominator = durationToDenominator(note.durationBeat);
                const isWhole = denominator === 1;
                const isHalf = denominator === 2;
                const flagCount = denominator >= 16 ? 2 : denominator >= 8 ? 1 : 0;
                const centerPercent = getNoteCenterPercent(note);

                return (
                  <div
                    key={`${note.measureIndex}-${note.startBeat}-${note.noteId}-${note.absoluteIndex}`}
                    className="absolute inset-y-0"
                    style={{ left: `${centerPercent}%`, width: 0 }}
                  >
                    <div
                      className={`absolute h-3.5 w-5 rounded-full border-2 ${
                        isCurrent
                          ? isHalf || isWhole
                            ? "border-fuchsia-700 bg-white"
                            : "border-fuchsia-700 bg-fuchsia-400"
                          : isHalf || isWhole
                            ? "border-indigo-600 bg-white"
                            : "border-indigo-500 bg-indigo-300"
                      }`}
                      style={{ left: `calc(-10px + ${NOTE_HEAD_LEFT_PADDING_PX}px)`, top: `${top}%` }}
                    />
                    {!isWhole ? (
                      <div
                        className={`absolute w-0.5 ${isCurrent ? "bg-fuchsia-700" : "bg-indigo-600"}`}
                        style={{
                          left: `${NOTE_HEAD_LEFT_PADDING_PX + 8}px`,
                          top: `${top - 22}%`,
                          height: "22%",
                        }}
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
          <div
            className="relative mx-auto flex h-52 w-full max-w-[1060px] rounded-2xl bg-slate-200 p-2 select-none"
            style={KEYBOARD_TOUCH_STYLE}
            onContextMenu={(event) => event.preventDefault()}
          >
            {!isAudioReady ? (
              <div className="absolute inset-0 z-20 grid place-items-center rounded-2xl bg-slate-900/40 backdrop-blur-[2px]">
                <div className="mx-4 flex max-w-md flex-col items-center gap-4 rounded-[2rem] bg-white px-6 py-5 text-center shadow-[0_16px_40px_rgba(15,23,42,0.24)]">
                  <p className="text-2xl font-black text-slate-800">さいしょに おとを だせるようにする</p>
                  <p className="text-base font-bold text-slate-500">このあと けんばんを おすと おとが でるよ</p>
                  <button
                    type="button"
                    onClick={async () => {
                      const enabled = await enableAudio();
                      setEncouragement(enabled ? "おとの じゅんびが できたよ！" : "もういちど おしてみてね");
                    }}
                    className="rounded-[1.5rem] bg-amber-300 px-6 py-3 text-2xl font-black text-amber-900 shadow-[0_6px_0_#f59e0b] transition active:translate-y-[2px] active:shadow-[0_2px_0_#f59e0b]"
                  >
                    🔊 おとを だす
                  </button>
                </div>
              </div>
            ) : null}
            {whiteKeys.map((key) => {
              const isTarget = key.id === currentPracticeNote?.noteId && !isModelPlaying;
              const isActive = activeNoteIds.includes(key.id);

              return (
                <button
                  key={key.id}
                  type="button"
                  onPointerDown={(event) => handleKeyPointerDown(event, key.id)}
                  onPointerUp={releasePressedKey}
                  onPointerLeave={releasePressedKey}
                  onPointerCancel={releasePressedKey}
                  className={`relative flex-1 rounded-b-2xl border border-slate-300 px-1 pb-3 pt-24 text-center shadow-[inset_0_-8px_0_rgba(148,163,184,0.2)] transition select-none ${
                    isTarget
                      ? "bg-gradient-to-b from-yellow-100 via-yellow-200 to-amber-200 ring-4 ring-yellow-300"
                      : isActive
                        ? "bg-yellow-100"
                        : "bg-white"
                  } ${key.hand === "left" ? "hover:bg-pink-50" : "hover:bg-sky-50"}`}
                  style={KEYBOARD_TOUCH_STYLE}
                  onContextMenu={(event) => event.preventDefault()}
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
              const isTarget = key.id === currentPracticeNote?.noteId && !isModelPlaying;

              return (
                <button
                  key={key.id}
                  type="button"
                  onPointerDown={(event) => handleKeyPointerDown(event, key.id)}
                  onPointerUp={releasePressedKey}
                  onPointerLeave={releasePressedKey}
                  onPointerCancel={releasePressedKey}
                  className={`absolute top-2 h-24 w-[3.8%] -translate-x-1/2 rounded-b-xl shadow-lg transition select-none ${
                    isTarget
                      ? "bg-gradient-to-b from-yellow-200 to-amber-400 ring-4 ring-yellow-300"
                      : isActive
                        ? "bg-violet-500"
                        : "bg-slate-800 hover:bg-slate-700"
                  }`}
                  style={{ ...KEYBOARD_TOUCH_STYLE, left }}
                  onContextMenu={(event) => event.preventDefault()}
                />
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-orange-50 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-2xl font-black text-orange-700">しょうせつ {visibleMeasureStart}-{visibleMeasureStart + 1}</h2>
            <span className="rounded-full bg-white px-3 py-1 text-lg font-black text-orange-700">{selectedSong.beatsPerMeasure}/4</span>
          </div>
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

        <p className="text-center text-sm font-bold text-slate-500">
          ろくおん: {recordedNotes.length} おと / {Math.round(recordedDurationMs / 100) / 10}びょう
        </p>
      </div>
    </main>
  );
}
