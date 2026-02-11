import React from "react";
import registerGameTop from "../../assets/register-game-top.png";
import { SceneFrame, SorobanSubnav } from "./SceneFrame";
import { loadRegisterProgress } from "./state";

type Props = {
  onGoPractice: () => void;
  onGoRegisterStage: () => void;
  onGoShop: () => void;
  onGoShelf: () => void;
};

export function RegisterTopPage({
  onGoPractice,
  onGoRegisterStage,
  onGoShop,
  onGoShelf,
}: Props) {
  const progress = loadRegisterProgress();

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
        <div className="absolute right-4 top-4 rounded-xl bg-black/35 px-4 py-2 text-base font-bold text-white backdrop-blur-sm">
          てもちコイン: {progress.coins}コイン
        </div>

        <div className="absolute inset-x-0 bottom-2">
          <SorobanSubnav
            current="register"
            onGoRegister={onGoRegisterStage}
            onGoShop={onGoShop}
            onGoShelf={onGoShelf}
            large
          />
        </div>
      </div>
    </SceneFrame>
  );
}
