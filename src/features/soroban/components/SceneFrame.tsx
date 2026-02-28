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
  current: "register" | "shop" | "shelf" | "snack";
  onGoRegister: () => void;
  onGoShop: () => void;
  onGoShelf: () => void;
  onGoSnack?: () => void;
  onGoSnackBadges?: () => void;
  large?: boolean;
};

export function SorobanSubnav({
  current,
  onGoRegister,
  onGoShop,
  onGoShelf,
  onGoSnack,
  onGoSnackBadges,
  large = false,
}: NavProps) {
  const tabs: Array<{
    key: NavProps["current"] | "badges";
    label: string;
    onClick: () => void;
  }> = [
    { key: "register", label: "レジゲーム", onClick: onGoRegister },
    { key: "shop", label: "ショップ", onClick: onGoShop },
    { key: "shelf", label: "たな", onClick: onGoShelf },
    ...(onGoSnack
      ? [{ key: "snack" as const, label: "あんざんゲーム", onClick: onGoSnack }]
      : []),
    ...(onGoSnackBadges
      ? [{ key: "badges" as const, label: "バッジずかん", onClick: onGoSnackBadges }]
      : []),
  ];
  const colsClass = onGoSnackBadges
    ? "sm:grid-cols-5"
    : onGoSnack
      ? "sm:grid-cols-4"
      : "sm:grid-cols-3";

  return (
    <div className={`grid gap-2 rounded-2xl bg-transparent p-3 shadow-sm ${colsClass}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`rounded-xl px-4 py-3 ${large ? "text-base" : "text-sm"} font-semibold transition ${
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
  backgroundImage?: string;
  backgroundImageClassName?: string;
  backgroundImageStyle?: React.CSSProperties;
  fullscreenBackground?: boolean;
  outsideTopLeft?: React.ReactNode;
  children: React.ReactNode;
};

export function SceneFrame({
  backgroundImage,
  backgroundImageClassName,
  backgroundImageStyle,
  fullscreenBackground = false,
  outsideTopLeft,
  children,
}: FrameProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const useFullscreen = fullscreenBackground && Boolean(backgroundImage);
  const fullscreenHeightClass = "h-[calc(100vh-3.5rem)]";

  return (
    <div
      className={`min-h-screen ${useFullscreen ? "bg-slate-900/90 p-0" : "bg-[radial-gradient(circle_at_top,_#e7f6ff_0%,_#f4fbff_45%,_#fff6e6_100%)] px-4 pb-16 pt-10"}`}
    >
      <div className={useFullscreen ? "w-full" : "mx-auto max-w-6xl"}>
        {outsideTopLeft ? <div className="mb-2">{outsideTopLeft}</div> : null}

        <div
          className={`relative overflow-hidden ${useFullscreen ? `${fullscreenHeightClass} rounded-none border-0 shadow-none` : "rounded-[28px] border border-slate-200 bg-slate-100 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.7)]"}`}
        >
          {backgroundImage ? (
            <>
              {!hasImageError ? (
                <img
                  src={backgroundImage}
                  alt="はいけい"
                  onError={() => setHasImageError(true)}
                  className={`w-full ${useFullscreen ? "h-full object-cover object-top" : "h-auto object-cover"} ${backgroundImageClassName ?? ""}`}
                  style={backgroundImageStyle}
                />
              ) : (
                <div
                  className={`w-full bg-[linear-gradient(140deg,#fef3c7_0%,#dbeafe_55%,#e2e8f0_100%)] ${useFullscreen ? "h-full" : "h-[520px]"}`}
                />
              )}

              {hasImageError ? (
                <div className="absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600">
                  はいけいがぞうが みつからないよ
                </div>
              ) : null}

              <div className="absolute inset-0 bg-slate-900/10" />
              <div
                className={`absolute inset-0 ${useFullscreen ? "p-0" : "p-4 sm:p-6"}`}
              >
                {children}
              </div>
            </>
          ) : (
            <div className="bg-white/95 p-4 sm:p-6">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
