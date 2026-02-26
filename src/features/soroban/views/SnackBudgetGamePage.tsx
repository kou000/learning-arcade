import React, { useMemo, useRef, useState } from "react";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import snackShelf from "@/assets/snack_shelf.png";
import basketImage from "@/assets/basket.png";
import snackMascot from "@/assets/snack-mascot.png";
import { SNACK_SEEDS } from "@/features/soroban/snackCatalog";

type Snack = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type CartItem = {
  snack: Snack;
  quantity: number;
};
type ShelfArea = "left" | "center" | "right";
type SnackLayout = {
  top: string;
  left: string;
  width: string;
};
type ShelfSnack = Snack;
type ShelfSlot = {
  layout: SnackLayout;
  snack: ShelfSnack | null;
};

const TARGET_YEN = 300;
const SHELF_VISIBLE_COUNT = 6;

const SNACK_DRAG_TYPE = "text/snack-id";
const SNACK_LAYOUT_SLOTS: SnackLayout[] = [
  { top: "8%", left: "10%", width: "18%" },
  { top: "8%", left: "31%", width: "18%" },
  { top: "8%", left: "52%", width: "18%" },
  { top: "60%", left: "10%", width: "18%" },
  { top: "60%", left: "31%", width: "18%" },
  { top: "60%", left: "52%", width: "18%" },
];
const SHELF_AREAS: Array<{
  id: ShelfArea;
  label: string;
  left: string;
  width: string;
}> = [
  { id: "left", label: "ひだりの たな", left: "6%", width: "28%" },
  { id: "center", label: "まんなかの たな", left: "36%", width: "28%" },
  { id: "right", label: "みぎの たな", left: "65%", width: "28%" },
];
const SHELF_AREA_ORDER: ShelfArea[] = ["left", "center", "right"];
const FOCUS_STYLE: Record<"full" | ShelfArea, React.CSSProperties> = {
  full: { transform: "scale(1) translateX(0%) translateY(0%)" },
  left: { transform: "scale(2.5) translateX(26%) translateY(-18%)" },
  center: { transform: "scale(2.5) translateX(-4%) translateY(-18%)" },
  right: { transform: "scale(2.5) translateX(-30%) translateY(-18%)" },
};
const shuffle = <T,>(items: readonly T[]): T[] => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const randomSnackPrice = (basePrice: number) => {
  const swing = Math.round((basePrice * 0.15) / 10) * 10;
  const steps = swing / 10;
  const delta = (Math.floor(Math.random() * (steps * 2 + 1)) - steps) * 10;
  return Math.max(10, basePrice + delta);
};

const canReachExactTotal = (prices: number[], target: number): boolean => {
  const normalized = Array.from(
    new Set(prices.filter((price) => Number.isFinite(price) && price > 0)),
  );
  const dp = Array.from({ length: target + 1 }, () => false);
  dp[0] = true;
  for (let sum = 1; sum <= target; sum += 1) {
    dp[sum] = normalized.some((price) => sum - price >= 0 && dp[sum - price]);
  }
  return dp[target];
};

const generateShelfSlotsByArea = (
  priceBySeedId: Record<string, number>,
): Record<ShelfArea, ShelfSlot[]> => {
  const shuffledSeeds = shuffle(SNACK_SEEDS);
  let seedIndex = 0;
  const buildSlots = () =>
    shuffle(SNACK_LAYOUT_SLOTS).map((layout) => {
      const seed = shuffledSeeds[seedIndex];
      seedIndex += 1;
      if (!seed) return { layout, snack: null };
      return {
        layout,
        snack: {
          id: seed.id,
          name: seed.name,
          image: seed.image,
          price: priceBySeedId[seed.id] ?? seed.basePrice,
        },
      };
    });
  return {
    left: buildSlots(),
    center: buildSlots(),
    right: buildSlots(),
  };
};

function CartList({
  cart,
  onRemove,
}: {
  cart: CartItem[];
  onRemove: (snackId: string) => void;
}) {
  if (cart.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/85 px-4 py-6 text-center text-sm font-semibold text-slate-500">
        まだなにもはいってないよ
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {cart.map(({ snack, quantity }) => (
        <div
          key={snack.id}
          className="grid grid-cols-[1fr_auto] gap-2 rounded-xl border border-slate-200 bg-white/90 p-3"
        >
          <div>
            <div className="font-bold text-slate-800">{snack.name}</div>
            <div className="text-xs text-slate-600">
              {snack.price}えん × {quantity}こ
            </div>
          </div>
          <div className="flex items-center">
            <button
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100"
              onClick={() => onRemove(snack.id)}
            >
              けす
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
  onGoSnackResult: (payload: {
    total: number;
    items: Array<{ id: string; price: number; quantity: number }>;
  }) => void;
};

export function SnackBudgetGamePage(props: Props) {
  const { onGoRegister, onGoSnackResult } = props;
  const [shelfSlotsByArea] = useState<Record<ShelfArea, ShelfSlot[]>>(() => {
    const priceBySeedId = Object.fromEntries(
      SNACK_SEEDS.map((seed) => [seed.id, randomSnackPrice(seed.basePrice)]),
    );
    const generated = generateShelfSlotsByArea(priceBySeedId);
    const displayedSnacks = Object.values(generated)
      .flat()
      .map((slot) => slot.snack)
      .filter((snack): snack is ShelfSnack => snack !== null);
    const displayedPrices = displayedSnacks.map((snack) => snack.price);
    if (!canReachExactTotal(displayedPrices, TARGET_YEN)) {
      const fallback = displayedSnacks[0];
      if (fallback) {
        const adjustedPrice = 100;
        return Object.fromEntries(
          Object.entries(generated).map(([area, slots]) => [
            area,
            slots.map((slot) =>
              slot.snack?.id === fallback.id
                ? { ...slot, snack: { ...slot.snack, price: adjustedPrice } }
                : slot,
            ),
          ]),
        ) as Record<ShelfArea, ShelfSlot[]>;
      }
    }
    return generated;
  });
  const [cartMap, setCartMap] = useState<Record<string, number>>({});
  const [cartOrder, setCartOrder] = useState<string[]>([]);
  const [draggingSnackId, setDraggingSnackId] = useState<string | null>(null);
  const [pointerDraggingSnackId, setPointerDraggingSnackId] = useState<
    string | null
  >(null);
  const [pointerDragPreview, setPointerDragPreview] = useState<{
    snackId: string;
    x: number;
    y: number;
  } | null>(null);
  const [basketActive, setBasketActive] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>(
    {},
  );
  const [basketImageError, setBasketImageError] = useState(false);
  const [selectedArea, setSelectedArea] = useState<ShelfArea | null>(null);
  const basketDropRef = useRef<HTMLDivElement | null>(null);
  const activeShelfSlots = selectedArea ? shelfSlotsByArea[selectedArea] : [];
  const allShelfSnacks = useMemo(
    () =>
      (Object.values(shelfSlotsByArea) as ShelfSlot[][])
        .flat()
        .map((slot) => slot.snack)
        .filter((snack): snack is ShelfSnack => snack !== null)
        .reduce<ShelfSnack[]>((acc, snack) => {
          if (acc.some((item) => item.id === snack.id)) return acc;
          acc.push(snack);
          return acc;
        }, []),
    [shelfSlotsByArea],
  );

  const snackById = useMemo(
    () => Object.fromEntries(allShelfSnacks.map((snack) => [snack.id, snack])),
    [allShelfSnacks],
  );
  const cart = useMemo(
    () =>
      cartOrder
        .map((snackId) => snackById[snackId])
        .filter((snack): snack is ShelfSnack => Boolean(snack))
        .filter((snack) => (cartMap[snack.id] ?? 0) > 0)
        .map((snack) => ({
          snack,
          quantity: cartMap[snack.id] ?? 0,
        })),
    [cartMap, cartOrder, snackById],
  );
  const selectedAreaStyle = selectedArea
    ? FOCUS_STYLE[selectedArea]
    : FOCUS_STYLE.full;
  const isShelfFocused = selectedArea !== null;
  const moveShelfArea = (direction: -1 | 1) => {
    setSelectedArea((prev) => {
      if (!prev) return prev;
      const currentIndex = SHELF_AREA_ORDER.indexOf(prev);
      if (currentIndex < 0) return prev;
      const nextIndex =
        (currentIndex + direction + SHELF_AREA_ORDER.length) %
        SHELF_AREA_ORDER.length;
      return SHELF_AREA_ORDER[nextIndex];
    });
  };

  const addSnack = (snackId: string) => {
    setCartMap((prev) => {
      const nextQty = (prev[snackId] ?? 0) + 1;
      return { ...prev, [snackId]: nextQty };
    });
    setCartOrder((prev) =>
      prev.includes(snackId) ? prev : [...prev, snackId],
    );
  };

  const removeSnack = (snackId: string) => {
    setCartMap((prev) => {
      if (!(snackId in prev)) return prev;
      const next = { ...prev };
      delete next[snackId];
      return next;
    });
    setCartOrder((prev) => prev.filter((id) => id !== snackId));
  };

  const clearCart = () => {
    setCartMap({});
    setCartOrder([]);
  };

  const doCheckout = () => {
    const total = cart.reduce(
      (sum, item) => sum + item.snack.price * item.quantity,
      0,
    );
    onGoSnackResult({
      total,
      items: cart.map((item) => ({
        id: item.snack.id,
        price: item.snack.price,
        quantity: item.quantity,
      })),
    });
  };

  const activeDraggingSnackId = draggingSnackId ?? pointerDraggingSnackId;
  const showBasketDrop = isShelfFocused && activeDraggingSnackId !== null;
  const isInsideBasketDrop = (x: number, y: number) => {
    const rect = basketDropRef.current?.getBoundingClientRect();
    if (!rect) return false;
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  };
  const handleDropToBasket = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const snackId =
      e.dataTransfer.getData(SNACK_DRAG_TYPE) || activeDraggingSnackId;
    if (snackId) addSnack(snackId);
    setBasketActive(false);
    setDraggingSnackId(null);
    setPointerDraggingSnackId(null);
    setPointerDragPreview(null);
  };

  return (
    <SceneFrame
      backgroundImage={snackShelf}
      backgroundImageStyle={selectedAreaStyle}
      backgroundImageClassName="origin-top transition-transform duration-500 ease-out will-change-transform"
      fullscreenBackground
      outsideTopLeft={
        <button
          className="rounded-xl bg-transparent px-4 py-3 text-base font-semibold text-white hover:bg-white/10"
          onClick={onGoRegister}
        >
          ← ゲームモードTOP
        </button>
      }
    >
      <div
        className="relative h-full p-3 sm:p-4"
        style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="rounded-xl bg-white/85 px-3 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-sm sm:w-fit">
            {isShelfFocused
              ? "たなから えらんで かごへ どらっぐ"
              : "たなを えらんでね"}
          </div>
          {selectedArea ? (
            <div className="flex items-center gap-2">
              <button
                className="rounded-lg bg-white/85 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-white"
                onClick={() => moveShelfArea(-1)}
              >
                ひだり
              </button>
              <button
                className="rounded-lg bg-white/85 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-white"
                onClick={() => moveShelfArea(1)}
              >
                みぎ
              </button>
              <button
                className="rounded-lg bg-white/85 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-white"
                onClick={() => setSelectedArea(null)}
              >
                もどる
              </button>
            </div>
          ) : null}
        </div>
        <div className="relative mt-3 h-[calc(100%-12.5rem)] min-h-[440px] rounded-2xl">
          {!selectedArea
            ? SHELF_AREAS.map((area) => (
                <button
                  key={area.id}
                  onClick={() => setSelectedArea(area.id)}
                  className="absolute top-[8%] z-10 h-[95%] bg-white/5 transition hover:bg-white/15"
                  style={{ left: area.left, width: area.width }}
                >
                  <span className="rounded-lg bg-slate-900/65 px-2 py-1 text-xs font-bold text-white">
                    {area.label}
                  </span>
                </button>
              ))
            : null}

          {isShelfFocused
            ? activeShelfSlots.map((slot, slotIndex) => {
                const snack = slot.snack;
                if (!snack) {
                  return (
                    <article
                      key={`empty-${selectedArea ?? "none"}-${slotIndex}`}
                      className="absolute select-none"
                      style={{
                        top: slot.layout.top,
                        left: slot.layout.left,
                        width: slot.layout.width,
                      }}
                    >
                      <div className="rounded-xl bg-white/55 p-2 shadow-lg backdrop-blur-sm">
                        <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/80 text-center text-xs font-bold text-slate-500">
                          しょうひんなし
                        </div>
                        <div className="mt-2 rounded-lg bg-slate-100 px-2 py-1 text-center text-xs font-black text-slate-500">
                          ---
                        </div>
                      </div>
                    </article>
                  );
                }
                const isBroken = imageErrorMap[snack.id];
                return (
                  <article
                    key={snack.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "copy";
                      e.dataTransfer.setData("text/plain", snack.id);
                      e.dataTransfer.setData(SNACK_DRAG_TYPE, snack.id);
                      setDraggingSnackId(snack.id);
                      setPointerDragPreview(null);
                    }}
                    onDragEnd={() => {
                      setDraggingSnackId(null);
                      setPointerDraggingSnackId(null);
                      setBasketActive(false);
                      setPointerDragPreview(null);
                    }}
                    onPointerDown={(e) => {
                      if (e.pointerType === "mouse") return;
                      e.preventDefault();
                      e.currentTarget.setPointerCapture(e.pointerId);
                      setPointerDraggingSnackId(snack.id);
                      setBasketActive(isInsideBasketDrop(e.clientX, e.clientY));
                      setPointerDragPreview({
                        snackId: snack.id,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onPointerMove={(e) => {
                      if (e.pointerType === "mouse") return;
                      if (!pointerDraggingSnackId) return;
                      setBasketActive(isInsideBasketDrop(e.clientX, e.clientY));
                      setPointerDragPreview((prev) =>
                        prev
                          ? { ...prev, x: e.clientX, y: e.clientY }
                          : { snackId: snack.id, x: e.clientX, y: e.clientY },
                      );
                    }}
                    onPointerUp={(e) => {
                      if (e.pointerType === "mouse") return;
                      if (
                        pointerDraggingSnackId &&
                        isInsideBasketDrop(e.clientX, e.clientY)
                      ) {
                        addSnack(pointerDraggingSnackId);
                      }
                      setPointerDraggingSnackId(null);
                      setBasketActive(false);
                      setPointerDragPreview(null);
                      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                        e.currentTarget.releasePointerCapture(e.pointerId);
                      }
                    }}
                    onPointerCancel={(e) => {
                      if (e.pointerType === "mouse") return;
                      setPointerDraggingSnackId(null);
                      setBasketActive(false);
                      setPointerDragPreview(null);
                      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                        e.currentTarget.releasePointerCapture(e.pointerId);
                      }
                    }}
                    className={`absolute cursor-grab select-none transition ${activeDraggingSnackId === snack.id ? "scale-105 opacity-80" : "opacity-100"}`}
                    style={{
                      top: slot.layout.top,
                      left: slot.layout.left,
                      width: slot.layout.width,
                      touchAction: "none",
                    }}
                  >
                    <div className="rounded-xl bg-white/60 p-2 shadow-lg backdrop-blur-sm">
                      {isBroken ? (
                        <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/80 text-center text-xs font-bold text-slate-500">
                          がぞう
                        </div>
                      ) : (
                        <div className="h-36 w-full rounded-lg bg-white/80 p-1">
                          <img
                            src={snack.image}
                            alt={snack.name}
                            onError={() =>
                              setImageErrorMap((prev) => ({
                                ...prev,
                                [snack.id]: true,
                              }))
                            }
                            className="h-full w-full rounded-lg object-contain shadow-sm"
                          />
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-amber-100 px-2 py-1 text-xs font-black text-amber-900">
                        <span className="min-w-0 flex-1 break-words leading-tight">
                          {snack.name}
                        </span>
                        <span className="shrink-0 whitespace-nowrap">
                          {snack.price}えん
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })
            : null}

          {isShelfFocused ? (
            <section className="absolute right-3 top-[8%] z-10 grid w-[min(92vw,266px)] grid-rows-[auto_1fr_auto] rounded-2xl border border-white/45 bg-white/70 p-3 shadow-xl backdrop-blur-sm">
              <div className="rounded-xl bg-white/85 px-3 py-2 text-sm font-bold text-slate-700">
                かご
              </div>
              <div className="mt-2 min-h-[170px] max-h-[300px] overflow-y-auto">
                <CartList cart={cart} onRemove={removeSnack} />
              </div>
              <div className="mt-2 grid gap-2">
                <button
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-base font-black text-white hover:bg-emerald-700"
                  onClick={doCheckout}
                >
                  おかいけい
                </button>
                <button
                  className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={clearCart}
                >
                  かごを からにする
                </button>
              </div>
            </section>
          ) : null}

          {isShelfFocused ? (
            <div
              ref={basketDropRef}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
                setBasketActive(true);
              }}
              onDragLeave={() => setBasketActive(false)}
              onDrop={handleDropToBasket}
              className={`pointer-events-auto absolute bottom-[-4.5rem] left-1/2 z-30 -translate-x-1/2 transition-all duration-300 ${showBasketDrop ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"}`}
            >
              <div className="text-center text-xs font-bold text-white drop-shadow-md">
                ここに おとして ついか
              </div>
              {basketImageError ? (
                <div
                  className={`mt-1 flex h-32 w-52 items-center justify-center rounded-xl border-2 border-dashed bg-white/85 text-xs font-bold text-slate-600 ${basketActive ? "border-sky-400" : "border-slate-300"}`}
                >
                  かごがぞう
                </div>
              ) : (
                <img
                  src={basketImage}
                  alt="かご"
                  onError={() => setBasketImageError(true)}
                  className={`mt-1 h-32 w-auto select-none drop-shadow-2xl transition-transform duration-200 ${basketActive ? "scale-105" : "scale-100"}`}
                />
              )}
            </div>
          ) : null}
          {pointerDragPreview ? (
            <div
              className="pointer-events-none fixed z-[70] -translate-x-1/2 -translate-y-1/2"
              style={{ left: pointerDragPreview.x, top: pointerDragPreview.y }}
              aria-hidden
            >
              {snackById[pointerDragPreview.snackId]?.image ? (
                <img
                  src={snackById[pointerDragPreview.snackId].image}
                  alt=""
                  className="h-20 w-20 rounded-lg object-contain drop-shadow-xl"
                />
              ) : (
                <div className="rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-slate-700 shadow">
                  {snackById[pointerDragPreview.snackId]?.name ?? "おかし"}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {!isShelfFocused ? (
          <div className="pointer-events-none absolute bottom-3 left-20 z-20 flex items-start gap-2">
            <div className="relative max-w-[24rem] rounded-[1.5rem] border-2 border-amber-200 bg-gradient-to-b from-white to-amber-50/95 px-5 py-4 text-sm font-bold leading-relaxed text-slate-700 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
              <div className="whitespace-pre-line">
                300えんを こえないように おかしをえらぼう！
              </div>
              <div className="absolute bottom-3 -right-3 h-5 w-5 rounded-full border-2 border-amber-200 bg-white/95" />
              <div className="absolute bottom-0 -right-6 h-3 w-3 rounded-full border-2 border-amber-200 bg-white/95" />
            </div>
            <img
              src={snackMascot}
              alt="おかしマスコット"
              className="h-40 w-auto drop-shadow-2xl"
            />
          </div>
        ) : null}
      </div>
    </SceneFrame>
  );
}
