import React, { useEffect, useState } from "react";
import { DogSpeechBubble } from "@/features/soroban/components/DogSpeechBubble";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import { SHOP_ITEMS } from "@/features/soroban/catalog";
import { loadRegisterProgress } from "@/features/soroban/state";
import shopTopBg from "@/assets/shop-top.png";

type ShopPageProps = {
  onGoRegister: () => void;
  onGoPayment: (itemId: string) => void;
};

function ItemPreview({ src, alt }: { src: string; alt: string }) {
  const [missing, setMissing] = useState(false);
  if (missing) {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-500">
        がぞうなし
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setMissing(true)}
      className="h-24 w-24 rounded-xl border border-slate-200 bg-white object-contain p-2"
    />
  );
}

export function ShopPage({ onGoRegister, onGoPayment }: ShopPageProps) {
  const [progress] = useState(() => loadRegisterProgress());
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setShowItems(true);
    }, 1400);
    return () => window.clearTimeout(timerId);
  }, []);

  return (
    <SceneFrame
      backgroundImage={shopTopBg}
      fullscreenBackground
      outsideTopLeft={
        <div className="grid gap-2">
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto rounded-xl px-3 py-0.5 text-sm text-white [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0">
            <button
              className="h-12 rounded-xl bg-transparent px-4 text-sm font-semibold hover:bg-white/10"
              onClick={onGoRegister}
            >
              ← ゲームモードTOP
            </button>
            <span className="inline-flex h-8 items-center rounded-full bg-white/70 px-3 py-0.5 text-sm font-bold text-slate-800">
              てもちコイン: {progress.coins}
            </span>
          </div>
        </div>
      }
    >
      <div
        className="relative grid h-full grid-rows-[1fr] gap-3 text-lg"
        style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}
      >
        {!showItems ? (
          <div className="pointer-events-none absolute left-[23%] top-[10%] z-20 w-[min(30rem,48vw)]">
            <DogSpeechBubble text="いらっしゃいませ！" />
          </div>
        ) : null}

        {showItems ? (
          <div className="grid min-h-0 content-start gap-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white/92 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
            {SHOP_ITEMS.map((item) => {
              const purchased = progress.purchasedItemIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <ItemPreview src={item.image} alt={item.name} />
                  <div className="font-bold text-slate-800">{item.name}</div>
                  <div className="text-sm text-slate-600">
                    {item.description}
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    {item.price} コイン
                  </div>
                  <button
                    className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                      purchased
                        ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                        : "bg-sky-600 text-white hover:bg-sky-700"
                    }`}
                    disabled={purchased}
                    onClick={() => onGoPayment(item.id)}
                  >
                    {purchased ? "購入済み" : "かう"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </SceneFrame>
  );
}
