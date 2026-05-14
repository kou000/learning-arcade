import {
  LETTER_GUIDE_GROUPS,
  type LetterCase,
  type LetterGuide,
} from "@/features/english/domain/letterGuides";

export type PracticeItemKind = "letter" | "word";

export type PracticeUnit = {
  id: string;
  label: string;
  guide: LetterGuide;
};

export type PracticeItem = {
  id: string;
  kind: PracticeItemKind;
  label: string;
  units: PracticeUnit[];
};

function createLetterPracticeItem(guide: LetterGuide): PracticeItem {
  return {
    id: guide.id,
    kind: "letter",
    label: guide.label,
    units: [
      {
        id: guide.id,
        label: guide.label,
        guide,
      },
    ],
  };
}

export const ALPHABET_PRACTICE_GROUPS: Record<LetterCase, PracticeItem[]> = {
  uppercase: LETTER_GUIDE_GROUPS.uppercase.map(createLetterPracticeItem),
  lowercase: LETTER_GUIDE_GROUPS.lowercase.map(createLetterPracticeItem),
};

export const ALPHABET_PRACTICE_ITEMS: PracticeItem[] = [
  ...ALPHABET_PRACTICE_GROUPS.uppercase,
  ...ALPHABET_PRACTICE_GROUPS.lowercase,
];
