import React, { useEffect, useState } from "react";
import { ArcadeHome } from "./features/arcade/ArcadeHome";
import { PracticePage } from "./features/practice/views/PracticePage";
import { RegisterGamePage } from "./features/soroban/views/RegisterGamePage";
import { RegisterStagePage } from "./features/soroban/views/RegisterStagePage";
import { RegisterTopPage } from "./features/soroban/views/RegisterTopPage";
import { RegisterAdminPage } from "./features/soroban/views/RegisterAdminPage";
import { ShopPage } from "./features/soroban/views/ShopPage";
import { ShopPaymentPage } from "./features/soroban/views/ShopPaymentPage";
import { ShelfPage } from "./features/soroban/views/ShelfPage";

type Route =
  | "home"
  | "soroban"
  | "soroban-register"
  | "soroban-register-stage"
  | "soroban-register-play"
  | "soroban-shop"
  | "soroban-shop-payment"
  | "soroban-shelf"
  | "soroban-admin";

function isAdminModeFromEnv(): boolean {
  const raw = String(import.meta.env.VITE_REGISTER_ADMIN_MODE ?? "").toLowerCase();
  return raw === "1" || raw === "true" || raw === "on";
}

function getRouteFromHash(): Route {
  const h = window.location.hash.replace("#", "").replace(/^\/+/, "").replace(/\/+$/, "");
  if (h === "soroban") return "soroban";
  if (h === "soroban/register") return "soroban-register";
  if (h === "soroban/register/stage") return "soroban-register-stage";
  if (h === "soroban/register/play") return "soroban-register-play";
  if (h === "soroban/shop") return "soroban-shop";
  if (h.startsWith("soroban/shop/payment/")) return "soroban-shop-payment";
  if (h === "soroban/shelf") return "soroban-shelf";
  if (h === "soroban/admin") return "soroban-admin";
  return "home";
}

function getShopPaymentItemIdFromHash(): string | null {
  const h = window.location.hash.replace("#", "").replace(/^\/+/, "").replace(/\/+$/, "");
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

export default function App() {
  const [route, setRoute] = useState<Route>(() => getRouteFromHash());
  const isAdminMode = isAdminModeFromEnv();

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const goHome = () => { window.location.hash = ""; };
  const goSoroban = () => { window.location.hash = "/soroban"; };
  const goRegister = () => { window.location.hash = "/soroban/register"; };
  const goRegisterStage = () => { window.location.hash = "/soroban/register/stage"; };
  const goRegisterPlay = () => { window.location.hash = "/soroban/register/play"; };
  const goShop = () => { window.location.hash = "/soroban/shop"; };
  const goShopPayment = (itemId: string) => {
    window.location.hash = `/soroban/shop/payment/${encodeURIComponent(itemId)}`;
  };
  const goShelf = () => { window.location.hash = "/soroban/shelf"; };
  const shopPaymentItemId = getShopPaymentItemIdFromHash();

  return (
    <div className="relative min-h-screen">
      {isAdminMode ? (
        <header className="pointer-events-none fixed right-4 top-4 z-50">
          <span className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 shadow-sm">
            ADMIN MODE
          </span>
        </header>
      ) : null}
      {route === "home" ? <ArcadeHome onStartSoroban={goSoroban} /> : null}
      {route === "soroban" ? (
        <PracticePage onBack={goHome} onGoRegister={goRegister} />
      ) : null}
      {route === "soroban-register" ? (
        <RegisterTopPage onGoPractice={goSoroban} onGoRegisterStage={goRegisterStage} onGoShop={goShop} onGoShelf={goShelf} />
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
      {route === "soroban-admin" ? (
        <RegisterAdminPage onGoRegister={goRegister} />
      ) : null}
    </div>
  );
}
