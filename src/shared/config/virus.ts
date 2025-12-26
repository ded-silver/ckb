import type { VirusType } from "@features/virus/model";

export interface AdBannerConfig {
  title: string;
  text: string;
  subtitle: string;
}

export const AD_BANNERS_SET_1: AdBannerConfig[] = [
  {
    title: "CLICK HERE!",
    text: "WIN 1,000,000 CREDITS!",
    subtitle: "99% SUCCESS RATE!",
  },
  {
    title: "SPECIAL OFFER!",
    text: "GET RICH QUICK!",
    subtitle: "ONLY TODAY!",
  },
  {
    title: "UPGRADE NOW!",
    text: "BOOST YOUR SYSTEM!",
    subtitle: "50% DISCOUNT!",
  },
  {
    title: "FREE DOWNLOAD!",
    text: "PREMIUM HACKING TOOLS!",
    subtitle: "LIMITED TIME!",
  },
  {
    title: "HOT DEAL!",
    text: "NEOCORP PREMIUM!",
    subtitle: "999 CREDITS/MONTH!",
  },
  {
    title: "WINNER!",
    text: "YOU WON 500,000!",
    subtitle: "CLAIM NOW!",
  },
];

export const AD_BANNERS_SET_2: AdBannerConfig[] = [
  {
    title: "EXCLUSIVE!",
    text: "VIP ACCESS!",
    subtitle: "JOIN NOW!",
  },
  {
    title: "BONUS!",
    text: "EXTRA CREDITS!",
    subtitle: "FREE TRIAL!",
  },
  {
    title: "SALE!",
    text: "80% OFF!",
    subtitle: "LAST CHANCE!",
  },
  {
    title: "NEW!",
    text: "LATEST TOOLS!",
    subtitle: "GET THEM NOW!",
  },
  {
    title: "PREMIUM!",
    text: "UNLOCK ALL!",
    subtitle: "SUBSCRIBE!",
  },
  {
    title: "ALERT!",
    text: "SECURITY BREACH!",
    subtitle: "PROTECT NOW!",
  },
];

interface EffectConfig {
  interval: number;
  duration: number;
  randomOffset?: number;
}

export interface VirusEffectConfig {
  glitch?: EffectConfig;
  shake?: EffectConfig;
  corruption?: EffectConfig;
  wave?: Omit<EffectConfig, "randomOffset">;
  chaos?: EffectConfig;
  pulse?: EffectConfig;
  adBanners?: EffectConfig & { count: number };
}

export const VIRUS_EFFECTS_CONFIG: Record<VirusType, VirusEffectConfig> = {
  trojan: {
    glitch: {
      interval: 2000,
      duration: 100,
      randomOffset: 1000,
    },
    shake: {
      interval: 3000,
      duration: 200,
    },
    corruption: {
      interval: 4000,
      duration: 150,
    },
  },
  honeypot: {
    wave: {
      interval: 2500,
      duration: 300,
    },
    pulse: {
      interval: 2000,
      duration: 500,
    },
  },
  prototype: {
    chaos: {
      interval: 1500,
      duration: 200,
      randomOffset: 1000,
    },
    glitch: {
      interval: 1000,
      duration: 150,
      randomOffset: 2000,
    },
    shake: {
      interval: 2000,
      duration: 300,
      randomOffset: 1500,
    },
  },
  adware: {
    pulse: {
      interval: 1500,
      duration: 400,
    },
    glitch: {
      interval: 2500,
      duration: 100,
      randomOffset: 1000,
    },
    adBanners: {
      count: 2,
      interval: 3000,
      duration: 1500,
      randomOffset: 2000,
    },
  },
  corruption: {
    glitch: {
      interval: 1000,
      duration: 200,
      randomOffset: 500,
    },
    corruption: {
      interval: 2000,
      duration: 300,
      randomOffset: 1000,
    },
    shake: {
      interval: 1500,
      duration: 150,
      randomOffset: 500,
    },
  },
};

export const SIDE_BANNERS = {
  left: "CLICK FOR FREE CREDITS!",
  right: "UPGRADE NOW!",
};
