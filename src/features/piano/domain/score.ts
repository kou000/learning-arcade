export type Hand = "left" | "right";

export type NoteEvent = {
  id: string;
  pitch: string;
  startBeat: number;
  durationBeat: number;
  hand: Hand;
  finger?: string;
  lyric?: string;
};

export type Measure = {
  id: string;
  index: number;
  noteEvents: NoteEvent[];
};

export type SongSection = {
  id: string;
  title: string;
  measures: Measure[];
};

export type SongScore = {
  id: string;
  title: string;
  beatsPerMeasure: number;
  sections: SongSection[];
};

export type FlatPracticeNote = {
  noteId: string;
  lyric: string;
  measureIndex: number;
  durationBeat: number;
  requiresInput: boolean;
};

const makeNote = (
  id: string,
  pitch: string,
  startBeat: number,
  durationBeat: number,
  hand: Hand,
  lyric: string,
  finger?: string,
): NoteEvent => ({ id, pitch, startBeat, durationBeat, hand, lyric, finger });

export const PIANO_SONGS: SongScore[] = [
  {
    id: "twinkle",
    title: "きらきらぼし",
    beatsPerMeasure: 4,
    sections: [
      {
        id: "right-hand-a",
        title: "みぎて れんしゅう A",
        measures: [
          {
            id: "twinkle-m1",
            index: 1,
            noteEvents: [
              makeNote("twinkle-m1-n1", "c4", 0, 1, "right", "ド", "1"),
              makeNote("twinkle-m1-n2", "c4", 1, 1, "right", "ド", "1"),
              makeNote("twinkle-m1-n3", "g4", 2, 1, "right", "ソ", "3"),
              makeNote("twinkle-m1-n4", "g4", 3, 1, "right", "ソ", "3"),
            ],
          },
          {
            id: "twinkle-m2",
            index: 2,
            noteEvents: [
              makeNote("twinkle-m2-n1", "a4", 0, 1, "right", "ラ", "4"),
              makeNote("twinkle-m2-n2", "a4", 1, 1, "right", "ラ", "4"),
              makeNote("twinkle-m2-n3", "g4", 2, 1, "right", "ソ", "3"),
              makeNote("twinkle-m2-n4", "g4", 3, 1, "right", "ー", "3"),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "frog",
    title: "かえるのうた",
    beatsPerMeasure: 4,
    sections: [
      {
        id: "both-a",
        title: "りょうて れんしゅう A",
        measures: [
          {
            id: "frog-m1",
            index: 1,
            noteEvents: [
              makeNote("frog-m1-n1", "c4", 0, 1, "left", "ド", "1"),
              makeNote("frog-m1-n2", "d4", 1, 1, "left", "レ", "2"),
              makeNote("frog-m1-n3", "e4", 2, 1, "left", "ミ", "3"),
              makeNote("frog-m1-n4", "f4", 3, 1, "left", "ファ", "4"),
            ],
          },
          {
            id: "frog-m2",
            index: 2,
            noteEvents: [
              makeNote("frog-m2-n1", "e4", 0, 1, "left", "ミ", "3"),
              makeNote("frog-m2-n2", "d4", 1, 1, "left", "レ", "2"),
              makeNote("frog-m2-n3", "c4", 2, 1, "left", "ド", "1"),
              makeNote("frog-m2-n4", "c4", 3, 1, "left", "ー", "1"),
            ],
          },
        ],
      },
    ],
  },
  {
    id: "chopsticks",
    title: "ねこふんじゃった",
    beatsPerMeasure: 4,
    sections: [
      {
        id: "left-a",
        title: "ひだりて れんしゅう A",
        measures: [
          {
            id: "chopsticks-m1",
            index: 1,
            noteEvents: [
              makeNote("chopsticks-m1-n1", "g4", 0, 1, "left", "ソ", "5"),
              makeNote("chopsticks-m1-n2", "a4", 1, 1, "left", "ラ", "1"),
              makeNote("chopsticks-m1-n3", "g4", 2, 1, "left", "ソ", "5"),
              makeNote("chopsticks-m1-n4", "e4", 3, 1, "left", "ミ", "3"),
            ],
          },
          {
            id: "chopsticks-m2",
            index: 2,
            noteEvents: [
              makeNote("chopsticks-m2-n1", "f4", 0, 1, "left", "ファ", "4"),
              makeNote("chopsticks-m2-n2", "e4", 1, 1, "left", "ミ", "3"),
              makeNote("chopsticks-m2-n3", "c4", 2, 1, "left", "ド", "1"),
              makeNote("chopsticks-m2-n4", "c4", 3, 1, "left", "ー", "1"),
            ],
          },
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
          durationBeat: note.durationBeat,
          requiresInput: true,
        });
      });

      return mergedNotes;
    }),
  );
};
