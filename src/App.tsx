import React, { useEffect, useState } from "react";
import { ArcadeHome } from "@/features/arcade/ArcadeHome";
import { PracticePage } from "@/features/practice/views/PracticePage";
import { RegisterGamePage } from "@/features/soroban/views/RegisterGamePage";
import { RegisterStagePage } from "@/features/soroban/views/RegisterStagePage";
import { RegisterTopPage } from "@/features/soroban/views/RegisterTopPage";
import { RegisterAdminPage } from "@/features/soroban/views/RegisterAdminPage";
import { ShopPage } from "@/features/soroban/views/ShopPage";
import { ShopPaymentPage } from "@/features/soroban/views/ShopPaymentPage";
import { ShelfPage } from "@/features/soroban/views/ShelfPage";
import { SnackBudgetGamePage } from "@/features/soroban/views/SnackBudgetGamePage";
import { SnackBudgetResultPage } from "@/features/soroban/views/SnackBudgetResultPage";
import { SnackBudgetTopPage } from "@/features/soroban/views/SnackBudgetTopPage";
import { SnackBadgeBookPage } from "@/features/soroban/views/SnackBadgeBookPage";

type Route =
  | "home"
  | "soroban"
  | "soroban-register"
  | "soroban-register-stage"
  | "soroban-register-play"
  | "soroban-shop"
  | "soroban-shop-payment"
  | "soroban-shelf"
  | "soroban-snack-top"
  | "soroban-snack"
  | "soroban-badges"
  | "soroban-snack-result"
  | "soroban-admin";

function isAdminModeFromEnv(): boolean {
  const raw = String(import.meta.env.VITE_REGISTER_ADMIN_MODE ?? "").toLowerCase();
  return raw === "1" || raw === "true" || raw === "on";
}

const ADMIN_PASSWORD_SHA256 = "a7be8e1fe282a37cd666e0632b17d933fa13f21addf4798fc0455bc166e2488c";

async function hashTextToSha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function getHashPath(): string {
  const hash = window.location.hash.replace("#", "").replace(/^\/+/, "");
  const pathOnly = hash.split("?")[0] ?? "";
  return pathOnly.replace(/\/+$/, "");
}

function getRouteFromHash(): Route {
  const h = getHashPath();
  if (h === "soroban") return "soroban";
  if (h === "soroban/register") return "soroban-register";
  if (h === "soroban/register/stage") return "soroban-register-stage";
  if (h === "soroban/register/play") return "soroban-register-play";
  if (h === "soroban/shop") return "soroban-shop";
  if (h.startsWith("soroban/shop/payment/")) return "soroban-shop-payment";
  if (h === "soroban/shelf") return "soroban-shelf";
  if (h === "soroban/badges") return "soroban-badges";
  if (h === "soroban/snack/top") return "soroban-snack-top";
  if (h === "soroban/snack") return "soroban-snack";
  if (h === "soroban/snack/result") return "soroban-snack-result";
  if (h === "soroban/admin") return "soroban-admin";
  return "home";
}

function getShopPaymentItemIdFromHash(): string | null {
  const h = getHashPath();
  const prefix = "soroban/shop/payment/";
  if (!h.startsWith(prefix)) return null;
  const raw = h.slice(prefix.length);
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}


function getSnackDifficultyFromHash(): "easy" | "normal" | "hard" {
  const hash = window.location.hash.replace("#", "").replace(/^\/+/, "");
  const [path, query = ""] = hash.split("?");
  if (path !== "soroban/snack") return "easy";
  const params = new URLSearchParams(query);
  const raw = params.get("difficulty");
  if (raw === "normal" || raw === "hard") return raw;
  return "easy";
}

function getSnackResultTotalFromHash(): number | null {
  const hash = window.location.hash.replace("#", "").replace(/^\/+/, "");
  const [path, query = ""] = hash.split("?");
  if (path !== "soroban/snack/result") return null;
  const params = new URLSearchParams(query);
  const raw = params.get("total");
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

type SnackResultItem = {
  id: string;
  price: number;
  quantity: number;
};

function getSnackResultDifficultyFromHash(): "easy" | "normal" | "hard" {
  const hash = window.location.hash.replace("#", "").replace(/^\/+/, "");
  const [path, query = ""] = hash.split("?");
  if (path !== "soroban/snack/result") return "easy";
  const params = new URLSearchParams(query);
  const raw = params.get("difficulty");
  if (raw === "normal" || raw === "hard") return raw;
  return "easy";
}

function getSnackResultItemsFromHash(): SnackResultItem[] {
  const hash = window.location.hash.replace("#", "").replace(/^\/+/, "");
  const [path, query = ""] = hash.split("?");
  if (path !== "soroban/snack/result") return [];
  const params = new URLSearchParams(query);
  const raw = params.get("items");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        id: String(item?.id ?? ""),
        price: Number(item?.price ?? 0),
        quantity: Number(item?.quantity ?? 0),
      }))
      .filter(
        (item) =>
          item.id.length > 0 &&
          Number.isFinite(item.price) &&
          item.price > 0 &&
          Number.isFinite(item.quantity) &&
          item.quantity > 0,
      );
  } catch {
    return [];
  }
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => getRouteFromHash());
  const [isRefreshingCache, setIsRefreshingCache] = useState(false);
  const isAdminMode = isAdminModeFromEnv();

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const goHome = () => { window.location.hash = ""; };
  const goSoroban = () => { window.location.hash = "/soroban"; };
  const goAdminWithPassword = async () => {
    const password = window.prompt("admin パスワードを入力してください");
    if (password == null) return;

    const enteredHash = await hashTextToSha256(password.trim());
    if (enteredHash !== ADMIN_PASSWORD_SHA256) {
      window.alert("パスワードがちがいます");
      return;
    }

    window.location.hash = "/soroban/admin";
  };
  const goRegister = () => { window.location.hash = "/soroban/register"; };
  const goRegisterStage = () => { window.location.hash = "/soroban/register/stage"; };
  const goRegisterPlay = () => { window.location.hash = "/soroban/register/play"; };
  const goShop = (opts?: { fromPurchase?: boolean }) => {
    window.location.hash = opts?.fromPurchase
      ? "/soroban/shop?fromPurchase=1"
      : "/soroban/shop";
  };
  const goShopPayment = (itemId: string) => {
    window.location.hash = `/soroban/shop/payment/${encodeURIComponent(itemId)}`;
  };
  const goShelf = () => { window.location.hash = "/soroban/shelf"; };
  const goSnackTop = () => { window.location.hash = "/soroban/snack/top"; };
  const goSnackBadges = () => { window.location.hash = "/soroban/badges"; };
  const goSnack = (difficulty: "easy" | "normal" | "hard" = "easy") => {
    const params = new URLSearchParams();
    if (difficulty !== "easy") params.set("difficulty", difficulty);
    const query = params.toString();
    window.location.hash = query ? `/soroban/snack?${query}` : "/soroban/snack";
  };
  const goSnackResult = (payload: {
    total: number;
    difficulty: "easy" | "normal" | "hard";
    items: Array<{ id: string; price: number; quantity: number }>;
  }) => {
    const params = new URLSearchParams();
    params.set("total", String(payload.total));
    params.set("difficulty", payload.difficulty);
    params.set("items", JSON.stringify(payload.items));
    window.location.hash = `/soroban/snack/result?${params.toString()}`;
  };
  const shopPaymentItemId = getShopPaymentItemIdFromHash();
  const snackDifficulty = getSnackDifficultyFromHash();
  const snackResultTotal = getSnackResultTotalFromHash();
  const snackResultItems = getSnackResultItemsFromHash();
  const snackResultDifficulty = getSnackResultDifficultyFromHash();

  const refreshCacheAndReload = async () => {
    if (isRefreshingCache) return;
    setIsRefreshingCache(true);

    try {
      if ("caches" in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((key) => window.caches.delete(key)));
      }

      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
    } finally {
      window.location.reload();
    }
  };

  return (
    <div className="relative min-h-screen">
      {isAdminMode ? (
        <header className="pointer-events-none fixed right-4 top-4 z-50">
          <span className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 shadow-sm">
            ADMIN MODE
          </span>
        </header>
      ) : null}
      {route === "home" ? (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
          <button
            type="button"
            onClick={goAdminWithPassword}
            className="rounded-xl border border-amber-300 bg-amber-50/95 px-3 py-2 text-xs font-bold text-amber-800 shadow-sm transition hover:bg-amber-100"
          >
            admin
          </button>
          <button
            type="button"
            onClick={refreshCacheAndReload}
            disabled={isRefreshingCache}
            className="rounded-xl border border-slate-300 bg-white/95 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-white disabled:cursor-wait disabled:opacity-70"
          >
            {isRefreshingCache ? "更新中..." : "キャッシュ更新"}
          </button>
        </div>
      ) : null}
      {route === "home" ? <ArcadeHome onStartSoroban={goSoroban} /> : null}
      {route === "soroban" ? (
        <PracticePage onBack={goHome} onGoRegister={goRegister} />
      ) : null}
      {route === "soroban-register" ? (
        <RegisterTopPage
          onGoPractice={goSoroban}
          onGoRegisterStage={goRegisterStage}
          onGoShop={goShop}
          onGoShelf={goShelf}
          onGoSnack={goSnackTop}
          onGoSnackBadges={goSnackBadges}
        />
      ) : null}
      {route === "soroban-register-stage" ? (
        <RegisterStagePage onGoRegisterTop={goRegister} onGoRegisterPlay={goRegisterPlay} onGoShop={goShop} onGoShelf={goShelf} />
      ) : null}
      {route === "soroban-register-play" ? (
        <RegisterGamePage
          onGoRegister={goRegister}
          onGoRegisterStage={goRegisterStage}
        />
      ) : null}
      {route === "soroban-shop" ? (
        <ShopPage onGoRegister={goRegister} onGoPayment={goShopPayment} />
      ) : null}
      {route === "soroban-shop-payment" ? (
        <ShopPaymentPage
          itemId={shopPaymentItemId}
          onGoRegister={goRegister}
          onGoShop={goShop}
        />
      ) : null}
      {route === "soroban-shelf" ? (
        <ShelfPage onGoPractice={goSoroban} onGoRegister={goRegister} onGoShop={goShop} onGoShelf={goShelf} />
      ) : null}
      {route === "soroban-snack-top" ? (
        <SnackBudgetTopPage onGoRegister={goRegister} onGoSnackPlay={goSnack} />
      ) : null}
      {route === "soroban-snack" ? (
        <SnackBudgetGamePage
          onGoRegister={goRegister}
          onGoShop={goShop}
          onGoShelf={goShelf}
          onGoSnack={goSnack}
          difficulty={snackDifficulty}
          onGoSnackResult={goSnackResult}
        />
      ) : null}
      {route === "soroban-badges" ? (
        <SnackBadgeBookPage onGoRegister={goRegister} />
      ) : null}
      {route === "soroban-snack-result" ? (
        <SnackBudgetResultPage
          total={snackResultTotal}
          difficulty={snackResultDifficulty}
          items={snackResultItems}
          onGoSnack={() => goSnack(snackResultDifficulty)}
          onGoRegister={goRegister}
        />
      ) : null}
      {route === "soroban-admin" ? (
        <RegisterAdminPage onGoRegister={goRegister} />
      ) : null}
    </div>
  );
}
