import React, { useState } from "react";

type ModeNavProps = {
  current: "test" | "one-by-one" | "game";
  onGoTest: () => void;
  onGoPractice: () => void;
  onGoGame: () => void;
};

export function SorobanModeNav({
  current,
  onGoTest,
  onGoPractice,
  onGoGame,
}: ModeNavProps) {
  const tabs: Array<{
    key: ModeNavProps["current"];
    label: string;
    onClick: () => void;
  }> = [
    { key: "test", label: "テストモード", onClick: onGoTest },
    { key: "one-by-one", label: "れんしゅうモード", onClick: onGoPractice },
    { key: "game", label: "ゲームモード", onClick: onGoGame },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
            current === tab.key
              ? "bg-sky-600 text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
          onClick={tab.onClick}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

type NavProps = {
  current: "register" | "shop" | "shelf";
  onGoRegister: () => void;
  onGoShop: () => void;
  onGoShelf: () => void;
};

export function SorobanSubnav({
  current,
  onGoRegister,
  onGoShop,
  onGoShelf,
}: NavProps) {
  const tabs: Array<{
    key: NavProps["current"];
    label: string;
    onClick: () => void;
  }> = [
    { key: "register", label: "レジゲーム", onClick: onGoRegister },
    { key: "shop", label: "ショップ", onClick: onGoShop },
    { key: "shelf", label: "たな", onClick: onGoShelf },
  ];

  return (
    <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm sm:grid-cols-3">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
            current === tab.key
              ? "bg-sky-600 text-white"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
          onClick={tab.onClick}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

type FrameProps = {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  outsideTopLeft?: React.ReactNode;
  children: React.ReactNode;
};

export function SceneFrame({
  title,
  subtitle,
  backgroundImage,
  outsideTopLeft,
  children,
}: FrameProps) {
  const [hasImageError, setHasImageError] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e7f6ff_0%,_#f4fbff_45%,_#fff6e6_100%)] px-4 pb-16 pt-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 text-center">
          <h1 className="text-4xl font-black text-slate-800 font-[var(--pop-font)]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>

        {outsideTopLeft ? <div className="mb-2">{outsideTopLeft}</div> : null}

        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.7)]">
          {backgroundImage ? (
            <>
              {!hasImageError ? (
                <img
                  src={backgroundImage}
                  alt="background"
                  onError={() => setHasImageError(true)}
                  className="h-auto w-full object-cover"
                />
              ) : (
                <div className="h-[520px] w-full bg-[linear-gradient(140deg,#fef3c7_0%,#dbeafe_55%,#e2e8f0_100%)]" />
              )}

              {hasImageError ? (
                <div className="absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600">
                  背景画像なし（/public/assets/... を配置すると反映されます）
                </div>
              ) : null}

              <div className="absolute inset-0 bg-slate-900/10" />
              <div className="absolute inset-0 p-4 sm:p-6">{children}</div>
            </>
          ) : (
            <div className="bg-white/95 p-4 sm:p-6">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
