import React, { useEffect, useMemo, useState } from "react";
import registerGameTop from "../../assets/register-game-top.png";
import {
  EXAM_BODY_LABELS,
  getAvailableGrades,
} from "../../domain/specs/kenteiSpec";
import type { ExamBody, Grade } from "../../domain/specs/types";
import { Select } from "../../ui/components/Select";
import { SceneFrame, SorobanSubnav } from "./SceneFrame";
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
  onGoRegister: _onGoRegister,
  onGoRegisterPlay,
  onGoShop,
  onGoShelf,
}: Props) {
  const [showRegisterPanel, setShowRegisterPanel] = useState(false);
  const [config, setConfig] = useState<PracticeConfig>(() =>
    loadPracticeConfig(),
  );
  const [progress, setProgress] = useState<RegisterProgress>(() =>
    loadRegisterProgress(),
  );

  const registerSubject = toRegisterSubject(config);
  const selection = clampRegisterSelection(
    progress,
    config.grade,
    registerSubject,
  );
  const unlockedGrades = getRegisterUnlockedGrades(progress);
  const unlockedSubjects = getRegisterUnlockedSubjects(
    progress,
    selection.grade,
  );

  const gradeOptions = useMemo(
    () =>
      unlockedGrades.map((grade) => ({ value: grade, label: `${grade}級` })),
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
      backgroundImage={registerGameTop}
      fullscreenBackground
      hideHeader
      headerAlign="left"
      outsideTopLeft={
        <button
          className="rounded-xl bg-transparent px-4 py-3 text-base font-semibold text-white hover:bg-white/10"
          onClick={onGoPractice}
        >
          ← トップへもどる
        </button>
      }
    >
      <div
        className="relative h-full text-lg"
        style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}
      >
        {showRegisterPanel ? (
          <div className="absolute left-1/2 top-[58%] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 px-4">
            <div className="grid content-start gap-3 rounded-2xl border border-white/35 bg-white/58 p-4 shadow-sm backdrop-blur-md">
              <div className="rounded-xl border border-white/45 bg-white/45 px-4 py-3 text-base text-slate-800">
                てもちコイン:{" "}
                <span className="font-bold">{progress.coins}コイン</span>
              </div>
              <div className="rounded-xl border border-white/45 bg-white/45 px-4 py-3 text-base text-slate-800">
                クリアでつぎがかいほうされます。みとりざん → かけざん →
                わりざんのじゅんですすみ、わりざんまでクリアするとつぎの級があそべます。
              </div>

              <div className="grid gap-3 sm:grid-cols-3 [&_label>span]:text-slate-800 [&_select]:border-white/60 [&_select]:bg-white/75 [&_select]:text-slate-800 [&_select]:shadow-sm [&_select]:backdrop-blur-sm">
                <Select
                  label="けんてい"
                  value={config.examBody}
                  options={examOptions}
                  onChange={(value) => {
                    const examBody = value as ExamBody;
                    const grades = getAvailableGrades(examBody);
                    const grade = grades.includes(config.grade)
                      ? config.grade
                      : (grades[0] ?? config.grade);
                    const clamped = clampRegisterSelection(
                      progress,
                      grade,
                      registerSubject,
                    );
                    setConfig((prev) => ({
                      ...prev,
                      examBody,
                      grade,
                      subject: clamped.subject,
                    }));
                  }}
                />
                <Select
                  label="きゅう"
                  value={selection.grade}
                  options={gradeOptions}
                  onChange={(value) => {
                    const grade = Number(value) as Grade;
                    const clamped = clampRegisterSelection(
                      progress,
                      grade,
                      registerSubject,
                    );
                    setConfig((prev) => ({
                      ...prev,
                      grade,
                      subject: clamped.subject,
                    }));
                  }}
                />
                <Select
                  label="もんだいのしゅるい"
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

              <div className="flex justify-center gap-3 pt-2">
                <button
                  className="rounded-2xl bg-sky-500/90 px-12 py-5 text-3xl font-black text-white shadow-sm transition hover:bg-sky-600/90"
                  onClick={onGoRegisterPlay}
                >
                  スタート
                </button>
                <button
                  className="rounded-2xl border border-white/60 bg-white/70 px-8 py-5 text-2xl font-black text-slate-700 shadow-sm transition hover:bg-white/85"
                  onClick={() => setShowRegisterPanel(false)}
                >
                  やめる
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-x-0 bottom-2">
            <SorobanSubnav
              current="register"
              onGoRegister={() => setShowRegisterPanel(true)}
              onGoShop={onGoShop}
              onGoShelf={onGoShelf}
              large
            />
          </div>
        )}
      </div>
    </SceneFrame>
  );
}
