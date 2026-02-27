import React from "react";
import snackGameTop from "@/assets/snack-game-top.png";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";

type Props = {
  onGoRegister: () => void;
  onGoSnackPlay: (difficulty: "easy" | "normal" | "hard") => void;
};

export function SnackBudgetTopPage({ onGoRegister, onGoSnackPlay }: Props) {
  const [difficulty, setDifficulty] = React.useState<"easy" | "normal" | "hard">("easy");

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
          <div className="mb-3 rounded-2xl bg-white/85 p-3 shadow-md backdrop-blur-sm">
            <div className="mb-2 text-center text-sm font-black text-slate-700">
              なんいどを えらぼう
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "easy", label: "かんたん" },
                { id: "normal", label: "ふつう" },
                { id: "hard", label: "むずかしい" },
              ].map((mode) => {
                const active = difficulty === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    className={`rounded-xl px-3 py-2 text-sm font-black transition ${
                      active
                        ? "bg-sky-600 text-white shadow"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                    }`}
                    onClick={() =>
                      setDifficulty(mode.id as "easy" | "normal" | "hard")
                    }
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            className="rounded-2xl bg-emerald-600 px-8 py-4 text-xl font-black text-white shadow-lg hover:bg-emerald-700"
            onClick={() => onGoSnackPlay(difficulty)}
          >
            ゲームスタート
          </button>
        </div>
      </div>
    </SceneFrame>
  );
}
