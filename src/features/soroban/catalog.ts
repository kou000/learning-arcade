export type ShopItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "pencil-cup",
    name: "えんぴつたて",
    price: 120,
    image: "/assets/items/pencil-cup.png",
    description: "つくえがちょっと べんりになる。",
  },
  {
    id: "mini-plant",
    name: "ミニしょくぶつ",
    price: 180,
    image: "/assets/items/mini-plant.png",
    description: "みどりで きもちが おちつく。",
  },
  {
    id: "rocket-toy",
    name: "ロケットおもちゃ",
    price: 260,
    image: "/assets/items/rocket-toy.png",
    description: "がんばったごほうびに ぴったり。",
  },
  {
    id: "piggy-bank",
    name: "ぶたのちょきんばこ",
    price: 340,
    image: "/assets/items/piggy-bank.png",
    description: "レジゲームの おとも。",
  },
  {
    id: "star-lamp",
    name: "ほしランプ",
    price: 420,
    image: "/assets/items/star-lamp.png",
    description: "やさしい ひかりが きれい。",
  },
];
