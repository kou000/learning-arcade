import React from "react";
import { Mascot } from "../../ui/components/Mascot";
import { Button } from "../../ui/components/Button";

type Props = { onStartSoroban: () => void };

function Card({ title, desc, cta, onClick }: { title: string; desc: string; cta: string; onClick: () => void }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="text-xl font-extrabold">{title}</div>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
      <div className="mt-4">
        <Button onClick={onClick}>{cta}</Button>
      </div>
    </div>
  );
}

export function ArcadeHome({ onStartSoroban }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 pt-8">
      <header className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-b from-sky-50 to-white p-6 text-center shadow-sm ring-1 ring-slate-200 sm:flex-row sm:text-left">
        <Mascot size={160} className="drop-shadow-sm" />
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Learning Arcade</h1>
          <p className="mt-2 text-base text-slate-700">
            ちいさな「まなびゲーム」で、あそびながら つよくなる！
          </p>
          <p className="mt-1 text-sm text-slate-500">
            アークがいっしょに応援するよ 🐶
          </p>
        </div>
      </header>

      <main className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card
          title="そろばん（珠算）"
          desc="1級〜10級の練習問題を作れるよ。見取算・乗算・除算・（1〜3級は伝票算）"
          cta="はじめる"
          onClick={onStartSoroban}
        />
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6">
          <div className="text-xl font-extrabold text-slate-700">つぎにつくる…</div>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
            <li>計算スピード（たし算・ひき算）</li>
            <li>ロジックパズル</li>
            <li>英単語カード</li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">※ここは後から増やせる「筐体スペース」</p>
        </div>
      </main>

      <footer className="mt-10 text-center text-xs text-slate-500">
        <span className="font-semibold">Tips:</span> 印刷ボタンで練習プリントにもできるよ
      </footer>
    </div>
  );
}
