import React, { useEffect, useMemo, useState } from "react";
import shelfDefaultBg from "@/assets/shelf.png";
import shelfColorfulBg from "@/assets/shelf-colorful.png";
import shelfFancyBg from "@/assets/shelf-fancy.png";
import { LongPressPreviewImage } from "@/features/soroban/components/LongPressPreviewImage";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import { SHOP_ITEMS } from "@/features/soroban/catalog";
import { SNACK_PLACEABLE_ITEMS } from "@/features/soroban/snackCatalog";
import {
  DEFAULT_SHELF_ID,
  SHELF_DEFINITIONS,
  type ShelfId,
  getUnlockedShelfIds,
} from "@/features/soroban/shelfCatalog";
import { loadRegisterProgress, saveRegisterProgress } from "@/features/soroban/state";

type Props = {
  onGoPractice: () => void;
  onGoRegister: () => void;
  onGoShop: () => void;
  onGoShelf: () => void;
};

const SHELF_ROWS = 3;
const UPPER_ROW_UNLOCK_ID = "shelf-upper-unlock";
const LOWER_ROW_UNLOCK_ID = "shelf-lower-unlock";
const SHELF_ROW_UNLOCK_ITEM_IDS: Record<
  ShelfId,
  { upper: string[]; lower: string[] }
> = {
  "shelf-default": {
    upper: [UPPER_ROW_UNLOCK_ID],
    lower: [LOWER_ROW_UNLOCK_ID],
  },
  "shelf-colorful": {
    upper: ["shelf-colorful-upper-unlock"],
    lower: ["shelf-colorful-lower-unlock"],
  },
  "shelf-fancy": {
    upper: ["shelf-fancy-upper-unlock"],
    lower: ["shelf-fancy-lower-unlock"],
  },
};

const SHELF_BG_BY_ID: Record<ShelfId, string> = {
  "shelf-default": shelfDefaultBg,
  "shelf-colorful": shelfColorfulBg,
  "shelf-fancy": shelfFancyBg,
};

export function ShelfPage({
  onGoPractice: _onGoPractice,
  onGoRegister,
  onGoShop: _onGoShop,
  onGoShelf: _onGoShelf,
}: Props) {
  const [progress, setProgress] = useState(() => loadRegisterProgress());
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const shelfItems = useMemo(() => [...SHOP_ITEMS, ...SNACK_PLACEABLE_ITEMS], []);

  const unlockedShelfIds = useMemo(
    () => getUnlockedShelfIds(progress.purchasedItemIds),
    [progress.purchasedItemIds],
  );
  const activeShelfId = unlockedShelfIds.includes(progress.activeShelfId)
    ? progress.activeShelfId
    : (unlockedShelfIds[0] ?? DEFAULT_SHELF_ID);

  const purchasedItems = useMemo(
    () =>
      shelfItems.filter(
        (item) =>
          progress.purchasedItemIds.includes(item.id) &&
          item.placeable !== false,
      ),
    [progress.purchasedItemIds, shelfItems],
  );
  const placedItemIds = useMemo(() => {
    const ids = new Set<string>();
    SHELF_DEFINITIONS.forEach((shelf) => {
      const slots = progress.shelfLayouts[shelf.id] ?? [];
      slots.forEach((slotItemId) => {
        if (typeof slotItemId === "string" && slotItemId.length > 0) {
          ids.add(slotItemId);
        }
      });
    });
    return ids;
  }, [progress.shelfLayouts]);

  const shelfCols = Math.max(1, progress.shelfCols);
  const slotCount = shelfCols * SHELF_ROWS;
  const shelfSlots = useMemo(
    () =>
      Array.from(
        { length: slotCount },
        (_, idx) =>
          progress.shelfLayouts[activeShelfId]?.[idx] ??
          progress.shelfSlots[idx] ??
          null,
      ),
    [activeShelfId, progress.shelfLayouts, progress.shelfSlots, slotCount],
  );

  useEffect(() => {
    if (
      progress.shelfRows === SHELF_ROWS &&
      progress.shelfSlots.length === slotCount &&
      unlockedShelfIds.includes(progress.activeShelfId)
    ) {
      return;
    }
    setProgress((prev) => {
      const fallbackShelfId = unlockedShelfIds[0] ?? DEFAULT_SHELF_ID;
      const nextActiveShelfId = unlockedShelfIds.includes(prev.activeShelfId)
        ? prev.activeShelfId
        : fallbackShelfId;
      const layout = Array.from(
        { length: prev.shelfCols * SHELF_ROWS },
        (_, idx) => prev.shelfLayouts[nextActiveShelfId]?.[idx] ?? prev.shelfSlots[idx] ?? null,
      );
      return saveRegisterProgress({
        ...prev,
        activeShelfId: nextActiveShelfId,
        shelfRows: SHELF_ROWS,
        shelfSlots: layout,
      });
    });
  }, [progress, slotCount, unlockedShelfIds]);

  const saveProgress = (
    updater: (current: typeof progress) => typeof progress,
  ) => {
    setProgress((prev) => saveRegisterProgress(updater(prev)));
  };

  const closePicker = () => {
    setIsPickerOpen(false);
    setActiveSlotIndex(null);
  };

  const placeAt = (slotIndex: number, itemId: string) => {
    saveProgress((prev) => {
      const totalSlots = prev.shelfCols * SHELF_ROWS;
      const nextLayouts: Partial<Record<ShelfId, Array<string | null>>> = {
        ...prev.shelfLayouts,
      };

      SHELF_DEFINITIONS.forEach((shelf) => {
        const slots = Array.from({ length: totalSlots }, (_, idx) => {
          if (shelf.id === prev.activeShelfId) {
            return prev.shelfLayouts[shelf.id]?.[idx] ?? prev.shelfSlots[idx] ?? null;
          }
          return prev.shelfLayouts[shelf.id]?.[idx] ?? null;
        });
        for (let i = 0; i < slots.length; i++) {
          if (slots[i] === itemId) slots[i] = null;
        }
        nextLayouts[shelf.id] = slots;
      });

      const targetSlots =
        nextLayouts[activeShelfId] ??
        Array.from({ length: totalSlots }, () => null);
      targetSlots[slotIndex] = itemId;
      nextLayouts[activeShelfId] = targetSlots;

      return {
        ...prev,
        shelfRows: SHELF_ROWS,
        shelfSlots: targetSlots,
        shelfLayouts: nextLayouts,
      };
    });
  };

  const removeAt = (slotIndex: number) => {
    saveProgress((prev) => {
      const slots = Array.from(
        { length: prev.shelfCols * SHELF_ROWS },
        (_, idx) =>
          prev.shelfLayouts[activeShelfId]?.[idx] ?? prev.shelfSlots[idx] ?? null,
      );
      slots[slotIndex] = null;
      return {
        ...prev,
        shelfRows: SHELF_ROWS,
        shelfSlots: slots,
        shelfLayouts: {
          ...prev.shelfLayouts,
          [activeShelfId]: slots,
        },
      };
    });
  };

  const onSelectShelf = (shelfId: ShelfId) => {
    if (!unlockedShelfIds.includes(shelfId)) return;
    closePicker();
    setIsEditMode(false);
    saveProgress((prev) => {
      const nextSlots = Array.from(
        { length: prev.shelfCols * SHELF_ROWS },
        (_, idx) => prev.shelfLayouts[shelfId]?.[idx] ?? null,
      );
      return {
        ...prev,
        activeShelfId: shelfId,
        shelfRows: SHELF_ROWS,
        shelfSlots: nextSlots,
      };
    });
  };

  const onSlotClick = (slotIndex: number) => {
    if (!isEditMode) return;
    const rowIndex = Math.floor(slotIndex / shelfCols);
    const unlockIds =
      SHELF_ROW_UNLOCK_ITEM_IDS[activeShelfId] ??
      SHELF_ROW_UNLOCK_ITEM_IDS["shelf-default"];
    const topUnlocked = unlockIds.upper.some((id) =>
      progress.purchasedItemIds.includes(id),
    );
    const bottomUnlocked = unlockIds.lower.some((id) =>
      progress.purchasedItemIds.includes(id),
    );
    const isUnlocked =
      rowIndex === 1 ||
      (rowIndex === 0 && topUnlocked) ||
      (rowIndex === 2 && bottomUnlocked);
    if (!isUnlocked) return;
    setActiveSlotIndex(slotIndex);
    setIsPickerOpen(true);
  };

  const onPickItem = (itemId: string) => {
    if (activeSlotIndex == null) return;
    placeAt(activeSlotIndex, itemId);
    closePicker();
  };

  const onRemoveFromActiveSlot = () => {
    if (activeSlotIndex == null) return;
    removeAt(activeSlotIndex);
    closePicker();
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      closePicker();
      setIsEditMode(false);
      return;
    }
    setIsEditMode(true);
  };

  const activeSlotItemId =
    activeSlotIndex == null ? null : shelfSlots[activeSlotIndex];
  const activeSlotItem =
    activeSlotItemId == null
      ? null
      : (shelfItems.find((item) => item.id === activeSlotItemId) ?? null);

  const isRowUnlocked = (rowIndex: number) => {
    const unlockIds =
      SHELF_ROW_UNLOCK_ITEM_IDS[activeShelfId] ??
      SHELF_ROW_UNLOCK_ITEM_IDS["shelf-default"];
    const topUnlocked = unlockIds.upper.some((id) =>
      progress.purchasedItemIds.includes(id),
    );
    const bottomUnlocked = unlockIds.lower.some((id) =>
      progress.purchasedItemIds.includes(id),
    );
    return (
      rowIndex === 1 ||
      (rowIndex === 0 && topUnlocked) ||
      (rowIndex === 2 && bottomUnlocked)
    );
  };

  const shelfBackgroundImage = SHELF_BG_BY_ID[activeShelfId] ?? shelfDefaultBg;
  const shelfOverlayTopClass =
    activeShelfId === "shelf-fancy" ? "top-[10.5%]" : "top-[9%]";
  const activeShelfIndex = SHELF_DEFINITIONS.findIndex(
    (shelf) => shelf.id === activeShelfId,
  );
  const canMovePrev = activeShelfIndex > 0;
  const canMoveNext = activeShelfIndex >= 0 && activeShelfIndex < SHELF_DEFINITIONS.length - 1;

  const moveShelf = (direction: -1 | 1) => {
    const hasShelfInDirection =
      direction < 0 ? activeShelfIndex > 0 : activeShelfIndex < SHELF_DEFINITIONS.length - 1;
    if (!hasShelfInDirection) return;

    let nextShelf: (typeof SHELF_DEFINITIONS)[number] | undefined;
    for (
      let idx = activeShelfIndex + direction;
      idx >= 0 && idx < SHELF_DEFINITIONS.length;
      idx += direction
    ) {
      const candidate = SHELF_DEFINITIONS[idx];
      if (unlockedShelfIds.includes(candidate.id)) {
        nextShelf = candidate;
        break;
      }
    }

    if (!nextShelf) {
      window.alert("みせで べつのたなを かうと ひらくよ");
      return;
    }
    onSelectShelf(nextShelf.id);
  };

  return (
    <SceneFrame
      backgroundImage={shelfBackgroundImage}
      fullscreenBackground
      outsideTopLeft={
        <button
          className="rounded-xl bg-transparent px-4 py-3 text-base font-semibold text-white hover:bg-white/10"
          onClick={onGoRegister}
        >
          ← ゲームトップへ
        </button>
      }
    >
      <div
        className="relative h-full text-lg"
        style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}
      >
        <button
          className={`absolute left-[2.2%] top-1/2 z-20 -translate-y-1/2 rounded-2xl px-3 py-4 text-3xl font-black leading-none ${
            canMovePrev
              ? "bg-white/85 text-slate-900 hover:bg-white"
              : "cursor-not-allowed bg-white/20 text-white/60"
          }`}
          onClick={() => moveShelf(-1)}
          disabled={!canMovePrev}
          aria-label="まえのたな"
        >
          ←
        </button>

        <button
          className={`absolute right-[2.2%] top-1/2 z-20 -translate-y-1/2 rounded-2xl px-3 py-4 text-3xl font-black leading-none ${
            canMoveNext
              ? "bg-white/85 text-slate-900 hover:bg-white"
              : "cursor-not-allowed bg-white/20 text-white/60"
          }`}
          onClick={() => moveShelf(1)}
          disabled={!canMoveNext}
          aria-label="つぎのたな"
        >
          →
        </button>

        <div
          className={`absolute left-1/2 ${shelfOverlayTopClass} z-10 h-[calc(100vh-80px)] min-h-[640px] max-h-[700px] w-[92%] -translate-x-1/2 -translate-y-[30px] overflow-hidden rounded-3xl sm:w-[86%] md:w-[80%]`}
        >
          <div className="grid content-start gap-y-1">
            {Array.from({ length: SHELF_ROWS }, (_, rowIndex) => {
              const rowUnlocked = isRowUnlocked(rowIndex);
              return (
                <div key={rowIndex} className="relative h-[170px] rounded-2xl">
                  <div
                    className="grid h-full"
                    style={{
                      gridTemplateColumns: `repeat(${shelfCols}, minmax(96px, 1fr))`,
                      columnGap: "0.75rem",
                    }}
                  >
                    {Array.from({ length: shelfCols }, (_, colIndex) => {
                      const idx = rowIndex * shelfCols + colIndex;
                      const itemId = shelfSlots[idx];
                      const item = shelfItems.find((x) => x.id === itemId);
                      const isActiveSlot =
                        isEditMode && isPickerOpen && activeSlotIndex === idx;

                      return (
                        <button
                          key={idx}
                          className={`flex h-full min-h-0 items-center justify-center rounded-xl border transition ${
                            !isEditMode
                              ? "border-transparent bg-transparent"
                              : !rowUnlocked
                                ? "border-white/35 bg-transparent"
                                : isActiveSlot
                                  ? "border-sky-200 bg-sky-100/35"
                                  : item
                                    ? "border-transparent bg-transparent hover:border-white/40"
                                    : "border-dashed border-white/20 bg-transparent hover:border-white/55"
                          }`}
                          onClick={() => onSlotClick(idx)}
                          disabled={!isEditMode}
                        >
                          {item && rowUnlocked ? (
                            <div className="grid place-items-center gap-1 p-1">
                              <LongPressPreviewImage
                                src={item.image}
                                alt={item.name}
                                title={item.name}
                                imageClassName="h-[clamp(90px,14vw,150px)] w-[clamp(90px,14vw,150px)] object-contain drop-shadow-[0_6px_8px_rgba(15,23,42,0.45)]"
                                missingClassName="h-[clamp(90px,14vw,150px)] w-[clamp(90px,14vw,150px)] rounded-lg border border-dashed border-white/70 bg-white/50"
                              />
                              {isEditMode ? (
                                <div className="text-[10px] leading-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.65)]">
                                  {item.name}
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div className="text-xs text-white/50">　</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {!rowUnlocked && isEditMode ? (
                    <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-slate-900/45 pb-[20px] text-sm font-bold text-white">
                      みかいほう
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-center">
            <button
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                isEditMode
                  ? "bg-white text-slate-800 hover:bg-slate-100"
                  : "bg-white/80 text-slate-900 hover:bg-white"
              }`}
              onClick={toggleEditMode}
            >
              {isEditMode ? "へんしゅうをおわる" : "へんしゅう"}
            </button>
          </div>
        </div>
      </div>

      {isEditMode && isPickerOpen ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-lg font-black text-slate-800">
                グッズをえらぶ
              </div>
              <button
                className="ml-auto rounded-lg border border-slate-200 px-3 py-1 text-sm"
                onClick={closePicker}
              >
                とじる
              </button>
            </div>
            {activeSlotItem ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                <span>いまのはいち: {activeSlotItem.name}</span>
                <button
                  className="ml-auto rounded-lg border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                  onClick={onRemoveFromActiveSlot}
                >
                  このばしょから はずす
                </button>
              </div>
            ) : (
              <div className="mt-2 text-sm text-slate-600">
                えらんだグッズを このばしょに おくよ
              </div>
            )}

            <div className="mt-3 max-h-[52vh] overflow-auto">
              {purchasedItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-600">
                  ショップで グッズを かってね
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {purchasedItems.map((item) => (
                    <button
                      key={item.id}
                      className={`flex items-center gap-2 rounded-xl border px-2 py-2 text-left text-sm transition ${
                        activeSlotItemId === item.id
                          ? "border-sky-300 bg-sky-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                      onClick={() => onPickItem(item.id)}
                    >
                      <LongPressPreviewImage
                        src={item.image}
                        alt={item.name}
                        title={item.name}
                        imageClassName="h-12 w-12 object-contain drop-shadow-[0_6px_8px_rgba(15,23,42,0.45)]"
                        missingClassName="h-12 w-12 rounded-lg border border-dashed border-white/70 bg-white/50"
                      />
                      <div className="grid gap-1">
                        <span className="font-semibold text-slate-700">
                          {item.name}
                        </span>
                        {placedItemIds.has(item.id) ? (
                          <span className="inline-flex w-fit rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                            はいちずみ
                          </span>
                        ) : null}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </SceneFrame>
  );
}
