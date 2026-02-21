import React from "react";
import coinIcon from "@/assets/coin.png";

const formatNumber = (value: number) =>
  new Intl.NumberFormat("ja-JP").format(Math.max(0, Math.floor(value)));

type CoinValueProps = {
  amount: number;
  className?: string;
  amountClassName?: string;
  unitClassName?: string;
  iconClassName?: string;
  unitLabel?: string;
  showUnit?: boolean;
};

export function CoinValue({
  amount,
  className,
  amountClassName,
  unitClassName,
  iconClassName,
  unitLabel = "コイン",
  showUnit = true,
}: CoinValueProps) {
  return (
    <span className={`inline-flex items-center gap-1 align-middle whitespace-nowrap ${className ?? ""}`}>
      <img
        src={coinIcon}
        alt=""
        aria-hidden
        className={`h-5 w-5 object-contain ${iconClassName ?? ""}`}
      />
      <span className={amountClassName}>{formatNumber(amount)}</span>
      {showUnit ? <span className={unitClassName}>{unitLabel}</span> : null}
    </span>
  );
}
