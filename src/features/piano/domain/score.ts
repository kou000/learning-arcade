export type Hand = "left" | "right";
export type Pitch =
  | "c4"
  | "c4s"
  | "d4"
  | "d4s"
  | "e4"
  | "f4"
  | "f4s"
  | "g4"
  | "g4s"
  | "a4"
  | "a4s"
  | "b4"
  | "c5"
  | "c5s"
  | "d5"
  | "d5s"
  | "e5"
  | "f5"
  | "f5s"
  | "g5"
  | "g5s"
  | "a5"
  | "a5s"
  | "b5";

// 1音ごとの譜面イベント。小節内の開始拍と長さを持つ。
export type NoteEvent = {
  id: string;
  pitch: Pitch;
  startBeat: number;
  durationBeat: number;
  hand: Hand;
  finger?: string;
  lyric?: string;
};

// 小節単位のまとまり。noteEvents はその小節に含まれる音符列。
export type Measure = {
  id: string;
  index: number;
  noteEvents: NoteEvent[];
};

// 曲中のフレーズや練習ブロック単位。
export type SongSection = {
  id: string;
  title: string;
  measures: Measure[];
};

// 画面で扱う1曲ぶんの完全な譜面データ。
export type SongScore = {
  id: string;
  title: string;
  beatsPerMeasure: number;
  tempoBpm: number;
  sections: SongSection[];
};

// 練習画面用に平坦化した音列。譜面描画や進行管理で使う。
export type FlatPracticeNote = {
  noteId: Pitch;
  lyric: string;
  measureIndex: number;
  startBeat: number;
  durationBeat: number;
  requiresInput: boolean;
};

const makeNote = (
  id: string,
  pitch: Pitch,
  startBeat: number,
  durationBeat: number,
  hand: Hand,
  lyric: string,
  finger?: string,
): NoteEvent => ({ id, pitch, startBeat, durationBeat, hand, lyric, finger });

const makeMeasure = (
  songId: string,
  index: number,
  notes: Array<{
    pitch: Pitch;
    durationBeat: number;
    hand: Hand;
    lyric: string;
    finger?: string;
  }>,
): Measure => {
  let currentBeat = 0;

  return {
    id: `${songId}-m${index}`,
    index,
    noteEvents: notes.map((note, noteIndex) => {
      const event = makeNote(
        `${songId}-m${index}-n${noteIndex + 1}`,
        note.pitch,
        currentBeat,
        note.durationBeat,
        note.hand,
        note.lyric,
        note.finger,
      );
      currentBeat += note.durationBeat;
      return event;
    }),
  };
};

export const PIANO_SONGS: SongScore[] = [
  {
    id: "twinkle",
    title: "きらきらぼし",
    beatsPerMeasure: 4,
    tempoBpm: 92,
    sections: [
      {
        id: "right-hand-full",
        title: "みぎて 1きょく",
        measures: [
          makeMeasure("twinkle", 1, [
            { pitch: "c4", durationBeat: 1, hand: "right", lyric: "ド", finger: "1" },
            { pitch: "c4", durationBeat: 1, hand: "right", lyric: "ド", finger: "1" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "3" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "3" },
          ]),
          makeMeasure("twinkle", 2, [
            { pitch: "a4", durationBeat: 1, hand: "right", lyric: "ラ", finger: "4" },
            { pitch: "a4", durationBeat: 1, hand: "right", lyric: "ラ", finger: "4" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "3" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ー", finger: "3" },
          ]),
          makeMeasure("twinkle", 3, [
            { pitch: "f4", durationBeat: 1, hand: "right", lyric: "ファ", finger: "2" },
            { pitch: "f4", durationBeat: 1, hand: "right", lyric: "ファ", finger: "2" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "2" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "2" },
          ]),
          makeMeasure("twinkle", 4, [
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "1" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "1" },
            { pitch: "c4", durationBeat: 1, hand: "right", lyric: "ド", finger: "1" },
            { pitch: "c4", durationBeat: 1, hand: "right", lyric: "ー", finger: "1" },
          ]),
          makeMeasure("twinkle", 5, [
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "3" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "3" },
            { pitch: "f4", durationBeat: 1, hand: "right", lyric: "ファ", finger: "2" },
            { pitch: "f4", durationBeat: 1, hand: "right", lyric: "ファ", finger: "2" },
          ]),
          makeMeasure("twinkle", 6, [
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "2" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "2" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "1" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "ー", finger: "1" },
          ]),
          makeMeasure("twinkle", 7, [
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "3" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "3" },
            { pitch: "f4", durationBeat: 1, hand: "right", lyric: "ファ", finger: "2" },
            { pitch: "f4", durationBeat: 1, hand: "right", lyric: "ファ", finger: "2" },
          ]),
          makeMeasure("twinkle", 8, [
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "2" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "2" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "1" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "ー", finger: "1" },
          ]),
          makeMeasure("twinkle", 9, [
            { pitch: "c4", durationBeat: 1, hand: "right", lyric: "ド", finger: "1" },
            { pitch: "c4", durationBeat: 1, hand: "right", lyric: "ド", finger: "1" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "3" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "3" },
          ]),
          makeMeasure("twinkle", 10, [
            { pitch: "a4", durationBeat: 1, hand: "right", lyric: "ラ", finger: "4" },
            { pitch: "a4", durationBeat: 1, hand: "right", lyric: "ラ", finger: "4" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "3" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ー", finger: "3" },
          ]),
          makeMeasure("twinkle", 11, [
            { pitch: "f4", durationBeat: 1, hand: "right", lyric: "ファ", finger: "2" },
            { pitch: "f4", durationBeat: 1, hand: "right", lyric: "ファ", finger: "2" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "2" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "2" },
          ]),
          makeMeasure("twinkle", 12, [
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "1" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "1" },
            { pitch: "c4", durationBeat: 1, hand: "right", lyric: "ド", finger: "1" },
            { pitch: "c4", durationBeat: 1, hand: "right", lyric: "ー", finger: "1" },
          ]),
        ],
      },
    ],
  },
  {
    id: "frog",
    title: "かえるのうた",
    beatsPerMeasure: 4,
    tempoBpm: 112,
    sections: [
      {
        id: "both-full",
        title: "りょうて 1きょく",
        measures: [
          makeMeasure("frog", 1, [
            { pitch: "c4", durationBeat: 1, hand: "left", lyric: "ド", finger: "1" },
            { pitch: "d4", durationBeat: 1, hand: "left", lyric: "レ", finger: "2" },
            { pitch: "e4", durationBeat: 1, hand: "left", lyric: "ミ", finger: "3" },
            { pitch: "f4", durationBeat: 1, hand: "left", lyric: "ファ", finger: "4" },
          ]),
          makeMeasure("frog", 2, [
            { pitch: "e4", durationBeat: 1, hand: "left", lyric: "ミ", finger: "3" },
            { pitch: "d4", durationBeat: 1, hand: "left", lyric: "レ", finger: "2" },
            { pitch: "c4", durationBeat: 1, hand: "left", lyric: "ド", finger: "1" },
            { pitch: "c4", durationBeat: 1, hand: "left", lyric: "ー", finger: "1" },
          ]),
          makeMeasure("frog", 3, [
            { pitch: "e4", durationBeat: 1, hand: "left", lyric: "ミ", finger: "3" },
            { pitch: "f4", durationBeat: 1, hand: "left", lyric: "ファ", finger: "4" },
            { pitch: "g4", durationBeat: 1, hand: "left", lyric: "ソ", finger: "5" },
            { pitch: "g4", durationBeat: 1, hand: "left", lyric: "ー", finger: "5" },
          ]),
          makeMeasure("frog", 4, [
            { pitch: "e4", durationBeat: 1, hand: "left", lyric: "ミ", finger: "3" },
            { pitch: "f4", durationBeat: 1, hand: "left", lyric: "ファ", finger: "4" },
            { pitch: "g4", durationBeat: 1, hand: "left", lyric: "ソ", finger: "5" },
            { pitch: "g4", durationBeat: 1, hand: "left", lyric: "ー", finger: "5" },
          ]),
          makeMeasure("frog", 5, [
            { pitch: "g4", durationBeat: 1, hand: "left", lyric: "ソ", finger: "5" },
            { pitch: "a4", durationBeat: 1, hand: "left", lyric: "ラ", finger: "1" },
            { pitch: "g4", durationBeat: 1, hand: "left", lyric: "ソ", finger: "5" },
            { pitch: "f4", durationBeat: 1, hand: "left", lyric: "ファ", finger: "4" },
          ]),
          makeMeasure("frog", 6, [
            { pitch: "e4", durationBeat: 1, hand: "left", lyric: "ミ", finger: "3" },
            { pitch: "c4", durationBeat: 1, hand: "left", lyric: "ド", finger: "1" },
            { pitch: "c4", durationBeat: 1, hand: "left", lyric: "ド", finger: "1" },
            { pitch: "c4", durationBeat: 1, hand: "left", lyric: "ー", finger: "1" },
          ]),
          makeMeasure("frog", 7, [
            { pitch: "c4", durationBeat: 1, hand: "left", lyric: "ク", finger: "1" },
            { pitch: "g4", durationBeat: 1, hand: "left", lyric: "ワ", finger: "5" },
            { pitch: "c5", durationBeat: 1, hand: "left", lyric: "ク", finger: "1" },
            { pitch: "g4", durationBeat: 1, hand: "left", lyric: "ワ", finger: "5" },
          ]),
          makeMeasure("frog", 8, [
            { pitch: "a4", durationBeat: 1, hand: "left", lyric: "ク", finger: "1" },
            { pitch: "g4", durationBeat: 1, hand: "left", lyric: "ワ", finger: "5" },
            { pitch: "f4", durationBeat: 1, hand: "left", lyric: "ク", finger: "4" },
            { pitch: "e4", durationBeat: 1, hand: "left", lyric: "ワ", finger: "3" },
          ]),
          makeMeasure("frog", 9, [
            { pitch: "d4", durationBeat: 1, hand: "left", lyric: "ケ", finger: "2" },
            { pitch: "e4", durationBeat: 1, hand: "left", lyric: "ケ", finger: "3" },
            { pitch: "f4", durationBeat: 1, hand: "left", lyric: "ケ", finger: "4" },
            { pitch: "g4", durationBeat: 1, hand: "left", lyric: "ケ", finger: "5" },
          ]),
          makeMeasure("frog", 10, [
            { pitch: "a4", durationBeat: 1, hand: "left", lyric: "ケ", finger: "1" },
            { pitch: "g4", durationBeat: 1, hand: "left", lyric: "ケ", finger: "5" },
            { pitch: "f4", durationBeat: 1, hand: "left", lyric: "ケ", finger: "4" },
            { pitch: "e4", durationBeat: 1, hand: "left", lyric: "ケ", finger: "3" },
          ]),
          makeMeasure("frog", 11, [
            { pitch: "c4", durationBeat: 1, hand: "left", lyric: "ク", finger: "1" },
            { pitch: "g4", durationBeat: 1, hand: "left", lyric: "ワ", finger: "5" },
            { pitch: "c5", durationBeat: 1, hand: "left", lyric: "ク", finger: "1" },
            { pitch: "g4", durationBeat: 1, hand: "left", lyric: "ワ", finger: "5" },
          ]),
          makeMeasure("frog", 12, [
            { pitch: "e4", durationBeat: 1, hand: "left", lyric: "ク", finger: "3" },
            { pitch: "d4", durationBeat: 1, hand: "left", lyric: "ワ", finger: "2" },
            { pitch: "c4", durationBeat: 1, hand: "left", lyric: "ド", finger: "1" },
            { pitch: "c4", durationBeat: 1, hand: "left", lyric: "ー", finger: "1" },
          ]),
        ],
      },
    ],
  },
  {
    id: "mary",
    title: "メリーさんのひつじ",
    beatsPerMeasure: 4,
    tempoBpm: 104,
    sections: [
      {
        id: "mary-right-full",
        title: "みぎて 1きょく",
        measures: [
          makeMeasure("mary", 1, [
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "c4", durationBeat: 1, hand: "right", lyric: "ド", finger: "1" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
          ]),
          makeMeasure("mary", 2, [
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "e4", durationBeat: 2, hand: "right", lyric: "ミ", finger: "3" },
          ]),
          makeMeasure("mary", 3, [
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "d4", durationBeat: 2, hand: "right", lyric: "レ", finger: "2" },
          ]),
          makeMeasure("mary", 4, [
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "5" },
            { pitch: "g4", durationBeat: 2, hand: "right", lyric: "ソ", finger: "5" },
          ]),
          makeMeasure("mary", 5, [
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "c4", durationBeat: 1, hand: "right", lyric: "ド", finger: "1" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
          ]),
          makeMeasure("mary", 6, [
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ー", finger: "3" },
          ]),
          makeMeasure("mary", 7, [
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
          ]),
          makeMeasure("mary", 8, [
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "c4", durationBeat: 4, hand: "right", lyric: "ド", finger: "1" },
          ]),
        ],
      },
    ],
  },
  {
    id: "bee",
    title: "ぶんぶんぶん",
    beatsPerMeasure: 4,
    tempoBpm: 124,
    sections: [
      {
        id: "bee-right-full",
        title: "みぎて 1きょく",
        measures: [
          makeMeasure("bee", 1, [
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "5" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "f4", durationBeat: 1, hand: "right", lyric: "ファ", finger: "4" },
          ]),
          makeMeasure("bee", 2, [
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "c4", durationBeat: 2, hand: "right", lyric: "ド", finger: "1" },
          ]),
          makeMeasure("bee", 3, [
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "f4", durationBeat: 1, hand: "right", lyric: "ファ", finger: "4" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "5" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "5" },
          ]),
          makeMeasure("bee", 4, [
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "5" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "5" },
            { pitch: "g4", durationBeat: 2, hand: "right", lyric: "ー", finger: "5" },
          ]),
          makeMeasure("bee", 5, [
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "5" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "f4", durationBeat: 1, hand: "right", lyric: "ファ", finger: "4" },
          ]),
          makeMeasure("bee", 6, [
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "c4", durationBeat: 2, hand: "right", lyric: "ド", finger: "1" },
          ]),
          makeMeasure("bee", 7, [
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "5" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "5" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
          ]),
          makeMeasure("bee", 8, [
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "c4", durationBeat: 3, hand: "right", lyric: "ド", finger: "1" },
          ]),
        ],
      },
    ],
  },
  {
    id: "ode",
    title: "よろこびのうた",
    beatsPerMeasure: 4,
    tempoBpm: 108,
    sections: [
      {
        id: "ode-right-full",
        title: "みぎて 1きょく",
        measures: [
          makeMeasure("ode", 1, [
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "f4", durationBeat: 1, hand: "right", lyric: "ファ", finger: "4" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "5" },
          ]),
          makeMeasure("ode", 2, [
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "5" },
            { pitch: "f4", durationBeat: 1, hand: "right", lyric: "ファ", finger: "4" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
          ]),
          makeMeasure("ode", 3, [
            { pitch: "c4", durationBeat: 1, hand: "right", lyric: "ド", finger: "1" },
            { pitch: "c4", durationBeat: 1, hand: "right", lyric: "ド", finger: "1" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
          ]),
          makeMeasure("ode", 4, [
            { pitch: "e4", durationBeat: 1.5, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "d4", durationBeat: 0.5, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "d4", durationBeat: 2, hand: "right", lyric: "レ", finger: "2" },
          ]),
          makeMeasure("ode", 5, [
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "f4", durationBeat: 1, hand: "right", lyric: "ファ", finger: "4" },
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "5" },
          ]),
          makeMeasure("ode", 6, [
            { pitch: "g4", durationBeat: 1, hand: "right", lyric: "ソ", finger: "5" },
            { pitch: "f4", durationBeat: 1, hand: "right", lyric: "ファ", finger: "4" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
          ]),
          makeMeasure("ode", 7, [
            { pitch: "c4", durationBeat: 1, hand: "right", lyric: "ド", finger: "1" },
            { pitch: "c4", durationBeat: 1, hand: "right", lyric: "ド", finger: "1" },
            { pitch: "d4", durationBeat: 1, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "e4", durationBeat: 1, hand: "right", lyric: "ミ", finger: "3" },
          ]),
          makeMeasure("ode", 8, [
            { pitch: "d4", durationBeat: 1.5, hand: "right", lyric: "レ", finger: "2" },
            { pitch: "c4", durationBeat: 0.5, hand: "right", lyric: "ド", finger: "1" },
            { pitch: "c4", durationBeat: 2, hand: "right", lyric: "ド", finger: "1" },
          ]),
        ],
      },
    ],
  },
];

export const flattenSongNotes = (song: SongScore): FlatPracticeNote[] => {
  return song.sections.flatMap((section) =>
    section.measures.flatMap((measure) => {
      const sortedNotes = measure.noteEvents.slice().sort((a, b) => a.startBeat - b.startBeat);
      const mergedNotes: FlatPracticeNote[] = [];

      sortedNotes.forEach((note) => {
        if (note.lyric === "ー") {
          const previous = mergedNotes.at(-1);
          if (previous && previous.noteId === note.pitch) {
            previous.durationBeat += note.durationBeat;
          }
          return;
        }

        mergedNotes.push({
          noteId: note.pitch,
          lyric: note.lyric ?? "・",
          measureIndex: measure.index,
          startBeat: note.startBeat,
          durationBeat: note.durationBeat,
          requiresInput: true,
        });
      });

      return mergedNotes;
    }),
  );
};
