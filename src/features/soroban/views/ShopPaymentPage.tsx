import React, { useEffect, useMemo, useRef, useState } from "react";
import coin1Image from "@/assets/coin/coin-1.png";
import coin10Image from "@/assets/coin/coin-10.png";
import coin100Image from "@/assets/coin/coin-100.png";
import coin5Image from "@/assets/coin/coin-5.png";
import coin50Image from "@/assets/coin/coin-50.png";
import coin500Image from "@/assets/coin/coin-500.png";
import shopPaymentBg from "@/assets/shop-peyment.png";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import { SHOP_ITEMS } from "@/features/soroban/catalog";
import { loadRegisterProgress, saveRegisterProgress } from "@/features/soroban/state";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("ja-JP").format(value);

type ShopPaymentPageProps = {
  itemId: string | null;
  onGoRegister: () => void;
  onGoShop: () => void;
};

const COINS = [
  { value: 500, image: coin500Image },
  { value: 100, image: coin100Image },
  { value: 50, image: coin50Image },
  { value: 10, image: coin10Image },
  { value: 5, image: coin5Image },
  { value: 1, image: coin1Image },
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

function ItemPreview({
  src,
  alt,
  size = "normal",
}: {
  src: string;
  alt: string;
  size?: "normal" | "large";
}) {
  const [missing, setMissing] = useState(false);
  const sizeClass = size === "large" ? "h-36 w-36" : "h-24 w-24";
  const frameClass =
    size === "large" ? "border-transparent bg-transparent p-0" : "border border-slate-200 bg-white p-2";
  if (missing) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-500 ${sizeClass}`}
      >
        がぞうなし
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setMissing(true)}
      className={`rounded-xl object-contain ${sizeClass} ${frameClass}`}
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

export function ShopPaymentPage({
  itemId,
  onGoRegister,
  onGoShop,
}: ShopPaymentPageProps) {
  const [progress, setProgress] = useState(() => loadRegisterProgress());
  const [tray, setTray] = useState<number[]>([]);
  const [result, setResult] = useState<string>("");
  const [purchasedItem, setPurchasedItem] = useState<{
    name: string;
    image: string;
    bonus: number;
  } | null>(null);
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
  const walletCoins = useMemo(() => {
    if (activeItem && activeItem.price <= 500) {
      return COINS.filter((coin) => coin.value !== 500);
    }
    return COINS;
  }, [activeItem]);

  useEffect(() => {
    setResult("");
  }, [tray]);

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
    const latestProgress = loadRegisterProgress();
    if (!activeItem) {
      setResult("しょうひんがありません");
      return;
    }
    if (latestProgress.purchasedItemIds.includes(activeItem.id)) {
      setResult("このグッズは もうもっているよ");
      return;
    }
    if (trayTotal < activeItem.price) {
      setResult(
        `トレーのおかねが たりないよ（${activeItem.price}コイン ひつよう）`,
      );
      return;
    }
    if (latestProgress.coins < activeItem.price) {
      setResult(
        `てもちコインが たりないよ（${activeItem.price}コイン ひつよう）`,
      );
      return;
    }

    const change = trayTotal - activeItem.price;
    const exactBonus = change === 0 ? Math.floor(activeItem.price * 0.1) : 0;
    const nextProgress = saveRegisterProgress({
      ...latestProgress,
      coins: latestProgress.coins - activeItem.price + exactBonus,
      purchasedItemIds: [...latestProgress.purchasedItemIds, activeItem.id],
    });
    setProgress(nextProgress);
    setPurchasedItem({
      name: activeItem.name,
      image: activeItem.image,
      bonus: exactBonus,
    });
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
            {walletCoins.map((coin, index) => {
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
          </div>

          <div className="absolute left-3 top-3 z-20 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3 py-2 text-sm font-bold text-emerald-700">
            おつりなしだと ボーナスが もらえるよ
          </div>

          <div className="absolute left-[50.5%] top-[80%] z-20 w-[40.5%]">
            <div className="flex gap-3">
              <button
                className="h-14 flex-1 rounded-2xl border border-slate-200 bg-white/90 px-4 text-base font-bold text-slate-700 hover:bg-white"
                onClick={() => setTray([])}
              >
                クリア
              </button>
              <button
                className="h-14 flex-[1.8] rounded-2xl bg-emerald-600 px-4 text-base font-black text-white hover:bg-emerald-700 disabled:opacity-60"
                onClick={purchase}
                disabled={!activeItem}
              >
                おかねをはらう
              </button>
            </div>

            {result ? (
              <div className="mt-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700">
                {result}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {purchasedItem ? (
        <div className="absolute inset-0 z-40 grid place-items-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl">
            <div className="text-sm font-semibold text-slate-500">
              おかいもの かんりょう！
            </div>
            <div className="mt-2 text-xl font-black text-slate-800">
              {purchasedItem.name} を こうにゅうしたよ
            </div>
            {purchasedItem.bonus > 0 ? (
              <div className="mt-2 text-sm font-bold text-emerald-700">
                ぴったりしはらいボーナス +{purchasedItem.bonus}コイン
              </div>
            ) : null}
            <div className="mt-4 grid place-items-center">
              <ItemPreview
                src={purchasedItem.image}
                alt={purchasedItem.name}
                size="large"
              />
            </div>
            <button
              className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              onClick={onGoShop}
            >
              おみせにもどる
            </button>
          </div>
        </div>
      ) : null}
    </SceneFrame>
  );
}
