import { useMemo } from "react";
import { Theme } from "../types";
import "./VirusEffects.css";
import { VirusType } from "../utils/virus";
import { useVirusEffects } from "../hooks/useVirusEffects";
import { AdwareBanners } from "./AdwareBanners";

interface VirusEffectsProps {
  isActive: boolean;
  timeRemaining: number;
  theme: Theme;
  virusType: VirusType;
}

export const VirusEffects = ({
  isActive,
  timeRemaining,
  theme,
  virusType,
}: VirusEffectsProps) => {
  const {
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
  } = useVirusEffects(isActive, virusType);

  const overlayClasses = useMemo(
    () =>
      `virus-overlay theme-${theme} virus-type-${virusType} ${
        glitch ? "glitch-active" : ""
      } ${corruption ? "corruption-active" : ""} ${wave ? "wave-active" : ""} ${
        chaos ? "chaos-active" : ""
      } ${pulse ? "pulse-active" : ""}`.trim(),
    [theme, virusType, glitch, corruption, wave, chaos, pulse]
  );

  const secondsRemaining = useMemo(
    () => Math.ceil(timeRemaining / 1000),
    [timeRemaining]
  );

  if (!isActive) return null;

  const isCorruption = virusType === "corruption";
  const isAdware = virusType === "adware";
  const showOverlay = !isCorruption;

  return (
    <>
      {showOverlay && <div className={overlayClasses} />}
      {isAdware && (
        <AdwareBanners
          adBanner={adBanner}
          adBannerType={adBannerType}
          adBanner2={adBanner2}
          adBanner2Type={adBanner2Type}
        />
      )}
      {!isCorruption && (
        <div className={`virus-shake ${shake ? "shake-active" : ""}`}>
          <div
            className={`virus-warning theme-${theme} virus-type-${virusType}`}
          >
            <div
              className={`virus-timer theme-${theme} virus-type-${virusType}`}
            >
              SYSTEM INFECTED
              <br />
              <span
                className={`virus-time theme-${theme} virus-type-${virusType}`}
              >
                {isAdware || isCorruption
                  ? "INFECTION: PERMANENT"
                  : `TIME REMAINING: ${secondsRemaining}s`}
              </span>
              <br />
              <span
                className={`virus-command theme-${theme} virus-type-${virusType}`}
              >
                TYPE: antivirus &lt;code&gt;
              </span>
              <br />
              <span
                className={`virus-type-label theme-${theme} virus-type-${virusType}`}
              >
                VIRUS: {virusType.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
