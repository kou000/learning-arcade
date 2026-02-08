import React, { useEffect, useMemo, useState } from "react";
import type { ExamBody, Grade } from "../../domain/specs/types";
import {
  EXAM_BODY_LABELS,
  getAvailableGrades,
} from "../../domain/specs/kenteiSpec";
import { Select } from "../../ui/components/Select";
import { SceneFrame } from "./SceneFrame";
import {
  canPlayStage,
  clampRegisterSelection,
  getClearedStage,
  getRegisterUnlockedGrades,
  getRegisterUnlockedSubjects,
  loadPracticeConfig,
  loadRegisterProgress,
  savePracticeConfig,
  saveRegisterPlayConfig,
  type PracticeConfig,
  type RegisterProgress,
  type RegisterStage,
  type RegisterSubject,
} from "./state";

type Props = {
  onGoRegisterTop: () => void;
  onGoRegisterPlay: () => void;
  onGoShop: () => void;
  onGoShelf: () => void;
};

function toRegisterSubject(config: PracticeConfig): RegisterSubject {
  if (
    config.subject === "mitori" ||
    config.subject === "mul" ||
    config.subject === "div"
  )
    return config.subject;
  return "mitori";
}

function stageLabel(stage: RegisterStage): string {
  return `ステージ ${stage}`;
}

function subjectLabel(subject: RegisterSubject): string {
  if (subject === "mitori") return "みとりざん";
  if (subject === "mul") return "かけざん";
  return "わりざん";
}

export function RegisterStagePage({
  onGoRegisterTop,
  onGoRegisterPlay,
  onGoShop: _onGoShop,
  onGoShelf: _onGoShelf,
}: Props) {
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
  const clearedStage = getClearedStage(
    progress,
    selection.grade,
    selection.subject,
  );

  const gradeOptions = useMemo(
    () =>
      unlockedGrades.map((grade) => ({
        value: grade,
        label: `${grade}きゅう`,
      })),
    [unlockedGrades],
  );
  const subjectOptions = useMemo(
    () =>
      [
        { value: "mitori" as const, label: "みとりざん" },
        { value: "mul" as const, label: "かけざん" },
        { value: "div" as const, label: "わりざん" },
      ].filter((x) => unlockedSubjects.includes(x.value)),
    [unlockedSubjects],
  );
  const examOptions: { value: ExamBody; label: string }[] = [
    { value: "zenshugakuren", label: EXAM_BODY_LABELS.zenshugakuren },
  ];

  useEffect(() => {
    const corrected = clampRegisterSelection(
      progress,
      selection.grade,
      selection.subject,
    );
    if (
      config.examBody !== "zenshugakuren" ||
      config.grade !== corrected.grade ||
      registerSubject !== corrected.subject
    ) {
      const available = getAvailableGrades("zenshugakuren");
      const nextGrade = available.includes(corrected.grade)
        ? corrected.grade
        : (available[0] ?? corrected.grade);
      setConfig((prev) => ({
        ...prev,
        examBody: "zenshugakuren",
        grade: nextGrade,
        subject: corrected.subject,
      }));
      return;
    }
    savePracticeConfig(config);
    setProgress(loadRegisterProgress());
  }, [config, registerSubject, selection.grade, selection.subject]);

  const onPickStage = (stage: RegisterStage) => {
    if (!canPlayStage(progress, selection.grade, selection.subject, stage))
      return;
    savePracticeConfig({
      examBody: "zenshugakuren",
      grade: selection.grade,
      subject: selection.subject,
    });
    saveRegisterPlayConfig({
      grade: selection.grade,
      subject: selection.subject,
      stage,
    });
    onGoRegisterPlay();
  };

  const cards: Array<{
    stage: RegisterStage;
    left: string;
    top: string;
    color: string;
    titleTilt: string;
    titleTop: string;
    detailTop: string;
  }> = [
    {
      stage: 1,
      left: "22%",
      top: "0%",
      color: "bg-emerald-600",
      titleTilt: "-4deg",
      titleTop: "9%",
      detailTop: "31%",
    },
    {
      stage: 2,
      left: "50%",
      top: "-2.5%",
      color: "bg-amber-600",
      titleTilt: "0deg",
      titleTop: "9.5%",
      detailTop: "31%",
    },
    {
      stage: 3,
      left: "79%",
      top: "0%",
      color: "bg-sky-600",
      titleTilt: "3deg",
      titleTop: "9%",
      detailTop: "31%",
    },
  ];

  return (
    <SceneFrame
      title="ステージせんたく"
      subtitle="きゅうとしゅるいをえらんでステージにちょうせん"
      backgroundImage="/assets/register-stage-select.png"
      fullscreenBackground
      hideHeader
      outsideTopLeft={
        <button
          className="rounded-xl bg-transparent px-4 py-3 text-base font-semibold text-white hover:bg-white/10"
          onClick={onGoRegisterTop}
        >
          ← ゲームTOPへ
        </button>
      }
    >
      <div
        className="relative h-full text-lg"
        style={{ fontFamily: '"M PLUS Rounded 1c", var(--pop-font)' }}
      >
        <div className="pointer-events-none absolute left-1/2 top-[9.2%] z-10 flex w-[56%] -translate-x-1/2 items-center justify-center gap-7 text-center">
          <div
            className="text-4xl font-black text-amber-900/90 drop-shadow-[0_1px_0_rgba(255,245,220,0.75)]"
            style={{ transform: "rotate(-3deg)" }}
          >
            {selection.grade}きゅう
          </div>
          <div
            className="text-3xl font-extrabold text-amber-900/90 drop-shadow-[0_1px_0_rgba(255,245,220,0.75)]"
            style={{ transform: "rotate(3deg)" }}
          >
            {subjectLabel(selection.subject)}
          </div>
        </div>

        <div className="absolute inset-x-0 top-[41%] h-[40%]">
          {cards.map((card) => {
            const canPlay = canPlayStage(
              progress,
              selection.grade,
              selection.subject,
              card.stage,
            );
            const isCleared = clearedStage >= card.stage;
            return (
              <button
                key={card.stage}
                onClick={() => onPickStage(card.stage)}
                disabled={!canPlay}
                className={`absolute top-0 h-[88%] w-[26%] -translate-x-1/2 rounded-2xl p-0 text-left transition ${
                  canPlay
                    ? "hover:bg-white/5"
                    : "cursor-not-allowed text-white/70"
                }`}
                style={{ left: card.left, top: card.top }}
              >
                <div
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{ top: card.titleTop }}
                >
                  <div
                    className="text-2xl font-black text-slate-800 drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]"
                    style={{ transform: `rotate(${card.titleTilt})` }}
                  >
                    {stageLabel(card.stage)}
                  </div>
                </div>

                {isCleared ? (
                  <span className="absolute right-[9%] top-[11%] rounded-full bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
                    クリア
                  </span>
                ) : null}

                <div
                  className="absolute left-[10%] right-[10%] text-sm text-slate-800"
                  style={{
                    top: card.detailTop,
                    transform: `rotate(${card.titleTilt})`,
                  }}
                >
                  {card.stage === 1
                    ? "3もん / じかんせいげんなし / ノーミス"
                    : null}
                  {card.stage === 2
                    ? "3もん / じかんせいげんあり / ノーミス"
                    : null}
                  {card.stage === 3
                    ? "5もん / じかんせいげんあり / ノーミス"
                    : null}
                  {!canPlay ? (
                    <div className="mt-2 inline-block rounded-full bg-black/35 px-2 py-1 text-xs font-bold text-white">
                      ロック みかいほう
                    </div>
                  ) : null}
                </div>

                <div
                  className="absolute bottom-[40%] left-[10%] right-[10%] h-2 rounded-full bg-white/50"
                  style={{ transform: `rotate(${card.titleTilt})` }}
                >
                  <div
                    className={`h-2 rounded-full ${card.color}`}
                    style={{
                      width: isCleared ? "100%" : canPlay ? "45%" : "0%",
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="absolute inset-x-0 bottom-2 px-4">
          <div className="rounded-2xl border border-white/35 bg-white/58 p-4 shadow-sm backdrop-blur-md">
            <div className="grid gap-3 sm:grid-cols-3 [&_label>span]:text-slate-800 [&_select]:border-white/60 [&_select]:bg-white/75 [&_select]:text-slate-800 [&_select]:shadow-sm">
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
          </div>
        </div>
      </div>
    </SceneFrame>
  );
}
