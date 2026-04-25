import React, { useMemo } from "react";
import registerGameTop from "@/assets/register-game-top.png";
import { KEIMARUKUN_CARDS } from "@/features/soroban/cardCatalog";
import { LongPressPreviewImage } from "@/features/soroban/components/LongPressPreviewImage";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import { loadRegisterProgress } from "@/features/soroban/state";

type Props = {
  onGoRegister: () => void;
  onGoGacha: () => void;
};

export function CardBookPage({ onGoRegister, onGoGacha }: Props) {
  const progress = loadRegisterProgress();
  const ownedCardIds = useMemo(
    () => new Set(progress.purchasedItemIds),
    [progress.purchasedItemIds],
  );
  const ownedCount = KEIMARUKUN_CARDS.filter((card) =>
    ownedCardIds.has(card.id),
  ).length;

  return (
    <SceneFrame
      backgroundImage={registerGameTop}
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
        <section className="mx-auto flex h-full max-w-6xl flex-col rounded-2xl border border-white/40 bg-white/90 p-4 shadow-xl backdrop-blur-sm">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-black text-slate-800">
                カードずかん
              </h1>
              <p className="mt-1 text-sm font-bold text-slate-600">
                けいまるくん かーど
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-bold text-sky-700">
                かくとく {ownedCount} / {KEIMARUKUN_CARDS.length}
              </span>
              <button
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-black text-white hover:bg-rose-700"
                onClick={onGoGacha}
              >
                ガチャガチャへ
              </button>
            </div>
          </header>

          <div className="mt-4 grid min-h-0 flex-1 gap-4 overflow-y-auto lg:grid-cols-2">
            {KEIMARUKUN_CARDS.map((card) => {
              const owned = ownedCardIds.has(card.id);
              return (
                <section
                  key={card.id}
                  className={`grid content-start gap-4 rounded-xl border p-4 sm:grid-cols-[13rem_1fr] ${
                    owned
                      ? "border-amber-200 bg-gradient-to-b from-amber-50 to-white"
                      : "border-slate-200 bg-slate-100/80"
                  }`}
                >
                  <div className="grid place-items-center rounded-lg bg-white/75 px-3 py-4">
                    {owned ? (
                      <LongPressPreviewImage
                        src={card.image}
                        alt={card.name}
                        title={card.name}
                        imageClassName="h-72 w-52 rounded-xl object-contain drop-shadow-[0_10px_14px_rgba(15,23,42,0.28)]"
                        missingClassName="grid h-72 w-52 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-500"
                      />
                    ) : (
                      <div className="grid h-72 w-52 place-items-center rounded-xl border-4 border-dashed border-slate-300 bg-gradient-to-br from-slate-200 to-slate-100 text-6xl font-black text-slate-400 shadow-inner">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="self-center">
                    <h2 className="text-xl font-black leading-tight text-slate-800">
                      {owned ? card.name : "みかくとく"}
                    </h2>
                    <p className="mt-3 text-base font-bold leading-relaxed text-slate-600">
                      {owned
                        ? card.description
                        : "ガチャガチャで あつめよう"}
                    </p>
                  </div>
                </section>
              );
            })}
          </div>
        </section>
      </div>
    </SceneFrame>
  );
}
