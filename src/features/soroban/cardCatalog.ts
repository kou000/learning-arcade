import keimarukunBeachCardImage from "@/assets/cards/keimarukun-beach-card.png";
import keimarukunBreakfastCardImage from "@/assets/cards/keimarukun-breakfast-card.png";
import keimarukunDanceCardImage from "@/assets/cards/keimarukun-dance-card.png";
import keimarukunFestivalCardImage from "@/assets/cards/keimarukun-festival-card.png";
import keimarukunMagicCardImage from "@/assets/cards/keimarukun-magic-card.png";
import keimarukunNapCardImage from "@/assets/cards/keimarukun-nap-card.png";
import keimarukunPandaCardImage from "@/assets/cards/keimarukun-panda-card.png";
import keimarukunPicnicCardImage from "@/assets/cards/keimarukun-picnic-card.png";
import keimarukunRamenCardImage from "@/assets/cards/keimarukun-ramen-card.png";
import keimarukunRockGuitarCardImage from "@/assets/cards/keimarukun-rock-guitar-card.png";
import keimarukunSpaceCardImage from "@/assets/cards/keimarukun-space-card.png";
import keimarukunSweetsCardImage from "@/assets/cards/keimarukun-sweets-card.png";
import keimarukunWinterCardImage from "@/assets/cards/keimarukun-winter-card.png";

export type CardItem = {
  id: string;
  name: string;
  image: string;
  description: string;
  addedOn: string;
};

export const KEIMARUKUN_CARDS: CardItem[] = [
  {
    id: "keimarukun-rock-guitar-card",
    name: "けいまるくん ろっくぎたーかーど",
    image: keimarukunRockGuitarCardImage,
    description: "ぎたーをもった けいまるくんの かっこいい かーど。",
    addedOn: "2026-04-24",
  },
  {
    id: "keimarukun-magic-card",
    name: "けいまるくん まほうつかいかーど",
    image: keimarukunMagicCardImage,
    description: "ほしのまほうをつかう けいまるくんの きらきらかーど。",
    addedOn: "2026-04-24",
  },
  {
    id: "keimarukun-panda-card",
    name: "けいまるくん ぱんだかーど",
    image: keimarukunPandaCardImage,
    description: "ぱんだのふくをきた けいまるくんの ふわふわかーど。",
    addedOn: "2026-04-24",
  },
  {
    id: "keimarukun-breakfast-card",
    name: "けいまるくん あさごはんかーど",
    image: keimarukunBreakfastCardImage,
    description: "とーすとになった けいまるくんの ほかほかかーど。",
    addedOn: "2026-04-24",
  },
  {
    id: "keimarukun-winter-card",
    name: "けいまるくん ふゆかーど",
    image: keimarukunWinterCardImage,
    description: "ゆきのひの けいまるくんの ぬくぬくかーど。",
    addedOn: "2026-04-24",
  },
  {
    id: "keimarukun-ramen-card",
    name: "けいまるくん らーめんかーど",
    image: keimarukunRamenCardImage,
    description: "らーめんをたべる けいまるくんの あつあつかーど。",
    addedOn: "2026-04-24",
  },
  {
    id: "keimarukun-space-card",
    name: "けいまるくん うちゅうかーど",
    image: keimarukunSpaceCardImage,
    description: "うちゅうふくで ほしをたんけんする けいまるくん。",
    addedOn: "2026-04-25",
  },
  {
    id: "keimarukun-nap-card",
    name: "けいまるくん おひるねかーど",
    image: keimarukunNapCardImage,
    description: "おつきさまと いっしょに すやすやねむる けいまるくん。",
    addedOn: "2026-04-25",
  },
  {
    id: "keimarukun-sweets-card",
    name: "けいまるくん すいーつかーど",
    image: keimarukunSweetsCardImage,
    description: "あまいすいーつに かこまれた けいまるくん。",
    addedOn: "2026-04-25",
  },
  {
    id: "keimarukun-beach-card",
    name: "けいまるくん うみべかーど",
    image: keimarukunBeachCardImage,
    description: "うきわで うみべをたのしむ けいまるくん。",
    addedOn: "2026-04-25",
  },
  {
    id: "keimarukun-picnic-card",
    name: "けいまるくん ぴくにっくかーど",
    image: keimarukunPicnicCardImage,
    description: "おそとで さんどいっちをたべる けいまるくん。",
    addedOn: "2026-04-25",
  },
  {
    id: "keimarukun-dance-card",
    name: "けいまるくん だんすかーど",
    image: keimarukunDanceCardImage,
    description: "おんがくにあわせて たのしくおどる けいまるくん。",
    addedOn: "2026-04-25",
  },
  {
    id: "keimarukun-festival-card",
    name: "けいまるくん おまつりかーど",
    image: keimarukunFestivalCardImage,
    description: "おまつりのよるを たのしむ けいまるくん。",
    addedOn: "2026-04-25",
  },
];

const CARD_ITEM_ID_SET = new Set(KEIMARUKUN_CARDS.map((card) => card.id));

export function getCardById(cardId: string): CardItem | null {
  return KEIMARUKUN_CARDS.find((card) => card.id === cardId) ?? null;
}

export function isCardItemId(itemId: string): boolean {
  return CARD_ITEM_ID_SET.has(itemId);
}
