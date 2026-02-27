import React, { useEffect, useMemo, useRef, useState } from "react";
import coin1Image from "@/assets/coin/coin-1.png";
import coin10Image from "@/assets/coin/coin-10.png";
import coin100Image from "@/assets/coin/coin-100.png";
import coin5Image from "@/assets/coin/coin-5.png";
import coin50Image from "@/assets/coin/coin-50.png";
import coin500Image from "@/assets/coin/coin-500.png";
import coinIcon from "@/assets/coin.png";
import arkSuccess from "@/assets/ark_success.png";
import shopPaymentBg from "@/assets/shop-peyment.png";
import { CoinValue } from "@/features/soroban/components/CoinValue";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import { SHOP_ITEMS } from "@/features/soroban/catalog";
import { pickPurchaseSpeechByItemId } from "@/features/soroban/speech";
import { loadRegisterProgress, saveRegisterProgress } from "@/features/soroban/state";
import {
  buildWalletForPrice,
  type CoinDenomination,
  type WalletBreakdown,
} from "@/features/soroban/wallet";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("ja-JP").format(value);

type ShopPaymentPageProps = {
  itemId: string | null;
  onGoRegister: () => void;
  onGoShop: (opts?: { fromPurchase?: boolean }) => void;
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
const DRAG_TRAY_COIN_ID = "application/x-learning-arcade-tray-coin-id";
const DRAG_WALLET_COIN_KEY = "application/x-learning-arcade-wallet-coin-key";
const MAX_VISIBLE_WALLET_COINS_PER_DENOM = 18;
const DRAG_PREVIEW_Z_INDEX = 50000;

type WalletCoinLayoutItem = {
  key: string;
  value: number;
  left: number;
  top: number;
  rotate: number;
  zIndex: number;
};

type TrayCoin = {
  id: number;
  value: number;
  sourceWalletCoinKey: string | null;
};

const seededRandom = (seed: number) => {
  let next = seed >>> 0;
  next = (next * 1664525 + 1013904223) >>> 0;
  return next / 0xffffffff;
};

const createWalletCoinLayout = (
  walletBreakdown: WalletBreakdown,
  walletDenominations: readonly number[],
  tray: readonly TrayCoin[],
) => {
  const result: WalletCoinLayoutItem[] = [];
  const trayBreakdown: WalletBreakdown = { 500: 0, 100: 0, 50: 0, 10: 0, 5: 0, 1: 0 };
  const movedWalletCoinKeys = new Set(
    tray
      .map((coin) => coin.sourceWalletCoinKey)
      .filter((key): key is string => typeof key === "string" && key.length > 0),
  );
  tray.forEach((coin) => {
    const denom = coin.value as CoinDenomination;
    trayBreakdown[denom] += 1;
  });
  walletDenominations.forEach((value, denomIndex) => {
    const denom = value as CoinDenomination;
    const totalCount = (walletBreakdown[denom] ?? 0) + (trayBreakdown[denom] ?? 0);
    const visibleCapacity = Math.min(totalCount, MAX_VISIBLE_WALLET_COINS_PER_DENOM);
    for (let slot = 0; slot < visibleCapacity; slot += 1) {
      const coinKey = `${value}-${slot}`;
      if (movedWalletCoinKeys.has(coinKey)) continue;
      const seedBase = value * 1009 + slot * 9176 + denomIndex * 6151;
      const jitterX = seededRandom(seedBase + 11) * 6 - 3;
      const jitterY = seededRandom(seedBase + 37) * 6 - 3;
      const rotate = seededRandom(seedBase + 83) * 12 - 6;
      const spreadIndex = denomIndex * MAX_VISIBLE_WALLET_COINS_PER_DENOM + slot;
      const left = 14 + ((spreadIndex * 19) % 62) + jitterX;
      const top = 20 + ((spreadIndex * 23) % 55) + jitterY;
      result.push({
        key: coinKey,
        value,
        left: Math.min(80, Math.max(12, left)),
        top: Math.min(78, Math.max(16, top)),
        rotate,
        zIndex: denomIndex * 100 + slot + 1,
      });
    }
  });
  return result;
};

function ItemPreview({
  src,
  alt,
  size = "normal",
}: {
  src: string;
  alt: string;
  size?: "normal" | "panel" | "large";
}) {
  const [missing, setMissing] = useState(false);
  const sizeClass = size === "large" ? "h-36 w-36" : size === "panel" ? "h-32 w-32" : "h-24 w-24";
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

function WalletCoin({
  coinKey,
  value,
  image,
  left,
  top,
  rotate,
  zIndex,
  onDragValueStart,
  onDragValueEnd,
  onPointerValueStart,
  onPointerValueMove,
  onPointerValueEnd,
  onPointerValueCancel,
  isDragging,
}: {
  coinKey: string;
  value: number;
  image: string;
  left: number;
  top: number;
  rotate: number;
  zIndex: number;
  onDragValueStart: (value: number, coinKey: string) => void;
  onDragValueEnd: () => void;
  onPointerValueStart: (value: number, coinKey: string, x: number, y: number) => void;
  onPointerValueMove: (x: number, y: number) => void;
  onPointerValueEnd: (value: number, coinKey: string, x: number, y: number) => void;
  onPointerValueCancel: () => void;
  isDragging: boolean;
}) {
  const [missing, setMissing] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(DRAG_SOURCE_TYPE, "wallet");
        e.dataTransfer.setData("text/plain", String(value));
        e.dataTransfer.setData(DRAG_WALLET_COIN_KEY, coinKey);
        e.dataTransfer.setDragImage(
          e.currentTarget,
          e.currentTarget.clientWidth / 2,
          e.currentTarget.clientHeight / 2,
        );
        onDragValueStart(value, coinKey);
      }}
      onDragEnd={onDragValueEnd}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") return;
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        onPointerValueStart(value, coinKey, e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse") return;
        onPointerValueMove(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        if (e.pointerType === "mouse") return;
        onPointerValueEnd(value, coinKey, e.clientX, e.clientY);
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
      className={`absolute h-16 w-16 cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-0" : ""
      }`}
      title="ドラッグでトレーにいれる"
      role="button"
      aria-label={`${formatNumber(value)}えんをドラッグ`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: `translate(-50%, -50%) rotate(${rotate.toFixed(1)}deg)`,
        zIndex,
        touchAction: "none",
      }}
    >
      {missing ? (
        <div className="flex h-full w-full items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-100 text-[10px] text-slate-500">
          がぞうなし
        </div>
      ) : (
        <img
          src={image}
          alt={`${formatNumber(value)}えん`}
          onError={() => setMissing(true)}
          className="pointer-events-none h-full w-full object-contain drop-shadow-sm"
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
  const [tray, setTray] = useState<TrayCoin[]>([]);
  const [result, setResult] = useState<string>("");
  const [purchasedItem, setPurchasedItem] = useState<{
    name: string;
    image: string;
    bonus: number;
    speech: string;
  } | null>(null);
  const [isTrayDragging, setIsTrayDragging] = useState(false);
  const [draggingCoinValue, setDraggingCoinValue] = useState<number | null>(
    null,
  );
  const [draggingWalletCoinKey, setDraggingWalletCoinKey] = useState<string | null>(null);
  const [draggingTrayCoinId, setDraggingTrayCoinId] = useState<number | null>(null);
  const [pointerDragPreview, setPointerDragPreview] = useState<{
    value: number;
    x: number;
    y: number;
  } | null>(null);
  const [exactPaymentFlashBonus, setExactPaymentFlashBonus] = useState<number | null>(null);
  const trayRef = useRef<HTMLDivElement | null>(null);
  const walletRef = useRef<HTMLDivElement | null>(null);
  const pointerDraggingRef = useRef(false);
  const exactFlashTimerRef = useRef<number | null>(null);
  const trayCoinIdRef = useRef(1);
  const returningTrayCoinIdsRef = useRef<Set<number>>(new Set());

  const activeItem = useMemo(
    () => SHOP_ITEMS.find((item) => item.id === itemId) ?? null,
    [itemId],
  );
  const trayTotal = useMemo(
    () => tray.reduce((acc, coin) => acc + coin.value, 0),
    [tray],
  );
  const walletCoins = useMemo(() => {
    if (activeItem && activeItem.price <= 500) {
      return COINS.filter((coin) => coin.value !== 500);
    }
    return COINS;
  }, [activeItem]);
  const walletDenominations = useMemo(
    () => walletCoins.map((coin) => coin.value),
    [walletCoins],
  );
  const walletCoinImageByValue = useMemo(
    () => Object.fromEntries(walletCoins.map((coin) => [coin.value, coin.image])) as Record<number, string>,
    [walletCoins],
  );
  const [walletBreakdown, setWalletBreakdown] = useState<WalletBreakdown>(() =>
    buildWalletForPrice(progress.coins, activeItem?.price ?? 0, walletDenominations),
  );
  const [walletCoinOverrides, setWalletCoinOverrides] = useState<
    Record<string, Pick<WalletCoinLayoutItem, "left" | "top" | "zIndex">>
  >({});
  const walletCoinTopZIndexRef = useRef(10_000);
  const walletCoinLayout = useMemo(
    () =>
      createWalletCoinLayout(walletBreakdown, walletDenominations, tray).map((coin) => {
        const override = walletCoinOverrides[coin.key];
        if (!override) return coin;
        return {
          ...coin,
          left: override.left,
          top: override.top,
          zIndex: override.zIndex,
        };
      }),
    [walletBreakdown, walletDenominations, tray, walletCoinOverrides],
  );

  useEffect(() => {
    setWalletBreakdown(
      buildWalletForPrice(progress.coins, activeItem?.price ?? 0, walletDenominations),
    );
    setWalletCoinOverrides({});
    walletCoinTopZIndexRef.current = 10_000;
    setTray([]);
  }, [activeItem?.id, progress.coins, walletDenominations]);

  useEffect(() => {
    setResult("");
  }, [tray]);

  useEffect(
    () => () => {
      if (exactFlashTimerRef.current != null) {
        window.clearTimeout(exactFlashTimerRef.current);
        exactFlashTimerRef.current = null;
      }
    },
    [],
  );

  const pushCoinToTray = (value: number, sourceWalletCoinKey: string | null) => {
    const denom = value as CoinDenomination;
    if ((walletBreakdown[denom] ?? 0) <= 0) {
      setResult("そのコインは もうないよ");
      return;
    }
    setWalletBreakdown((prev) => ({ ...prev, [denom]: Math.max(0, prev[denom] - 1) }));
    setTray((prev) => [
      ...prev,
      { id: trayCoinIdRef.current++, value, sourceWalletCoinKey },
    ]);
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
  const removeTrayCoinById = (coinId: number) => {
    if (returningTrayCoinIdsRef.current.has(coinId)) return;
    const target = tray.find((item) => item.id === coinId);
    if (!target) return;
    returningTrayCoinIdsRef.current.add(coinId);
    const denom = target.value as CoinDenomination;
    setTray((prev) => prev.filter((item) => item.id !== coinId));
    setWalletBreakdown((walletPrev) => ({
      ...walletPrev,
      [denom]: walletPrev[denom] + 1,
    }));
  };

  const moveWalletCoin = (coinKey: string, clientX: number, clientY: number) => {
    const rect = walletRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    const leftRatio = ((clientX - rect.left) / rect.width) * 100;
    const topRatio = ((clientY - rect.top) / rect.height) * 100;
    const left = Math.min(90, Math.max(8, leftRatio));
    const top = Math.min(88, Math.max(12, topRatio));
    walletCoinTopZIndexRef.current += 1;
    setWalletCoinOverrides((prev) => ({
      ...prev,
      [coinKey]: {
        left,
        top,
        zIndex: walletCoinTopZIndexRef.current,
      },
    }));
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
    setTray([]);
    setWalletBreakdown(
      buildWalletForPrice(nextProgress.coins, activeItem.price, walletDenominations),
    );
    setPurchasedItem({
      name: activeItem.name,
      image: activeItem.image,
      bonus: exactBonus,
      speech: pickPurchaseSpeechByItemId(activeItem.id),
    });
    if (exactBonus > 0) {
      setExactPaymentFlashBonus(exactBonus);
      if (exactFlashTimerRef.current != null) {
        window.clearTimeout(exactFlashTimerRef.current);
      }
      exactFlashTimerRef.current = window.setTimeout(() => {
        setExactPaymentFlashBonus(null);
        exactFlashTimerRef.current = null;
      }, 2200);
    }
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
              onClick={() => onGoShop()}
            >
              ← おみせにもどる
            </button>
            <span className="inline-flex h-8 items-center rounded-full bg-white/70 px-3 py-0.5 text-sm font-bold text-slate-800">
              てもちコイン: <CoinValue amount={progress.coins} amountClassName="font-bold" unitClassName="font-bold" />
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
              if (source === "tray") {
                const coinId = Number(e.dataTransfer.getData(DRAG_TRAY_COIN_ID));
                if (Number.isInteger(coinId) && coinId > 0) {
                  removeTrayCoinById(coinId);
                }
              }
              if (source === "wallet") {
                const coinKey = e.dataTransfer.getData(DRAG_WALLET_COIN_KEY);
                if (coinKey) {
                  moveWalletCoin(coinKey, e.clientX, e.clientY);
                }
              }
              setDraggingCoinValue(null);
              setDraggingWalletCoinKey(null);
              setDraggingTrayCoinId(null);
              setPointerDragPreview(null);
              setIsTrayDragging(false);
            }}
          >
            {walletCoinLayout.map((coin) => (
              <WalletCoin
                key={coin.key}
                coinKey={coin.key}
                value={coin.value}
                image={walletCoinImageByValue[coin.value] ?? COIN_IMAGE_BY_VALUE[coin.value] ?? ""}
                left={coin.left}
                top={coin.top}
                rotate={coin.rotate}
                zIndex={coin.zIndex}
                onDragValueStart={(value, coinKey) => {
                  setDraggingCoinValue(value);
                  setDraggingWalletCoinKey(coinKey);
                  setDraggingTrayCoinId(null);
                }}
                onDragValueEnd={() => {
                  if (pointerDraggingRef.current) return;
                  setIsTrayDragging(false);
                  setDraggingCoinValue(null);
                  setDraggingWalletCoinKey(null);
                  setDraggingTrayCoinId(null);
                }}
                onPointerValueStart={(value, coinKey, x, y) => {
                  pointerDraggingRef.current = true;
                  setDraggingCoinValue(value);
                  setDraggingWalletCoinKey(coinKey);
                  setDraggingTrayCoinId(null);
                  setIsTrayDragging(isInsideTray(x, y));
                  setPointerDragPreview({ value, x, y });
                }}
                onPointerValueMove={(x, y) => {
                  setIsTrayDragging(isInsideTray(x, y));
                  setPointerDragPreview((prev) =>
                    prev ? { ...prev, x, y } : prev,
                  );
                }}
                onPointerValueEnd={(value, coinKey, x, y) => {
                  if (isInsideTray(x, y)) {
                    pushCoinToTray(value, coinKey);
                  } else if (isInsideWallet(x, y)) {
                    moveWalletCoin(coinKey, x, y);
                  }
                  pointerDraggingRef.current = false;
                  setIsTrayDragging(false);
                  setDraggingCoinValue(null);
                  setDraggingWalletCoinKey(null);
                  setDraggingTrayCoinId(null);
                  setPointerDragPreview(null);
                }}
                onPointerValueCancel={() => {
                  pointerDraggingRef.current = false;
                  setIsTrayDragging(false);
                  setDraggingCoinValue(null);
                  setDraggingWalletCoinKey(null);
                  setDraggingTrayCoinId(null);
                  setPointerDragPreview(null);
                }}
                isDragging={draggingWalletCoinKey === coin.key}
              />
            ))}
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
                setDraggingWalletCoinKey(null);
                setDraggingTrayCoinId(null);
                setPointerDragPreview(null);
                return;
              }
              const dropped = Number(e.dataTransfer.getData("text/plain"));
              const droppedCoinKey = e.dataTransfer.getData(DRAG_WALLET_COIN_KEY);
              const value =
                Number.isFinite(dropped) && dropped > 0
                  ? dropped
                  : draggingCoinValue;
              if (value != null && value > 0) {
                pushCoinToTray(value, droppedCoinKey || draggingWalletCoinKey);
              }
              setIsTrayDragging(false);
              setDraggingCoinValue(null);
              setDraggingWalletCoinKey(null);
              setDraggingTrayCoinId(null);
            }}
          >
            <div className="mt-2 max-h-[calc(100%-3.5rem)] overflow-auto rounded-xl bg-white/70 p-2">
              <div className="flex items-center py-1 pl-1">
                {tray.length === 0 ? (
                  <div className="text-xs text-slate-500">
                    ここにコインをいれてね
                  </div>
                ) : (
                  tray.map((coin) => (
                    <div
                      key={coin.id}
                      className="relative -ml-6 first:ml-0"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(DRAG_SOURCE_TYPE, "tray");
                        e.dataTransfer.setData(DRAG_TRAY_COIN_ID, String(coin.id));
                        e.dataTransfer.setDragImage(
                          e.currentTarget,
                          e.currentTarget.clientWidth / 2,
                          e.currentTarget.clientHeight / 2,
                        );
                        setDraggingCoinValue(coin.value);
                        setDraggingWalletCoinKey(null);
                        setDraggingTrayCoinId(coin.id);
                      }}
                      onDragEnd={() => {
                        if (pointerDraggingRef.current) return;
                        setDraggingCoinValue(null);
                        setDraggingWalletCoinKey(null);
                        setDraggingTrayCoinId(null);
                        setPointerDragPreview(null);
                        setIsTrayDragging(false);
                      }}
                      onPointerDown={(e) => {
                        if (e.pointerType === "mouse") return;
                        e.preventDefault();
                        e.currentTarget.setPointerCapture(e.pointerId);
                        pointerDraggingRef.current = true;
                        setDraggingCoinValue(coin.value);
                        setDraggingWalletCoinKey(null);
                        setDraggingTrayCoinId(coin.id);
                        setIsTrayDragging(isInsideTray(e.clientX, e.clientY));
                        setPointerDragPreview({
                          value: coin.value,
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
                          removeTrayCoinById(coin.id);
                        }
                        pointerDraggingRef.current = false;
                        setDraggingCoinValue(null);
                        setDraggingWalletCoinKey(null);
                        setDraggingTrayCoinId(null);
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
                        setDraggingWalletCoinKey(null);
                        setDraggingTrayCoinId(null);
                        setPointerDragPreview(null);
                        setIsTrayDragging(false);
                        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                          e.currentTarget.releasePointerCapture(e.pointerId);
                        }
                      }}
                      role="button"
                      aria-label={`${coin.value}えんをさいふにもどす`}
                      style={{
                        touchAction: "none",
                        opacity: draggingTrayCoinId === coin.id ? 0 : 1,
                      }}
                    >
                      {COIN_IMAGE_BY_VALUE[coin.value] ? (
                        <img
                          src={COIN_IMAGE_BY_VALUE[coin.value]}
                          alt={`${coin.value}円`}
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
              className="pointer-events-none fixed -translate-x-1/2 -translate-y-1/2"
              style={{
                left: pointerDragPreview.x,
                top: pointerDragPreview.y,
                zIndex: DRAG_PREVIEW_Z_INDEX,
              }}
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

          <div className="absolute right-3 top-3 z-20 w-80 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow">
            <div className="text-sm font-bold text-slate-700">
              こうにゅうするグッズ
            </div>
            {activeItem ? (
              <div className="mt-2 grid gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex min-h-32 min-w-[7.25rem] flex-col justify-center rounded-2xl border-2 border-amber-300 bg-amber-50 px-3 text-center shadow-sm">
                    <div className="text-xs font-bold tracking-wide text-amber-700">
                      ねだん
                    </div>
                    <div className="text-5xl font-black leading-none text-amber-600">
                      {formatNumber(activeItem.price)}
                    </div>
                    <div className="mt-1 inline-flex items-center justify-center gap-1 text-xs font-bold text-amber-700">
                      <img src={coinIcon} alt="" aria-hidden className="h-5 w-5 object-contain" />
                      こいん
                    </div>
                  </div>
                  <ItemPreview src={activeItem.image} alt={activeItem.name} size="panel" />
                </div>
                <div className="text-sm font-bold text-slate-800">
                  {activeItem.name}
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
                onClick={() => {
                  setWalletBreakdown((prev) => {
                    const next = { ...prev };
                    tray.forEach((coin) => {
                      const denom = coin.value as CoinDenomination;
                      next[denom] += 1;
                    });
                    return next;
                  });
                  setTray([]);
                }}
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
        <div className="absolute inset-0 z-[2000] grid place-items-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl">
            <div className="text-sm font-semibold text-slate-500">
              おかいもの かんりょう！
            </div>
            <div className="mt-2 text-xl font-black text-slate-800">
              {purchasedItem.name} を こうにゅうしたよ
            </div>
            <div className="mt-2 text-sm font-bold text-sky-700">
              {purchasedItem.speech}
            </div>
            {purchasedItem.bonus > 0 ? (
              <div className="mt-2 text-sm font-bold text-emerald-700">
                ぴったりしはらいボーナス +<CoinValue amount={purchasedItem.bonus} amountClassName="font-bold" unitClassName="font-bold" />
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
              onClick={() => onGoShop({ fromPurchase: true })}
            >
              おみせにもどる
            </button>
          </div>
        </div>
      ) : null}
      {exactPaymentFlashBonus != null ? (
        <div className="pointer-events-none fixed inset-0 z-[2100] flex items-center justify-center bg-slate-900/35 backdrop-blur-[1px]">
          <div className="flash-good flex items-center gap-8">
            <img
              src={arkSuccess}
              alt="ぴったりせいかい"
              className="h-52 w-52 rounded-full bg-white object-cover shadow-sm"
            />
            <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white px-7 py-5 text-center shadow-[0_6px_18px_rgba(0,0,0,0.25)]">
              <div
                className="text-6xl font-extrabold tracking-wide text-amber-700 font-[var(--pop-font)]"
                style={{
                  textShadow: "0 2px 0 rgba(255,255,255,0.65), 0 4px 8px rgba(120,53,15,0.22)",
                }}
              >
                ぴったりせいかい！
              </div>
              <div className="mt-2 text-3xl font-black text-emerald-600">
                ボーナス +<CoinValue amount={exactPaymentFlashBonus} amountClassName="font-black" unitClassName="font-black" iconClassName="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </SceneFrame>
  );
}
