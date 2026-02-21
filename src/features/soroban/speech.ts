type SpeechPool = {
  normal: string[];
  rare?: string[];
};

const RARE_RATE = 0.2;
const lastSpeechByKey = new Map<string, string>();

const SHOP_ENTER_SPEECH: SpeechPool = {
  normal: [
    "いらっしゃいませ！",
    "ゆっくり みていってね！",
    "いいグッズ そろってるよ！",
  ],
  rare: [
    "しばてんちょう、きょうも えいぎょうちゅう！",
    "きょうの おきにいりを みつけてね！",
  ],
};

const SHOP_PURCHASE_RETURN_SPEECH: SpeechPool = {
  normal: [
    "おかいあげありがとうございます！",
    "きにいって もらえて うれしい！",
    "だいじに つかってね！",
  ],
  rare: [
    "また すてきな グッズを そろえて おくね！",
    "しばてん、こころをこめて おみおくり！",
  ],
};

const SHOP_LEAVE_TOP_SPEECH: SpeechPool = {
  normal: [
    "ありがとうございました！",
    "またの ごらいてんを おまちしてます！",
    "また きてね！",
  ],
  rare: [
    "つぎも いい おかいものに なるといいな！",
  ],
};

const PURCHASE_COMMON_SPEECH: SpeechPool = {
  normal: [
    "いい おかいものだね！",
    "そのグッズ、にあいそう！",
  ],
  rare: [
    "えらぶ せんす、ばつぐん！",
  ],
};

const PURCHASE_BY_ITEM_ID: Record<string, SpeechPool> = {
  "shiba-plush": {
    normal: ["しばともだち、なかまいり！"],
    rare: ["しばどうしで なかよく してね！"],
  },
  "penguin-plush": {
    normal: ["ぺんぎんさん、すずしげで いいね！"],
    rare: ["ひんやりムードで いやされるね！"],
  },
  "toy-car": {
    normal: ["ぶーん！ たのしく はしりそう！"],
    rare: ["スピードかん まんてんだね！"],
  },
  "star-keychain": {
    normal: ["きらきらで かわいい！"],
    rare: ["ほしが ぴかっと ひかってるね！"],
  },
  "ark-pouch": {
    normal: ["たっぷり はいる ぽーちだね！"],
    rare: ["おでかけじゅんびが はかどるね！"],
  },
  "ark-bag": {
    normal: ["おでかけしたくなる ばっぐ！"],
    rare: ["もちあるくのが たのしみだね！"],
  },
  "ark-cup": {
    normal: ["ほっとひといきに ぴったり！"],
    rare: ["しばてんも いっしょに おちゃしたい！"],
  },
  "ark-porch": {
    normal: ["こもの せいりが はかどるね！"],
    rare: ["みにさいずで つかいやすそう！"],
  },
  "red-panda-plush-wave": {
    normal: ["あらいぐまさん、てをふってる！"],
    rare: ["にこにこ ぽーずで げんきがでるね！"],
  },
  "hamster-plush-striped-shirt": {
    normal: ["はむすたーさん、しましまが おしゃれ！"],
    rare: ["まるいおててが とっても かわいい！"],
  },
  "rabbit-plush-wave": {
    normal: ["うさぎさんが こんにちはって してるね！"],
    rare: ["みどりのえぷろん、すてきだね！"],
  },
  "shiba-plush-wave": {
    normal: ["あかいふくの しばさん、げんきいっぱい！"],
    rare: ["しばてんの なかまが ふえたね！"],
  },
  "sheep-plush-blue-ribbon": {
    normal: ["もこもこ ひつじさん、いやされるね！"],
    rare: ["あおいりぼんが ちゃーむぽいんと！"],
  },
  "bear-plush-scarf": {
    normal: ["くまさんの まふらー、あったかそう！"],
    rare: ["やさしいえがおで ほっとするね！"],
  },
  "shelf-upper-unlock": {
    normal: ["これで うえのだんも つかえるね！"],
    rare: ["かざる ばしょが ふえて たのしいね！"],
  },
  "shelf-lower-unlock": {
    normal: ["したのだんも かざれるように なったよ！"],
    rare: ["たなが さらに にぎやかに なるね！"],
  },
};

function chooseFromPool(key: string, pool: SpeechPool): string {
  const useRare =
    Array.isArray(pool.rare) &&
    pool.rare.length > 0 &&
    Math.random() < RARE_RATE;
  const source = useRare ? (pool.rare ?? pool.normal) : pool.normal;
  if (source.length === 0) return "";

  let picked = source[Math.floor(Math.random() * source.length)];
  const last = lastSpeechByKey.get(key);
  if (source.length > 1 && picked === last) {
    const candidates = source.filter((speech) => speech !== last);
    picked = candidates[Math.floor(Math.random() * candidates.length)] ?? picked;
  }
  lastSpeechByKey.set(key, picked);
  return picked;
}

export function pickShopSpeech(
  event: "enter" | "purchase-return" | "leave-top",
): string {
  if (event === "enter") {
    return chooseFromPool("shop-enter", SHOP_ENTER_SPEECH);
  }
  if (event === "purchase-return") {
    return chooseFromPool("shop-purchase-return", SHOP_PURCHASE_RETURN_SPEECH);
  }
  return chooseFromPool("shop-leave-top", SHOP_LEAVE_TOP_SPEECH);
}

export function pickPurchaseSpeechByItemId(itemId: string): string {
  const specific = PURCHASE_BY_ITEM_ID[itemId];
  if (specific) return chooseFromPool(`purchase-${itemId}`, specific);
  return chooseFromPool("purchase-common", PURCHASE_COMMON_SPEECH);
}
