import { useEffect, useState } from "react";
import { VirusType } from "../utils/virus";
import { VIRUS_EFFECTS_CONFIG } from "../constants/virusConfig";

interface UseVirusEffectsResult {
  glitch: boolean;
  shake: boolean;
  corruption: boolean;
  wave: boolean;
  chaos: boolean;
  pulse: boolean;
  adBanner: boolean;
  adBannerType: number;
  adBanner2: boolean;
  adBanner2Type: number;
}

const createToggleInterval = (
  config: { interval: number; duration: number; randomOffset?: number },
  setter: (value: boolean) => void
): ReturnType<typeof setInterval> => {
  const baseInterval =
    config.interval +
    (config.randomOffset ? Math.random() * config.randomOffset : 0);
  return setInterval(() => {
    setter(true);
    setTimeout(() => setter(false), config.duration);
  }, baseInterval);
};

export const useVirusEffects = (
  isActive: boolean,
  virusType: VirusType
): UseVirusEffectsResult => {
  const [glitch, setGlitch] = useState(false);
  const [shake, setShake] = useState(false);
  const [corruption, setCorruption] = useState(false);
  const [wave, setWave] = useState(false);
  const [chaos, setChaos] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [adBanner, setAdBanner] = useState(false);
  const [adBannerType, setAdBannerType] = useState(0);
  const [adBanner2, setAdBanner2] = useState(false);
  const [adBanner2Type, setAdBanner2Type] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const config = VIRUS_EFFECTS_CONFIG[virusType];
    const intervals: ReturnType<typeof setInterval>[] = [];

    // Glitch effect
    if (config.glitch) {
      intervals.push(createToggleInterval(config.glitch, setGlitch));
    }

    // Shake effect
    if (config.shake) {
      intervals.push(createToggleInterval(config.shake, setShake));
    }

    // Corruption effect
    if (config.corruption) {
      intervals.push(createToggleInterval(config.corruption, setCorruption));
    }

    // Wave effect
    if (config.wave) {
      intervals.push(createToggleInterval(config.wave, setWave));
    }

    // Chaos effect
    if (config.chaos) {
      intervals.push(createToggleInterval(config.chaos, setChaos));
    }

    // Pulse effect
    if (config.pulse) {
      intervals.push(createToggleInterval(config.pulse, setPulse));
    }

    // Ad banners
    if (config.adBanners) {
      const bannerInterval =
        config.adBanners.interval +
        (config.adBanners.randomOffset
          ? Math.random() * config.adBanners.randomOffset
          : 0);

      intervals.push(
        setInterval(() => {
          setAdBannerType(Math.floor(Math.random() * 6));
          setAdBanner(true);
          setTimeout(() => setAdBanner(false), config.adBanners!.duration);
        }, bannerInterval)
      );

      const banner2Interval =
        config.adBanners.interval +
        500 +
        (config.adBanners.randomOffset
          ? Math.random() * config.adBanners.randomOffset
          : 0);

      intervals.push(
        setInterval(() => {
          setAdBanner2Type(Math.floor(Math.random() * 6));
          setAdBanner2(true);
          setTimeout(() => setAdBanner2(false), config.adBanners!.duration);
        }, banner2Interval)
      );
    }

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [isActive, virusType]);

  return {
    glitch,
    shake,
    corruption,
    wave,
    chaos,
    pulse,
    adBanner,
    adBannerType,
    adBanner2,
    adBanner2Type,
  };
};
