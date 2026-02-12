import React, { useEffect, useMemo, useState } from "react";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import { SHOP_ITEMS } from "@/features/soroban/catalog";
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

function ShelfItemImage({
  src,
  alt,
  size = "picker",
}: {
  src: string;
  alt: string;
  size?: "picker" | "slot";
}) {
  const [missing, setMissing] = useState(false);
  const sizeClass =
    size === "slot"
      ? "h-[clamp(90px,14vw,150px)] w-[clamp(90px,14vw,150px)]"
      : "h-12 w-12";

  if (missing) {
    return (
      <div
        className={`${sizeClass} rounded-lg border border-dashed border-white/70 bg-white/50`}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setMissing(true)}
      className={`${sizeClass} object-contain drop-shadow-[0_6px_8px_rgba(15,23,42,0.45)]`}
    />
  );
}

export function ShelfPage({
  onGoPractice: _onGoPractice,
  onGoRegister,
  onGoShop: _onGoShop,
  onGoShelf: _onGoShelf,
}: Props) {
  const [progress, setProgress] = useState(() => loadRegisterProgress());
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const purchasedItems = useMemo(
    () =>
      SHOP_ITEMS.filter(
        (item) =>
          progress.purchasedItemIds.includes(item.id) && item.placeable !== false,
      ),
    [progress.purchasedItemIds],
  );
  const shelfCols = Math.max(1, progress.shelfCols);
  const slotCount = shelfCols * SHELF_ROWS;
  const shelfSlots = useMemo(
    () =>
      Array.from(
        { length: slotCount },
        (_, idx) => progress.shelfSlots[idx] ?? null,
      ),
    [progress.shelfSlots, slotCount],
  );

  useEffect(() => {
    if (
      progress.shelfRows === SHELF_ROWS &&
      progress.shelfSlots.length === slotCount
    )
      return;
    setProgress((prev) =>
      saveRegisterProgress({
        ...prev,
        shelfRows: SHELF_ROWS,
        shelfSlots: Array.from(
          { length: prev.shelfCols * SHELF_ROWS },
          (_, idx) => prev.shelfSlots[idx] ?? null,
        ),
      }),
    );
  }, [progress, slotCount]);

  const saveProgress = (
    updater: (current: typeof progress) => typeof progress,
  ) => {
    setProgress((prev) => saveRegisterProgress(updater(prev)));
  };

  const closePicker = () => {
    setIsPickerOpen(false);
  };

  const placeOrRemoveAt = (slotIndex: number, itemId: string) => {
    saveProgress((prev) => {
      const slots = Array.from(
        { length: prev.shelfCols * SHELF_ROWS },
        (_, idx) => prev.shelfSlots[idx] ?? null,
      );
      const isSameItemAtSlot = slots[slotIndex] === itemId;

      if (isSameItemAtSlot) {
        slots[slotIndex] = null;
        return { ...prev, shelfRows: SHELF_ROWS, shelfSlots: slots };
      }

      for (let i = 0; i < slots.length; i++) {
        if (slots[i] === itemId) slots[i] = null;
      }
      slots[slotIndex] = itemId;
      return { ...prev, shelfRows: SHELF_ROWS, shelfSlots: slots };
    });
  };

  const openPicker = () => {
    setIsPickerOpen(true);
  };

  const onSlotClick = (slotIndex: number) => {
    const rowIndex = Math.floor(slotIndex / shelfCols);
    const topUnlocked = progress.purchasedItemIds.includes(UPPER_ROW_UNLOCK_ID);
    const bottomUnlocked = progress.purchasedItemIds.includes(
      LOWER_ROW_UNLOCK_ID,
    );
    const isUnlocked =
      rowIndex === 1 || (rowIndex === 0 && topUnlocked) || (rowIndex === 2 && bottomUnlocked);
    if (!isUnlocked) return;

    if (selectedItemId) {
      placeOrRemoveAt(slotIndex, selectedItemId);
      return;
    }
    openPicker();
  };

  const onPickItem = (itemId: string) => {
    setSelectedItemId(itemId);
    closePicker();
  };

  const clearSelection = () => {
    setSelectedItemId(null);
  };
  const isRowUnlocked = (rowIndex: number) => {
    const topUnlocked = progress.purchasedItemIds.includes(UPPER_ROW_UNLOCK_ID);
    const bottomUnlocked = progress.purchasedItemIds.includes(
      LOWER_ROW_UNLOCK_ID,
    );
    return (
      rowIndex === 1 || (rowIndex === 0 && topUnlocked) || (rowIndex === 2 && bottomUnlocked)
    );
  };

  return (
    <SceneFrame
      backgroundImage="/assets/shelf.png"
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
        <div className="absolute left-1/2 top-[7%] z-10 w-[92%] -translate-x-1/2 sm:w-[86%] md:w-[80%]">
          <div className="grid gap-y-2">
            {Array.from({ length: SHELF_ROWS }, (_, rowIndex) => {
              const rowUnlocked = isRowUnlocked(rowIndex);
              return (
                <div key={rowIndex} className="relative rounded-2xl">
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${shelfCols}, minmax(96px, 1fr))`,
                      columnGap: "0.75rem",
                    }}
                  >
                    {Array.from({ length: shelfCols }, (_, colIndex) => {
                      const idx = rowIndex * shelfCols + colIndex;
                      const itemId = shelfSlots[idx];
                      const item = SHOP_ITEMS.find((x) => x.id === itemId);
                      const isSelectedItem = Boolean(
                        rowUnlocked && selectedItemId && itemId === selectedItemId,
                      );

                      return (
                        <button
                          key={idx}
                          className={`flex aspect-square items-center justify-center rounded-xl border transition ${
                            !rowUnlocked
                              ? "border-white/35 bg-transparent"
                              : isSelectedItem
                                ? "border-sky-200 bg-sky-100/35"
                                : item
                                  ? "border-transparent bg-transparent hover:border-white/40"
                                  : "border-dashed border-white/20 bg-transparent hover:border-white/55"
                          }`}
                          onClick={() => onSlotClick(idx)}
                        >
                          {item && rowUnlocked ? (
                            <div className="grid place-items-center gap-1 p-1">
                              <ShelfItemImage
                                src={item.image}
                                alt={item.name}
                                size="slot"
                              />
                              <div className="text-[10px] leading-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.65)]">
                                {item.name}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-white/50">　</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {!rowUnlocked ? (
                    <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-slate-900/45 pb-[20px] text-sm font-bold text-white">
                      みかいほう
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-[24px] left-1/2 z-10 -translate-x-1/2">
          <button
            className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
              selectedItemId
                ? "bg-white text-slate-800 hover:bg-slate-100"
                : "cursor-not-allowed bg-white/60 text-slate-500"
            }`}
            onClick={clearSelection}
            disabled={!selectedItemId}
          >
            せんたくを かいじょ
          </button>
        </div>
      </div>

      {isPickerOpen ? (
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
                        selectedItemId === item.id
                          ? "border-sky-300 bg-sky-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                      onClick={() => onPickItem(item.id)}
                    >
                      <ShelfItemImage src={item.image} alt={item.name} />
                      <span className="font-semibold text-slate-700">
                        {item.name}
                      </span>
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
