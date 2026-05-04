import type { RegisterSubject } from "@/features/soroban/state";

export type RegisterCampaign = {
  id: string;
  enabled: boolean;
  subject: RegisterSubject;
  startsOn: string;
  endsOn: string;
  rewardMultiplier: number;
  title: string;
  description: string;
  resultLabel: string;
};

export const REGISTER_CAMPAIGNS: RegisterCampaign[] = [
  {
    id: "mitori-reward-double",
    enabled: true,
    subject: "mitori",
    startsOn: "2026-05-01",
    endsOn: "2026-05-15",
    rewardMultiplier: 2,
    title: "みとりざん がんばりキャンペーン中",
    description: "もらえるコインが2ばい",
    resultLabel: "みとりざん がんばりキャンペーン 2ばい",
  },
];

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isCampaignActive(
  campaign: RegisterCampaign,
  date = new Date(),
): boolean {
  const today = formatLocalDate(date);
  return (
    campaign.enabled && campaign.startsOn <= today && today <= campaign.endsOn
  );
}

export function getActiveRegisterCampaigns(
  date = new Date(),
): RegisterCampaign[] {
  return REGISTER_CAMPAIGNS.filter((campaign) =>
    isCampaignActive(campaign, date),
  );
}

export function getActiveRegisterCampaign(
  subject: RegisterSubject,
  date = new Date(),
): RegisterCampaign | null {
  return (
    REGISTER_CAMPAIGNS.find(
      (campaign) =>
        campaign.subject === subject && isCampaignActive(campaign, date),
    ) ?? null
  );
}

export function getRegisterRewardMultiplier(subject: RegisterSubject): number {
  return getActiveRegisterCampaign(subject)?.rewardMultiplier ?? 1;
}
