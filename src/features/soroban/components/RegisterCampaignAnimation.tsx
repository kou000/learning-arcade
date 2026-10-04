import React, { useState } from "react";
import keimaruSoroban from "@/assets/seal/keimaru-soroban-sticker.png";
import keimaruOk from "@/assets/seal/keimaru-ok-sticker.png";
import type { RegisterCampaign } from "@/features/soroban/registerCampaigns";
import "./registerCampaignAnimation.css";

export function RegisterCampaignAnimation({ campaign }: { campaign: RegisterCampaign }) {
  const [paused, setPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [, month, day] = campaign.endsOn.split("-");
  const deadline = `${Number(month)}/${Number(day)}まで`;

  return (
    <section
      className="register-campaign-animation"
      data-paused={paused}
      aria-label={`${campaign.title}。${campaign.description}。${deadline}`}
    >
      <div className="register-campaign-animation__sparkles" aria-hidden="true">
        <span>✦</span><span>✦</span><span>✦</span><span>✦</span>
      </div>
      <div className="register-campaign-animation__character" aria-hidden="true">
        {[
          { src: keimaruSoroban, pose: "soroban" },
          { src: keimaruOk, pose: "ok" },
        ].map(({ src, pose }) => (
          <div key={pose} className={`register-campaign-animation__pose register-campaign-animation__pose--${pose}`}>
            {failedImages[pose] ? (
              <span className="register-campaign-animation__fallback">けいまるくん<br />おうえんしてるよ！</span>
            ) : (
              <img
                src={src}
                alt=""
                onError={() => setFailedImages((previous) => ({ ...previous, [pose]: true }))}
              />
            )}
          </div>
        ))}
      </div>
      <div className="register-campaign-animation__copy">
        <div className="register-campaign-animation__eyebrow">けいまるくんから おしらせ</div>
        <h2>{campaign.title}</h2>
        <div className="register-campaign-animation__scenes" aria-hidden="true">
          <div className="register-campaign-animation__scene register-campaign-animation__scene--intro">
            <strong>はじまったよ！</strong>
            <span>みとりざんに チャレンジ！</span>
          </div>
          <div className="register-campaign-animation__scene register-campaign-animation__scene--reward">
            <span>もらえるコインが</span>
            <strong className="register-campaign-animation__reward">{campaign.rewardMultiplier}<small>ばい！</small></strong>
          </div>
          <div className="register-campaign-animation__scene register-campaign-animation__scene--cheer">
            <strong>いっしょに<br />がんばろう！</strong>
          </div>
        </div>
        <div className="register-campaign-animation__footer">
          <span>{deadline}</span>
          <span>{campaign.description}</span>
        </div>
      </div>
      <div className="register-campaign-animation__coins" aria-hidden="true">
        <span>★</span><span>★</span><span>★</span>
      </div>
      <button
        type="button"
        className="register-campaign-animation__pause"
        aria-label={paused ? "アニメーションをさいせい" : "アニメーションをとめる"}
        onClick={() => setPaused((previous) => !previous)}
      >
        {paused ? "▶ さいせい" : "Ⅱ とめる"}
      </button>
    </section>
  );
}
