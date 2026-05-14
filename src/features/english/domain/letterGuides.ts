export type Point = {
  x: number;
  y: number;
};

export type StrokeNumberPosition = Point & {
  n: string;
};

export type LetterGuide = {
  id: string;
  label: string;
  note: string;
  numberPositions: StrokeNumberPosition[];
  strokes: Point[][];
};

function cubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, count: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const mt = 1 - t;
    points.push({
      x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
      y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
    });
  }
  return points;
}

function quadraticBezier(p0: Point, p1: Point, p2: Point, count: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const mt = 1 - t;
    points.push({
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    });
  }
  return points;
}

function linePoints(from: Point, to: Point, count: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    points.push({
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    });
  }
  return points;
}

function concatPaths(...paths: Point[][]): Point[] {
  const result: Point[] = [];
  for (const path of paths) {
    if (result.length > 0 && path.length > 0) {
      result.push(...path.slice(1));
    } else {
      result.push(...path);
    }
  }
  return result;
}

export const LETTER_GUIDES = {
  A: {
    id: "A",
    label: "A",
    note: "Aは3画想定です。1画目: 左斜め、2画目: 右斜め、3画目: 横棒。",
    numberPositions: [
      { x: 230, y: 70, n: "1" },
      { x: 292, y: 70, n: "2" },
      { x: 184, y: 254, n: "3" },
    ],
    strokes: [
      linePoints({ x: 260, y: 82 }, { x: 145, y: 415 }, 54),
      linePoints({ x: 260, y: 82 }, { x: 385, y: 415 }, 54),
      concatPaths(quadraticBezier({ x: 192, y: 275 }, { x: 260, y: 258 }, { x: 330, y: 275 }, 44)),
    ],
  },
  B: {
    id: "B",
    label: "B",
    note: "Bは2画想定です。縦線を書いてから、上のふくらみと下のふくらみを続けて書きます。",
    numberPositions: [
      { x: 150, y: 95, n: "1" },
      { x: 260, y: 100, n: "2" },
    ],
    strokes: [
      linePoints({ x: 165, y: 88 }, { x: 165, y: 425 }, 60),
      concatPaths(
        linePoints({ x: 165, y: 98 }, { x: 262, y: 98 }, 18),
        cubicBezier({ x: 262, y: 98 }, { x: 390, y: 100 }, { x: 390, y: 245 }, { x: 260, y: 252 }, 48),
        linePoints({ x: 260, y: 252 }, { x: 165, y: 252 }, 18),
        linePoints({ x: 165, y: 252 }, { x: 272, y: 252 }, 18),
        cubicBezier({ x: 272, y: 252 }, { x: 410, y: 258 }, { x: 405, y: 420 }, { x: 270, y: 424 }, 52),
        linePoints({ x: 270, y: 424 }, { x: 165, y: 424 }, 18),
      ),
    ],
  },
  C: {
    id: "C",
    label: "C",
    note: "Cは1画想定です。右上から左へ回って、右下に向かいます。",
    numberPositions: [{ x: 360, y: 112, n: "1" }],
    strokes: [
      concatPaths(
        cubicBezier({ x: 360, y: 115 }, { x: 250, y: 45 }, { x: 105, y: 95 }, { x: 110, y: 260 }, 52),
        cubicBezier({ x: 110, y: 260 }, { x: 115, y: 420 }, { x: 255, y: 475 }, { x: 365, y: 405 }, 52),
      ),
    ],
  },
  D: {
    id: "D",
    label: "D",
    note: "Dは2画想定です。縦線を書いてから、右側の大きなふくらみを書きます。",
    numberPositions: [
      { x: 160, y: 92, n: "1" },
      { x: 245, y: 92, n: "2" },
    ],
    strokes: [
      linePoints({ x: 165, y: 90 }, { x: 165, y: 425 }, 62),
      concatPaths(
        linePoints({ x: 165, y: 95 }, { x: 250, y: 95 }, 18),
        cubicBezier({ x: 250, y: 95 }, { x: 420, y: 105 }, { x: 420, y: 410 }, { x: 250, y: 425 }, 72),
        linePoints({ x: 250, y: 425 }, { x: 165, y: 425 }, 18),
      ),
    ],
  },
  E: {
    id: "E",
    label: "E",
    note: "Eは4画想定です。縦線、上横線、真ん中横線、下横線の順番です。",
    numberPositions: [
      { x: 165, y: 92, n: "1" },
      { x: 210, y: 92, n: "2" },
      { x: 205, y: 260, n: "3" },
      { x: 210, y: 425, n: "4" },
    ],
    strokes: [
      linePoints({ x: 165, y: 90 }, { x: 165, y: 425 }, 60),
      linePoints({ x: 165, y: 95 }, { x: 365, y: 95 }, 48),
      linePoints({ x: 165, y: 260 }, { x: 325, y: 260 }, 42),
      linePoints({ x: 165, y: 425 }, { x: 370, y: 425 }, 48),
    ],
  },
  F: {
    id: "F",
    label: "F",
    note: "Fは3画想定です。縦線、上横線、真ん中横線の順番です。",
    numberPositions: [
      { x: 165, y: 92, n: "1" },
      { x: 210, y: 92, n: "2" },
      { x: 205, y: 260, n: "3" },
    ],
    strokes: [
      linePoints({ x: 165, y: 90 }, { x: 165, y: 425 }, 60),
      linePoints({ x: 165, y: 95 }, { x: 365, y: 95 }, 48),
      linePoints({ x: 165, y: 260 }, { x: 325, y: 260 }, 42),
    ],
  },
  G: {
    id: "G",
    label: "G",
    note: "Gは2画想定です。Cのように回ってから、内側の横線を書きます。",
    numberPositions: [
      { x: 360, y: 112, n: "1" },
      { x: 300, y: 300, n: "2" },
    ],
    strokes: [
      concatPaths(
        cubicBezier({ x: 365, y: 125 }, { x: 255, y: 45 }, { x: 105, y: 95 }, { x: 110, y: 260 }, 52),
        cubicBezier({ x: 110, y: 260 }, { x: 115, y: 425 }, { x: 270, y: 475 }, { x: 380, y: 385 }, 52),
      ),
      concatPaths(
        linePoints({ x: 290, y: 320 }, { x: 380, y: 320 }, 25),
        linePoints({ x: 380, y: 320 }, { x: 380, y: 405 }, 24),
      ),
    ],
  },
  H: {
    id: "H",
    label: "H",
    note: "Hは3画想定です。左縦線、右縦線、真ん中横線の順番です。",
    numberPositions: [
      { x: 150, y: 90, n: "1" },
      { x: 370, y: 90, n: "2" },
      { x: 180, y: 260, n: "3" },
    ],
    strokes: [
      linePoints({ x: 155, y: 90 }, { x: 155, y: 425 }, 60),
      linePoints({ x: 370, y: 90 }, { x: 370, y: 425 }, 60),
      linePoints({ x: 155, y: 260 }, { x: 370, y: 260 }, 52),
    ],
  },
  I: {
    id: "I",
    label: "I",
    note: "Iは3画想定です。上横線、縦線、下横線の順番です。",
    numberPositions: [
      { x: 190, y: 95, n: "1" },
      { x: 260, y: 120, n: "2" },
      { x: 190, y: 425, n: "3" },
    ],
    strokes: [
      linePoints({ x: 170, y: 95 }, { x: 350, y: 95 }, 42),
      linePoints({ x: 260, y: 95 }, { x: 260, y: 425 }, 60),
      linePoints({ x: 170, y: 425 }, { x: 350, y: 425 }, 42),
    ],
  },
  J: {
    id: "J",
    label: "J",
    note: "Jは1画想定です。上から縦に下ろして、左へ曲げます。",
    numberPositions: [{ x: 315, y: 115, n: "1" }],
    strokes: [
      concatPaths(
        linePoints({ x: 315, y: 95 }, { x: 315, y: 330 }, 44),
        cubicBezier({ x: 315, y: 330 }, { x: 315, y: 445 }, { x: 145, y: 455 }, { x: 145, y: 350 }, 42),
      ),
    ],
  },
  K: {
    id: "K",
    label: "K",
    note: "Kは2画想定です。縦線を書いてから、右上から中央を通って右下へ続けて書きます。",
    numberPositions: [
      { x: 155, y: 90, n: "1" },
      { x: 345, y: 95, n: "2" },
    ],
    strokes: [
      linePoints({ x: 155, y: 90 }, { x: 155, y: 425 }, 60),
      concatPaths(
        linePoints({ x: 365, y: 95 }, { x: 155, y: 260 }, 52),
        linePoints({ x: 155, y: 260 }, { x: 370, y: 425 }, 52),
      ),
    ],
  },
  L: {
    id: "L",
    label: "L",
    note: "Lは1画想定です。上から下へ書いて、そのまま右へ曲げます。",
    numberPositions: [{ x: 165, y: 90, n: "1" }],
    strokes: [
      concatPaths(
        linePoints({ x: 165, y: 90 }, { x: 165, y: 425 }, 60),
        linePoints({ x: 165, y: 425 }, { x: 370, y: 425 }, 48),
      ),
    ],
  },
  M: {
    id: "M",
    label: "M",
    note: "Mは2画想定です。左縦を書いてから、左上から谷を通って右縦まで続けて書きます。",
    numberPositions: [
      { x: 108, y: 78, n: "1" },
      { x: 158, y: 78, n: "2" },
    ],
    strokes: [
      linePoints({ x: 130, y: 95 }, { x: 130, y: 420 }, 60),
      concatPaths(
        linePoints({ x: 130, y: 95 }, { x: 260, y: 420 }, 66),
        linePoints({ x: 260, y: 420 }, { x: 390, y: 95 }, 66),
        linePoints({ x: 390, y: 95 }, { x: 390, y: 420 }, 60),
      ),
    ],
  },
  N: {
    id: "N",
    label: "N",
    note: "Nは2画想定です。左縦を書いてから、左上から斜めに下りて右縦へ続けて書きます。",
    numberPositions: [
      { x: 122, y: 78, n: "1" },
      { x: 172, y: 78, n: "2" },
    ],
    strokes: [
      linePoints({ x: 145, y: 95 }, { x: 145, y: 420 }, 60),
      concatPaths(
        linePoints({ x: 145, y: 95 }, { x: 375, y: 420 }, 70),
        linePoints({ x: 375, y: 420 }, { x: 375, y: 95 }, 60),
      ),
    ],
  },
  O: {
    id: "O",
    label: "O",
    note: "Oは1画想定です。上から反時計回りにぐるっと一周します。",
    numberPositions: [{ x: 260, y: 80, n: "1" }],
    strokes: [
      concatPaths(
        cubicBezier({ x: 260, y: 80 }, { x: 90, y: 80 }, { x: 90, y: 430 }, { x: 260, y: 430 }, 64),
        cubicBezier({ x: 260, y: 430 }, { x: 430, y: 430 }, { x: 430, y: 80 }, { x: 260, y: 80 }, 64),
      ),
    ],
  },
  P: {
    id: "P",
    label: "P",
    note: "Pは2画想定です。縦線を書いてから、上のふくらみを書きます。",
    numberPositions: [
      { x: 165, y: 90, n: "1" },
      { x: 255, y: 98, n: "2" },
    ],
    strokes: [
      linePoints({ x: 165, y: 90 }, { x: 165, y: 425 }, 60),
      concatPaths(
        linePoints({ x: 165, y: 95 }, { x: 260, y: 95 }, 18),
        cubicBezier({ x: 260, y: 95 }, { x: 395, y: 100 }, { x: 390, y: 265 }, { x: 260, y: 270 }, 52),
        linePoints({ x: 260, y: 270 }, { x: 165, y: 270 }, 18),
      ),
    ],
  },
  Q: {
    id: "Q",
    label: "Q",
    note: "Qは2画想定です。Oを書いてから、右下に短い線を書きます。",
    numberPositions: [
      { x: 260, y: 80, n: "1" },
      { x: 325, y: 350, n: "2" },
    ],
    strokes: [
      concatPaths(
        cubicBezier({ x: 260, y: 80 }, { x: 90, y: 80 }, { x: 90, y: 430 }, { x: 260, y: 430 }, 64),
        cubicBezier({ x: 260, y: 430 }, { x: 430, y: 430 }, { x: 430, y: 80 }, { x: 260, y: 80 }, 64),
      ),
      linePoints({ x: 315, y: 350 }, { x: 390, y: 440 }, 28),
    ],
  },
  R: {
    id: "R",
    label: "R",
    note: "Rは3画想定です。縦線、上のふくらみ、斜めの足の順番です。",
    numberPositions: [
      { x: 165, y: 90, n: "1" },
      { x: 255, y: 98, n: "2" },
      { x: 245, y: 275, n: "3" },
    ],
    strokes: [
      linePoints({ x: 165, y: 90 }, { x: 165, y: 425 }, 60),
      concatPaths(
        linePoints({ x: 165, y: 95 }, { x: 260, y: 95 }, 18),
        cubicBezier({ x: 260, y: 95 }, { x: 395, y: 100 }, { x: 390, y: 265 }, { x: 260, y: 270 }, 52),
        linePoints({ x: 260, y: 270 }, { x: 165, y: 270 }, 18),
      ),
      linePoints({ x: 245, y: 270 }, { x: 385, y: 425 }, 45),
    ],
  },
  S: {
    id: "S",
    label: "S",
    note: "Sは1画想定です。上から書き始め、左へ回り、中央を抜けて下に流します。",
    numberPositions: [{ x: 355, y: 106, n: "1" }],
    strokes: [
      concatPaths(
        cubicBezier({ x: 360, y: 112 }, { x: 270, y: 54 }, { x: 120, y: 92 }, { x: 132, y: 195 }, 38),
        cubicBezier({ x: 132, y: 195 }, { x: 142, y: 278 }, { x: 370, y: 232 }, { x: 372, y: 334 }, 42),
        cubicBezier({ x: 372, y: 334 }, { x: 374, y: 445 }, { x: 190, y: 458 }, { x: 132, y: 392 }, 38),
      ),
    ],
  },
  T: {
    id: "T",
    label: "T",
    note: "Tは2画想定です。上横線を書いてから、中央の縦線を書きます。",
    numberPositions: [
      { x: 155, y: 95, n: "1" },
      { x: 260, y: 120, n: "2" },
    ],
    strokes: [
      linePoints({ x: 130, y: 95 }, { x: 390, y: 95 }, 58),
      linePoints({ x: 260, y: 95 }, { x: 260, y: 425 }, 60),
    ],
  },
  U: {
    id: "U",
    label: "U",
    note: "Uは1画想定です。左上から下へ、底を回って右上に上がります。",
    numberPositions: [{ x: 155, y: 95, n: "1" }],
    strokes: [
      concatPaths(
        linePoints({ x: 155, y: 95 }, { x: 155, y: 315 }, 42),
        cubicBezier({ x: 155, y: 315 }, { x: 155, y: 455 }, { x: 365, y: 455 }, { x: 365, y: 315 }, 58),
        linePoints({ x: 365, y: 315 }, { x: 365, y: 95 }, 42),
      ),
    ],
  },
  V: {
    id: "V",
    label: "V",
    note: "Vは1画想定です。左上から下中央を通って、右上へ続けて書きます。",
    numberPositions: [{ x: 145, y: 95, n: "1" }],
    strokes: [
      concatPaths(
        linePoints({ x: 145, y: 95 }, { x: 260, y: 425 }, 62),
        linePoints({ x: 260, y: 425 }, { x: 375, y: 95 }, 62),
      ),
    ],
  },
  W: {
    id: "W",
    label: "W",
    note: "Wは1画想定です。左上から下、中央上、下、右上へジグザグに続けて書きます。",
    numberPositions: [{ x: 105, y: 95, n: "1" }],
    strokes: [
      concatPaths(
      linePoints({ x: 105, y: 95 }, { x: 180, y: 425 }, 60),
      linePoints({ x: 180, y: 425 }, { x: 260, y: 95 }, 60),
      linePoints({ x: 260, y: 95 }, { x: 340, y: 425 }, 60),
      linePoints({ x: 340, y: 425 }, { x: 415, y: 95 }, 60),
      ),
    ],
  },
  X: {
    id: "X",
    label: "X",
    note: "Xは2画想定です。左上から右下、右上から左下の順番です。",
    numberPositions: [
      { x: 145, y: 95, n: "1" },
      { x: 375, y: 95, n: "2" },
    ],
    strokes: [
      linePoints({ x: 145, y: 95 }, { x: 375, y: 425 }, 62),
      linePoints({ x: 375, y: 95 }, { x: 145, y: 425 }, 62),
    ],
  },
  Y: {
    id: "Y",
    label: "Y",
    note: "Yは2画想定です。左上から中央へ書いてから、右上から中央を通って下へ続けます。",
    numberPositions: [
      { x: 145, y: 95, n: "1" },
      { x: 375, y: 95, n: "2" },
    ],
    strokes: [
      linePoints({ x: 145, y: 95 }, { x: 260, y: 250 }, 42),
      concatPaths(
        linePoints({ x: 375, y: 95 }, { x: 260, y: 250 }, 42),
        linePoints({ x: 260, y: 250 }, { x: 260, y: 425 }, 42),
      ),
    ],
  },
  Z: {
    id: "Z",
    label: "Z",
    note: "Zは1画想定です。上横線から斜めに下り、そのまま下横線を書きます。",
    numberPositions: [{ x: 150, y: 95, n: "1" }],
    strokes: [
      concatPaths(
        linePoints({ x: 140, y: 95 }, { x: 380, y: 95 }, 54),
        linePoints({ x: 380, y: 95 }, { x: 140, y: 425 }, 72),
        linePoints({ x: 140, y: 425 }, { x: 380, y: 425 }, 54),
      ),
    ],
  },
} satisfies Record<string, LetterGuide>;

export const LOWERCASE_LETTER_GUIDES = {
  a: {
    id: "lower-a",
    label: "a",
    note: "aは2画想定です。丸を書いてから右の縦線を書きます。ブロック体寄りの小文字です。",
    numberPositions: [
      { x: 315, y: 165, n: "1" },
      { x: 360, y: 170, n: "2" },
    ],
    strokes: [
      concatPaths(
        cubicBezier({ x: 315, y: 170 }, { x: 205, y: 105 }, { x: 130, y: 210 }, { x: 155, y: 300 }, 45),
        cubicBezier({ x: 155, y: 300 }, { x: 185, y: 410 }, { x: 315, y: 400 }, { x: 335, y: 300 }, 45),
        cubicBezier({ x: 335, y: 300 }, { x: 355, y: 215 }, { x: 350, y: 185 }, { x: 315, y: 170 }, 28),
      ),
      linePoints({ x: 360, y: 165 }, { x: 360, y: 395 }, 44),
    ],
  },
  b: {
    id: "lower-b",
    label: "b",
    note: "bは2画想定です。縦線を書いてから右の丸を書きます。",
    numberPositions: [
      { x: 165, y: 90, n: "1" },
      { x: 245, y: 215, n: "2" },
    ],
    strokes: [
      linePoints({ x: 165, y: 90 }, { x: 165, y: 405 }, 62),
      concatPaths(
        cubicBezier({ x: 165, y: 240 }, { x: 260, y: 155 }, { x: 380, y: 215 }, { x: 360, y: 315 }, 48),
        cubicBezier({ x: 360, y: 315 }, { x: 340, y: 430 }, { x: 220, y: 420 }, { x: 165, y: 350 }, 46),
      ),
    ],
  },
  c: {
    id: "lower-c",
    label: "c",
    note: "cは1画想定です。右上から左へ回って右下へ向かいます。",
    numberPositions: [{ x: 350, y: 185, n: "1" }],
    strokes: [
      concatPaths(
        cubicBezier({ x: 350, y: 190 }, { x: 250, y: 120 }, { x: 120, y: 170 }, { x: 125, y: 285 }, 50),
        cubicBezier({ x: 125, y: 285 }, { x: 130, y: 405 }, { x: 265, y: 430 }, { x: 355, y: 355 }, 50),
      ),
    ],
  },
  d: {
    id: "lower-d",
    label: "d",
    note: "dは2画想定です。丸を書いてから右の長い縦線を書きます。",
    numberPositions: [
      { x: 290, y: 215, n: "1" },
      { x: 365, y: 90, n: "2" },
    ],
    strokes: [
      concatPaths(
        cubicBezier({ x: 315, y: 210 }, { x: 220, y: 145 }, { x: 125, y: 210 }, { x: 145, y: 315 }, 48),
        cubicBezier({ x: 145, y: 315 }, { x: 170, y: 425 }, { x: 300, y: 420 }, { x: 345, y: 330 }, 48),
      ),
      linePoints({ x: 365, y: 90 }, { x: 365, y: 405 }, 62),
    ],
  },
  e: {
    id: "lower-e",
    label: "e",
    note: "eは1画想定です。中央の横線から入り、丸く回ります。",
    numberPositions: [{ x: 190, y: 260, n: "1" }],
    strokes: [
      concatPaths(
        linePoints({ x: 180, y: 260 }, { x: 350, y: 260 }, 28),
        cubicBezier({ x: 350, y: 260 }, { x: 335, y: 135 }, { x: 130, y: 155 }, { x: 130, y: 300 }, 55),
        cubicBezier({ x: 130, y: 300 }, { x: 135, y: 420 }, { x: 285, y: 430 }, { x: 360, y: 350 }, 45),
      ),
    ],
  },
  f: {
    id: "lower-f",
    label: "f",
    note: "fは2画想定です。上から曲げて縦に下ろし、あとで横棒を書きます。",
    numberPositions: [
      { x: 320, y: 105, n: "1" },
      { x: 185, y: 250, n: "2" },
    ],
    strokes: [
      concatPaths(
        cubicBezier({ x: 325, y: 105 }, { x: 235, y: 55 }, { x: 215, y: 130 }, { x: 235, y: 210 }, 32),
        linePoints({ x: 235, y: 210 }, { x: 235, y: 430 }, 48),
      ),
      linePoints({ x: 155, y: 245 }, { x: 330, y: 245 }, 42),
    ],
  },
  g: {
    id: "lower-g",
    label: "g",
    note: "gは2画想定です。丸を書いてから右の下へ伸びる線を書きます。ブロック体寄りです。",
    numberPositions: [
      { x: 305, y: 200, n: "1" },
      { x: 360, y: 180, n: "2" },
    ],
    strokes: [
      concatPaths(
        cubicBezier({ x: 315, y: 205 }, { x: 220, y: 140 }, { x: 125, y: 205 }, { x: 145, y: 310 }, 48),
        cubicBezier({ x: 145, y: 310 }, { x: 170, y: 415 }, { x: 305, y: 405 }, { x: 345, y: 315 }, 48),
      ),
      concatPaths(
        linePoints({ x: 360, y: 180 }, { x: 360, y: 420 }, 50),
        cubicBezier({ x: 360, y: 420 }, { x: 350, y: 500 }, { x: 210, y: 505 }, { x: 190, y: 430 }, 36),
      ),
    ],
  },
  h: {
    id: "lower-h",
    label: "h",
    note: "hは2画想定です。縦線を書いてから山を作ります。",
    numberPositions: [
      { x: 165, y: 90, n: "1" },
      { x: 170, y: 260, n: "2" },
    ],
    strokes: [
      linePoints({ x: 165, y: 90 }, { x: 165, y: 405 }, 62),
      concatPaths(
        cubicBezier({ x: 165, y: 260 }, { x: 235, y: 160 }, { x: 360, y: 190 }, { x: 360, y: 300 }, 48),
        linePoints({ x: 360, y: 300 }, { x: 360, y: 405 }, 24),
      ),
    ],
  },
  i: {
    id: "lower-i",
    label: "i",
    note: "iは2画想定です。縦線を書いてから点を打ちます。",
    numberPositions: [
      { x: 260, y: 185, n: "1" },
      { x: 260, y: 105, n: "2" },
    ],
    strokes: [
      linePoints({ x: 260, y: 180 }, { x: 260, y: 405 }, 45),
      concatPaths(
        cubicBezier({ x: 252, y: 105 }, { x: 252, y: 95 }, { x: 268, y: 95 }, { x: 268, y: 105 }, 10),
        cubicBezier({ x: 268, y: 105 }, { x: 268, y: 118 }, { x: 252, y: 118 }, { x: 252, y: 105 }, 10),
      ),
    ],
  },
  j: {
    id: "lower-j",
    label: "j",
    note: "jは2画想定です。下に伸ばして左へ曲げ、あとで点を打ちます。",
    numberPositions: [
      { x: 285, y: 185, n: "1" },
      { x: 285, y: 105, n: "2" },
    ],
    strokes: [
      concatPaths(
        linePoints({ x: 285, y: 180 }, { x: 285, y: 420 }, 45),
        cubicBezier({ x: 285, y: 420 }, { x: 280, y: 500 }, { x: 160, y: 500 }, { x: 160, y: 430 }, 34),
      ),
      concatPaths(
        cubicBezier({ x: 277, y: 105 }, { x: 277, y: 95 }, { x: 293, y: 95 }, { x: 293, y: 105 }, 10),
        cubicBezier({ x: 293, y: 105 }, { x: 293, y: 118 }, { x: 277, y: 118 }, { x: 277, y: 105 }, 10),
      ),
    ],
  },
  k: {
    id: "lower-k",
    label: "k",
    note: "kは3画想定です。縦線、中央への斜め、右下への斜めの順番です。",
    numberPositions: [
      { x: 165, y: 90, n: "1" },
      { x: 340, y: 190, n: "2" },
      { x: 230, y: 295, n: "3" },
    ],
    strokes: [
      linePoints({ x: 165, y: 90 }, { x: 165, y: 405 }, 62),
      linePoints({ x: 345, y: 190 }, { x: 165, y: 300 }, 42),
      linePoints({ x: 165, y: 300 }, { x: 355, y: 405 }, 42),
    ],
  },
  l: {
    id: "lower-l",
    label: "l",
    note: "lは1画想定です。上からまっすぐ下へ書きます。",
    numberPositions: [{ x: 260, y: 90, n: "1" }],
    strokes: [linePoints({ x: 260, y: 90 }, { x: 260, y: 405 }, 62)],
  },
  m: {
    id: "lower-m",
    label: "m",
    note: "mは3画想定です。左縦、1つ目の山、2つ目の山の順番です。",
    numberPositions: [
      { x: 125, y: 190, n: "1" },
      { x: 130, y: 285, n: "2" },
      { x: 260, y: 285, n: "3" },
    ],
    strokes: [
      linePoints({ x: 125, y: 190 }, { x: 125, y: 405 }, 42),
      concatPaths(
        cubicBezier({ x: 125, y: 285 }, { x: 165, y: 180 }, { x: 250, y: 180 }, { x: 250, y: 300 }, 42),
        linePoints({ x: 250, y: 300 }, { x: 250, y: 405 }, 22),
      ),
      concatPaths(
        cubicBezier({ x: 250, y: 285 }, { x: 295, y: 180 }, { x: 380, y: 180 }, { x: 380, y: 300 }, 42),
        linePoints({ x: 380, y: 300 }, { x: 380, y: 405 }, 22),
      ),
    ],
  },
  n: {
    id: "lower-n",
    label: "n",
    note: "nは2画想定です。左縦、山の順番です。",
    numberPositions: [
      { x: 150, y: 190, n: "1" },
      { x: 155, y: 285, n: "2" },
    ],
    strokes: [
      linePoints({ x: 150, y: 190 }, { x: 150, y: 405 }, 42),
      concatPaths(
        cubicBezier({ x: 150, y: 285 }, { x: 220, y: 170 }, { x: 360, y: 190 }, { x: 360, y: 310 }, 52),
        linePoints({ x: 360, y: 310 }, { x: 360, y: 405 }, 20),
      ),
    ],
  },
  o: {
    id: "lower-o",
    label: "o",
    note: "oは1画想定です。上から反時計回りに丸を書きます。",
    numberPositions: [{ x: 260, y: 165, n: "1" }],
    strokes: [
      concatPaths(
        cubicBezier({ x: 260, y: 165 }, { x: 125, y: 165 }, { x: 125, y: 405 }, { x: 260, y: 405 }, 58),
        cubicBezier({ x: 260, y: 405 }, { x: 395, y: 405 }, { x: 395, y: 165 }, { x: 260, y: 165 }, 58),
      ),
    ],
  },
  p: {
    id: "lower-p",
    label: "p",
    note: "pは2画想定です。長い縦線を書いてから右の丸を書きます。",
    numberPositions: [
      { x: 165, y: 190, n: "1" },
      { x: 245, y: 215, n: "2" },
    ],
    strokes: [
      linePoints({ x: 165, y: 190 }, { x: 165, y: 485 }, 62),
      concatPaths(
        cubicBezier({ x: 165, y: 240 }, { x: 260, y: 155 }, { x: 380, y: 215 }, { x: 360, y: 315 }, 48),
        cubicBezier({ x: 360, y: 315 }, { x: 340, y: 430 }, { x: 220, y: 420 }, { x: 165, y: 350 }, 46),
      ),
    ],
  },
  q: {
    id: "lower-q",
    label: "q",
    note: "qは2画想定です。丸を書いてから右の下へ伸びる線を書きます。",
    numberPositions: [
      { x: 300, y: 210, n: "1" },
      { x: 360, y: 190, n: "2" },
    ],
    strokes: [
      concatPaths(
        cubicBezier({ x: 315, y: 205 }, { x: 220, y: 140 }, { x: 125, y: 205 }, { x: 145, y: 310 }, 48),
        cubicBezier({ x: 145, y: 310 }, { x: 170, y: 415 }, { x: 305, y: 405 }, { x: 345, y: 315 }, 48),
      ),
      linePoints({ x: 360, y: 190 }, { x: 360, y: 485 }, 62),
    ],
  },
  r: {
    id: "lower-r",
    label: "r",
    note: "rは2画想定です。左縦を書いてから、小さな肩を書きます。",
    numberPositions: [
      { x: 170, y: 190, n: "1" },
      { x: 175, y: 275, n: "2" },
    ],
    strokes: [
      linePoints({ x: 170, y: 190 }, { x: 170, y: 405 }, 42),
      cubicBezier({ x: 170, y: 275 }, { x: 215, y: 190 }, { x: 300, y: 185 }, { x: 330, y: 225 }, 42),
    ],
  },
  s: {
    id: "lower-s",
    label: "s",
    note: "sは1画想定です。右上から左へ回り、中央を抜けて右下へ流します。",
    numberPositions: [{ x: 345, y: 190, n: "1" }],
    strokes: [
      concatPaths(
        cubicBezier({ x: 345, y: 195 }, { x: 265, y: 145 }, { x: 145, y: 175 }, { x: 155, y: 255 }, 38),
        cubicBezier({ x: 155, y: 255 }, { x: 165, y: 315 }, { x: 355, y: 290 }, { x: 355, y: 360 }, 40),
        cubicBezier({ x: 355, y: 360 }, { x: 355, y: 430 }, { x: 210, y: 430 }, { x: 150, y: 380 }, 32),
      ),
    ],
  },
  t: {
    id: "lower-t",
    label: "t",
    note: "tは2画想定です。縦線を書いてから横棒を書きます。",
    numberPositions: [
      { x: 260, y: 120, n: "1" },
      { x: 190, y: 230, n: "2" },
    ],
    strokes: [
      linePoints({ x: 260, y: 120 }, { x: 260, y: 405 }, 54),
      linePoints({ x: 170, y: 230 }, { x: 350, y: 230 }, 42),
    ],
  },
  u: {
    id: "lower-u",
    label: "u",
    note: "uは2画想定です。左を下ろして底を回り、右の短い縦線を書きます。",
    numberPositions: [
      { x: 165, y: 190, n: "1" },
      { x: 360, y: 190, n: "2" },
    ],
    strokes: [
      concatPaths(
        linePoints({ x: 165, y: 190 }, { x: 165, y: 315 }, 26),
        cubicBezier({ x: 165, y: 315 }, { x: 165, y: 430 }, { x: 330, y: 430 }, { x: 360, y: 315 }, 52),
      ),
      linePoints({ x: 360, y: 190 }, { x: 360, y: 405 }, 42),
    ],
  },
  v: {
    id: "lower-v",
    label: "v",
    note: "vは2画想定です。左上から下中央、下中央から右上の順番です。",
    numberPositions: [
      { x: 160, y: 190, n: "1" },
      { x: 260, y: 405, n: "2" },
    ],
    strokes: [
      linePoints({ x: 160, y: 190 }, { x: 260, y: 405 }, 42),
      linePoints({ x: 260, y: 405 }, { x: 360, y: 190 }, 42),
    ],
  },
  w: {
    id: "lower-w",
    label: "w",
    note: "wは4画想定です。小文字でも山が2つある形です。",
    numberPositions: [
      { x: 110, y: 190, n: "1" },
      { x: 185, y: 405, n: "2" },
      { x: 260, y: 250, n: "3" },
      { x: 335, y: 405, n: "4" },
    ],
    strokes: [
      linePoints({ x: 110, y: 190 }, { x: 185, y: 405 }, 40),
      linePoints({ x: 185, y: 405 }, { x: 260, y: 250 }, 34),
      linePoints({ x: 260, y: 250 }, { x: 335, y: 405 }, 34),
      linePoints({ x: 335, y: 405 }, { x: 410, y: 190 }, 40),
    ],
  },
  x: {
    id: "lower-x",
    label: "x",
    note: "xは2画想定です。左上から右下、右上から左下の順番です。",
    numberPositions: [
      { x: 170, y: 190, n: "1" },
      { x: 350, y: 190, n: "2" },
    ],
    strokes: [
      linePoints({ x: 170, y: 190 }, { x: 350, y: 405 }, 45),
      linePoints({ x: 350, y: 190 }, { x: 170, y: 405 }, 45),
    ],
  },
  y: {
    id: "lower-y",
    label: "y",
    note: "yは2画想定です。vの形を書いてから下へ伸ばして左に曲げます。",
    numberPositions: [
      { x: 160, y: 190, n: "1" },
      { x: 360, y: 190, n: "2" },
    ],
    strokes: [
      linePoints({ x: 160, y: 190 }, { x: 260, y: 405 }, 42),
      concatPaths(
        linePoints({ x: 360, y: 190 }, { x: 260, y: 405 }, 42),
        cubicBezier({ x: 260, y: 405 }, { x: 240, y: 500 }, { x: 145, y: 500 }, { x: 145, y: 430 }, 34),
      ),
    ],
  },
  z: {
    id: "lower-z",
    label: "z",
    note: "zは3画想定です。上横線、斜め、下横線の順番です。",
    numberPositions: [
      { x: 155, y: 190, n: "1" },
      { x: 350, y: 205, n: "2" },
      { x: 155, y: 405, n: "3" },
    ],
    strokes: [
      linePoints({ x: 150, y: 190 }, { x: 360, y: 190 }, 48),
      linePoints({ x: 360, y: 190 }, { x: 150, y: 405 }, 58),
      linePoints({ x: 150, y: 405 }, { x: 360, y: 405 }, 48),
    ],
  },
} satisfies Record<string, LetterGuide>;

export type LetterId = keyof typeof LETTER_GUIDES | keyof typeof LOWERCASE_LETTER_GUIDES;

export type LetterCase = "uppercase" | "lowercase";

export const LETTER_GUIDE_GROUPS = {
  uppercase: Object.values(LETTER_GUIDES),
  lowercase: Object.values(LOWERCASE_LETTER_GUIDES),
} satisfies Record<LetterCase, LetterGuide[]>;

export const LETTER_GUIDE_LIST = [...LETTER_GUIDE_GROUPS.uppercase, ...LETTER_GUIDE_GROUPS.lowercase];
