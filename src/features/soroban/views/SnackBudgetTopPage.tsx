import React from "react";
import snackGameTop from "@/assets/snack-game-top.png";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";

type Props = {
  onGoRegister: () => void;
  onGoSnackPlay: () => void;
};

export function SnackBudgetTopPage({ onGoRegister, onGoSnackPlay }: Props) {
  return (
    <SceneFrame
      backgroundImage={snackGameTop}
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
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button
            className="rounded-2xl bg-emerald-600 px-8 py-4 text-xl font-black text-white shadow-lg hover:bg-emerald-700"
            onClick={onGoSnackPlay}
          >
            ゲームスタート
          </button>
        </div>
      </div>
    </SceneFrame>
  );
}
