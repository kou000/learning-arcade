import React from "react";
import registerGameTop from "@/assets/register-game-top.png";
import { SHOP_ITEMS } from "@/features/soroban/catalog";
import { CoinValue } from "@/features/soroban/components/CoinValue";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import {
  loadRegisterProgress,
  loadShopLastOpenedOn,
} from "@/features/soroban/state";

type Props = {
  onGoPractice: () => void;
  onGoRegisterStage: () => void;
  onGoShop: () => void;
  onGoShelf: () => void;
  onGoSnack: () => void;
  onGoSnackBadges: () => void;
};

export function RegisterTopPage({
  onGoPractice,
  onGoRegisterStage,
  onGoShop,
  onGoShelf,
  onGoSnack,
  onGoSnackBadges,
}: Props) {
  const progress = loadRegisterProgress();
  const shopLastOpenedOn = loadShopLastOpenedOn();
  const hasNewShopItems = SHOP_ITEMS.some(
    (item) =>
      item.addedOn != null &&
      shopLastOpenedOn != null &&
      item.addedOn > shopLastOpenedOn,
  );

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

        <div className="absolute inset-x-0 bottom-2 px-3">
          <div className="mb-2 flex justify-center">
            <button
              className="rounded-2xl bg-sky-600 px-8 py-4 text-lg font-bold text-white transition hover:bg-sky-700"
              onClick={onGoRegisterStage}
            >
              レジゲームスタート
            </button>
          </div>
          <div className="grid gap-2 rounded-2xl bg-transparent p-3 shadow-sm sm:grid-cols-4">
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
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onGoShelf}
            >
              たな
            </button>
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onGoSnack}
            >
              あんざんゲーム
            </button>
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onGoSnackBadges}
            >
              バッジずかん
            </button>
          </div>
        </div>
      </div>
    </SceneFrame>
  );
}
