import React, { useMemo, useRef, useState } from "react";
import sealBookBg from "@/assets/seal-book-bg.png";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import {
  loadRegisterProgress,
  saveRegisterProgress,
  type StickerPlacement,
} from "@/features/soroban/state";
import {
  STICKER_PAGE_COUNT,
  STICKERS,
  getStickerById,
  type StickerItem,
} from "@/features/soroban/stickerCatalog";

type Props = {
  onGoRegister: () => void;
  onGoGacha: () => void;
};

type DragState =
  | {
      source: "palette";
      stickerId: string;
      pointerId: number;
      x: number;
      y: number;
    }
  | {
      source: "placement";
      instanceId: string;
      stickerId: string;
      pointerId: number;
      x: number;
      y: number;
      startX: number;
      startY: number;
      placementX: number;
      placementY: number;
      rotation: number;
    };

const STICKER_SIZE_PX = 136;
const STICKER_ROTATION_STEP = 15;
const DRAG_MOVE_THRESHOLD_PX = 6;

function clampStickerRotation(rotation: number): number {
  return Math.max(-180, Math.min(180, Math.round(rotation)));
}

function countPlacementsBySticker(
  placements: StickerPlacement[],
): Record<string, number> {
  return placements.reduce<Record<string, number>>((acc, placement) => {
    acc[placement.stickerId] = (acc[placement.stickerId] ?? 0) + 1;
    return acc;
  }, {});
}

function makePlacementId(stickerId: string): string {
  return `${stickerId}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function StickerBookPage({ onGoRegister, onGoGacha }: Props) {
  const [progress, setProgress] = useState(() => loadRegisterProgress());
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null,
  );
  const [dragState, setDragState] = useState<DragState | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);

  const placedCountBySticker = useMemo(
    () => countPlacementsBySticker(progress.stickerPlacements),
    [progress.stickerPlacements],
  );
  const pagePlacements = useMemo(
    () =>
      progress.stickerPlacements.filter(
        (placement) => placement.pageIndex === activePageIndex,
      ),
    [activePageIndex, progress.stickerPlacements],
  );
  const ownedKindCount = STICKERS.filter(
    (sticker) => (progress.ownedStickerCounts[sticker.id] ?? 0) > 0,
  ).length;
  const ownedTotalCount = Object.values(progress.ownedStickerCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const selectedPlacement =
    selectedInstanceId == null
      ? null
      : progress.stickerPlacements.find(
          (placement) => placement.instanceId === selectedInstanceId,
        ) ?? null;

  const saveProgress = (
    updater: (current: typeof progress) => typeof progress,
  ) => {
    setProgress((prev) => saveRegisterProgress(updater(prev)));
  };

  const getPagePlacementRect = () => {
    const element = pageRef.current;
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    const borderLeft = Number.parseFloat(styles.borderLeftWidth) || 0;
    const borderRight = Number.parseFloat(styles.borderRightWidth) || 0;
    const borderTop = Number.parseFloat(styles.borderTopWidth) || 0;
    const borderBottom = Number.parseFloat(styles.borderBottomWidth) || 0;
    const left = rect.left + borderLeft;
    const top = rect.top + borderTop;
    const width = rect.width - borderLeft - borderRight;
    const height = rect.height - borderTop - borderBottom;
    return {
      left,
      right: left + width,
      top,
      bottom: top + height,
      width,
      height,
    };
  };

  const pointToPagePosition = (clientX: number, clientY: number) => {
    const rect = getPagePlacementRect();
    if (!rect) return null;
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }
    return {
      x: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      y: Math.max(
        0,
        Math.min(100, ((clientY - rect.top) / rect.height) * 100),
      ),
    };
  };

  const placementDragToPagePosition = (
    state: Extract<DragState, { source: "placement" }>,
    clientX: number,
    clientY: number,
  ) => {
    const rect = getPagePlacementRect();
    if (!rect) return null;
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }
    return {
      x: Math.max(
        0,
        Math.min(
          100,
          state.placementX + ((clientX - state.startX) / rect.width) * 100,
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          100,
          state.placementY + ((clientY - state.startY) / rect.height) * 100,
        ),
      ),
    };
  };

  const placementPagePositionToClient = (
    pagePosition: { x: number; y: number },
  ) => {
    const rect = getPagePlacementRect();
    if (!rect) return null;
    return {
      x: rect.left + (pagePosition.x / 100) * rect.width,
      y: rect.top + (pagePosition.y / 100) * rect.height,
    };
  };

  const startDrag = (
    e: React.PointerEvent<HTMLElement>,
    source:
      | { source: "palette"; stickerId: string }
      | { source: "placement"; stickerId: string; instanceId: string },
  ) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelectedInstanceId(
      source.source === "placement" ? source.instanceId : null,
    );
    if (source.source === "placement") {
      const placement = progress.stickerPlacements.find(
        (currentPlacement) =>
          currentPlacement.instanceId === source.instanceId,
      );
      setDragState({
        ...source,
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        startX: e.clientX,
        startY: e.clientY,
        placementX: placement?.x ?? 0,
        placementY: placement?.y ?? 0,
        rotation: placement?.rotation ?? 0,
      });
      return;
    }
    setDragState({
      ...source,
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const moveDrag = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    setDragState({ ...dragState, x: e.clientX, y: e.clientY });
  };

  const finishDrag = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragState || dragState.pointerId !== e.pointerId) return;
    const pagePosition = pointToPagePosition(e.clientX, e.clientY);
    if (pagePosition) {
      if (dragState.source === "palette") {
        const owned = progress.ownedStickerCounts[dragState.stickerId] ?? 0;
        const placed = placedCountBySticker[dragState.stickerId] ?? 0;
        if (owned > placed) {
          const instanceId = makePlacementId(dragState.stickerId);
          saveProgress((current) => ({
            ...current,
            stickerPlacements: [
              ...current.stickerPlacements,
              {
                instanceId,
                stickerId: dragState.stickerId,
                pageIndex: activePageIndex,
                rotation: 0,
                ...pagePosition,
              },
            ],
          }));
          setSelectedInstanceId(instanceId);
        }
      } else {
        const movedDistance = Math.hypot(
          e.clientX - dragState.startX,
          e.clientY - dragState.startY,
        );
        if (movedDistance < DRAG_MOVE_THRESHOLD_PX) {
          setSelectedInstanceId(dragState.instanceId);
          setDragState(null);
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
          return;
        }
        const nextPagePosition = placementDragToPagePosition(
          dragState,
          e.clientX,
          e.clientY,
        );
        if (!nextPagePosition) {
          setDragState(null);
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
          return;
        }
        saveProgress((current) => ({
          ...current,
          stickerPlacements: current.stickerPlacements.map((placement) =>
            placement.instanceId === dragState.instanceId
              ? {
                  ...placement,
                  pageIndex: activePageIndex,
                  ...nextPagePosition,
                }
              : placement,
          ),
        }));
        setSelectedInstanceId(dragState.instanceId);
      }
    }
    setDragState(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const cancelDrag = (e: React.PointerEvent<HTMLElement>) => {
    if (dragState?.pointerId !== e.pointerId) return;
    setDragState(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const removeSelectedPlacement = () => {
    if (!selectedInstanceId) return;
    saveProgress((current) => ({
      ...current,
      stickerPlacements: current.stickerPlacements.filter(
        (placement) => placement.instanceId !== selectedInstanceId,
      ),
    }));
    setSelectedInstanceId(null);
  };

  const updateSelectedPlacementRotation = (rotation: number) => {
    if (!selectedInstanceId) return;
    const nextRotation = clampStickerRotation(rotation);
    saveProgress((current) => ({
      ...current,
      stickerPlacements: current.stickerPlacements.map((placement) =>
        placement.instanceId === selectedInstanceId
          ? { ...placement, rotation: nextRotation }
          : placement,
      ),
    }));
  };

  const selectedSticker =
    selectedPlacement == null ? null : getStickerById(selectedPlacement.stickerId);
  const dragSticker =
    dragState == null ? null : getStickerById(dragState.stickerId);
  const dragPreviewPosition =
    dragState?.source === "placement"
      ? placementPagePositionToClient(
          placementDragToPagePosition(dragState, dragState.x, dragState.y) ?? {
            x: dragState.placementX,
            y: dragState.placementY,
          },
        ) ?? { x: dragState.x, y: dragState.y }
      : dragState
        ? { x: dragState.x, y: dragState.y }
        : null;

  return (
    <SceneFrame
      backgroundImage={sealBookBg}
      fullscreenBackground
      outsideTopLeft={
        <div className="flex items-center gap-2 px-2">
          <button
            className="rounded-xl bg-transparent px-4 py-3 text-base font-semibold text-white hover:bg-white/10"
            onClick={onGoRegister}
          >
            ← ゲームモードTOP
          </button>
          <button
            className="rounded-xl bg-transparent px-4 py-3 text-base font-semibold text-white hover:bg-white/10"
            onClick={onGoGacha}
          >
            ガチャガチャ
          </button>
        </div>
      }
    >
      <div
        className="relative h-full p-4"
        style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}
      >
        <div className="grid h-full grid-cols-[1fr_18rem] gap-4">
          <section className="grid min-h-0 grid-rows-[auto_1fr_auto] rounded-2xl border border-white/50 bg-white/88 p-4 shadow-xl backdrop-blur-sm">
            <header className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-slate-800">
                  シールちょう
                </h1>
                <div className="mt-1 text-sm font-bold text-slate-600">
                  {ownedKindCount} / {STICKERS.length}しゅるい ・{" "}
                  {ownedTotalCount}まい
                </div>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: STICKER_PAGE_COUNT }, (_, index) => (
                  <button
                    key={index}
                    className={`h-11 w-11 rounded-full text-sm font-black shadow ${
                      activePageIndex === index
                        ? "bg-rose-600 text-white"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                    onClick={() => {
                      setActivePageIndex(index);
                      setSelectedInstanceId(null);
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </header>

            <div className="grid min-h-0 place-items-center py-3">
              <div
                ref={pageRef}
                className="relative h-[520px] w-[720px] overflow-visible rounded-[1.75rem] border-[10px] border-amber-200 bg-[linear-gradient(90deg,rgba(251,191,36,0.18)_1px,transparent_1px),linear-gradient(rgba(251,191,36,0.18)_1px,transparent_1px),linear-gradient(135deg,#fff7ed,#fff,#fef3c7)] bg-[length:48px_48px] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.85),0_18px_40px_rgba(120,53,15,0.28)]"
                onPointerDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  setSelectedInstanceId(null);
                }}
              >
                <div className="pointer-events-none absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-amber-200/60" />
                <div className="pointer-events-none absolute left-5 top-4 rounded-full bg-white/75 px-3 py-1 text-xs font-black text-amber-900">
                  {activePageIndex + 1}ぺーじ
                </div>
                {pagePlacements.map((placement) => {
                  const sticker = getStickerById(placement.stickerId);
                  if (!sticker) return null;
                  const selected = placement.instanceId === selectedInstanceId;
                  const isDraggingPlacement =
                    dragState?.source === "placement" &&
                    dragState.instanceId === placement.instanceId;
                  return (
                    <button
                      key={placement.instanceId}
                      className={`absolute grid place-items-center rounded-full transition ${
                        selected
                          ? "ring-4 ring-sky-300"
                          : "ring-2 ring-transparent hover:ring-white/80"
                      }`}
                      style={{
                        left: `${placement.x}%`,
                        top: `${placement.y}%`,
                        width: STICKER_SIZE_PX,
                        height: STICKER_SIZE_PX,
                        marginLeft: -STICKER_SIZE_PX / 2,
                        marginTop: -STICKER_SIZE_PX / 2,
                        opacity: isDraggingPlacement ? 0 : 1,
                        touchAction: "none",
                      }}
                      onPointerDown={(e) =>
                        startDrag(e, {
                          source: "placement",
                          stickerId: placement.stickerId,
                          instanceId: placement.instanceId,
                        })
                      }
                      onPointerMove={moveDrag}
                      onPointerUp={finishDrag}
                      onPointerCancel={cancelDrag}
                    >
                      <span
                        className="grid h-full w-full place-items-center"
                        style={{
                          transform: `rotate(${placement.rotation}deg)`,
                        }}
                      >
                        <img
                          src={sticker.image}
                          alt={sticker.name}
                          draggable={false}
                          className="h-full w-full select-none rounded-full object-contain drop-shadow-[0_8px_10px_rgba(15,23,42,0.28)]"
                        />
                      </span>
                    </button>
                  );
                })}
                {selectedPlacement && selectedSticker && !dragState ? (
                  <div
                    className="pointer-events-none absolute z-30"
                    style={{
                      left: `${selectedPlacement.x}%`,
                      top: `${selectedPlacement.y}%`,
                      width: STICKER_SIZE_PX,
                      height: STICKER_SIZE_PX,
                      marginLeft: -STICKER_SIZE_PX / 2,
                      marginTop: -STICKER_SIZE_PX / 2,
                    }}
                    aria-label={`${selectedSticker.name}のそうさ`}
                  >
                    <button
                      type="button"
                      className="pointer-events-auto absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-2xl font-black leading-none text-amber-950 shadow-lg ring-2 ring-amber-200 hover:bg-amber-100"
                      style={{
                        left: -12,
                        transform: "translate(-100%, -50%)",
                      }}
                      aria-label="ひだりにまわす"
                      onClick={() =>
                        updateSelectedPlacementRotation(
                          selectedPlacement.rotation - STICKER_ROTATION_STEP,
                        )
                      }
                    >
                      ↶
                    </button>
                    <button
                      type="button"
                      className="pointer-events-auto absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-2xl font-black leading-none text-amber-950 shadow-lg ring-2 ring-amber-200 hover:bg-amber-100"
                      style={{
                        right: -12,
                        transform: "translate(100%, -50%)",
                      }}
                      aria-label="みぎにまわす"
                      onClick={() =>
                        updateSelectedPlacementRotation(
                          selectedPlacement.rotation + STICKER_ROTATION_STEP,
                        )
                      }
                    >
                      ↷
                    </button>
                    <button
                      type="button"
                      className="pointer-events-auto absolute left-1/2 min-w-20 whitespace-nowrap rounded-full bg-rose-600 px-4 py-2 text-sm font-black text-white shadow-lg ring-2 ring-white hover:bg-rose-700"
                      style={{
                        top: STICKER_SIZE_PX + 10,
                        transform: "translateX(-50%)",
                      }}
                      onClick={removeSelectedPlacement}
                    >
                      はがす
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <footer className="flex min-h-[3rem] items-center gap-3 rounded-xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-950">
              {selectedSticker ? (
                <span className="min-w-0 flex-1 truncate">
                  {selectedSticker.name} ・ {selectedSticker.description}
                </span>
              ) : (
                <span>右のシールを ひっぱって はろう</span>
              )}
            </footer>
          </section>

          <aside className="grid min-h-0 grid-rows-[auto_1fr] rounded-2xl border border-white/50 bg-white/90 p-3 shadow-xl backdrop-blur-sm">
            <header className="rounded-xl bg-sky-50 px-3 py-2 text-center text-sm font-black text-sky-800">
              もっているシール
            </header>
            <div className="mt-3 min-h-0 overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2">
                {STICKERS.filter(
                  (sticker) =>
                    (progress.ownedStickerCounts[sticker.id] ?? 0) > 0,
                ).map((sticker) => {
                  const owned = progress.ownedStickerCounts[sticker.id] ?? 0;
                  const placed = placedCountBySticker[sticker.id] ?? 0;
                  const remaining = Math.max(0, owned - placed);
                  const canPlace = remaining > 0;
                  return (
                    <button
                      key={sticker.id}
                      className={`relative grid place-items-center rounded-xl border p-2 text-center transition ${
                        canPlace
                          ? "border-amber-200 bg-amber-50 hover:bg-amber-100"
                          : owned > 0
                            ? "border-slate-200 bg-slate-100 opacity-75"
                            : "border-slate-200 bg-slate-100"
                      }`}
                      disabled={!canPlace}
                      title={sticker.description}
                      style={{ touchAction: "none" }}
                      onPointerDown={(e) => {
                        if (!canPlace) return;
                        startDrag(e, {
                          source: "palette",
                          stickerId: sticker.id,
                        });
                      }}
                      onPointerMove={moveDrag}
                      onPointerUp={finishDrag}
                      onPointerCancel={cancelDrag}
                    >
                      <img
                        src={sticker.image}
                        alt={sticker.name}
                        draggable={false}
                        className="h-20 w-20 select-none rounded-full object-contain drop-shadow"
                      />
                      <span className="mt-1 text-xs font-black leading-tight text-slate-700">
                        {sticker.name}
                      </span>
                      <span className="absolute right-1 top-1 rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-black text-white">
                        {remaining}/{owned}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>

        {dragState && dragSticker ? (
          <div
            className="pointer-events-none fixed z-[80] -translate-x-1/2 -translate-y-1/2"
            style={{
              left: dragPreviewPosition?.x ?? dragState.x,
              top: dragPreviewPosition?.y ?? dragState.y,
            }}
            aria-hidden
          >
            <img
              src={dragSticker.image}
              alt=""
              className="rounded-full object-contain drop-shadow-2xl"
              width={STICKER_SIZE_PX}
              height={STICKER_SIZE_PX}
              style={{
                width: STICKER_SIZE_PX,
                height: STICKER_SIZE_PX,
                transform:
                  dragState.source === "placement"
                    ? `rotate(${dragState.rotation}deg)`
                    : undefined,
              }}
            />
          </div>
        ) : null}
      </div>
    </SceneFrame>
  );
}
