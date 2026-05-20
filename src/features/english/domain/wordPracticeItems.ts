import { LOWERCASE_LETTER_GUIDES, type LetterGuide, type Point } from "@/features/english/domain/letterGuides";
import type { PracticeItem } from "@/features/english/domain/practiceItems";

const CANVAS_SIZE = 520;
const LETTER_SOURCE_SIZE = 520;
const WORD_LETTER_WIDTH = 132;
const WORD_LETTER_SCALE = 0.46;
const WORD_BASELINE_SHIFT_Y = 142;

export type WordPracticeDefinition = {
  id: string;
  label: string;
  meaning: string;
  emoji: string;
};

export const WORD_PRACTICE_DEFINITIONS: WordPracticeDefinition[] = [
  { id: "cat", label: "cat", meaning: "ねこ", emoji: "🐱" },
  { id: "dog", label: "dog", meaning: "いぬ", emoji: "🐶" },
  { id: "sun", label: "sun", meaning: "たいよう", emoji: "☀️" },
  { id: "cup", label: "cup", meaning: "コップ", emoji: "🥤" },
  { id: "pen", label: "pen", meaning: "ペン", emoji: "✏️" },
  { id: "bed", label: "bed", meaning: "ベッド", emoji: "🛏️" },
  { id: "bus", label: "bus", meaning: "バス", emoji: "🚌" },
  { id: "egg", label: "egg", meaning: "たまご", emoji: "🥚" },
  { id: "mom", label: "mom", meaning: "ママ", emoji: "👩" },
  { id: "dad", label: "dad", meaning: "パパ", emoji: "👨" },
  { id: "bag", label: "bag", meaning: "バッグ", emoji: "👜" },
  { id: "box", label: "box", meaning: "はこ", emoji: "📦" },
  { id: "hat", label: "hat", meaning: "ぼうし", emoji: "🧢" },
  { id: "map", label: "map", meaning: "ちず", emoji: "🗺️" },
  { id: "car", label: "car", meaning: "くるま", emoji: "🚗" },
  { id: "toy", label: "toy", meaning: "おもちゃ", emoji: "🧸" },
  { id: "key", label: "key", meaning: "かぎ", emoji: "🔑" },
  { id: "pig", label: "pig", meaning: "ぶた", emoji: "🐷" },
  { id: "cow", label: "cow", meaning: "うし", emoji: "🐮" },
];

function transformPoint(point: Point, offsetX: number, offsetY: number, scale: number): Point {
  return {
    x: offsetX + point.x * scale,
    y: offsetY + point.y * scale,
  };
}

function createWordGuide(word: WordPracticeDefinition): LetterGuide {
  const letters = word.label.split("");
  const wordWidth = letters.length * WORD_LETTER_WIDTH;
  const startX = (CANVAS_SIZE - wordWidth) / 2;
  const offsetY = WORD_BASELINE_SHIFT_Y;
  let strokeNumber = 1;

  const strokes: Point[][] = [];
  const numberPositions: LetterGuide["numberPositions"] = [];

  letters.forEach((letter, index) => {
    const guide = LOWERCASE_LETTER_GUIDES[letter as keyof typeof LOWERCASE_LETTER_GUIDES];
    if (!guide) return;
    const offsetX = startX + index * WORD_LETTER_WIDTH - (LETTER_SOURCE_SIZE * WORD_LETTER_SCALE - WORD_LETTER_WIDTH) / 2;

    for (const stroke of guide.strokes) {
      strokes.push(stroke.map((point) => transformPoint(point, offsetX, offsetY, WORD_LETTER_SCALE)));
    }

    for (const position of guide.numberPositions) {
      numberPositions.push({
        ...transformPoint(position, offsetX, offsetY, WORD_LETTER_SCALE),
        n: String(strokeNumber),
      });
      strokeNumber += 1;
    }
  });

  return {
    id: `word-${word.id}`,
    label: word.label,
    note: `${word.label} は「${word.meaning}」。小文字を順番になぞって単語で書きます。`,
    numberPositions,
    strokes,
  };
}

function createWordPracticeItem(word: WordPracticeDefinition): PracticeItem & WordPracticeDefinition {
  const guide = createWordGuide(word);
  return {
    ...word,
    kind: "word",
    units: [
      {
        id: guide.id,
        label: word.label,
        guide,
      },
    ],
  };
}

export const WORD_PRACTICE_ITEMS = WORD_PRACTICE_DEFINITIONS.map(createWordPracticeItem);
