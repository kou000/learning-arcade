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

function ShelfItemImage({ src, alt }: { src: string; alt: string }) {
  const [missing, setMissing] = useState(false);

  if (missing) {
    return (
      <div className="h-12 w-12 rounded-lg border border-dashed border-slate-300 bg-slate-100" />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setMissing(true)}
      className="h-12 w-12 rounded-lg border border-slate-200 bg-white object-contain p-1"
    />
  );
}

function rowExpansionCost(rows: number): number {
  return 150 + Math.max(0, rows - 2) * 100;
}

function colExpansionCost(cols: number): number {
  return 180 + Math.max(0, cols - 4) * 120;
}

export function ShelfPage({
  onGoPractice,
  onGoRegister,
  onGoShop,
  onGoShelf,
}: Props) {
  const [progress, setProgress] = useState(() => loadRegisterProgress());
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const purchasedItems = useMemo(
    () =>
      SHOP_ITEMS.filter((item) => progress.purchasedItemIds.includes(item.id)),
    [progress.purchasedItemIds],
  );

  const updateProgress = (
    updater: (current: typeof progress) => typeof progress,
  ) => {
    setProgress((prev) => {
      const draft = updater(prev);
      return saveRegisterProgress(draft);
    });
  };

  const onSlotClick = (idx: number) => {
    updateProgress((prev) => {
      const slots = [...prev.shelfSlots];
      if (selectedItemId) {
        for (let i = 0; i < slots.length; i++) {
          if (slots[i] === selectedItemId) slots[i] = null;
        }
        slots[idx] = slots[idx] === selectedItemId ? null : selectedItemId;
      } else if (slots[idx]) {
        slots[idx] = null;
      }
      return { ...prev, shelfSlots: slots };
    });
  };

  const expandRows = () => {
    const cost = rowExpansionCost(progress.shelfRows);
    if (progress.coins < cost) {
      setMessage("コインが足りません");
      return;
    }
    updateProgress((prev) => {
      const nextRows = prev.shelfRows + 1;
      const nextSlots = [
        ...prev.shelfSlots,
        ...Array.from({ length: prev.shelfCols }, () => null),
      ];
      return {
        ...prev,
        coins: prev.coins - cost,
        shelfRows: nextRows,
        shelfSlots: nextSlots,
      };
    });
    setMessage(`棚を1段ふやしました（-${cost}コイン）`);
  };

  const expandCols = () => {
    const cost = colExpansionCost(progress.shelfCols);
    if (progress.coins < cost) {
      setMessage("コインが足りません");
      return;
    }
    updateProgress((prev) => {
      const nextCols = prev.shelfCols + 1;
      const nextSlots: Array<string | null> = [];
      for (let row = 0; row < prev.shelfRows; row++) {
        const offset = row * prev.shelfCols;
        nextSlots.push(
          ...prev.shelfSlots.slice(offset, offset + prev.shelfCols),
        );
        nextSlots.push(null);
      }
      return {
        ...prev,
        coins: prev.coins - cost,
        shelfCols: nextCols,
        shelfSlots: nextSlots,
      };
    });
    setMessage(`棚を1列ふやしました（-${cost}コイン）`);
  };

  return (
    <SceneFrame
      backgroundImage="/assets/shelf-bg.png"
      fullscreenBackground
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
          current="shelf"
          onGoRegister={onGoRegister}
          onGoShop={onGoShop}
          onGoShelf={onGoShelf}
        />

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            所持コイン: <span className="font-bold">{progress.coins}</span>
          </div>
          <button
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
            onClick={expandRows}
          >
            行をふやす（{rowExpansionCost(progress.shelfRows)}）
          </button>
          <button
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
            onClick={expandCols}
          >
            列をふやす（{colExpansionCost(progress.shelfCols)}）
          </button>
        </div>

        <div className="grid min-h-0 gap-3 lg:grid-cols-[280px_1fr]">
          <div className="overflow-auto rounded-2xl border border-slate-200 bg-white/92 p-3 shadow-sm">
            <div className="text-sm font-bold text-slate-700">
              購入済みグッズ
            </div>
            <div className="mt-2 grid gap-2">
              {purchasedItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-600">
                  まだグッズがありません。ショップで購入してください。
                </div>
              ) : null}
              {purchasedItems.map((item) => (
                <button
                  key={item.id}
                  className={`flex items-center gap-2 rounded-xl border px-2 py-2 text-left text-sm ${
                    selectedItemId === item.id
                      ? "border-sky-300 bg-sky-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                  onClick={() =>
                    setSelectedItemId((prev) =>
                      prev === item.id ? null : item.id,
                    )
                  }
                >
                  <ShelfItemImage src={item.image} alt={item.name} />
                  <span className="font-semibold text-slate-700">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-auto rounded-2xl border border-slate-200 bg-white/92 p-4 shadow-sm">
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${progress.shelfCols}, minmax(88px, 1fr))`,
              }}
            >
              {progress.shelfSlots.map((itemId, idx) => {
                const item = SHOP_ITEMS.find((x) => x.id === itemId);
                return (
                  <button
                    key={idx}
                    className={`flex aspect-square items-center justify-center rounded-xl border transition ${
                      item
                        ? "border-slate-300 bg-slate-50 hover:bg-slate-100"
                        : "border-dashed border-slate-300 bg-white hover:bg-slate-50"
                    }`}
                    onClick={() => onSlotClick(idx)}
                  >
                    {item ? (
                      <div className="grid place-items-center gap-1 p-1">
                        <ShelfItemImage src={item.image} alt={item.name} />
                        <div className="text-[11px] text-slate-600">
                          {item.name}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">empty</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {message ? (
          <div className="rounded-xl border border-slate-200 bg-white/92 px-3 py-2 text-sm text-slate-700">
            {message}
          </div>
        ) : null}
      </div>
    </SceneFrame>
  );
}
