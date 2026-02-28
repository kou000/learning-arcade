import arkPouchImage from "@/assets/items/pencil-cup.png";
import arkBagImage from "@/assets/items/ark-bag.png";
import arkCupImage from "@/assets/items/ark-cup.png";
import arkPorchImage from "@/assets/items/ark-porch.png";
import bearPlushScarfImage from "@/assets/items/bear-plush-scarf.png";
import hamsterPlushStripedShirtImage from "@/assets/items/hamster-plush-striped-shirt.png";
import penguinPlushImage from "@/assets/items/mini-plant.png";
import rabbitPlushWaveImage from "@/assets/items/rabbit-plush-wave.png";
import redPandaPlushWaveImage from "@/assets/items/red-panda-plush-wave.png";
import sheepPlushBlueRibbonImage from "@/assets/items/sheep-plush-blue-ribbon.png";
import shelfUnlockImage from "@/assets/items/shelf.png";
import shibaKeyholderImage from "@/assets/items/shiba-keyholder.png";
import shibaPlushWaveImage from "@/assets/items/shiba-plush-wave.png";
import shibaPlushImage from "@/assets/items/piggy-bank.png";
import chuchupiBagImage from "@/assets/items/chuchupi-bag.png";
import chuchupiKeyholderImage from "@/assets/items/chuchupi-keyholder.png";
import friendsGardenDioramaImage from "@/assets/items/friends-garden-diorama.png";
import festivalStallDioramaImage from "@/assets/items/festival-stall-diorama.png";
import jellyfishUnderwaterDioramaImage from "@/assets/items/jellyfish-underwater-diorama.png";
import keimarukunKeyholderImage from "@/assets/items/keimarukun-keyholder.png";
import keimarukunPlushImage from "@/assets/items/keimarukun-plush.png";
import moonlightForestDioramaImage from "@/assets/items/moonlight-forest-diorama.png";
import spaceAdventureDioramaImage from "@/assets/items/space-adventure-diorama.png";
import starKeychainImage from "@/assets/items/star-lamp.png";
import studyClassroomDioramaImage from "@/assets/items/study-classroom-diorama.png";
import toyCarImage from "@/assets/items/toy-car.png";

export type ShopItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  placeable?: boolean;
  addedOn?: string;
};

export const SHOP_ITEMS: ShopItem[] = [
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
  {
    id: "ark-bag",
    name: "あーくばっぐ",
    price: 280,
    image: arkBagImage,
    description: "あーくろごいりの かるい ばっぐ。",
  },
  {
    id: "ark-cup",
    name: "あーくかっぷ",
    price: 320,
    image: arkCupImage,
    description: "あーくろごいりの まぐかっぷ。",
  },
  {
    id: "ark-porch",
    name: "あーくぽーち みに",
    price: 360,
    image: arkPorchImage,
    description: "こものが はいる みにぽーち。",
  },
  {
    id: "red-panda-plush-wave",
    name: "あらいぐまぬいぐるみ",
    price: 220,
    image: redPandaPlushWaveImage,
    description: "きいろのふくで てをふる ぬいぐるみ。",
  },
  {
    id: "hamster-plush-striped-shirt",
    name: "はむすたーぬいぐるみ",
    price: 240,
    image: hamsterPlushStripedShirtImage,
    description: "しましまふくが かわいい ぬいぐるみ。",
  },
  {
    id: "rabbit-plush-wave",
    name: "うさぎぬいぐるみ",
    price: 260,
    image: rabbitPlushWaveImage,
    description: "みどりのえぷろんで てをふる うさぎ。",
  },
  {
    id: "shiba-plush-wave",
    name: "しばいぬぬいぐるみ あかふく",
    price: 280,
    image: shibaPlushWaveImage,
    description: "あかいふくで げんきな しばいぬ。",
  },
  {
    id: "sheep-plush-blue-ribbon",
    name: "ひつじぬいぐるみ",
    price: 300,
    image: sheepPlushBlueRibbonImage,
    description: "あおいりぼんの もこもこ ひつじ。",
  },
  {
    id: "bear-plush-scarf",
    name: "くまぬいぐるみ",
    price: 320,
    image: bearPlushScarfImage,
    description: "みずいろまふらーの やさしい くま。",
  },
  {
    id: "space-adventure-diorama",
    name: "うちゅうだいぼうけんぼーど",
    price: 360,
    image: spaceAdventureDioramaImage,
    description: "うちゅうをたびする きらきらぼーど。",
    addedOn: "2026-02-28",
  },
  {
    id: "jellyfish-underwater-diorama",
    name: "くらげうみぼーど",
    price: 380,
    image: jellyfishUnderwaterDioramaImage,
    description: "くらげとともだちの うみのぼーど。",
    addedOn: "2026-02-28",
  },
  {
    id: "festival-stall-diorama",
    name: "なつまつりやたいぼーど",
    price: 400,
    image: festivalStallDioramaImage,
    description: "やたいときんぎょすくいの にぎやかぼーど。",
    addedOn: "2026-02-28",
  },
  {
    id: "moonlight-forest-diorama",
    name: "つきよのもりぼーど",
    price: 420,
    image: moonlightForestDioramaImage,
    description: "つきあかりでほしがひかる しずかなもり。",
    addedOn: "2026-02-28",
  },
  {
    id: "study-classroom-diorama",
    name: "できたきょうしつぼーど",
    price: 440,
    image: studyClassroomDioramaImage,
    description: "べんきょうをがんばる きょうしつぼーど。",
    addedOn: "2026-02-28",
  },
  {
    id: "friends-garden-diorama",
    name: "ともだちがーでんぼーど",
    price: 460,
    image: friendsGardenDioramaImage,
    description: "にじのしたであそぶ たのしいぼーど。",
    addedOn: "2026-02-28",
  },
  {
    id: "chuchupi-bag",
    name: "ちゅちゅぴばっぐ",
    price: 260,
    image: chuchupiBagImage,
    description: "ちゅちゅぴがえがかれた つかいやすい ばっぐ。",
    addedOn: "2026-02-28",
  },
  {
    id: "chuchupi-keyholder",
    name: "ちゅちゅぴきーほるだー",
    price: 190,
    image: chuchupiKeyholderImage,
    description: "ちゅちゅぴの かわいい きーほるだー。",
    addedOn: "2026-02-28",
  },
  {
    id: "shiba-keyholder",
    name: "しばきーほるだー",
    price: 210,
    image: shibaKeyholderImage,
    description: "しばいぬの きらりとひかる きーほるだー。",
    addedOn: "2026-02-28",
  },
  {
    id: "keimarukun-keyholder",
    name: "けいまるくんきーほるだー",
    price: 210,
    image: keimarukunKeyholderImage,
    description: "けいまるくんの かわいい きーほるだー。",
    addedOn: "2026-02-28",
  },
  {
    id: "keimarukun-plush",
    name: "けいまるくんぬいぐるみ",
    price: 320,
    image: keimarukunPlushImage,
    description: "けいまるくんの ふわふわ ぬいぐるみ。",
    addedOn: "2026-02-28",
  },
  {
    id: "shelf-upper-unlock",
    name: "たな１だんめかいほう",
    price: 399,
    image: shelfUnlockImage,
    description: "たなの １だんめを つかえるようにする。",
    placeable: false,
  },
  {
    id: "shelf-lower-unlock",
    name: "たな３だんめかいほう",
    price: 999,
    image: shelfUnlockImage,
    description: "たなの ３だんめを つかえるようにする。",
    placeable: false,
  },
];
