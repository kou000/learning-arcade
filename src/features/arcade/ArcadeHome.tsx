import React from "react";
import arkNormal from "@/assets/ark_normal.png";
import arkSuccess from "@/assets/ark_success.png";

type Props = { onStartSoroban: () => void };

export function ArcadeHome({ onStartSoroban }: Props) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e7f6ff_0%,_#f4fbff_45%,_#fff6e6_100%)] px-4 pb-20 pt-12">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white/80 p-8 shadow-[0_22px_60px_-28px_rgba(15,23,42,0.55)] backdrop-blur">
          <div className="absolute -top-16 -right-20 h-56 w-56 rounded-full bg-amber-200/40 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sky-200/50 blur-2xl" />

          <header className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <img
              src={arkNormal}
              alt="アーク"
              width={210}
              height={210}
              draggable={false}
              className="select-none drop-shadow"
            />
            <div className="flex-1">
              <h1 className="text-6xl font-black tracking-tight text-slate-800 sm:text-7xl font-[var(--pop-font)]">
                Learning Arcade
              </h1>
              <p className="mt-3 text-xl text-slate-600">
                ちいさな まなびゲームで あそびながら まなぼう！
              </p>
            </div>
          </header>

          <main className="relative mt-8 rounded-[30px] border border-slate-200 bg-white/90 p-6 shadow-inner">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">✨</span>
                  <h2 className="text-4xl font-black text-slate-800">そろばん（珠算）</h2>
                </div>
                <p className="mt-2 text-lg text-slate-600">
                  そろばんのけいさんを れんしゅうしよう！
                </p>
              </div>
              <div className="hidden sm:flex h-36 w-44 items-center justify-center rounded-2xl bg-amber-50 shadow-sm">
                <img
                  src={arkSuccess}
                  alt="そろばん"
                  width={148}
                  height={98}
                  draggable={false}
                  className="select-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={onStartSoroban}
                className="w-full rounded-2xl bg-gradient-to-b from-sky-400 to-sky-600 px-6 py-6 text-3xl font-black text-white shadow-[0_12px_0_rgba(14,116,144,0.25)] transition active:translate-y-0.5 active:shadow-[0_7px_0_rgba(14,116,144,0.25)]"
              >
                はじめる
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
