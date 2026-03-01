import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type LongPressPreviewImageProps = {
  src: string;
  alt: string;
  title?: string;
  longPressMs?: number;
  imageClassName?: string;
  missingClassName?: string;
  missingContent?: React.ReactNode;
  onImageError?: () => void;
};

export function LongPressPreviewImage({
  src,
  alt,
  title,
  longPressMs = 420,
  imageClassName = "h-24 w-24 rounded-xl border border-slate-200 bg-white object-contain p-2",
  missingClassName = "flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-100 text-xs text-slate-500",
  missingContent = "がぞうなし",
  onImageError,
}: LongPressPreviewImageProps) {
  const [missing, setMissing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const longPressTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (longPressTimerRef.current != null) {
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    },
    [],
  );

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const startLongPress = () => {
    clearLongPressTimer();
    longPressTimerRef.current = window.setTimeout(() => {
      setIsPreviewOpen(true);
      longPressTimerRef.current = null;
    }, longPressMs);
  };

  return (
    <>
      {missing ? (
        <div className={missingClassName}>{missingContent}</div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => {
            setMissing(true);
            onImageError?.();
          }}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            startLongPress();
          }}
          onPointerUp={clearLongPressTimer}
          onPointerLeave={clearLongPressTimer}
          onPointerCancel={clearLongPressTimer}
          onContextMenu={(event) => event.preventDefault()}
          className={imageClassName}
        />
      )}

      {isPreviewOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/75 p-4"
              onClick={() => setIsPreviewOpen(false)}
            >
              <div
                className="grid max-h-[90vh] w-full max-w-3xl gap-3 rounded-2xl border border-white/20 bg-slate-950/85 p-4"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold text-white">{title ?? alt}</div>
                  <button
                    className="rounded-lg border border-white/30 px-3 py-1 text-sm font-semibold text-white hover:bg-white/10"
                    onClick={() => setIsPreviewOpen(false)}
                  >
                    とじる
                  </button>
                </div>
                <img
                  src={src}
                  alt={alt}
                  className="max-h-[75vh] w-full rounded-xl bg-white object-contain p-2"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
