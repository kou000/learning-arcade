import React from "react";
import type { ExamBody, Grade, Subject } from "../../../domain/specs/types";
import type { PracticeMode } from "../types";
import { EXAM_BODY_LABELS, getAvailableGrades, getGradeSpec } from "../../../domain/specs/kenteiSpec";
import { subjectLabel } from "../../../domain/generator";
import { Button } from "../../../ui/components/Button";
import { Select } from "../../../ui/components/Select";
import { NumberInput } from "../../../ui/components/NumberInput";
import { Toggle } from "../../../ui/components/Toggle";

type Props = {
  grade: Grade;
  subject: Subject;
  mode: PracticeMode;
  examBody: ExamBody;
  sets: number;
  showAnswers: boolean;
  onChangeGrade: (g: Grade) => void;
  onChangeSubject: (s: Subject) => void;
  onChangeExamBody: (b: ExamBody) => void;
  onChangeMode: (m: PracticeMode) => void;
  onChangeSets: (n: number) => void;
  onToggleAnswers: (v: boolean) => void;
  onGenerate: () => void;
};

export function ControlBar({
  grade, subject, mode, examBody, sets, showAnswers,
  onChangeGrade, onChangeSubject, onChangeExamBody, onChangeMode, onChangeSets, onToggleAnswers, onGenerate
}: Props) {
  const gradeOptions = getAvailableGrades(examBody).map((g) => ({ value: g, label: `${g}級` }));
  const examOptions: { value: ExamBody; label: string }[] = [
    { value: "zenshugakuren", label: EXAM_BODY_LABELS.zenshugakuren },
  ];

  const gradeSpec = getGradeSpec(examBody, grade);
  const hasDenpyo = Boolean(gradeSpec?.denpyo);
  const subjectOptions: { value: Subject; label: string }[] = [
    { value: "mitori", label: subjectLabel("mitori") },
    { value: "mul", label: subjectLabel("mul") },
    { value: "div", label: subjectLabel("div") },
    ...(hasDenpyo ? [{ value: "denpyo" as const, label: subjectLabel("denpyo") }] : []),
  ];

  const isTestMode = mode === "test";

  return (
    <div className={`grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:items-end ${isTestMode ? "md:grid-cols-6" : "md:grid-cols-5"}`}>
      <Select label="検定" value={examBody} options={examOptions} onChange={(v) => onChangeExamBody(v as ExamBody)} />
      <Select label="級" value={grade} options={gradeOptions} onChange={(v) => onChangeGrade(Number(v) as Grade)} />
      <Select label="種目" value={subject} options={subjectOptions} onChange={(v) => onChangeSubject(v as Subject)} />
      {isTestMode ? (
        <>
          <NumberInput label="セット数" value={sets} min={1} max={10} onChange={onChangeSets} />
          <div className="flex items-center md:justify-center">
            <Toggle label="解答を表示" checked={showAnswers} onChange={onToggleAnswers} />
          </div>
        </>
      ) : null}
      <Button onClick={onGenerate} className="w-full">つくりなおす</Button>
    </div>
  );
}
