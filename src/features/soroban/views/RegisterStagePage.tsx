import React, { useEffect, useMemo, useState } from "react";
import type { ExamBody, Grade } from "../../../domain/specs/types";
import {
  EXAM_BODY_LABELS,
  getAvailableGrades,
} from "../../../domain/specs/kenteiSpec";
import { Select } from "../../../ui/components/Select";
import { SceneFrame } from "../SceneFrame";
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
} from "../state";

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

function stageDetail(stage: RegisterStage, subject: RegisterSubject): string {
  if (subject === "mitori") {
    if (stage === 1) return "2もん\nじかんせいげんなし\nノーミス";
    if (stage === 2) return "2もん\nじかんせいげんゆるめ\nノーミス";
    if (stage === 3) return "3もん\nじかんせいげん\nノーミス";
    if (stage === 4) return "5もん\nじかんせいげん\nノーミス";
    if (stage === 5) return "7もん\nじかんせいげん\nノーミス";
    return "けんていとおなじ\nもんだいすう\nノーミス";
  }
  if (stage === 1) return "3もん\nじかんせいげんなし\nノーミス";
  if (stage === 2) return "3もん\nじかんせいげんゆるめ\nノーミス";
  if (stage === 3) return "5もん\nじかんせいげん\nノーミス";
  if (stage === 4) return "7もん\nじかんせいげん\nノーミス";
  if (stage === 5) return "10もん\nじかんせいげん\nノーミス";
  return "けんていとおなじ\nもんだいすう\nノーミス";
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
  const [stagePanel, setStagePanel] = useState<1 | 2>(1);

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
    titleColor: string;
    titleTilt: string;
    titleTop: string;
    detailTop: string;
  }> =
    stagePanel === 1
      ? [
          {
            stage: 1,
            left: "22%",
            top: "0%",
            color: "bg-emerald-600",
            titleColor: "#708135",
            titleTilt: "-4deg",
            titleTop: "9%",
            detailTop: "31%",
          },
          {
            stage: 2,
            left: "50%",
            top: "-2.5%",
            color: "bg-amber-600",
            titleColor: "#d3872b",
            titleTilt: "0deg",
            titleTop: "9.5%",
            detailTop: "31%",
          },
          {
            stage: 3,
            left: "79%",
            top: "0%",
            color: "bg-sky-600",
            titleColor: "#6792a6",
            titleTilt: "3deg",
            titleTop: "9%",
            detailTop: "31%",
          },
        ]
      : [
          {
            stage: 4,
            left: "22%",
            top: "0%",
            color: "bg-violet-600",
            titleColor: "#7c5dc2",
            titleTilt: "-4deg",
            titleTop: "9%",
            detailTop: "31%",
          },
          {
            stage: 5,
            left: "50%",
            top: "-2.5%",
            color: "bg-rose-600",
            titleColor: "#cd5b83",
            titleTilt: "0deg",
            titleTop: "9.5%",
            detailTop: "31%",
          },
          {
            stage: 6,
            left: "79%",
            top: "0%",
            color: "bg-indigo-700",
            titleColor: "#596ec0",
            titleTilt: "3deg",
            titleTop: "9%",
            detailTop: "31%",
          },
        ];

  return (
    <SceneFrame
      backgroundImage="/assets/register-stage-select.png"
      fullscreenBackground
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

        {stagePanel === 1 ? (
          <div className="absolute right-[2.4%] top-[43%] z-20 -translate-y-1/2">
            <button
              aria-label="チャレンジステージへ"
              className="rounded-2xl border-2 border-white/80 bg-white/80 px-5 py-4 text-5xl font-black leading-none text-slate-700 shadow-lg transition hover:bg-white"
              onClick={() => setStagePanel(2)}
            >
              ▶
            </button>
          </div>
        ) : (
          <div className="absolute left-[2.4%] top-[43%] z-20 -translate-y-1/2">
            <button
              aria-label="通常ステージへ"
              className="rounded-2xl border-2 border-white/80 bg-white/80 px-5 py-4 text-5xl font-black leading-none text-slate-700 shadow-lg transition hover:bg-white"
              onClick={() => setStagePanel(1)}
            >
              ◀
            </button>
          </div>
        )}

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
                    className="whitespace-nowrap text-3xl font-black text-slate-800 drop-shadow-[0_1px_0_rgba(255,255,255,0.35)]"
                    style={{
                      transform: `rotate(${card.titleTilt})`,
                      color: card.titleColor,
                    }}
                  >
                    {stageLabel(card.stage)}
                  </div>
                </div>

                {isCleared ? (
                  <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                    <span
                      className="inline-block whitespace-nowrap rounded-full border-2 border-amber-100/90 bg-emerald-600/95 px-5 py-2 text-2xl font-black text-emerald-50 shadow-[0_2px_0_rgba(92,63,24,0.45)]"
                      style={{ transform: `rotate(${card.titleTilt})` }}
                    >
                      ✓ クリア！
                    </span>
                  </div>
                ) : null}

                <div
                  className="absolute left-[10%] right-[10%] z-10 whitespace-pre-line px-2 text-base font-bold text-slate-800"
                  style={{
                    top: card.detailTop,
                    transform: `rotate(${card.titleTilt})`,
                  }}
                >
                  {stageDetail(card.stage, selection.subject)}
                </div>

                {!canPlay ? (
                  <div
                    className="absolute left-[8%] right-[8%] top-1/2 z-30 rounded-xl bg-black/80 px-3 py-4 text-center text-white shadow-lg backdrop-blur-[1px]"
                    style={{
                      transform: `translateY(-50%) rotate(${card.titleTilt})`,
                    }}
                  >
                    <div className="text-base font-black">
                      🔒 ろっく みかいほう
                    </div>
                    <div className="mx-2 mt-1 text-xs font-bold text-white/85">
                      ひとつまえの すてーじを
                      <br />
                      くりあすると あそべるよ
                    </div>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="absolute inset-x-0 bottom-2 px-4">
          <div className="rounded-2xl border border-white/35 bg-white/58 p-4 shadow-sm backdrop-blur-md">
            <div className="grid gap-3 sm:grid-cols-3 [&_label>span]:text-slate-800 [&_select]:h-12 [&_select]:min-h-[48px] [&_select]:border-white/60 [&_select]:bg-white/75 [&_select]:px-3 [&_select]:py-2.5 [&_select]:text-base [&_select]:text-slate-800 [&_select]:shadow-sm">
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
