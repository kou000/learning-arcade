const ADMIN_MODE_OVERRIDE_KEY = "learning-arcade:admin-mode-override";

type AdminModeOverride = "on" | "off" | null;

function isAdminModeFromEnv(): boolean {
  const raw = String(import.meta.env.VITE_REGISTER_ADMIN_MODE ?? "").toLowerCase();
  return raw === "1" || raw === "true" || raw === "on";
}

function readAdminModeOverride(): AdminModeOverride {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(ADMIN_MODE_OVERRIDE_KEY);
  if (raw === "on" || raw === "off") return raw;
  return null;
}

export function resolveAdminMode(): boolean {
  const override = readAdminModeOverride();
  if (override === "on") return true;
  if (override === "off") return false;
  return isAdminModeFromEnv();
}

export function setAdminModeOverride(next: AdminModeOverride): void {
  if (typeof window === "undefined") return;
  if (next == null) {
    window.sessionStorage.removeItem(ADMIN_MODE_OVERRIDE_KEY);
    return;
  }
  window.sessionStorage.setItem(ADMIN_MODE_OVERRIDE_KEY, next);
}

export function getAdminModeSourceLabel(): string {
  const override = readAdminModeOverride();
  if (override === "on") return "画面切り替え（ON）";
  if (override === "off") return "画面切り替え（OFF）";
  return "環境変数";
}
