import bearChocolate from "@/assets/snack/bear_chocolate.png";
import chorollCookieCream from "@/assets/snack/choroll_cookie_cream.png";
import chorollMilkChoco from "@/assets/snack/choroll_milk_choco.png";
import chorollStrawberryMilk from "@/assets/snack/choroll_strawberry_milk.png";
import colorfulRamune from "@/assets/snack/colorful_ramune.png";
import fuwatoroChocoPie from "@/assets/snack/fuwatoro_choco_pie.png";
import kansaiDashiSoyPotato from "@/assets/snack/kansai_dashi_soy_potato.png";
import kinokokoMushroomChoco from "@/assets/snack/kinokoko_mushroom_choco.png";
import kirinCrackerCheese from "@/assets/snack/kirin_cracker_cheese.png";
import nicoChewGrape from "@/assets/snack/nico_chew_grape.png";
import nicoChewMelon from "@/assets/snack/nico_chew_melon.png";
import nicoChewPineapple from "@/assets/snack/nico_chew_pineapple.png";
import nicoChewStrawberry from "@/assets/snack/nico_chew_strawberry.png";
import pakuPakuPandaBiscuit from "@/assets/snack/paku_paku_panda_biscuit.png";
import penguinGummyCandy from "@/assets/snack/penguin_gummy_candy.png";
import potatoChipsAnimalFriends from "@/assets/snack/potato_chips_animal_friends.png";
import pureGummyLemon from "@/assets/snack/pure_gummy_lemon.png";
import raccoonChocoCookies from "@/assets/snack/raccoon_choco_cookies.png";
import sakusakuPocojiroLemonChoco from "@/assets/snack/sakusaku_pocojiro_lemon_choco.png";
import sakusakuPotatoButterSoySauce from "@/assets/snack/sakusaku_potato_butter_soy_sauce.png";
import shibaStrawberryCake from "@/assets/snack/shiba_strawberry_cake.png";
import sourCreamPotatoTube from "@/assets/snack/sour_cream_potato_tube.png";
import umatottoSeaSnack from "@/assets/snack/umatotto_sea_snack.png";
import umePotatoChips from "@/assets/snack/ume_potato_chips.png";
import wanwanBiscuitStickChoco from "@/assets/snack/wanwan_biscuit_stick_choco.png";
import wanwanBiscuitStickStrawberry from "@/assets/snack/wanwan_biscuit_stick_strawberry.png";
import wanwanChocoSnack from "@/assets/snack/wanwan_choco_snack.png";

export type SnackSeed = {
  id: string;
  name: string;
  image: string;
  basePrice: number;
};

export type SnackPlaceableItem = {
  id: string;
  name: string;
  image: string;
  description: string;
  placeable: true;
};

export const SNACK_SEEDS: SnackSeed[] = [
  {
    id: "potato_chips",
    name: "ポテトチップス",
    basePrice: 110,
    image: potatoChipsAnimalFriends,
  },
  {
    id: "cookies",
    name: "チョコクッキー",
    basePrice: 40,
    image: raccoonChocoCookies,
  },
  {
    id: "gummy",
    name: "グミキャンディ",
    basePrice: 40,
    image: penguinGummyCandy,
  },
  {
    id: "strawberry_cake",
    name: "イチゴケーキ",
    basePrice: 80,
    image: shibaStrawberryCake,
  },
  {
    id: "bear_chocolate",
    name: "クマチョコ",
    basePrice: 50,
    image: bearChocolate,
  },
  {
    id: "sakusaku_potato",
    name: "サクサクポテト",
    basePrice: 60,
    image: sakusakuPotatoButterSoySauce,
  },
  {
    id: "wanwan_choco_snack",
    name: "ワンワンチョコ",
    basePrice: 40,
    image: wanwanChocoSnack,
  },
  {
    id: "wanwan_biscuit_stick_choco",
    name: "ワンワンビスケット チョコ",
    basePrice: 50,
    image: wanwanBiscuitStickChoco,
  },
  {
    id: "wanwan_biscuit_stick_strawberry",
    name: "ワンワンビスケット イチゴ",
    basePrice: 50,
    image: wanwanBiscuitStickStrawberry,
  },
  {
    id: "ume_potato_chips",
    name: "ウメポテトチップス",
    basePrice: 100,
    image: umePotatoChips,
  },
  {
    id: "sour_cream_potato_tube",
    name: "サワークリームポテト",
    basePrice: 150,
    image: sourCreamPotatoTube,
  },
  {
    id: "kinokoko_mushroom_choco",
    name: "キノココクマチョコ",
    basePrice: 60,
    image: kinokokoMushroomChoco,
  },
  {
    id: "colorful_ramune",
    name: "カラフルラムネ",
    basePrice: 70,
    image: colorfulRamune,
  },
  {
    id: "kansai_dashi_soy_potato",
    name: "関西だしポコしょうゆポテチ",
    basePrice: 130,
    image: kansaiDashiSoyPotato,
  },
  {
    id: "umatotto_sea_snack",
    name: "うぉとっと",
    basePrice: 60,
    image: umatottoSeaSnack,
  },
  {
    id: "pure_gummy_lemon",
    name: "ピュルグミ レモン",
    basePrice: 60,
    image: pureGummyLemon,
  },
  {
    id: "nico_chew_grape",
    name: "ニコチュウ ブドウ",
    basePrice: 80,
    image: nicoChewGrape,
  },
  {
    id: "nico_chew_strawberry",
    name: "ニコチュウ イチゴ",
    basePrice: 80,
    image: nicoChewStrawberry,
  },
  {
    id: "nico_chew_melon",
    name: "ニコチュウ メロン",
    basePrice: 80,
    image: nicoChewMelon,
  },
  {
    id: "nico_chew_pineapple",
    name: "ニコチュウ パイン",
    basePrice: 80,
    image: nicoChewPineapple,
  },
  {
    id: "fuwatoro_choco_pie",
    name: "ふわとろチョコパイ",
    basePrice: 90,
    image: fuwatoroChocoPie,
  },
  {
    id: "sakusaku_pocojiro_lemon_choco",
    name: "さくさくポコじろう",
    basePrice: 90,
    image: sakusakuPocojiroLemonChoco,
  },
  {
    id: "kirin_cracker_cheese",
    name: "キリンキー チーズ",
    basePrice: 100,
    image: kirinCrackerCheese,
  },
  {
    id: "paku_paku_panda_biscuit",
    name: "ぱくぱくパンダ",
    basePrice: 140,
    image: pakuPakuPandaBiscuit,
  },
  {
    id: "choroll_strawberry_milk",
    name: "チョロルチョコ イチゴ",
    basePrice: 20,
    image: chorollStrawberryMilk,
  },
  {
    id: "choroll_milk_choco",
    name: "チョロルチョコ ミルク",
    basePrice: 20,
    image: chorollMilkChoco,
  },
  {
    id: "choroll_cookie_cream",
    name: "チョロルチョコ クッキー",
    basePrice: 20,
    image: chorollCookieCream,
  },
];

export const SNACK_PLACEABLE_ITEMS: SnackPlaceableItem[] = SNACK_SEEDS.map(
  (seed) => ({
    id: seed.id,
    name: seed.name,
    image: seed.image,
    description: "300えんおやつゲームで てにいれた おかし。",
    placeable: true,
  }),
);
