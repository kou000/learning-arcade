import React, { useMemo, useState } from "react";
import { SceneFrame } from "../components/SceneFrame";
import { SOROBAN_STORAGE_KEY } from "../state";

type Props = {
  onGoRegister: () => void;
};

function prettyJson(raw: string | null): string {
  if (!raw) return "";
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function RegisterAdminPage({ onGoRegister }: Props) {
  const initialText = useMemo(
    () =>
      typeof window === "undefined"
        ? ""
        : prettyJson(window.localStorage.getItem(SOROBAN_STORAGE_KEY)),
    [],
  );
  const [editorValue, setEditorValue] = useState(initialText);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"ok" | "error" | null>(null);

  const reload = () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(SOROBAN_STORAGE_KEY);
    setEditorValue(prettyJson(raw));
    setMessage("現在のセーブデータを読み込みました。");
    setMessageType("ok");
  };

  const save = () => {
    if (typeof window === "undefined") return;
    try {
      const parsed = JSON.parse(editorValue);
      window.localStorage.setItem(
        SOROBAN_STORAGE_KEY,
        JSON.stringify(parsed),
      );
      setEditorValue(JSON.stringify(parsed, null, 2));
      setMessage("セーブデータを保存しました。");
      setMessageType("ok");
    } catch {
      setMessage("JSONの形式が不正です。保存できませんでした。");
      setMessageType("error");
    }
  };

  return (
    <SceneFrame
      title="そろばん管理者画面"
      subtitle="localStorage の learning-arcade:soroban-state を編集します"
      outsideTopLeft={
        <button
          className="rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-white"
          onClick={onGoRegister}
        >
          ← レジゲームTOPへ
        </button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-700">
          パスワードなしの暫定画面です。JSONを編集して保存できます。
        </p>
        <textarea
          className="min-h-[360px] w-full rounded-2xl border border-slate-300 bg-white p-4 font-mono text-sm text-slate-900 shadow-inner"
          value={editorValue}
          onChange={(e) => setEditorValue(e.target.value)}
          spellCheck={false}
        />
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
            onClick={save}
          >
            保存
          </button>
          <button
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={reload}
          >
            再読み込み
          </button>
        </div>
        {message ? (
          <p
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${
              messageType === "error"
                ? "bg-rose-50 text-rose-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {message}
          </p>
        ) : null}
      </div>
    </SceneFrame>
  );
}
