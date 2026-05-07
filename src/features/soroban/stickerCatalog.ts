// 7ばんはシリーズ内のシール枚数がそろうまで非公開。
// import arcMedalSorobanStickerImage from "@/assets/seal/arc-medal-soroban-sticker.png";
import arcSorobanBookStickerImage from "@/assets/seal/arc-soroban-book-sticker.png";
import keimaruAnimalBookStickerImage from "@/assets/seal/keimaru-animal-book-sticker.png";
import keimaruBananaHugStickerImage from "@/assets/seal/keimaru-banana-hug-sticker.png";
import keimaruCandyWrapperStickerImage from "@/assets/seal/keimaru-candy-wrapper-sticker.png";
import keimaruDuckHugStickerImage from "@/assets/seal/keimaru-duck-hug-sticker.png";
import keimaruIceCreamStickerImage from "@/assets/seal/keimaru-ice-cream-sticker.png";
import keimaruMoonNapStickerImage from "@/assets/seal/keimaru-moon-nap-sticker.png";
import keimaruMoonPillowStickerImage from "@/assets/seal/keimaru-moon-pillow-sticker.png";
import keimaruOverallsStickerImage from "@/assets/seal/keimaru-overalls-sticker.png";
import keimaruPictureBookStickerImage from "@/assets/seal/keimaru-picture-book-sticker.png";
import keimaruPrinceWandStickerImage from "@/assets/seal/keimaru-prince-wand-sticker.png";
import keimaruRainbowCloudStickerImage from "@/assets/seal/keimaru-rainbow-cloud-sticker.png";
import keimaruRamenStickerImage from "@/assets/seal/keimaru-ramen-sticker.png";
import keimaruRockGuitarStickerImage from "@/assets/seal/keimaru-rock-guitar-sticker.png";
import keimaruSnackBasketStickerImage from "@/assets/seal/keimaru-snack-basket-sticker.png";
import keimaruSorobanStickerImage from "@/assets/seal/keimaru-soroban-sticker.png";
import keimaruTrophyStickerImage from "@/assets/seal/keimaru-trophy-sticker.png";
import chuchupiHeartGiftStickerImage from "@/assets/seal/chuchupi-heart-gift-sticker.png";
import chuchupiPresentStickerImage from "@/assets/seal/chuchupi-present-sticker.png";
import shibaDonutStickerImage from "@/assets/seal/shiba-donut-sticker.png";
import shibaGamepadStickerImage from "@/assets/seal/shiba-gamepad-sticker.png";
import shibaHeadphonesStickerImage from "@/assets/seal/shiba-headphones-sticker.png";
import pocoronCandyWandStickerImage from "@/assets/seal/pocoron-candy-wand-sticker.png";
import pocoronRainbowStickerImage from "@/assets/seal/pocoron-rainbow-sticker.png";
import pocoronStarWandStickerImage from "@/assets/seal/pocoron-star-wand-sticker.png";
import pocoronStripedShirtStickerImage from "@/assets/seal/pocoron-striped-shirt-sticker.png";
import shibaStrawberryStickerImage from "@/assets/seal/shiba-strawberry-sticker.png";
import shibaSweetsBasketStickerImage from "@/assets/seal/shiba-sweets-basket-sticker.png";
import shibaWaveStickerImage from "@/assets/seal/shiba-wave-sticker.png";
import sorobanFriendsStickerImage from "@/assets/seal/soroban-friends-sticker.png";

export const STICKER_PAGE_COUNT = 4;

export type StickerItem = {
  id: string;
  name: string;
  image: string;
  description: string;
  addedOn: string;
  gachaId: StickerGachaId;
};

export type StickerGachaId =
  | "sticker-set-1"
  | "sticker-set-2"
  | "sticker-set-3"
  | "sticker-set-4"
  | "sticker-set-5"
  | "sticker-set-6";

export type StickerGachaDefinition = {
  id: StickerGachaId;
  name: string;
  shortName: string;
  description: string;
};

export const STICKER_GACHA_DEFINITIONS: StickerGachaDefinition[] = [
  {
    id: "sticker-set-1",
    name: "シール 1ばん",
    shortName: "1ばん",
    description: "同じシールがでることもあるがちゃ。",
  },
  {
    id: "sticker-set-2",
    name: "シール 2ばん",
    shortName: "2ばん",
    description: "同じシールがでることもあるがちゃ。",
  },
  {
    id: "sticker-set-3",
    name: "シール 3ばん",
    shortName: "3ばん",
    description: "同じシールがでることもあるがちゃ。",
  },
  {
    id: "sticker-set-4",
    name: "シール 4ばん",
    shortName: "4ばん",
    description: "同じシールがでることもあるがちゃ。",
  },
  {
    id: "sticker-set-5",
    name: "シール 5ばん",
    shortName: "5ばん",
    description: "同じシールがでることもあるがちゃ。",
  },
  {
    id: "sticker-set-6",
    name: "シール 6ばん",
    shortName: "6ばん",
    description: "同じシールがでることもあるがちゃ。",
  },
  // 7ばんはシリーズ内のシール枚数がそろうまで非公開。
  // {
  //   id: "sticker-set-7",
  //   name: "シール 7ばん",
  //   shortName: "7ばん",
  //   description: "同じシールがでることもあるがちゃ。",
  // },
];

export const STICKERS: StickerItem[] = [
  {
    id: "keimaru-overalls-sticker",
    name: "けいまるくん オーバーオールシール",
    image: keimaruOverallsStickerImage,
    description: "くるまもようのシャツとオーバーオールの けいまるくん。",
    addedOn: "2026-04-24",
    gachaId: "sticker-set-1",
  },
  {
    id: "keimaru-ramen-sticker",
    name: "けいまるくん ラーメンシール",
    image: keimaruRamenStickerImage,
    description: "あつあつラーメンを ちゅるっとたべる けいまるくん。",
    addedOn: "2026-04-24",
    gachaId: "sticker-set-1",
  },
  {
    id: "keimaru-candy-wrapper-sticker",
    name: "けいまるくん キャンディシール",
    image: keimaruCandyWrapperStickerImage,
    description: "キャンディのつつみに すっぽり入った けいまるくん。",
    addedOn: "2026-04-24",
    gachaId: "sticker-set-1",
  },
  {
    id: "keimaru-rainbow-cloud-sticker",
    name: "けいまるくん にじぐもシール",
    image: keimaruRainbowCloudStickerImage,
    description: "にじとくもの上で ちょこんとすわる けいまるくん。",
    addedOn: "2026-04-24",
    gachaId: "sticker-set-1",
  },
  {
    id: "keimaru-rock-guitar-sticker",
    name: "けいまるくん ギターシール",
    image: keimaruRockGuitarStickerImage,
    description: "ギターをかかえて かっこよくきめる けいまるくん。",
    addedOn: "2026-04-24",
    gachaId: "sticker-set-1",
  },
  {
    id: "keimaru-prince-wand-sticker",
    name: "けいまるくん まほうのステッキシール",
    image: keimaruPrinceWandStickerImage,
    description: "おうかんと星のステッキで きらきらする けいまるくん。",
    addedOn: "2026-04-24",
    gachaId: "sticker-set-2",
  },
  {
    id: "keimaru-picture-book-sticker",
    name: "けいまるくん えほんシール",
    image: keimaruPictureBookStickerImage,
    description: "えほんをひらいて おはなしをたのしむ けいまるくん。",
    addedOn: "2026-04-24",
    gachaId: "sticker-set-2",
  },
  {
    id: "keimaru-duck-hug-sticker",
    name: "けいまるくん ひよこシール",
    image: keimaruDuckHugStickerImage,
    description: "きいろいひよこを ぎゅっとだく けいまるくん。",
    addedOn: "2026-04-24",
    gachaId: "sticker-set-2",
  },
  {
    id: "keimaru-moon-nap-sticker",
    name: "けいまるくん おつきさまシール",
    image: keimaruMoonNapStickerImage,
    description: "おつきさまの上で すやすやねむる けいまるくん。",
    addedOn: "2026-04-24",
    gachaId: "sticker-set-2",
  },
  {
    id: "keimaru-animal-book-sticker",
    name: "けいまるくん どうぶつずかんシール",
    image: keimaruAnimalBookStickerImage,
    description: "どうぶつの本を じっくりよむ けいまるくん。",
    addedOn: "2026-04-24",
    gachaId: "sticker-set-2",
  },
  {
    id: "keimaru-ice-cream-sticker",
    name: "けいまるくん アイスシール",
    image: keimaruIceCreamStickerImage,
    description: "三だんアイスを うれしそうにかかえる けいまるくん。",
    addedOn: "2026-04-25",
    gachaId: "sticker-set-3",
  },
  {
    id: "keimaru-moon-pillow-sticker",
    name: "けいまるくん おやすみシール",
    image: keimaruMoonPillowStickerImage,
    description: "ちいさなおつきさまを まくらにする けいまるくん。",
    addedOn: "2026-04-25",
    gachaId: "sticker-set-3",
  },
  {
    id: "keimaru-banana-hug-sticker",
    name: "けいまるくん バナナシール",
    image: keimaruBananaHugStickerImage,
    description: "にこにこバナナを たいせつにかかえる けいまるくん。",
    addedOn: "2026-04-25",
    gachaId: "sticker-set-3",
  },
  {
    id: "keimaru-soroban-sticker",
    name: "けいまるくん そろばんシール",
    image: keimaruSorobanStickerImage,
    description: "そろばんを手にもって がんばる けいまるくん。",
    addedOn: "2026-04-25",
    gachaId: "sticker-set-3",
  },
  {
    id: "keimaru-trophy-sticker",
    name: "けいまるくん トロフィーシール",
    image: keimaruTrophyStickerImage,
    description: "ぴかぴかのトロフィーを かかげる けいまるくん。",
    addedOn: "2026-04-25",
    gachaId: "sticker-set-3",
  },
  {
    id: "keimaru-snack-basket-sticker",
    name: "けいまるくん おかしバスケットシール",
    image: keimaruSnackBasketStickerImage,
    description: "おかしをいっぱい入れたかごをもつ けいまるくん。",
    addedOn: "2026-04-25",
    gachaId: "sticker-set-4",
  },
  {
    id: "shiba-wave-sticker",
    name: "しばいぬ てふりシール",
    image: shibaWaveStickerImage,
    description: "赤いシャツで にこにこ手をふる しばいぬ。",
    addedOn: "2026-04-25",
    gachaId: "sticker-set-4",
  },
  {
    id: "pocoron-striped-shirt-sticker",
    name: "ポコロン しましまシール",
    image: pocoronStripedShirtStickerImage,
    description: "しましまの服で うれしそうにすわる ポコロン。",
    addedOn: "2026-04-25",
    gachaId: "sticker-set-4",
  },
  {
    id: "shiba-strawberry-sticker",
    name: "しばいぬ いちごシール",
    image: shibaStrawberryStickerImage,
    description: "いちごを持って にっこり手をふる しばいぬ。",
    addedOn: "2026-04-25",
    gachaId: "sticker-set-4",
  },
  {
    id: "chuchupi-heart-gift-sticker",
    name: "ちゅちゅぴ ハートギフトシール",
    image: chuchupiHeartGiftStickerImage,
    description: "大きなハートとプレゼントをだく ピンクのちゅちゅぴ。",
    addedOn: "2026-04-25",
    gachaId: "sticker-set-4",
  },
  {
    id: "pocoron-star-wand-sticker",
    name: "ポコロン 星ステッキシール",
    image: pocoronStarWandStickerImage,
    description: "星のステッキを持って まほうをかける ポコロン。",
    addedOn: "2026-04-30",
    gachaId: "sticker-set-5",
  },
  {
    id: "soroban-friends-sticker",
    name: "そろばんフレンズシール",
    image: sorobanFriendsStickerImage,
    description: "そろばんを持つアークと しばいぬがならぶシール。",
    addedOn: "2026-04-30",
    gachaId: "sticker-set-5",
  },
  {
    id: "shiba-gamepad-sticker",
    name: "しばいぬ ゲームシール",
    image: shibaGamepadStickerImage,
    description: "ピンクのゲームコントローラーで あそぶ しばいぬ。",
    addedOn: "2026-04-30",
    gachaId: "sticker-set-5",
  },
  {
    id: "pocoron-rainbow-sticker",
    name: "ポコロン にじシール",
    image: pocoronRainbowStickerImage,
    description: "にじとくものそばで わくわくする ポコロン。",
    addedOn: "2026-04-30",
    gachaId: "sticker-set-5",
  },
  {
    id: "pocoron-candy-wand-sticker",
    name: "ポコロン キャンディステッキシール",
    image: pocoronCandyWandStickerImage,
    description: "キャンディと星のステッキを持つ あまいポコロン。",
    addedOn: "2026-04-30",
    gachaId: "sticker-set-5",
  },
  {
    id: "shiba-headphones-sticker",
    name: "しばいぬ ヘッドホンシール",
    image: shibaHeadphonesStickerImage,
    description: "ヘッドホンで音楽をきく ごきげんな しばいぬ。",
    addedOn: "2026-05-04",
    gachaId: "sticker-set-6",
  },
  {
    id: "chuchupi-present-sticker",
    name: "ちゅちゅぴ プレゼントシール",
    image: chuchupiPresentStickerImage,
    description: "ピンクのプレゼントをたいせつに持つ ちゅちゅぴ。",
    addedOn: "2026-05-04",
    gachaId: "sticker-set-6",
  },
  {
    id: "arc-soroban-book-sticker",
    name: "アーク そろばんべんきょうシール",
    image: arcSorobanBookStickerImage,
    description: "そろばんと本で べんきょうする アーク。",
    addedOn: "2026-05-04",
    gachaId: "sticker-set-6",
  },
  {
    id: "shiba-donut-sticker",
    name: "しばいぬ ドーナツシール",
    image: shibaDonutStickerImage,
    description: "ピンクのドーナツを持って 手をふる しばいぬ。",
    addedOn: "2026-05-04",
    gachaId: "sticker-set-6",
  },
  {
    id: "shiba-sweets-basket-sticker",
    name: "しばいぬ おやつバスケットシール",
    image: shibaSweetsBasketStickerImage,
    description: "クッキーやおやつをかごいっぱいに集めた しばいぬ。",
    addedOn: "2026-05-04",
    gachaId: "sticker-set-6",
  },
  // 7ばんはシリーズ内のシール枚数がそろうまで非公開。
  // {
  //   id: "arc-medal-soroban-sticker",
  //   name: "アーク メダルそろばんシール",
  //   image: arcMedalSorobanStickerImage,
  //   description: "メダルをつけて そろばんを持つ アーク。",
  //   addedOn: "2026-05-04",
  //   gachaId: "sticker-set-7",
  // },
];

const STICKER_ID_SET = new Set(STICKERS.map((sticker) => sticker.id));

export function normalizeStickerId(stickerId: string): string | null {
  return STICKER_ID_SET.has(stickerId) ? stickerId : null;
}

export function getStickerById(stickerId: string): StickerItem | null {
  const normalizedStickerId = normalizeStickerId(stickerId);
  if (!normalizedStickerId) return null;
  return STICKERS.find((sticker) => sticker.id === normalizedStickerId) ?? null;
}

export function isStickerId(stickerId: string): boolean {
  return normalizeStickerId(stickerId) != null;
}

export function getStickersByGachaId(gachaId: StickerGachaId): StickerItem[] {
  return STICKERS.filter((sticker) => sticker.gachaId === gachaId);
}

export function getStickerGachaDefinition(
  gachaId: StickerGachaId,
): StickerGachaDefinition {
  return (
    STICKER_GACHA_DEFINITIONS.find((gacha) => gacha.id === gachaId) ??
    STICKER_GACHA_DEFINITIONS[0]
  );
}
