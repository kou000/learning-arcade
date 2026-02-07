import React, { useMemo, useState } from "react";
import { SceneFrame, SorobanModeNav, SorobanSubnav } from "./SceneFrame";
import { SHOP_ITEMS } from "./catalog";
import {
  loadRegisterProgress,
  savePracticeConfig,
  saveRegisterProgress,
} from "./state";

type Props = {
  onGoPractice: () => void;
  onGoRegister: () => void;
  onGoShop: () => void;
  onGoShelf: () => void;
};

const DENOMINATIONS = [1000, 500, 100, 50, 10] as const;

function ItemPreview({ src, alt }: { src: string; alt: string }) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-500">
        no image
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setMissing(true)}
      className="h-24 w-24 rounded-xl border border-slate-200 bg-white object-contain p-2"
    />
  );
}

export function ShopPage({
  onGoPractice,
  onGoRegister,
  onGoShop,
  onGoShelf,
}: Props) {
  const [progress, setProgress] = useState(() => loadRegisterProgress());
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [tray, setTray] = useState<number[]>([]);
  const [result, setResult] = useState<string>("");

  const activeItem = useMemo(
    () => SHOP_ITEMS.find((item) => item.id === activeItemId) ?? null,
    [activeItemId],
  );
  const trayTotal = useMemo(
    () => tray.reduce((acc, value) => acc + value, 0),
    [tray],
  );

  const purchase = () => {
    if (!activeItem) return;
    if (progress.purchasedItemIds.includes(activeItem.id)) {
      setResult("このグッズは すでに もっています。");
      return;
    }
    if (progress.coins < activeItem.price) {
      setResult("コインが たりません。");
      return;
    }
    if (trayTotal < activeItem.price) {
      setResult("トレーのお金が たりません。ついかしてください。");
      return;
    }

    const change = trayTotal - activeItem.price;
    const exactBonus = change === 0 ? 3 : 0;
    setProgress((prev) => {
      const next = saveRegisterProgress({
        ...prev,
        coins: prev.coins - activeItem.price + exactBonus,
        purchasedItemIds: [...prev.purchasedItemIds, activeItem.id],
      });
      return next;
    });

    setResult(
      change > 0
        ? `こうにゅう かんりょう。おつり ${change}円`
        : "こうにゅう かんりょう。ぴったり！（+3コイン）",
    );
    setTray([]);
    setActiveItemId(null);
  };

  return (
    <SceneFrame
      title="ごほうびショップ"
      subtitle="レジゲームでためたコインで おかいもの"
      backgroundImage="/assets/shop-bg.png"
    >
      <div className="grid h-full grid-rows-[auto_auto_1fr] gap-3">
        <SorobanModeNav
          current="game"
          onGoTest={() => {
            savePracticeConfig({ mode: "test" });
            onGoPractice();
          }}
          onGoPractice={() => {
            savePracticeConfig({ mode: "one-by-one" });
            onGoPractice();
          }}
          onGoGame={onGoRegister}
        />

        <SorobanSubnav
          current="shop"
          onGoRegister={onGoRegister}
          onGoShop={onGoShop}
          onGoShelf={onGoShelf}
        />

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-bold">所持コイン:</span> {progress.coins}
        </div>

        <div className="grid gap-3 overflow-auto rounded-2xl border border-slate-200 bg-white/92 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
          {SHOP_ITEMS.map((item) => {
            const purchased = progress.purchasedItemIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3"
              >
                <ItemPreview src={item.image} alt={item.name} />
                <div className="font-bold text-slate-800">{item.name}</div>
                <div className="text-sm text-slate-600">{item.description}</div>
                <div className="text-sm font-semibold text-slate-700">
                  {item.price} コイン
                </div>
                <button
                  className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                    purchased
                      ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                      : "bg-sky-600 text-white hover:bg-sky-700"
                  }`}
                  disabled={purchased}
                  onClick={() => {
                    setActiveItemId(item.id);
                    setTray([]);
                    setResult("");
                  }}
                >
                  {purchased ? "購入済み" : "買う"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {activeItem ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-lg font-black text-slate-800">
                {activeItem.name} を買う
              </div>
              <button
                className="ml-auto rounded-lg border border-slate-200 px-2 py-1 text-xs"
                onClick={() => {
                  setActiveItemId(null);
                  setTray([]);
                  setResult("");
                }}
              >
                閉じる
              </button>
            </div>

            <div className="mt-3 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <div>価格: {activeItem.price}コイン</div>
              <div>トレー合計: {trayTotal}円</div>
              <div>不足: {Math.max(0, activeItem.price - trayTotal)}円</div>
            </div>

            <div className="mt-3 grid grid-cols-5 gap-2">
              {DENOMINATIONS.map((yen) => (
                <button
                  key={yen}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold shadow-sm hover:bg-slate-50"
                  onClick={() => setTray((prev) => [...prev, yen])}
                >
                  {yen}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
                onClick={() => setTray([])}
              >
                クリア
              </button>
              <button
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                onClick={purchase}
              >
                支払って購入
              </button>
            </div>

            {result ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {result}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </SceneFrame>
  );
}
