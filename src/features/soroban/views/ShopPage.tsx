import React, { useEffect, useMemo, useRef, useState } from "react";
import { DogSpeechBubble } from "../components/DogSpeechBubble";
import { SceneFrame } from "../SceneFrame";
import { SHOP_ITEMS } from "../catalog";
import shopTopBg from "../../../../public/assets/shop-top.png";
import shopPaymentBg from "../../../../public/assets/shop-peyment.png";
import { loadRegisterProgress, saveRegisterProgress } from "../state";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("ja-JP").format(value);

type ShopPageProps = {
  onGoRegister: () => void;
  onGoPayment: (itemId: string) => void;
};

type ShopPaymentPageProps = {
  itemId: string | null;
  onGoRegister: () => void;
  onGoShop: () => void;
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

const DRAG_SOURCE_TYPE = "application/x-learning-arcade-source";
const DRAG_TRAY_INDEX = "application/x-learning-arcade-tray-index";

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
        がぞうなし
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
  onDragValueStart,
  onDragValueEnd,
  onPointerValueStart,
  onPointerValueMove,
  onPointerValueEnd,
  onPointerValueCancel,
}: {
  value: number;
  image: string;
  onDragValueStart: (value: number) => void;
  onDragValueEnd: () => void;
  onPointerValueStart: (value: number, x: number, y: number) => void;
  onPointerValueMove: (x: number, y: number) => void;
  onPointerValueEnd: (value: number, x: number, y: number) => void;
  onPointerValueCancel: () => void;
}) {
  const [missing, setMissing] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_SOURCE_TYPE, "wallet");
        e.dataTransfer.setData("text/plain", String(value));
        onDragValueStart(value);
      }}
      onDragEnd={onDragValueEnd}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onPointerValueStart(value, e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse") return;
        onPointerValueMove(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        if (e.pointerType === "mouse") return;
        onPointerValueEnd(value, e.clientX, e.clientY);
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }}
      onPointerCancel={(e) => {
        if (e.pointerType === "mouse") return;
        onPointerValueCancel();
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }}
      className="grid h-20 w-20 place-items-center rounded-full bg-transparent p-0 shadow-none hover:scale-105"
      title="ドラッグでトレーにいれる"
      role="button"
      aria-label={`${formatNumber(value)}えんをドラッグ`}
      style={{ touchAction: "none" }}
    >
      {missing ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-100 text-[10px] text-slate-500">
          がぞうなし
        </div>
      ) : (
        <img
          src={image}
          alt={`${formatNumber(value)}えん`}
          onError={() => setMissing(true)}
          className="h-[4.5rem] w-[4.5rem] object-contain"
        />
      )}
    </div>
  );
}

export function ShopPage({ onGoRegister, onGoPayment }: ShopPageProps) {
  const [progress] = useState(() => loadRegisterProgress());
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setShowItems(true);
    }, 1400);
    return () => window.clearTimeout(timerId);
  }, []);

  return (
    <SceneFrame
      backgroundImage={shopTopBg}
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
            <span className="inline-flex h-8 items-center rounded-full bg-white/70 px-3 py-0.5 text-sm font-bold text-slate-800">
              てもちコイン: {progress.coins}
            </span>
          </div>
        </div>
      }
    >
      <div
        className="relative grid h-full grid-rows-[1fr] gap-3 text-lg"
        style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}
      >
        {!showItems ? (
          <div className="pointer-events-none absolute left-[6%] top-[16%] z-20 w-[min(30rem,48vw)]">
            <DogSpeechBubble text="いらっしゃいませ！" />
          </div>
        ) : null}

        {showItems ? (
          <div className="grid min-h-0 content-start gap-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white/92 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
            {SHOP_ITEMS.map((item) => {
              const purchased = progress.purchasedItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <ItemPreview src={item.image} alt={item.name} />
                  <div className="font-bold text-slate-800">{item.name}</div>
                  <div className="text-sm text-slate-600">
                    {item.description}
                  </div>
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
                    onClick={() => onGoPayment(item.id)}
                  >
                    {purchased ? "購入済み" : "かう"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </SceneFrame>
  );
}

export function ShopPaymentPage({
  itemId,
  onGoRegister,
  onGoShop,
}: ShopPaymentPageProps) {
  const [progress] = useState(() => loadRegisterProgress());
  const [tray, setTray] = useState<number[]>([]);
  const [result, setResult] = useState<string>("");
  const [isTrayDragging, setIsTrayDragging] = useState(false);
  const [draggingCoinValue, setDraggingCoinValue] = useState<number | null>(
    null,
  );
  const [pointerDragPreview, setPointerDragPreview] = useState<{
    value: number;
    x: number;
    y: number;
  } | null>(null);
  const trayRef = useRef<HTMLDivElement | null>(null);
  const walletRef = useRef<HTMLDivElement | null>(null);
  const pointerDraggingRef = useRef(false);

  const activeItem = useMemo(
    () => SHOP_ITEMS.find((item) => item.id === itemId) ?? null,
    [itemId],
  );
  const trayTotal = useMemo(
    () => tray.reduce((acc, value) => acc + value, 0),
    [tray],
  );

  const pushCoinToTray = (value: number) => {
    setTray((prev) => [...prev, value]);
  };
  const isTrayHighlight = isTrayDragging || draggingCoinValue != null;

  const isInsideTray = (x: number, y: number) => {
    const rect = trayRef.current?.getBoundingClientRect();
    if (!rect) return false;
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  };
  const isInsideWallet = (x: number, y: number) => {
    const rect = walletRef.current?.getBoundingClientRect();
    if (!rect) return false;
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  };
  const removeTrayCoinAt = (index: number) => {
    setTray((prev) => prev.filter((_, i) => i !== index));
  };

  const purchase = () => {
    if (!activeItem) {
      setResult("しょうひんがありません");
      return;
    }
    if (progress.purchasedItemIds.includes(activeItem.id)) {
      setResult("このグッズは もうもっているよ");
      return;
    }
    if (progress.coins < activeItem.price) {
      setResult("コインが たりないよ");
      return;
    }
    if (trayTotal < activeItem.price) {
      setResult("トレーのおかねが たりないよ");
      return;
    }

    const change = trayTotal - activeItem.price;
    const exactBonus = change === 0 ? 3 : 0;
    saveRegisterProgress({
      ...progress,
      coins: progress.coins - activeItem.price + exactBonus,
      purchasedItemIds: [...progress.purchasedItemIds, activeItem.id],
    });
    onGoShop();
  };

  return (
    <SceneFrame
      backgroundImage={shopPaymentBg}
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
            <button
              className="h-12 rounded-xl bg-white/20 px-4 text-sm font-semibold hover:bg-white/30"
              onClick={onGoShop}
            >
              ← おみせにもどる
            </button>
            <span className="inline-flex h-8 items-center rounded-full bg-white/70 px-3 py-0.5 text-sm font-bold text-slate-800">
              てもちコイン: {progress.coins}
            </span>
          </div>
        </div>
      }
    >
      <div
        className="grid h-full grid-rows-[1fr] gap-3 text-lg"
        style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}
      >
        <div className="relative h-full min-h-0">
          <div
            ref={walletRef}
            className="absolute left-[5.6%] top-[30.8%] h-[45.5%] w-[38.8%]"
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
              const source = e.dataTransfer.getData(DRAG_SOURCE_TYPE);
              if (source !== "tray") return;
              const index = Number(e.dataTransfer.getData(DRAG_TRAY_INDEX));
              if (Number.isInteger(index) && index >= 0) {
                removeTrayCoinAt(index);
              }
              setDraggingCoinValue(null);
              setPointerDragPreview(null);
              setIsTrayDragging(false);
            }}
          >
            {COINS.map((coin, index) => {
              const pos = WALLET_COIN_POSITIONS[index] ?? {
                left: "0%",
                top: "0%",
              };
              return (
                <div
                  key={coin.value}
                  className="absolute"
                  style={{ left: pos.left, top: pos.top }}
                >
                  <CoinChip
                    value={coin.value}
                    image={coin.image}
                    onDragValueStart={setDraggingCoinValue}
                    onDragValueEnd={() => {
                      if (pointerDraggingRef.current) return;
                      setIsTrayDragging(false);
                      setDraggingCoinValue(null);
                    }}
                    onPointerValueStart={(value, x, y) => {
                      pointerDraggingRef.current = true;
                      setDraggingCoinValue(value);
                      setIsTrayDragging(isInsideTray(x, y));
                      setPointerDragPreview({ value, x, y });
                    }}
                    onPointerValueMove={(x, y) => {
                      setIsTrayDragging(isInsideTray(x, y));
                      setPointerDragPreview((prev) =>
                        prev ? { ...prev, x, y } : prev,
                      );
                    }}
                    onPointerValueEnd={(value, x, y) => {
                      if (isInsideTray(x, y)) {
                        pushCoinToTray(value);
                      }
                      pointerDraggingRef.current = false;
                      setIsTrayDragging(false);
                      setDraggingCoinValue(null);
                      setPointerDragPreview(null);
                    }}
                    onPointerValueCancel={() => {
                      pointerDraggingRef.current = false;
                      setIsTrayDragging(false);
                      setDraggingCoinValue(null);
                      setPointerDragPreview(null);
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div
            ref={trayRef}
            className={`absolute left-[50.5%] top-[34.5%] h-[33%] w-[40.5%] rounded-3xl border-2 p-3 transition ${
              isTrayHighlight
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
              const source = e.dataTransfer.getData(DRAG_SOURCE_TYPE);
              if (source === "tray") {
                setIsTrayDragging(false);
                setDraggingCoinValue(null);
                setPointerDragPreview(null);
                return;
              }
              const dropped = Number(e.dataTransfer.getData("text/plain"));
              const value =
                Number.isFinite(dropped) && dropped > 0
                  ? dropped
                  : draggingCoinValue;
              if (value != null && value > 0) pushCoinToTray(value);
              setIsTrayDragging(false);
              setDraggingCoinValue(null);
            }}
          >
            <div className="mt-2 max-h-[calc(100%-3.5rem)] overflow-auto rounded-xl bg-white/70 p-2">
              <div className="flex items-center py-1 pl-1">
                {tray.length === 0 ? (
                  <div className="text-xs text-slate-500">
                    ここにコインをいれてね
                  </div>
                ) : (
                  tray.map((coin, i) => (
                    <div
                      key={`${coin}-${i}`}
                      className="relative -ml-6 first:ml-0"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(DRAG_SOURCE_TYPE, "tray");
                        e.dataTransfer.setData(DRAG_TRAY_INDEX, String(i));
                        setDraggingCoinValue(coin);
                      }}
                      onDragEnd={() => {
                        if (pointerDraggingRef.current) return;
                        setDraggingCoinValue(null);
                        setPointerDragPreview(null);
                        setIsTrayDragging(false);
                      }}
                      onPointerDown={(e) => {
                        if (e.pointerType === "mouse") return;
                        e.preventDefault();
                        e.currentTarget.setPointerCapture(e.pointerId);
                        pointerDraggingRef.current = true;
                        setDraggingCoinValue(coin);
                        setIsTrayDragging(isInsideTray(e.clientX, e.clientY));
                        setPointerDragPreview({
                          value: coin,
                          x: e.clientX,
                          y: e.clientY,
                        });
                      }}
                      onPointerMove={(e) => {
                        if (e.pointerType === "mouse") return;
                        setIsTrayDragging(isInsideTray(e.clientX, e.clientY));
                        setPointerDragPreview((prev) =>
                          prev ? { ...prev, x: e.clientX, y: e.clientY } : prev,
                        );
                      }}
                      onPointerUp={(e) => {
                        if (e.pointerType === "mouse") return;
                        if (isInsideWallet(e.clientX, e.clientY)) {
                          removeTrayCoinAt(i);
                        }
                        pointerDraggingRef.current = false;
                        setDraggingCoinValue(null);
                        setPointerDragPreview(null);
                        setIsTrayDragging(false);
                        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                          e.currentTarget.releasePointerCapture(e.pointerId);
                        }
                      }}
                      onPointerCancel={(e) => {
                        if (e.pointerType === "mouse") return;
                        pointerDraggingRef.current = false;
                        setDraggingCoinValue(null);
                        setPointerDragPreview(null);
                        setIsTrayDragging(false);
                        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                          e.currentTarget.releasePointerCapture(e.pointerId);
                        }
                      }}
                      role="button"
                      aria-label={`${coin}えんをさいふにもどす`}
                      style={{ touchAction: "none" }}
                    >
                      {COIN_IMAGE_BY_VALUE[coin] ? (
                        <img
                          src={COIN_IMAGE_BY_VALUE[coin]}
                          alt={`${coin}円`}
                          className="h-[4.5rem] w-[4.5rem] object-contain"
                        />
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          {pointerDragPreview ? (
            <div
              className="pointer-events-none fixed z-[70] -translate-x-1/2 -translate-y-1/2"
              style={{ left: pointerDragPreview.x, top: pointerDragPreview.y }}
              aria-hidden
            >
              {COIN_IMAGE_BY_VALUE[pointerDragPreview.value] ? (
                <img
                  src={COIN_IMAGE_BY_VALUE[pointerDragPreview.value]}
                  alt=""
                  className="h-16 w-16 object-contain drop-shadow-lg"
                />
              ) : (
                <div className="rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-slate-700 shadow">
                  {pointerDragPreview.value}円
                </div>
              )}
            </div>
          ) : null}

          <div className="absolute right-3 top-3 z-20 w-64 rounded-2xl border border-slate-200 p-3 shadow">
            <div className="text-sm font-bold text-slate-700">
              こうにゅうするグッズ
            </div>
            {activeItem ? (
              <div className="mt-2 grid gap-2">
                <ItemPreview src={activeItem.image} alt={activeItem.name} />
                <div className="text-sm font-bold text-slate-800">
                  {activeItem.name}
                </div>
                <div className="text-xs text-slate-700">
                  ねだん: {activeItem.price}コイン
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-slate-500">
                しょうひんがありません
              </div>
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
      </div>
    </SceneFrame>
  );
}
