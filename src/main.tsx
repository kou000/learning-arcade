import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "@/styles/index.css";

const currentEntryPath = (() => {
  try {
    return new URL(import.meta.url).pathname;
  } catch {
    return "";
  }
})();

let requestSwUpdate: (() => void) | null = null;

async function checkForNewBuild() {
  if (!currentEntryPath) return;

  try {
    const response = await fetch(`/index.html?ts=${Date.now()}`, {
      cache: "no-store",
      headers: { "cache-control": "no-cache" },
    });
    if (!response.ok) return;

    const html = await response.text();
    if (!html.includes(currentEntryPath)) {
      window.location.reload();
    }
  } catch {
    // noop: offline or transient failure
  }
}

function runUpdateChecks() {
  checkForNewBuild();
  requestSwUpdate?.();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

runUpdateChecks();
window.addEventListener("hashchange", runUpdateChecks);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    runUpdateChecks();
  }
});
window.addEventListener("focus", runUpdateChecks);

if ("serviceWorker" in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister())),
      )
      .catch(() => {
        // noop: dev only cleanup failure should not break app execution
      });
  } else {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          let refreshing = false;

          navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (refreshing) return;
            refreshing = true;
            window.location.reload();
          });

          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener("statechange", () => {
              if (newWorker.state !== "installed") return;
              if (!navigator.serviceWorker.controller) return;
              newWorker.postMessage({ type: "SKIP_WAITING" });
            });
          });

          requestSwUpdate = () => {
            registration.update().catch(() => {
              // noop: update check failures should not break app execution
            });
          };

          runUpdateChecks();
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    });
  }
}
