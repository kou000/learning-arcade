import bearChocolate from "@/assets/snack/bear_chocolate.png";
import penguinGummyCandy from "@/assets/snack/penguin_gummy_candy.png";
import potatoChipsAnimalFriends from "@/assets/snack/potato_chips_animal_friends.png";
import raccoonChocoCookies from "@/assets/snack/raccoon_choco_cookies.png";
import sakusakuPotatoButterSoySauce from "@/assets/snack/sakusaku_potato_butter_soy_sauce.png";
import shibaStrawberryCake from "@/assets/snack/shiba_strawberry_cake.png";
import wanwanBiscuitStickChoco from "@/assets/snack/wanwan_biscuit_stick_choco.png";
import wanwanBiscuitStickStrawberry from "@/assets/snack/wanwan_biscuit_stick_strawberry.png";
import wanwanChocoSnack from "@/assets/snack/wanwan_choco_snack.png";

export type SnackSeed = {
  id: string;
  name: string;
  image: string;
  basePrice: number;
};

export const SNACK_SEEDS: SnackSeed[] = [
  {
    id: "potato_chips",
    name: "ぽてとちっぷす",
    basePrice: 160,
    image: potatoChipsAnimalFriends,
  },
  {
    id: "cookies",
    name: "ちょここっきー",
    basePrice: 120,
    image: raccoonChocoCookies,
  },
  {
    id: "gummy",
    name: "ぐみきゃんでぃ",
    basePrice: 100,
    image: penguinGummyCandy,
  },
  {
    id: "strawberry_cake",
    name: "いちごけーき",
    basePrice: 170,
    image: shibaStrawberryCake,
  },
  {
    id: "bear_chocolate",
    name: "くまちょこ",
    basePrice: 110,
    image: bearChocolate,
  },
  {
    id: "sakusaku_potato",
    name: "さくさくぽてと",
    basePrice: 130,
    image: sakusakuPotatoButterSoySauce,
  },
  {
    id: "wanwan_choco_snack",
    name: "わんわんちょこ",
    basePrice: 140,
    image: wanwanChocoSnack,
  },
  {
    id: "wanwan_biscuit_stick_choco",
    name: "わんわんびすけっと ちょこ",
    basePrice: 150,
    image: wanwanBiscuitStickChoco,
  },
  {
    id: "wanwan_biscuit_stick_strawberry",
    name: "わんわんびすけっと いちご",
    basePrice: 150,
    image: wanwanBiscuitStickStrawberry,
  },
];
