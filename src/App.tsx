import React, { useEffect, useState } from "react";
import { ArcadeHome } from "./features/arcade/ArcadeHome";
import { PracticePage } from "./features/practice/PracticePage";

type Route = "home" | "soroban";

function getRouteFromHash(): Route {
  const h = window.location.hash.replace("#", "");
  if (h === "/soroban" || h === "soroban") return "soroban";
  return "home";
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => getRouteFromHash());

  useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const goHome = () => { window.location.hash = ""; };
  const goSoroban = () => { window.location.hash = "/soroban"; };

  return (
    <div className="min-h-screen">
      {route === "home" ? <ArcadeHome onStartSoroban={goSoroban} /> : <PracticePage onBack={goHome} />}
    </div>
  );
}
