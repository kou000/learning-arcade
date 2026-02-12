import React from "react";
import { Button } from "@/ui/components/Button";
import { formatMMSS } from "@/features/practice/hooks/useTimer";

type Props = {
  secondsLeft: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
};

export function TimerBar({ secondsLeft, isRunning, onStart, onPause, onReset }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mr-auto flex items-center gap-2">
        <div className="text-xs font-semibold text-slate-600">タイマー</div>
        <div className="rounded-xl bg-slate-900 px-3 py-1 text-sm font-bold text-white">
          {formatMMSS(secondsLeft)}
        </div>
      </div>

      {!isRunning ? (
        <Button onClick={onStart} variant="primary">スタート</Button>
      ) : (
        <Button onClick={onPause} variant="ghost">一時停止</Button>
      )}
      <Button onClick={onReset} variant="ghost">リセット</Button>
    </div>
  );
}
