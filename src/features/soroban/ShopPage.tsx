import React, { useMemo, useState } from "react";
import { SceneFrame } from "./SceneFrame";
import { SHOP_ITEMS } from "./catalog";
import shopItemsBg from "../../assets/shop-items.png";
import { loadRegisterProgress, saveRegisterProgress } from "./state";

type Props = {
  onGoPractice: () => void;
  onGoRegister: () => void;
  onGoShop: () => void;
  onGoShelf: () => void;
};

const COINS = [
  { value: 500, image: "/assets/coin/coin-500.png" },
  { value: 100, image: "/assets/coin/coin-100.png" },
  { value: 50, image: "/assets/coin/coin-50.png" },
  { value: 10, image: "/assets/coin/coin-10.png" },
  { value: 5, image: "/assets/coin/coin-5.png" },
  { value: 1, image: "/assets/coin/coin-1.png" },
] as const;

const COIN_IMAGE_BY_VALUE: Record<number, string> = Object.fromEntries(
  COINS.map((coin) => [coin.value, coin.image]),
);

const WALLET_COIN_POSITIONS = [
  { left: "10%", top: "42%" },
  { left: "34%", top: "44%" },
  { left: "58%", top: "46%" },
  { left: "14%", top: "67%" },
  { left: "40%", top: "69%" },
  { left: "66%", top: "71%" },
] as const;

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

function CoinChip({
  value,
  image,
  onSelect,
  onDragValueStart,
  onDragValueEnd,
}: {
  value: number;
  image: string;
  onSelect: () => void;
  onDragValueStart: (value: number) => void;
  onDragValueEnd: (value: number) => void;
}) {
  const [missing, setMissing] = useState(false);

  return (
    <button
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(value));
        onDragValueStart(value);
      }}
      onClick={onSelect}
      onMouseDown={() => onDragValueStart(value)}
      onDragEnd={() => onDragValueEnd(value)}
      className="grid h-20 w-20 place-items-center rounded-full bg-transparent p-0 shadow-none hover:scale-105"
      title="ドラッグでトレーにいれる"
    >
      {missing ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-100 text-[10px] text-slate-500">
          no image
        </div>
      ) : (
        <img
          src={image}
          alt={`${value}円`}
          onError={() => setMissing(true)}
          className="h-[4.5rem] w-[4.5rem] object-contain"
        />
      )}
    </button>
  );
}

export function ShopPage({ onGoRegister }: Props) {
  const [progress, setProgress] = useState(() => loadRegisterProgress());
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [tray, setTray] = useState<number[]>([]);
  const [result, setResult] = useState<string>("");
  const [screen, setScreen] = useState<"catalog" | "payment">("catalog");
  const [isTrayDragging, setIsTrayDragging] = useState(false);
  const [draggingCoinValue, setDraggingCoinValue] = useState<number | null>(null);

  const activeItem = useMemo(
    () => SHOP_ITEMS.find((item) => item.id === activeItemId) ?? null,
    [activeItemId],
  );
  const trayTotal = useMemo(
    () => tray.reduce((acc, value) => acc + value, 0),
    [tray],
  );

  const pushCoinToTray = (value: number) => {
    setTray((prev) => [...prev, value]);
  };

  const onCoinDragEnd = (value: number) => {
    if (isTrayDragging) {
      pushCoinToTray(value);
    }
    setIsTrayDragging(false);
    setDraggingCoinValue(null);
  };

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
    setProgress((prev) =>
      saveRegisterProgress({
        ...prev,
        coins: prev.coins - activeItem.price + exactBonus,
        purchasedItemIds: [...prev.purchasedItemIds, activeItem.id],
      }),
    );

    setResult(
      change > 0
        ? `こうにゅう かんりょう。おつり ${change}円`
        : "こうにゅう かんりょう。ぴったり！（+3コイン）",
    );
    setTray([]);
    setActiveItemId(null);
    setScreen("catalog");
  };

  return (
    <SceneFrame
      backgroundImage={shopItemsBg}
      fullscreenBackground
      outsideTopLeft={
        <div className="grid gap-2">
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto rounded-xl px-3 py-0.5 text-sm text-white [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0">
            <button
              className="h-12 rounded-xl bg-transparent px-4 text-sm font-semibold hover:bg-white/10"
              onClick={onGoRegister}
            >
              ← ゲームモードTOP
            </button>
            {screen === "payment" ? (
              <button
                className="h-12 rounded-xl bg-white/20 px-4 text-sm font-semibold hover:bg-white/30"
                onClick={() => {
                  setScreen("catalog");
                  setTray([]);
                  setResult("");
                }}
              >
                ← おみせにもどる
              </button>
            ) : null}
            <span className="inline-flex h-8 items-center rounded-full bg-white/70 px-3 py-0.5 text-sm font-bold text-slate-800">
              てもちコイン: {progress.coins}
            </span>
            {screen === "payment" ? (
              <span className="inline-flex h-8 items-center rounded-full bg-white/70 px-3 py-0.5 text-sm font-semibold text-slate-800">
                トレー合計: {trayTotal}円
              </span>
            ) : null}
          </div>
        </div>
      }
    >
      <div
        className="grid h-full grid-rows-[1fr] gap-3 text-lg"
        style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}
      >
        {screen === "catalog" ? (
          <div className="grid min-h-0 gap-3 rounded-2xl border border-slate-200 bg-white/92 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
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
                      setScreen("payment");
                    }}
                  >
                    {purchased ? "購入済み" : "かう"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative h-full min-h-0">
            <div className="absolute left-[5.6%] top-[30.8%] h-[45.5%] w-[38.8%]">
              {COINS.map((coin, index) => {
                const pos = WALLET_COIN_POSITIONS[index] ?? { left: "0%", top: "0%" };
                return (
                  <div
                    key={coin.value}
                    className="absolute"
                    style={{ left: pos.left, top: pos.top }}
                  >
                    <CoinChip
                      value={coin.value}
                      image={coin.image}
                      onSelect={() => pushCoinToTray(coin.value)}
                      onDragValueStart={setDraggingCoinValue}
                      onDragValueEnd={onCoinDragEnd}
                    />
                  </div>
                );
              })}
            </div>

            <div
              className={`absolute left-[50.5%] top-[34.5%] h-[33%] w-[40.5%] rounded-3xl border-2 p-3 transition ${
                isTrayDragging
                  ? "border-sky-500 bg-sky-100/60"
                  : "border-sky-200 bg-sky-50/35"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsTrayDragging(true);
              }}
              onDragLeave={() => setIsTrayDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = Number(e.dataTransfer.getData("text/plain"));
                const value = Number.isFinite(dropped) && dropped > 0 ? dropped : draggingCoinValue;
                if (value != null && value > 0) pushCoinToTray(value);
                setIsTrayDragging(false);
                setDraggingCoinValue(null);
              }}
              onMouseUp={() => {
                if (draggingCoinValue != null && draggingCoinValue > 0) {
                  pushCoinToTray(draggingCoinValue);
                }
                setIsTrayDragging(false);
                setDraggingCoinValue(null);
              }}
            >
              <div className="rounded-xl bg-white/75 px-3 py-2 text-sm font-bold text-sky-900">
                いれたおかね: {trayTotal}円
              </div>
              <div className="mt-2 max-h-[calc(100%-3.5rem)] overflow-auto rounded-xl bg-white/70 p-2">
                <div className="flex flex-wrap gap-2">
                  {tray.length === 0 ? (
                    <div className="text-xs text-slate-500">ここにコインをいれてね</div>
                  ) : (
                    tray.map((coin, i) => (
                      <div
                        key={`${coin}-${i}`}
                        className="flex items-center gap-1 rounded-full border border-sky-200 bg-white/85 px-2 py-1 text-xs font-semibold text-sky-900"
                      >
                        {COIN_IMAGE_BY_VALUE[coin] ? (
                          <img
                            src={COIN_IMAGE_BY_VALUE[coin]}
                            alt={`${coin}円`}
                            className="h-7 w-7 object-contain"
                          />
                        ) : null}
                        <span>{coin}円</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="absolute right-3 top-3 z-20 w-64 rounded-2xl border border-slate-200 p-3 shadow">
              <div className="text-sm font-bold text-slate-700">こうにゅうするグッズ</div>
              {activeItem ? (
                <div className="mt-2 grid gap-2">
                  <ItemPreview src={activeItem.image} alt={activeItem.name} />
                  <div className="text-sm font-bold text-slate-800">{activeItem.name}</div>
                  <div className="text-xs text-slate-700">ねだん: {activeItem.price}コイン</div>
                  <div className="text-xs text-slate-700">不足: {Math.max(0, activeItem.price - trayTotal)}円</div>
                </div>
              ) : (
                <div className="mt-2 text-sm text-slate-500">しょうひんがありません</div>
              )}

              <div className="mt-2 flex gap-2">
                <button
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                  onClick={() => setTray([])}
                >
                  クリア
                </button>
                <button
                  className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  onClick={purchase}
                  disabled={!activeItem}
                >
                  おかねをはらう
                </button>
              </div>

              {result ? (
                <div className="mt-2 rounded-xl border border-slate-200 px-2 py-1 text-xs text-slate-700">
                  {result}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </SceneFrame>
  );
}
