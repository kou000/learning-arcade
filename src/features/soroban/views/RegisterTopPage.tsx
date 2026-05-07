import React from "react";
import registerGameTop from "@/assets/register-game-top.png";
import { KEIMARUKUN_CARDS } from "@/features/soroban/cardCatalog";
import { SHOP_ITEMS } from "@/features/soroban/catalog";
import { CoinValue } from "@/features/soroban/components/CoinValue";
import { getActiveRegisterCampaigns } from "@/features/soroban/registerCampaigns";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import * as sorobanState from "@/features/soroban/state";
import { STICKERS } from "@/features/soroban/stickerCatalog";

type Props = {
  onGoPractice: () => void;
  onGoRegisterStage: () => void;
  onGoShop: () => void;
  onGoShelf: () => void;
  onGoGacha: () => void;
  onGoCards: () => void;
  onGoStickers: () => void;
  onGoProblemLog: () => void;
  onGoSnack: () => void;
  onGoSnackBadges: () => void;
};

function getBuildLabel(): string {
  return typeof __APP_BUILD_LABEL__ === "string" && __APP_BUILD_LABEL__.length > 0
    ? __APP_BUILD_LABEL__
    : "dev";
}

export function RegisterTopPage({
  onGoPractice,
  onGoRegisterStage,
  onGoShop,
  onGoShelf,
  onGoGacha,
  onGoCards,
  onGoStickers,
  onGoProblemLog,
  onGoSnack,
  onGoSnackBadges,
}: Props) {
  const buildLabel = getBuildLabel();
  const progress = sorobanState.loadRegisterProgress();
  const shopLastOpenedOn = (() => {
    const maybeLoader = (sorobanState as Record<string, unknown>)
      .loadShopLastOpenedOn;
    if (typeof maybeLoader === "function") {
      return (maybeLoader as () => string | null)();
    }
    return null;
  })();
  const gachaLastOpenedOn = (() => {
    const maybeLoader = (sorobanState as Record<string, unknown>)
      .loadGachaLastOpenedOn;
    if (typeof maybeLoader === "function") {
      return (maybeLoader as () => string | null)();
    }
    return null;
  })();
  const hasNewShopItems = SHOP_ITEMS.some(
    (item) =>
      item.addedOn != null &&
      shopLastOpenedOn != null &&
      item.addedOn > shopLastOpenedOn,
  );
  const hasNewGachaItems =
    gachaLastOpenedOn != null &&
    [...KEIMARUKUN_CARDS, ...STICKERS].some(
      (item) => item.addedOn > gachaLastOpenedOn,
    );
  const activeCampaign = getActiveRegisterCampaigns()[0] ?? null;

  return (
    <SceneFrame
      backgroundImage={registerGameTop}
      fullscreenBackground
      outsideTopLeft={
        <button
          className="rounded-xl bg-transparent px-4 py-3 text-base font-semibold text-white hover:bg-white/10"
          onClick={onGoPractice}
        >
          ← トップへもどる
        </button>
      }
    >
      <div
        className="relative h-full text-lg"
        style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}
      >
        <div className="absolute right-4 top-4">
          <div className="rounded-xl bg-black/35 px-4 py-2 text-base font-bold text-white backdrop-blur-sm">
            <span className="inline-flex items-center gap-1">
              <span>てもちコイン:</span>
              <CoinValue amount={progress.coins} amountClassName="font-bold" unitClassName="font-bold" />
            </span>
          </div>
        </div>

        <div className="absolute bottom-72 right-3 rounded-md bg-black/25 px-2 py-1 text-[10px] font-semibold tracking-wide text-white/90 backdrop-blur-sm">
          hash {buildLabel}
        </div>

        <div className="absolute inset-x-0 bottom-8 px-3">
          {activeCampaign ? (
            <div className="mb-3 flex justify-center">
              <div className="relative rounded-2xl border-2 border-rose-200 bg-white/95 px-5 py-3 text-center text-base font-black text-rose-700 shadow-lg backdrop-blur-sm">
                <div className="text-lg leading-tight">
                  {activeCampaign.title}
                </div>
                <div className="mt-1 text-sm leading-tight text-amber-700">
                  {activeCampaign.description}
                </div>
                <span
                  className="absolute left-1/2 top-full h-4 w-4 -translate-x-1/2 -translate-y-2 rotate-45 border-b-2 border-r-2 border-rose-200 bg-white/95"
                  aria-hidden
                />
              </div>
            </div>
          ) : null}
          <div className="mb-2 flex justify-center">
            <button
              className="rounded-2xl bg-sky-600 px-8 py-4 text-lg font-bold text-white transition hover:bg-sky-700"
              onClick={onGoRegisterStage}
            >
              レジゲームスタート
            </button>
          </div>
          <div className="mx-auto mt-2 grid max-w-3xl grid-cols-3 gap-2 rounded-2xl bg-transparent px-3 shadow-sm">
            <button
              className="relative rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onGoShop}
            >
              ショップ
              {hasNewShopItems ? (
                <span className="absolute -right-2 -top-2 inline-flex items-center rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black tracking-wide text-white">
                  NEW
                </span>
              ) : null}
            </button>
            <button
              className="relative rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onGoGacha}
            >
              ガチャガチャ
              {hasNewGachaItems ? (
                <span className="absolute -right-2 -top-2 inline-flex items-center rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black tracking-wide text-white">
                  NEW
                </span>
              ) : null}
            </button>
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onGoSnack}
            >
              あんざんゲーム
            </button>
          </div>
          <div className="mt-2 grid gap-2 rounded-2xl bg-transparent px-3 shadow-sm sm:grid-cols-5">
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onGoShelf}
            >
              たな
            </button>
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onGoCards}
            >
              カードずかん
            </button>
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onGoStickers}
            >
              シールちょう
            </button>
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onGoSnackBadges}
            >
              バッジずかん
            </button>
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onGoProblemLog}
            >
              がんばりログ
            </button>
          </div>
        </div>
      </div>
    </SceneFrame>
  );
}
