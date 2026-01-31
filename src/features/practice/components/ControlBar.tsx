import React from "react";
import type { Grade, Subject } from "../../../domain/specs/types";
import { KENTEI_SPEC } from "../../../domain/specs/kenteiSpec";
import { subjectLabel } from "../../../domain/generator";
import { Button } from "../../../ui/components/Button";
import { Select } from "../../../ui/components/Select";
import { NumberInput } from "../../../ui/components/NumberInput";
import { Toggle } from "../../../ui/components/Toggle";

type Props = {
  grade: Grade;
  subject: Subject;
  sets: number;
  showAnswers: boolean;
  onChangeGrade: (g: Grade) => void;
  onChangeSubject: (s: Subject) => void;
  onChangeSets: (n: number) => void;
  onToggleAnswers: (v: boolean) => void;
  onGenerate: () => void;
};

export function ControlBar({
  grade, subject, sets, showAnswers,
  onChangeGrade, onChangeSubject, onChangeSets, onToggleAnswers, onGenerate
}: Props) {
  const gradeOptions = (Object.keys(KENTEI_SPEC) as unknown as Grade[]).map((g) => ({ value: g, label: `${g}級` }));

  const hasDenpyo = Boolean(KENTEI_SPEC[grade].denpyo);
  const subjectOptions: { value: Subject; label: string }[] = [
    { value: "mitori", label: subjectLabel("mitori") },
    { value: "mul", label: subjectLabel("mul") },
    { value: "div", label: subjectLabel("div") },
    ...(hasDenpyo ? [{ value: "denpyo" as const, label: subjectLabel("denpyo") }] : []),
  ];

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5 md:items-end">
      <Select label="級" value={grade} options={gradeOptions} onChange={(v) => onChangeGrade(Number(v) as Grade)} />
      <Select label="種目" value={subject} options={subjectOptions} onChange={(v) => onChangeSubject(v as Subject)} />
      <NumberInput label="セット数" value={sets} min={1} max={10} onChange={onChangeSets} />
      <div className="flex items-center md:justify-center">
        <Toggle label="解答を表示" checked={showAnswers} onChange={onToggleAnswers} />
      </div>
      <Button onClick={onGenerate} className="w-full">問題を作る</Button>
    </div>
  );
}
