export type ShopItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  placeable?: boolean;
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "shelf-upper-unlock",
    name: "たな１だんめかいほう",
    price: 300,
    image: "",
    description: "たなの １だんめを つかえるようにする。",
    placeable: false,
  },
  {
    id: "shelf-lower-unlock",
    name: "たな３だんめかいほう",
    price: 300,
    image: "",
    description: "たなの ３だんめを つかえるようにする。",
    placeable: false,
  },
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
    name: "あーくぽーち",
    price: 420,
    image: "/assets/items/pencil-cup.png",
    description: "あーくろごいりの おおきめ ぽーち。",
  },
];
