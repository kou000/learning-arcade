import React, { useEffect, useMemo, useState } from "react";
import registerGameTop from "../../assets/register-game-top.png";
import {
  EXAM_BODY_LABELS,
  getAvailableGrades,
} from "../../domain/specs/kenteiSpec";
import type { ExamBody, Grade } from "../../domain/specs/types";
import { Select } from "../../ui/components/Select";
import { SceneFrame, SorobanModeNav, SorobanSubnav } from "./SceneFrame";
import {
  clampRegisterSelection,
  getRegisterUnlockedGrades,
  getRegisterUnlockedSubjects,
  loadPracticeConfig,
  loadRegisterProgress,
  savePracticeConfig,
  type PracticeConfig,
  type RegisterProgress,
  type RegisterSubject,
} from "./state";

type Props = {
  onGoPractice: () => void;
  onGoRegister: () => void;
  onGoRegisterPlay: () => void;
  onGoShop: () => void;
  onGoShelf: () => void;
};

function toRegisterSubject(config: PracticeConfig): RegisterSubject {
  if (
    config.subject === "mul" ||
    config.subject === "div" ||
    config.subject === "mitori"
  ) {
    return config.subject;
  }
  return "mitori";
}

export function RegisterTopPage({
  onGoPractice,
  onGoRegister,
  onGoRegisterPlay,
  onGoShop,
  onGoShelf,
}: Props) {
  const [config, setConfig] = useState<PracticeConfig>(() =>
    loadPracticeConfig(),
  );
  const [progress, setProgress] = useState<RegisterProgress>(() => loadRegisterProgress());

  const registerSubject = toRegisterSubject(config);
  const selection = clampRegisterSelection(progress, config.grade, registerSubject);
  const unlockedGrades = getRegisterUnlockedGrades(progress);
  const unlockedSubjects = getRegisterUnlockedSubjects(progress, selection.grade);

  const gradeOptions = useMemo(
    () => unlockedGrades.map((grade) => ({ value: grade, label: `${grade}級` })),
    [unlockedGrades],
  );

  const examOptions: { value: ExamBody; label: string }[] = [
    { value: "zenshugakuren", label: EXAM_BODY_LABELS.zenshugakuren },
  ];

  const subjectOptions: Array<{ value: RegisterSubject; label: string }> = [
    { value: "mitori", label: "みとりざん（れしーと）" },
    { value: "mul", label: "かけざん（まとめがい）" },
    { value: "div", label: "わりざん（ふくろわけ）" },
  ].filter((option) => unlockedSubjects.includes(option.value));

  useEffect(() => {
    const correctedGrade = selection.grade;
    const correctedSubject = selection.subject;

    if (
      config.examBody !== "zenshugakuren" ||
      config.grade !== correctedGrade ||
      registerSubject !== correctedSubject
    ) {
      const available = getAvailableGrades("zenshugakuren");
      const nextGrade = available.includes(correctedGrade)
        ? correctedGrade
        : (available[0] ?? correctedGrade);
      setConfig((prev) => ({
        ...prev,
        examBody: "zenshugakuren",
        grade: nextGrade,
        subject: correctedSubject,
      }));
      return;
    }
    savePracticeConfig(config);
    setProgress(loadRegisterProgress());
  }, [config, selection.grade, selection.subject, registerSubject]);

  return (
    <SceneFrame
      title="そろばんレジゲーム"
      subtitle="条件を決めてスタートすると、レジ問題ページに進みます"
    >
      <div className="grid h-full grid-rows-[auto_auto_1fr] gap-3">
        <SorobanModeNav
          current="game"
          onGoTest={() => {
            savePracticeConfig({ mode: "test" });
            onGoPractice();
          }}
          onGoPractice={() => {
            savePracticeConfig({ mode: "one-by-one" });
            onGoPractice();
          }}
          onGoGame={onGoRegister}
        />

        <SorobanSubnav
          current="register"
          onGoRegister={onGoRegister}
          onGoShop={onGoShop}
          onGoShelf={onGoShelf}
        />

        <div className="grid content-start gap-3 rounded-2xl border border-slate-200 bg-white/92 p-4 shadow-sm">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            所持コイン: <span className="font-bold">{progress.coins}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              label="検定"
              value={config.examBody}
              options={examOptions}
              onChange={(value) => {
                const examBody = value as ExamBody;
                const grades = getAvailableGrades(examBody);
                const grade = grades.includes(config.grade)
                  ? config.grade
                  : (grades[0] ?? config.grade);
                const clamped = clampRegisterSelection(progress, grade, registerSubject);
                setConfig((prev) => ({ ...prev, examBody, grade, subject: clamped.subject }));
              }}
            />
            <Select
              label="級"
              value={selection.grade}
              options={gradeOptions}
              onChange={(value) => {
                const grade = Number(value) as Grade;
                const clamped = clampRegisterSelection(progress, grade, registerSubject);
                setConfig((prev) => ({ ...prev, grade, subject: clamped.subject }));
              }}
            />
            <Select
              label="レジ問題"
              value={selection.subject}
              options={subjectOptions}
              onChange={(value) =>
                setConfig((prev) => ({
                  ...prev,
                  subject: value as RegisterSubject,
                }))
              }
            />
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <img
              src={registerGameTop}
              alt="レジゲームスタート"
              className="h-auto w-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/10" />
            <div className="absolute inset-x-0 bottom-20 flex justify-center">
              <button
                className="rounded-2xl bg-sky-600 px-10 py-4 text-2xl font-black text-white shadow-[0_14px_28px_-10px_rgba(2,132,199,0.75)] transition hover:bg-sky-700"
                onClick={onGoRegisterPlay}
              >
                スタート
              </button>
            </div>
          </div>
        </div>
      </div>
    </SceneFrame>
  );
}
