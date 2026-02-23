import React, { useMemo, useState } from "react";
import { SceneFrame, SorobanSubnav } from "@/features/soroban/components/SceneFrame";
import registerGameTop from "@/assets/register-game-top.png";

type Snack = {
  id: string;
  name: string;
  price: number;
  category: "あまい" | "しょっぱい" | "ドリンク";
};

type CartItem = {
  snack: Snack;
  quantity: number;
};

const TARGET_YEN = 300;

const SNACKS: Snack[] = [
  { id: "umaibo", name: "うまいぼう", price: 15, category: "しょっぱい" },
  { id: "pocky", name: "ぽっきー", price: 168, category: "あまい" },
  { id: "choco", name: "ちょこ", price: 98, category: "あまい" },
  { id: "gum", name: "がむ", price: 48, category: "あまい" },
  { id: "potato", name: "ぽてとちっぷす", price: 158, category: "しょっぱい" },
  { id: "jelly", name: "ぜりー", price: 88, category: "あまい" },
  { id: "juice", name: "じゅーす", price: 128, category: "ドリンク" },
  { id: "cookie", name: "くっきー", price: 118, category: "あまい" },
  { id: "senbei", name: "せんべい", price: 108, category: "しょっぱい" },
];

const SNACK_DRAG_TYPE = "text/snack-id";

function scoreResult(total: number): { rank: string; comment: string } {
  const diff = Math.abs(TARGET_YEN - total);
  const over = total > TARGET_YEN;
  if (diff === 0) return { rank: "S", comment: "ぴったり！ すごい！" };
  if (diff <= 5) return { rank: over ? "B" : "A", comment: over ? "おしい！ ちょっと こえた" : "おしい！ あとすこし" };
  if (diff <= 15) return { rank: over ? "C" : "B", comment: "かなり ちかい！" };
  if (diff <= 30) return { rank: over ? "D" : "C", comment: "つぎは もっと ちかづけよう" };
  return { rank: over ? "E" : "D", comment: over ? "こえすぎちゃった" : "まだ えらべるよ" };
}

function CartList({ cart, onIncrease, onDecrease }: {
  cart: CartItem[];
  onIncrease: (snackId: string) => void;
  onDecrease: (snackId: string) => void;
}) {
  if (cart.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/85 px-4 py-6 text-center text-sm font-semibold text-slate-500">
        ここに おかしを いれてね
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {cart.map(({ snack, quantity }) => (
        <div key={snack.id} className="grid grid-cols-[1fr_auto] gap-2 rounded-xl border border-slate-200 bg-white/90 p-3">
          <div>
            <div className="font-bold text-slate-800">{snack.name}</div>
            <div className="text-xs text-slate-600">{snack.price}えん × {quantity}こ</div>
          </div>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50" onClick={() => onDecrease(snack.id)}>
              －
            </button>
            <span className="min-w-6 text-center text-sm font-bold text-slate-700">{quantity}</span>
            <button className="h-8 w-8 rounded-lg border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50" onClick={() => onIncrease(snack.id)}>
              ＋
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

type Props = {
  onGoRegister: () => void;
  onGoShop: () => void;
  onGoShelf: () => void;
  onGoSnack: () => void;
};

export function SnackBudgetGamePage({ onGoRegister, onGoShop, onGoShelf, onGoSnack }: Props) {
  const [cartMap, setCartMap] = useState<Record<string, number>>({});
  const [checkoutTotal, setCheckoutTotal] = useState<number | null>(null);
  const [draggingSnackId, setDraggingSnackId] = useState<string | null>(null);
  const [basketActive, setBasketActive] = useState(false);

  const cart = useMemo(() => SNACKS
    .filter((snack) => (cartMap[snack.id] ?? 0) > 0)
    .map((snack) => ({ snack, quantity: cartMap[snack.id] ?? 0 })), [cartMap]);

  const addSnack = (snackId: string) => {
    setCartMap((prev) => ({ ...prev, [snackId]: (prev[snackId] ?? 0) + 1 }));
    setCheckoutTotal(null);
  };

  const removeSnack = (snackId: string) => {
    setCartMap((prev) => {
      const current = prev[snackId] ?? 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[snackId];
        return next;
      }
      return { ...prev, [snackId]: current - 1 };
    });
    setCheckoutTotal(null);
  };

  const clearCart = () => {
    setCartMap({});
    setCheckoutTotal(null);
  };

  const doCheckout = () => {
    const total = cart.reduce((sum, item) => sum + item.snack.price * item.quantity, 0);
    setCheckoutTotal(total);
  };

  const checkoutResult = checkoutTotal == null
    ? null
    : {
      ...scoreResult(checkoutTotal),
      diff: Math.abs(TARGET_YEN - checkoutTotal),
      over: checkoutTotal > TARGET_YEN,
    };

  return (
    <SceneFrame
      backgroundImage={registerGameTop}
      fullscreenBackground
      outsideTopLeft={
        <button className="rounded-xl bg-transparent px-4 py-3 text-base font-semibold text-white hover:bg-white/10" onClick={onGoRegister}>
          ← ゲームモードTOP
        </button>
      }
    >
      <div className="grid h-full grid-rows-[1fr_auto] gap-3 p-3 sm:p-4" style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}>
        <div className="grid min-h-0 gap-3 lg:grid-cols-[1.4fr_1fr]">
          <section className="grid min-h-0 grid-rows-[auto_1fr] rounded-2xl border border-white/45 bg-white/35 p-3 shadow-sm backdrop-blur-sm">
            <div className="mb-2 rounded-xl bg-white/80 px-3 py-2 text-sm font-bold text-slate-700">
              たなから おかしを かごへ どらっぐ！
            </div>
            <div className="grid min-h-0 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
              {SNACKS.map((snack) => (
                <article
                  key={snack.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData(SNACK_DRAG_TYPE, snack.id);
                    setDraggingSnackId(snack.id);
                  }}
                  onDragEnd={() => setDraggingSnackId(null)}
                  className={`cursor-grab rounded-xl border p-3 ${draggingSnackId === snack.id ? "border-sky-300 bg-sky-50/90" : "border-slate-200 bg-white/90"}`}
                >
                  <div className="text-sm font-bold text-slate-800">{snack.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{snack.category}</div>
                  <div className="mt-2 inline-flex rounded-lg bg-amber-100 px-2 py-1 text-sm font-black text-amber-800">{snack.price}えん</div>
                  <button
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    onClick={() => addSnack(snack.id)}
                  >
                    かごに いれる
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
              setBasketActive(true);
            }}
            onDragLeave={() => setBasketActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              const snackId = e.dataTransfer.getData(SNACK_DRAG_TYPE) || draggingSnackId;
              if (snackId) addSnack(snackId);
              setBasketActive(false);
              setDraggingSnackId(null);
            }}
            className={`grid min-h-0 grid-rows-[auto_1fr_auto] rounded-2xl border p-3 shadow-sm backdrop-blur-sm ${basketActive ? "border-sky-300 bg-sky-100/65" : "border-white/45 bg-white/35"}`}
          >
            <div className="rounded-xl bg-white/80 px-3 py-2 text-sm font-bold text-slate-700">かご（ごうけいは おかいけいまで ひみつ）</div>
            <div className="mt-2 min-h-0 overflow-y-auto">
              <CartList cart={cart} onIncrease={addSnack} onDecrease={removeSnack} />
            </div>
            <div className="mt-3 grid gap-2">
              <button className="rounded-xl bg-emerald-600 px-4 py-3 text-base font-black text-white hover:bg-emerald-700" onClick={doCheckout}>
                おかいけい
              </button>
              <button className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={clearCart}>
                かごを からにする
              </button>
            </div>
          </section>
        </div>

        <div className="grid gap-2 rounded-2xl border border-white/45 bg-white/50 p-3 text-slate-800 backdrop-blur-sm sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="text-sm font-bold">もくひょう: 300えんに できるだけ ちかづけよう</div>
            {checkoutResult ? (
              <div className="mt-1 text-sm font-semibold">
                ごうけい {checkoutTotal}えん / さがく {checkoutResult.diff}えん {checkoutResult.over ? "（300えんオーバー）" : ""}
                <span className="ml-2 inline-flex rounded-full bg-sky-100 px-2 py-0.5 font-black text-sky-700">らんく {checkoutResult.rank}</span>
                <span className="ml-2">{checkoutResult.comment}</span>
              </div>
            ) : (
              <div className="mt-1 text-sm font-semibold text-slate-600">おかいけいすると けっかが でるよ</div>
            )}
          </div>
          <div className="text-right text-xs text-slate-600">※ プレイちゅうは ごうけいきんがくを ひょうじしません</div>
        </div>

        <div className="absolute inset-x-0 bottom-2">
          <SorobanSubnav
            current="snack"
            onGoRegister={onGoRegister}
            onGoShop={onGoShop}
            onGoShelf={onGoShelf}
            onGoSnack={onGoSnack}
            large
          />
        </div>
      </div>
    </SceneFrame>
  );
}
