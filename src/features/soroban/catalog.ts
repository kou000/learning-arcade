import arkPouchImage from "@/assets/items/pencil-cup.png";
import penguinPlushImage from "@/assets/items/mini-plant.png";
import shibaPlushImage from "@/assets/items/piggy-bank.png";
import starKeychainImage from "@/assets/items/star-lamp.png";
import toyCarImage from "@/assets/items/toy-car.png";

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
    image: shibaPlushImage,
    description: "にこにこ しばいぬの ぬいぐるみ。",
  },
  {
    id: "penguin-plush",
    name: "ぺんぎんぬいぐるみ",
    price: 180,
    image: penguinPlushImage,
    description: "あおい ぺんぎんの ぬいぐるみ。",
  },
  {
    id: "toy-car",
    name: "おもちゃのくるま",
    price: 260,
    image: toyCarImage,
    description: "オレンジいろの かわいい くるま。",
  },
  {
    id: "star-keychain",
    name: "ほしのきーほるだー",
    price: 340,
    image: starKeychainImage,
    description: "しばいぬつきの きらきら ちゃーむ。",
  },
  {
    id: "ark-pouch",
    name: "あーくぽーち",
    price: 420,
    image: arkPouchImage,
    description: "あーくろごいりの おおきめ ぽーち。",
  },
];
