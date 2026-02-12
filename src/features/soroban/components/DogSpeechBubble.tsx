import React from "react";

type DogSpeechBubbleProps = {
  text: React.ReactNode;
  tone?: "default" | "reply";
  preserveLineBreaks?: boolean;
  className?: string;
};

export function DogSpeechBubble({
  text,
  tone = "default",
  preserveLineBreaks = false,
  className,
}: DogSpeechBubbleProps) {
  const isReplyTone = tone === "reply";
  const borderClass = isReplyTone ? "border-sky-200" : "border-slate-200";
  const bodyClass = isReplyTone
    ? "bg-sky-100/95 text-sky-900"
    : "bg-white/95 text-slate-800";
  const labelClass = isReplyTone ? "text-sky-700" : "text-slate-500";
  const textClass = preserveLineBreaks ? "whitespace-pre-line" : "";

  return (
    <div
      className={`relative rounded-[24px] border-2 px-5 py-4 shadow-lg ${borderClass} ${bodyClass} ${className ?? ""}`}
    >
      <div className={`text-xs font-semibold ${labelClass}`}>
        おきゃくさん（しばいぬ）
      </div>
      <div className={`mt-1 text-xl font-black leading-relaxed ${textClass}`}>
        {text}
      </div>
      <div
        className={`absolute -bottom-3 right-[164px] h-6 w-6 rotate-45 border-b-2 border-r-2 ${borderClass} ${bodyClass}`}
      />
    </div>
  );
}
