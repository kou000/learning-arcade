import React, { useEffect, useState } from "react";
import { ArcadeHome } from "./features/arcade/ArcadeHome";
import { PracticePage } from "./features/practice/PracticePage";
import { RegisterGamePage } from "./features/soroban/RegisterGamePage";
import { RegisterTopPage } from "./features/soroban/RegisterTopPage";
import { ShopPage } from "./features/soroban/ShopPage";
import { ShelfPage } from "./features/soroban/ShelfPage";

type Route = "home" | "soroban" | "soroban-register" | "soroban-register-play" | "soroban-shop" | "soroban-shelf";

function isAdminModeFromEnv(): boolean {
  const raw = String(import.meta.env.VITE_REGISTER_ADMIN_MODE ?? "").toLowerCase();
  return raw === "1" || raw === "true" || raw === "on";
}

function getRouteFromHash(): Route {
  const h = window.location.hash.replace("#", "").replace(/^\/+/, "").replace(/\/+$/, "");
  if (h === "soroban") return "soroban";
  if (h === "soroban/register") return "soroban-register";
  if (h === "soroban/register/play") return "soroban-register-play";
  if (h === "soroban/shop") return "soroban-shop";
  if (h === "soroban/shelf") return "soroban-shelf";
  return "home";
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
  const goRegisterPlay = () => { window.location.hash = "/soroban/register/play"; };
  const goShop = () => { window.location.hash = "/soroban/shop"; };
  const goShelf = () => { window.location.hash = "/soroban/shelf"; };

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
        <RegisterTopPage onGoPractice={goSoroban} onGoRegister={goRegister} onGoRegisterPlay={goRegisterPlay} onGoShop={goShop} onGoShelf={goShelf} />
      ) : null}
      {route === "soroban-register-play" ? (
        <RegisterGamePage onGoRegister={goRegister} />
      ) : null}
      {route === "soroban-shop" ? (
        <ShopPage onGoPractice={goSoroban} onGoRegister={goRegister} onGoShop={goShop} onGoShelf={goShelf} />
      ) : null}
      {route === "soroban-shelf" ? (
        <ShelfPage onGoPractice={goSoroban} onGoRegister={goRegister} onGoShop={goShop} onGoShelf={goShelf} />
      ) : null}
    </div>
  );
}
