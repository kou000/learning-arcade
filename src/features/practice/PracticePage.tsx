import React, { useMemo, useState } from "react";
import type { Grade, Subject } from "../../domain/specs/types";
import { generateProblems, subjectLabel, subjectMinutes } from "../../domain/generator";
import type { Problem } from "../../domain/generator/types";
import { ControlBar } from "./components/ControlBar";
import { TimerBar } from "./components/TimerBar";
import { useTimer } from "./hooks/useTimer";
import { ProblemSheet } from "./components/ProblemSheet";
import { AnswerSheet } from "./components/AnswerSheet";
import { OneByOnePractice } from "./components/OneByOnePractice";
import { Button } from "../../ui/components/Button";
import type { PracticeMode } from "./types";

export function PracticePage({ onBack }: { onBack: () => void }) {
  const [grade, setGrade] = useState<Grade>(7);
  const [subject, setSubject] = useState<Subject>("mitori");
  const [mode, setMode] = useState<PracticeMode>("test");
  const [sets, setSets] = useState<number>(1);
  const [showAnswers, setShowAnswers] = useState<boolean>(false);

  const [bundles, setBundles] = useState<Problem[][]>(() => [generateProblems(7, "mitori")]);

  const minutes = subjectMinutes(grade, subject);
  const timer = useTimer(minutes * 60);

  const title = useMemo(() => `${grade}級 / ${subjectLabel(subject)}`, [grade, subject]);

  const onGenerate = () => {
    const next: Problem[][] = [];
    const loops = mode === "test" ? sets : 1;
    for (let i = 0; i < loops; i++) next.push(generateProblems(grade, subject));
    setBundles(next);
    timer.reset();
  };

  const onChangeGrade = (g: Grade) => {
    setGrade(g);
    setSubject((prev) => (prev === "denpyo" && g >= 4 ? "mitori" : prev));
  };

  const onChangeMode = (m: PracticeMode) => {
    setMode(m);
    if (m === "one-by-one") {
      setSets(1);
      setShowAnswers(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={onBack}>← アーケードへ</Button>
        <h2 className="text-2xl font-extrabold">{title}</h2>
        <div className="ml-auto text-sm text-slate-600">本番想定：{minutes}分（目安）</div>
      </div>

      <div className="mt-4 grid gap-4">
        <ControlBar
          grade={grade}
          subject={subject}
          mode={mode}
          sets={sets}
          showAnswers={showAnswers}
          onChangeGrade={onChangeGrade}
          onChangeSubject={setSubject}
          onChangeMode={onChangeMode}
          onChangeSets={setSets}
          onToggleAnswers={setShowAnswers}
          onGenerate={onGenerate}
        />

        {mode === "test" ? (
          <TimerBar
            secondsLeft={timer.secondsLeft}
            isRunning={timer.isRunning}
            onStart={timer.start}
            onPause={timer.pause}
            onReset={timer.reset}
          />
        ) : null}

        {mode === "test" ? (
          <div className="grid gap-8">
            {bundles.map((problems, i) => (
              <section key={i} className="grid gap-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">セット {i + 1}</h3>
                  <span className="text-sm text-slate-600">（{problems.length}題）</span>
                  <div className="ml-auto">
                    <button
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 print:hidden"
                      onClick={() => window.print()}
                    >
                      印刷
                    </button>
                  </div>
                </div>

                <ProblemSheet
                  problems={problems}
                  grade={grade}
                  subject={subject}
                  setNumber={i + 1}
                  minutes={minutes}
                />
                {showAnswers ? <AnswerSheet problems={problems} /> : null}
              </section>
            ))}
          </div>
        ) : (
          <OneByOnePractice problems={bundles[0] ?? []} onRegenerate={onGenerate} />
        )}
      </div>

    </div>
  );
}
