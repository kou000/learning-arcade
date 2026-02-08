export type ShopItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "shiba-plush",
    name: "しばいぬぬいぐるみ",
    price: 120,
    image: "/assets/items/piggy-bank.png",
    description: "にこにこ しばいぬの ぬいぐるみ。",
  },
  {
    id: "penguin-plush",
    name: "ぺんぎんぬいぐるみ",
    price: 180,
    image: "/assets/items/mini-plant.png",
    description: "あおい ぺんぎんの ぬいぐるみ。",
  },
  {
    id: "toy-car",
    name: "おもちゃのくるま",
    price: 260,
    image: "/assets/items/toy-car.png",
    description: "オレンジいろの かわいい くるま。",
  },
  {
    id: "star-keychain",
    name: "ほしのきーほるだー",
    price: 340,
    image: "/assets/items/star-lamp.png",
    description: "しばいぬつきの きらきら ちゃーむ。",
  },
  {
    id: "ark-pouch",
    name: "ARKぽーち",
    price: 420,
    image: "/assets/items/pencil-cup.png",
    description: "ARKろごいりの おおきめ ぽーち。",
  },
];
