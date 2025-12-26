import { useMemo, useState, useEffect } from "react";

import type { VirusType } from "@features/virus/model";

import type { Theme } from "../../../types";

import "./VirusEffects.css";

import { useVirusEffects } from "../model";
import { AdwareBanners } from "./AdwareBanners";

interface VirusEffectsProps {
  isActive: boolean;
  timeRemaining: number;
  theme: Theme;
  virusType: VirusType;
}

const STORAGE_KEY = "cyberpunk_virus_warning_position";

const loadSavedPosition = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to load virus warning position", e);
  }
  return null;
};

const savePosition = (position: { x: number; y: number }) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  } catch (e) {
    console.warn("Failed to save virus warning position", e);
  }
};

export const VirusEffects = ({ isActive, timeRemaining, theme, virusType }: VirusEffectsProps) => {
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

  const [position, setPosition] = useState<{ x: number; y: number } | null>(loadSavedPosition());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Center на первый раз
  useEffect(() => {
    if (isActive && !position) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const newPos = { x: centerX, y: centerY };
      setPosition(newPos);
      savePosition(newPos);
    }
  }, [isActive, position]);

  // Dragging logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && position) {
        const newPos = {
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        };
        setPosition(newPos);
      }
    };

    const handleMouseUp = () => {
      if (isDragging && position) {
        savePosition(position);
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!position) return;

    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const overlayClasses = useMemo(
    () =>
      `virus-overlay theme-${theme} virus-type-${virusType} ${
        glitch ? "glitch-active" : ""
      } ${corruption ? "corruption-active" : ""} ${wave ? "wave-active" : ""} ${
        chaos ? "chaos-active" : ""
      } ${pulse ? "pulse-active" : ""}`.trim(),
    [theme, virusType, glitch, corruption, wave, chaos, pulse]
  );

  const secondsRemaining = useMemo(() => Math.ceil(timeRemaining / 1000), [timeRemaining]);

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
      {!isCorruption && position && (
        <div className={`virus-shake ${shake ? "shake-active" : ""}`}>
          <div
            className={`virus-warning theme-${theme} virus-type-${virusType} ${
              isDragging ? "dragging" : ""
            }`}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              transform: "translate(-50%, -50%)",
              cursor: isDragging ? "grabbing" : "grab",
            }}
            onMouseDown={handleMouseDown}
          >
            <div className={`virus-timer theme-${theme} virus-type-${virusType}`}>
              SYSTEM INFECTED
              <br />
              <span className={`virus-time theme-${theme} virus-type-${virusType}`}>
                {isAdware || isCorruption
                  ? "INFECTION: PERMANENT"
                  : `TIME REMAINING: ${secondsRemaining}s`}
              </span>
              <br />
              <span className={`virus-command theme-${theme} virus-type-${virusType}`}>
                TYPE: antivirus &lt;code&gt;
              </span>
              <br />
              <span className={`virus-type-label theme-${theme} virus-type-${virusType}`}>
                VIRUS: {virusType.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
