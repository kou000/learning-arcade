import React, { useMemo, useState } from "react";
import { SceneFrame } from "@/features/soroban/components/SceneFrame";
import {
  loadProblemLogs,
  type ProblemLogEntry,
  type RegisterSubject,
} from "@/features/soroban/state";

type Props = {
  onGoRegister: () => void;
};

type LogStats = {
  total: number;
  correct: number;
  wrong: number;
  wrongAttempts: number;
  review: number;
};

const SUBJECT_ORDER: RegisterSubject[] = [
  "mitori",
  "mul",
  "div",
  "mentalMitori",
  "mentalMul",
  "mentalDiv",
];

const SUBJECT_META: Record<
  RegisterSubject,
  { label: string; barClassName: string; dotClassName: string }
> = {
  mitori: {
    label: "みとり",
    barClassName: "bg-sky-400",
    dotClassName: "bg-sky-400",
  },
  mul: {
    label: "かけ",
    barClassName: "bg-emerald-400",
    dotClassName: "bg-emerald-400",
  },
  div: {
    label: "わり",
    barClassName: "bg-amber-400",
    dotClassName: "bg-amber-400",
  },
  mentalMitori: {
    label: "みとり暗",
    barClassName: "bg-violet-400",
    dotClassName: "bg-violet-400",
  },
  mentalMul: {
    label: "かけ暗",
    barClassName: "bg-fuchsia-400",
    dotClassName: "bg-fuchsia-400",
  },
  mentalDiv: {
    label: "わり暗",
    barClassName: "bg-rose-400",
    dotClassName: "bg-rose-400",
  },
};

const emptyStats = (): LogStats => ({
  total: 0,
  correct: 0,
  wrong: 0,
  wrongAttempts: 0,
  review: 0,
});

function formatLocalDateOnly(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseDateOnly(dateOnly: string): Date {
  return new Date(
    Number(dateOnly.slice(0, 4)),
    Number(dateOnly.slice(5, 7)) - 1,
    Number(dateOnly.slice(8, 10)),
  );
}

function mondayOfWeek(date: Date): Date {
  const weekday = date.getDay();
  const offset = weekday === 0 ? -6 : 1 - weekday;
  return addDays(date, offset);
}

function dateLabel(dateOnly: string): string {
  const [year, month, date] = dateOnly.split("-");
  if (!year || !month || !date) return dateOnly;
  return `${Number(month)}月${Number(date)}日`;
}

function addLog(stats: LogStats, log: ProblemLogEntry): LogStats {
  const hasWrongAttempt = log.result === "wrong" || log.wrongAttemptCount > 0;
  return {
    total: stats.total + 1,
    correct:
      stats.correct + (log.result === "correct" && !hasWrongAttempt ? 1 : 0),
    wrong: stats.wrong + (hasWrongAttempt ? 1 : 0),
    wrongAttempts: stats.wrongAttempts + log.wrongAttemptCount,
    review: stats.review + (log.isReview ? 1 : 0),
  };
}

function summarize(logs: ProblemLogEntry[]): LogStats {
  return logs.reduce((stats, log) => addLog(stats, log), emptyStats());
}

function percent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function chartScaleMax(maxValue: number): number {
  return Math.max(50, Math.ceil(maxValue / 50) * 50);
}

function hasWrongAttempt(log: ProblemLogEntry): boolean {
  return log.result === "wrong" || log.wrongAttemptCount > 0;
}

function countBySubject(
  logs: ProblemLogEntry[],
): Record<RegisterSubject, number> {
  const counts = Object.fromEntries(
    SUBJECT_ORDER.map((subject) => [subject, 0]),
  ) as Record<RegisterSubject, number>;
  logs.forEach((log) => {
    counts[log.subject] += 1;
  });
  return counts;
}

function weekdayLabel(dateOnly: string): string {
  const [year, month, date] = dateOnly.split("-").map(Number);
  if (!year || !month || !date) return "";
  return ["日", "月", "火", "水", "木", "金", "土"][
    new Date(year, month - 1, date).getDay()
  ];
}

function MetricPill({
  label,
  value,
  className,
  unit = "もん",
}: {
  label: string;
  value: number;
  className: string;
  unit?: string;
}) {
  return (
    <div className={`rounded-2xl px-4 py-3 ${className}`}>
      <div className="text-xs font-black">{label}</div>
      <div className="mt-1 text-2xl font-black leading-none">
        {value}
        <span className="ml-1 text-xs">{unit}</span>
      </div>
    </div>
  );
}

function SubjectSummary({
  correctBySubject,
  wrongBySubject,
}: {
  correctBySubject: Record<RegisterSubject, number>;
  wrongBySubject: Record<RegisterSubject, number>;
}) {
  return (
    <div className="grid gap-2">
      {SUBJECT_ORDER.map((subject) => {
        const correct = correctBySubject[subject];
        const wrong = wrongBySubject[subject];
        return (
          <div
            key={subject}
            className={`grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-xl px-3 py-2 text-xs font-black ${
              correct + wrong > 0 ? "bg-white" : "bg-slate-50 text-slate-400"
            }`}
          >
            <span className="inline-flex items-center gap-2 text-slate-700">
              <span
                className={`h-3 w-3 ${SUBJECT_META[subject].dotClassName}`}
              />
              {SUBJECT_META[subject].label}
            </span>
            <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700">
              せいかい {correct}
            </span>
            <span className="rounded-lg bg-rose-50 px-2 py-1 text-rose-700">
              まちがえた {wrong}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StackedSubjectBar({
  label,
  counts,
  total,
  maxTotal,
}: {
  label: string;
  counts: Record<RegisterSubject, number>;
  total: number;
  maxTotal: number;
}) {
  const height = percent(total, Math.max(1, maxTotal));
  return (
    <div className="grid justify-items-center gap-2">
      <div className="flex h-52 w-8 items-end bg-slate-100 p-0.5">
        <div
          className="flex w-full flex-col-reverse overflow-hidden"
          style={{ height: `${height}%` }}
        >
          {SUBJECT_ORDER.map((subject) => {
            const count = counts[subject];
            if (count <= 0) return null;
            return (
              <div
                key={subject}
                className={`w-full ${SUBJECT_META[subject].barClassName}`}
                style={{ height: `${percent(count, total)}%` }}
                title={`${SUBJECT_META[subject].label} ${count}もん`}
              />
            );
          })}
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-black text-slate-800">{total}</div>
        <div className="text-[10px] font-black leading-tight text-slate-500">
          {label}
        </div>
      </div>
    </div>
  );
}

export function ProblemLogPage({ onGoRegister }: Props) {
  const logs = useMemo(() => loadProblemLogs(), []);
  const today = formatLocalDateOnly(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const selectedDateObject = useMemo(
    () => parseDateOnly(selectedDate),
    [selectedDate],
  );
  const weekStartDate = useMemo(
    () => mondayOfWeek(selectedDateObject),
    [selectedDateObject],
  );
  const weekDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        formatLocalDateOnly(addDays(weekStartDate, index)),
      ),
    [weekStartDate],
  );
  const weekStartDateOnly = weekDates[0] ?? selectedDate;
  const weekEndDateOnly = weekDates[6] ?? selectedDate;

  const selectedStats = summarize(
    logs.filter((log) => log.answeredOn === selectedDate),
  );
  const selectedLogs = logs.filter((log) => log.answeredOn === selectedDate);
  const selectedCorrectBySubject = countBySubject(
    selectedLogs.filter(
      (log) => log.result === "correct" && !hasWrongAttempt(log),
    ),
  );
  const selectedWrongBySubject = countBySubject(
    selectedLogs.filter(hasWrongAttempt),
  );
  const weekRows = weekDates.map((dateOnly) => ({
    dateOnly,
    logs: logs.filter((log) => log.answeredOn === dateOnly),
  }));
  const weekStatsRows = weekRows.map((row) => {
    const correctLogs = row.logs.filter(
      (log) => log.result === "correct" && !hasWrongAttempt(log),
    );
    const wrongLogs = row.logs.filter(hasWrongAttempt);
    return {
      dateOnly: row.dateOnly,
      stats: summarize(row.logs),
      correctBySubject: countBySubject(correctLogs),
      wrongBySubject: countBySubject(wrongLogs),
    };
  });
  const maxDailyOutcome = chartScaleMax(
    Math.max(
      0,
      ...weekStatsRows.flatMap((row) => [row.stats.correct, row.stats.wrong]),
    ),
  );
  const maxSelectedOutcome = chartScaleMax(
    Math.max(0, selectedStats.correct, selectedStats.wrong),
  );
  const selectedDateLabel =
    selectedDate === today ? "きょう" : `${dateLabel(selectedDate)}のがんばり`;
  const canGoNextDate = selectedDate < today;
  const moveSelectedDate = (days: number) => {
    const current = parseDateOnly(selectedDate);
    const next = formatLocalDateOnly(addDays(current, days));
    setSelectedDate(next > today ? today : next);
  };

  return (
    <SceneFrame
      outsideTopLeft={
        <button
          className="rounded-xl bg-transparent px-4 py-3 text-base font-semibold text-slate-700 hover:bg-white/60"
          onClick={onGoRegister}
        >
          ← ゲームモードTOP
        </button>
      }
    >
      <div className="grid gap-5 text-slate-900">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <div className="text-sm font-bold text-sky-700">レジゲーム</div>
            <h1 className="text-2xl font-black text-slate-900">がんばりログ</h1>
          </div>
          <div className="ml-auto flex flex-wrap items-end gap-2">
            <button
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50"
              onClick={() => moveSelectedDate(-1)}
            >
              まえの日
            </button>
            <label className="grid gap-1 text-xs font-black text-slate-500">
              <span>ひにち</span>
              <input
                type="date"
                max={today}
                value={selectedDate}
                onChange={(event) => {
                  const next = event.target.value;
                  if (!next) return;
                  setSelectedDate(next > today ? today : next);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-800 shadow-sm"
              />
            </label>
            <button
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => moveSelectedDate(1)}
              disabled={!canGoNextDate}
            >
              つぎの日
            </button>
            <button
              className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-black text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => setSelectedDate(today)}
              disabled={selectedDate === today}
            >
              きょう
            </button>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm">
          <div className="grid gap-5 p-5 lg:grid-cols-[0.85fr_0.9fr_1.15fr] lg:items-center">
            <div>
              <div className="text-sm font-black text-sky-700">
                {selectedDateLabel}
              </div>
              <div className="mt-3 text-sm font-black text-slate-500">
                ぜんぶで といた問題
              </div>
              <div className="mt-2 flex items-end gap-3">
                <div className="text-7xl font-black leading-none tracking-normal text-slate-900">
                  {selectedStats.total}
                </div>
                <div className="pb-2 text-2xl font-black text-slate-600">
                  もん
                </div>
              </div>
              {logs.length === 0 ? (
                <div className="mt-4 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800">
                  レジゲームを1もんとくと、ここにきろくされるよ
                </div>
              ) : null}
            </div>

            <div className="grid gap-3">
              <div className="flex items-end justify-center gap-8 rounded-2xl bg-slate-50 px-4 py-4">
                <StackedSubjectBar
                  label="せいかい"
                  counts={selectedCorrectBySubject}
                  total={selectedStats.correct}
                  maxTotal={maxSelectedOutcome}
                />
                <StackedSubjectBar
                  label="まちがえた"
                  counts={selectedWrongBySubject}
                  total={selectedStats.wrong}
                  maxTotal={maxSelectedOutcome}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MetricPill
                  label="せいかい"
                  value={selectedStats.correct}
                  className="bg-emerald-50 text-emerald-700"
                />
                <MetricPill
                  label="まちがえた"
                  value={selectedStats.wrong}
                  className="bg-rose-50 text-rose-700"
                />
                <MetricPill
                  label="まちがえた回数"
                  value={selectedStats.wrongAttempts}
                  className="bg-amber-50 text-amber-700"
                  unit="かい"
                />
                <MetricPill
                  label="ふくしゅうでといた"
                  value={selectedStats.review}
                  className="bg-sky-50 text-sky-700"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <div className="mb-2 text-xs font-black text-slate-500">
                しゅるいごと
              </div>
              <SubjectSummary
                correctBySubject={selectedCorrectBySubject}
                wrongBySubject={selectedWrongBySubject}
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <h2 className="text-xl font-black text-slate-900">しゅうごと</h2>
              <div className="mt-1 text-sm font-bold text-slate-500">
                {dateLabel(weekStartDateOnly)}から{dateLabel(weekEndDateOnly)}
                まで
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3 text-xs font-black text-slate-500">
              {SUBJECT_ORDER.map((subject) => (
                <span key={subject} className="inline-flex items-center gap-1">
                  <span
                    className={`h-3 w-3 rounded-full ${SUBJECT_META[subject].dotClassName}`}
                  />
                  {SUBJECT_META[subject].label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 overflow-x-auto pb-1">
            <div className="grid min-w-[680px] grid-cols-7 gap-3">
              {weekStatsRows.map(
                ({ dateOnly, stats, correctBySubject, wrongBySubject }) => {
                  const isToday = dateOnly === today;
                  const isSelected = dateOnly === selectedDate;
                  const isFuture = dateOnly > today;
                  return (
                    <button
                      type="button"
                      key={dateOnly}
                      onClick={() => {
                        if (!isFuture) setSelectedDate(dateOnly);
                      }}
                      disabled={isFuture}
                      className={`grid gap-3 rounded-2xl border p-3 text-left transition disabled:cursor-not-allowed ${
                        isSelected
                          ? "border-sky-400 bg-sky-50 shadow-sm ring-2 ring-sky-200"
                          : isToday
                            ? "border-sky-200 bg-sky-50/70"
                            : isFuture
                              ? "border-slate-100 bg-slate-50/60 text-slate-400 opacity-60"
                              : stats.total > 0
                                ? "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
                                : "border-slate-100 bg-slate-50/70 text-slate-400 hover:-translate-y-0.5 hover:shadow-md"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-sm font-black leading-tight">
                          {dateLabel(dateOnly)}
                        </div>
                        <div className="mt-0.5 text-xs font-black text-slate-500">
                          {weekdayLabel(dateOnly)
                            ? `${weekdayLabel(dateOnly)}ようび`
                            : ""}
                        </div>
                        {isToday ? (
                          <div className="mt-1 text-xs font-black text-sky-700">
                            きょう
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-end justify-center gap-4">
                        <StackedSubjectBar
                          label="せいかい"
                          counts={correctBySubject}
                          total={stats.correct}
                          maxTotal={maxDailyOutcome}
                        />
                        <StackedSubjectBar
                          label="まちがえた"
                          counts={wrongBySubject}
                          total={stats.wrong}
                          maxTotal={maxDailyOutcome}
                        />
                      </div>

                      <div className="rounded-xl bg-white/70 px-2 py-2 text-center">
                        <div className="text-xl font-black text-slate-900">
                          {stats.total}
                          <span className="ml-1 text-xs text-slate-500">
                            もん
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </section>
      </div>
    </SceneFrame>
  );
}
