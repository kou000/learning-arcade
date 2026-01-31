import React from "react";
import mascotPng from "../../assets/mascot.png";

type Props = { size?: number; className?: string; alt?: string };

export function Mascot({ size = 160, className, alt = "アーク（learning-arcadeのともだち）" }: Props) {
  return (
    <img
      src={mascotPng}
      alt={alt}
      width={size}
      height={size}
      draggable={false}
      className={`select-none ${className ?? ""}`}
    />
  );
}
