import keimarukunBeachCardImage from "@/assets/cards/keimarukun-beach-card.png";
import keimarukunAnimatedRamenCardImage from "@/assets/cards/keimarukun-animated-ramen-card.gif";
import keimarukunAnimatedSteakCardImage from "@/assets/cards/keimarukun-animated-steak-card.gif";
import keimarukunAnimatedStudyCardImage from "@/assets/cards/keimarukun-animated-study-card.gif";
import keimarukunAnimatedWorkingCardImage from "@/assets/cards/keimarukun-animated-working-card.gif";
import keimarukunBananaCardImage from "@/assets/cards/keimarukun-banana-card.png";
import keimarukunBathCardImage from "@/assets/cards/keimarukun-bath-card.png";
import keimarukunBreakfastCardImage from "@/assets/cards/keimarukun-breakfast-card.png";
import keimarukunCarCardImage from "@/assets/cards/keimarukun-car-card.png";
import keimarukunCurryCardImage from "@/assets/cards/keimarukun-curry-card.png";
import keimarukunDanceCardImage from "@/assets/cards/keimarukun-dance-card.png";
import keimarukunFestivalCardImage from "@/assets/cards/keimarukun-festival-card.png";
import keimarukunGameCardImage from "@/assets/cards/keimarukun-game-card.png";
import keimarukunMagicCardImage from "@/assets/cards/keimarukun-magic-card.png";
import keimarukunNapCardImage from "@/assets/cards/keimarukun-nap-card.png";
import keimarukunOmuriceCardImage from "@/assets/cards/keimarukun-omurice-card.png";
import keimarukunPandaCardImage from "@/assets/cards/keimarukun-panda-card.png";
import keimarukunPicnicCardImage from "@/assets/cards/keimarukun-picnic-card.png";
import keimarukunRamenCardImage from "@/assets/cards/keimarukun-ramen-card.png";
import keimarukunRockGuitarCardImage from "@/assets/cards/keimarukun-rock-guitar-card.png";
import keimarukunRollerCoasterCardImage from "@/assets/cards/keimarukun-roller-coaster-card.png";
import keimarukunSchoolCardImage from "@/assets/cards/keimarukun-school-card.png";
import keimarukunSpaceCardImage from "@/assets/cards/keimarukun-space-card.png";
import keimarukunSteakCardImage from "@/assets/cards/keimarukun-steak-card.png";
import keimarukunStudyCardImage from "@/assets/cards/keimarukun-study-card.png";
import keimarukunSweetsCardImage from "@/assets/cards/keimarukun-sweets-card.png";
import keimarukunSushiCardImage from "@/assets/cards/keimarukun-sushi-card.png";
import keimarukunWinterCardImage from "@/assets/cards/keimarukun-winter-card.png";
import keimarukunWorkCardImage from "@/assets/cards/keimarukun-work-card.png";

export type CardItem = {
  id: string;
  name: string;
  image: string;
  description: string;
  addedOn: string;
  gachaId: CardGachaId;
};

export type CardGachaId =
  | "classic"
  | "dream"
  | "outing"
  | "food"
  | "life"
  | "moving";

export type CardGachaDefinition = {
  id: CardGachaId;
  name: string;
  shortName: string;
  description: string;
};

export const CARD_GACHA_DEFINITIONS: CardGachaDefinition[] = [
  {
    id: "classic",
    name: "けいまる ベーシック",
    shortName: "ベーシック",
    description: "いつもの けいまるくんが あつまった がちゃ。",
  },
  {
    id: "dream",
    name: "ゆめいろ コレクション",
    shortName: "ゆめいろ",
    description: "まほうや うちゅうの きらきら がちゃ。",
  },
  {
    id: "outing",
    name: "おでかけ コレクション",
    shortName: "おでかけ",
    description: "うみや おまつりに おでかけする がちゃ。",
  },
  {
    id: "food",
    name: "たべもの コレクション",
    shortName: "たべもの",
    description: "おいしい たべものが あつまった がちゃ。",
  },
  {
    id: "life",
    name: "わくわく ライフ",
    shortName: "ライフ",
    description: "まいにちの がんばりと あそびが あつまった がちゃ。",
  },
  {
    id: "moving",
    name: "うごくカード",
    shortName: "うごく",
    description: "うごく けいまるくんカードが あつまった がちゃ。",
  },
];

export const KEIMARUKUN_CARDS: CardItem[] = [
  {
    id: "keimarukun-rock-guitar-card",
    name: "けいまるくん ろっくぎたーかーど",
    image: keimarukunRockGuitarCardImage,
    description: "ぎたーをもった けいまるくんの かっこいい かーど。",
    addedOn: "2026-04-24",
    gachaId: "classic",
  },
  {
    id: "keimarukun-magic-card",
    name: "けいまるくん まほうつかいかーど",
    image: keimarukunMagicCardImage,
    description: "ほしのまほうをつかう けいまるくんの きらきらかーど。",
    addedOn: "2026-04-24",
    gachaId: "dream",
  },
  {
    id: "keimarukun-panda-card",
    name: "けいまるくん ぱんだかーど",
    image: keimarukunPandaCardImage,
    description: "ぱんだのふくをきた けいまるくんの ふわふわかーど。",
    addedOn: "2026-04-24",
    gachaId: "classic",
  },
  {
    id: "keimarukun-breakfast-card",
    name: "けいまるくん あさごはんかーど",
    image: keimarukunBreakfastCardImage,
    description: "とーすとになった けいまるくんの ほかほかかーど。",
    addedOn: "2026-04-24",
    gachaId: "classic",
  },
  {
    id: "keimarukun-winter-card",
    name: "けいまるくん ふゆかーど",
    image: keimarukunWinterCardImage,
    description: "ゆきのひの けいまるくんの ぬくぬくかーど。",
    addedOn: "2026-04-24",
    gachaId: "classic",
  },
  {
    id: "keimarukun-ramen-card",
    name: "けいまるくん らーめんかーど",
    image: keimarukunRamenCardImage,
    description: "らーめんをたべる けいまるくんの あつあつかーど。",
    addedOn: "2026-04-24",
    gachaId: "classic",
  },
  {
    id: "keimarukun-space-card",
    name: "けいまるくん うちゅうかーど",
    image: keimarukunSpaceCardImage,
    description: "うちゅうふくで ほしをたんけんする けいまるくん。",
    addedOn: "2026-04-25",
    gachaId: "dream",
  },
  {
    id: "keimarukun-nap-card",
    name: "けいまるくん おひるねかーど",
    image: keimarukunNapCardImage,
    description: "おつきさまと いっしょに すやすやねむる けいまるくん。",
    addedOn: "2026-04-25",
    gachaId: "dream",
  },
  {
    id: "keimarukun-sweets-card",
    name: "けいまるくん すいーつかーど",
    image: keimarukunSweetsCardImage,
    description: "あまいすいーつに かこまれた けいまるくん。",
    addedOn: "2026-04-25",
    gachaId: "outing",
  },
  {
    id: "keimarukun-beach-card",
    name: "けいまるくん うみべかーど",
    image: keimarukunBeachCardImage,
    description: "うきわで うみべをたのしむ けいまるくん。",
    addedOn: "2026-04-25",
    gachaId: "outing",
  },
  {
    id: "keimarukun-picnic-card",
    name: "けいまるくん ぴくにっくかーど",
    image: keimarukunPicnicCardImage,
    description: "おそとで さんどいっちをたべる けいまるくん。",
    addedOn: "2026-04-25",
    gachaId: "outing",
  },
  {
    id: "keimarukun-dance-card",
    name: "けいまるくん だんすかーど",
    image: keimarukunDanceCardImage,
    description: "おんがくにあわせて たのしくおどる けいまるくん。",
    addedOn: "2026-04-25",
    gachaId: "dream",
  },
  {
    id: "keimarukun-festival-card",
    name: "けいまるくん おまつりかーど",
    image: keimarukunFestivalCardImage,
    description: "おまつりのよるを たのしむ けいまるくん。",
    addedOn: "2026-04-25",
    gachaId: "outing",
  },
  {
    id: "keimarukun-sushi-card",
    name: "けいまるくん すしかーど",
    image: keimarukunSushiCardImage,
    description: "おすしやさんで まぐろすしになった けいまるくん。",
    addedOn: "2026-04-27",
    gachaId: "food",
  },
  {
    id: "keimarukun-curry-card",
    name: "けいまるくん かれーかーど",
    image: keimarukunCurryCardImage,
    description: "すぱいすかおる かれーを たべる けいまるくん。",
    addedOn: "2026-04-27",
    gachaId: "food",
  },
  {
    id: "keimarukun-steak-card",
    name: "けいまるくん にくかーど",
    image: keimarukunSteakCardImage,
    description: "あつあつの おにくに ちょっとこまった けいまるくん。",
    addedOn: "2026-04-27",
    gachaId: "food",
  },
  {
    id: "keimarukun-omurice-card",
    name: "けいまるくん おむらいすかーど",
    image: keimarukunOmuriceCardImage,
    description: "ふわふわ おむらいすにつつまれた けいまるくん。",
    addedOn: "2026-04-27",
    gachaId: "food",
  },
  {
    id: "keimarukun-banana-card",
    name: "けいまるくん ばななかーど",
    image: keimarukunBananaCardImage,
    description: "ばななぱふぇと いっしょの あまい けいまるくん。",
    addedOn: "2026-04-27",
    gachaId: "food",
  },
  {
    id: "keimarukun-car-card",
    name: "けいまるくん くるまかーど",
    image: keimarukunCarCardImage,
    description: "くるまで おでかけする けいまるくんの きらきらかーど。",
    addedOn: "2026-04-30",
    gachaId: "dream",
  },
  {
    id: "keimarukun-school-card",
    name: "けいまるくん とうこうかーど",
    image: keimarukunSchoolCardImage,
    description: "らんどせるで がっこうへむかう けいまるくん。",
    addedOn: "2026-04-30",
    gachaId: "outing",
  },
  {
    id: "keimarukun-work-card",
    name: "けいまるくん しごとかーど",
    image: keimarukunWorkCardImage,
    description: "ぱそこんで しごとを がんばる けいまるくん。",
    addedOn: "2026-05-04",
    gachaId: "life",
  },
  {
    id: "keimarukun-roller-coaster-card",
    name: "けいまるくん じぇっとこーすたーかーど",
    image: keimarukunRollerCoasterCardImage,
    description: "かぜをきって じぇっとこーすたーにのる けいまるくん。",
    addedOn: "2026-05-04",
    gachaId: "life",
  },
  {
    id: "keimarukun-game-card",
    name: "けいまるくん げーむかーど",
    image: keimarukunGameCardImage,
    description: "げーむにむちゅうな けいまるくんの ぴかぴかかーど。",
    addedOn: "2026-05-04",
    gachaId: "life",
  },
  {
    id: "keimarukun-bath-card",
    name: "けいまるくん おふろかーど",
    image: keimarukunBathCardImage,
    description: "あわいっぱいの おふろで あたたまる けいまるくん。",
    addedOn: "2026-05-04",
    gachaId: "life",
  },
  {
    id: "keimarukun-study-card",
    name: "けいまるくん べんきょうかーど",
    image: keimarukunStudyCardImage,
    description: "ほんをひらいて べんきょうする けいまるくん。",
    addedOn: "2026-05-04",
    gachaId: "life",
  },
  {
    id: "keimarukun-animated-steak-card",
    name: "けいまるくん うごく にくかーど",
    image: keimarukunAnimatedSteakCardImage,
    description: "あつあつステーキに ちょっとこまる うごくけいまるくん。",
    addedOn: "2026-05-08",
    gachaId: "moving",
  },
  {
    id: "keimarukun-animated-ramen-card",
    name: "けいまるくん うごく らーめんかーど",
    image: keimarukunAnimatedRamenCardImage,
    description: "らーめんをじっくりあじわう うごくけいまるくん。",
    addedOn: "2026-05-08",
    gachaId: "moving",
  },
  {
    id: "keimarukun-animated-study-card",
    name: "けいまるくん うごく べんきょうかーど",
    image: keimarukunAnimatedStudyCardImage,
    description: "つくえにむかって べんきょうする うごくけいまるくん。",
    addedOn: "2026-05-08",
    gachaId: "moving",
  },
  {
    id: "keimarukun-animated-working-card",
    name: "けいまるくん うごく しごとかーど",
    image: keimarukunAnimatedWorkingCardImage,
    description: "ぱそこんでしごとをしながら こーひーのにがさにびっくりする うごくけいまるくん。",
    addedOn: "2026-05-09",
    gachaId: "moving",
  },
];

const CARD_ITEM_ID_SET = new Set(KEIMARUKUN_CARDS.map((card) => card.id));

export function getCardById(cardId: string): CardItem | null {
  return KEIMARUKUN_CARDS.find((card) => card.id === cardId) ?? null;
}

export function isCardItemId(itemId: string): boolean {
  return CARD_ITEM_ID_SET.has(itemId);
}

export function getCardsByGachaId(gachaId: CardGachaId): CardItem[] {
  return KEIMARUKUN_CARDS.filter((card) => card.gachaId === gachaId);
}

export function getCardGachaDefinition(
  gachaId: CardGachaId,
): CardGachaDefinition {
  return (
    CARD_GACHA_DEFINITIONS.find((gacha) => gacha.id === gachaId) ??
    CARD_GACHA_DEFINITIONS[0]
  );
}
