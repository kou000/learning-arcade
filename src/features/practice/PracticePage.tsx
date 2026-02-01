import React, { useMemo, useState } from "react";
import type { ExamBody, Grade, Subject } from "../../domain/specs/types";
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
import { EXAM_BODY_LABELS, getAvailableGrades, getGradeSpec } from "../../domain/specs/kenteiSpec";

export function PracticePage({ onBack }: { onBack: () => void }) {
  const [grade, setGrade] = useState<Grade>(7);
  const [subject, setSubject] = useState<Subject>("mitori");
  const [mode, setMode] = useState<PracticeMode>("test");
  const [examBody, setExamBody] = useState<ExamBody>("zenshugakuren");
  const [sets, setSets] = useState<number>(1);
  const [showAnswers, setShowAnswers] = useState<boolean>(false);

  const [bundles, setBundles] = useState<Problem[][]>(() => [generateProblems(7, "mitori", "zenshugakuren")]);

  const minutes = subjectMinutes(grade, subject, examBody);
  const timer = useTimer(minutes * 60);

  const title = useMemo(() => `${EXAM_BODY_LABELS[examBody]} / ${grade}級 / ${subjectLabel(subject)}`, [examBody, grade, subject]);

  const onGenerate = () => {
    const next: Problem[][] = [];
    const loops = mode === "test" ? sets : 1;
    for (let i = 0; i < loops; i++) next.push(generateProblems(grade, subject, examBody));
    setBundles(next);
    timer.reset();
  };

  const onChangeGrade = (g: Grade) => {
    setGrade(g);
    const spec = getGradeSpec(examBody, g);
    setSubject((prev) => (prev === "denpyo" && !spec?.denpyo ? "mitori" : prev));
  };

  const onChangeExamBody = (b: ExamBody) => {
    setExamBody(b);
    const available = getAvailableGrades(b);
    if (!available.includes(grade)) {
      const nextGrade = available[0] ?? grade;
      setGrade(nextGrade);
      const spec = getGradeSpec(b, nextGrade);
      setSubject((prev) => (prev === "denpyo" && !spec?.denpyo ? "mitori" : prev));
    }
  };

  const onChangeMode = (m: PracticeMode) => {
    setMode(m);
    if (m === "one-by-one") {
      setSets(1);
      setShowAnswers(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e7f6ff_0%,_#f4fbff_45%,_#fff6e6_100%)] px-4 pb-16 pt-10">
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.55)] backdrop-blur">
          <div className="absolute -top-16 -right-20 h-56 w-56 rounded-full bg-amber-200/40 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sky-200/50 blur-2xl" />

          <div className="relative flex flex-wrap items-center gap-3">
            <Button variant="ghost" onClick={onBack}>← アーケードへ</Button>
            <h2 className="text-3xl font-black text-slate-800 font-[var(--pop-font)]">{title}</h2>
            <div className="ml-auto text-sm text-slate-600">本番想定：{minutes}分（目安）</div>
          </div>

          <div className="relative mt-5 grid gap-4">
            <ControlBar
              grade={grade}
              subject={subject}
              mode={mode}
              examBody={examBody}
              sets={sets}
              showAnswers={showAnswers}
              onChangeGrade={onChangeGrade}
              onChangeSubject={setSubject}
              onChangeExamBody={onChangeExamBody}
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
      </div>
    </div>
  );
}
