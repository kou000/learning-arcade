type Props = {
  onBackHome: () => void;
  onGoPractice: () => void;
  onGoGame: () => void;
};

export function EnglishHomePage({ onBackHome, onGoPractice, onGoGame }: Props) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e7f6ff_0%,_#f4fbff_45%,_#fff6e6_100%)] px-4 py-10 text-slate-800">
      <div className="mx-auto max-w-5xl rounded-[36px] border border-emerald-100 bg-white/85 p-8 shadow-[0_22px_60px_-28px_rgba(15,23,42,0.55)]">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-emerald-700">えいごれんしゅう</p>
            <h1 className="font-[var(--pop-font)] text-5xl font-black tracking-tight sm:text-6xl">English Arcade</h1>
            <p className="mt-3 text-xl font-bold text-slate-600">ことばを なぞって、よんで、ゲームで あそぼう！</p>
          </div>
          <button type="button" onClick={onBackHome} className="self-start rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-base font-black text-slate-700 shadow-sm transition active:translate-y-0.5 sm:self-auto">トップへ</button>
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <button type="button" onClick={onGoPractice} className="rounded-[28px] border-4 border-emerald-100 bg-gradient-to-br from-emerald-50 to-amber-50 p-7 text-left shadow-[0_10px_0_rgba(13,148,136,0.15)] transition active:translate-y-0.5 active:shadow-[0_5px_0_rgba(13,148,136,0.15)]">
            <div className="text-6xl">✏️</div>
            <h2 className="mt-3 text-4xl font-black text-emerald-700">れんしゅう</h2>
            <p className="mt-2 text-lg font-bold text-slate-600">手本の上から、えいごのことばをなぞろう。</p>
          </button>
          <button type="button" onClick={onGoGame} className="rounded-[28px] border-4 border-orange-100 bg-gradient-to-br from-orange-50 to-sky-50 p-7 text-left shadow-[0_10px_0_rgba(249,115,22,0.18)] transition active:translate-y-0.5 active:shadow-[0_5px_0_rgba(249,115,22,0.18)]">
            <div className="text-6xl">🛒</div>
            <h2 className="mt-3 text-4xl font-black text-orange-600">ゲーム</h2>
            <p className="mt-2 text-lg font-bold text-slate-600">おきゃくさんの注文を、えいごで書いてコインをためよう。</p>
          </button>
        </div>
      </div>
    </main>
  );
}
