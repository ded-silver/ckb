import { useState, useEffect } from "react";

import { loadTheme, saveTheme } from "@entities/theme/model";
import { loadSize, saveSize, loadUserInfo, saveUserInfo } from "@entities/user/model";
import type { VirusState } from "@features/virus/model";
import { getVirusState, clearVirusState } from "@features/virus/model";
import {
  applicationManager,
  type AppState,
  type ZIndexState,
} from "@shared/lib/applicationManager";
import { createDestroyOverlay } from "@shared/lib/destroy";
import { soundGenerator } from "@shared/lib/sounds";
import { EmailClient } from "@widgets/email-client/ui";
import { MatrixRain } from "@widgets/matrix-rain/ui";
import { MusicPlayer } from "@widgets/music-player/ui";
import { SnakeGame } from "@widgets/snake-game/ui";
import { Terminal } from "@widgets/terminal/ui";
import { VirusEffects } from "@widgets/virus-effects/ui";

import type { Theme, TerminalSize, UserInfo } from "../types";
import "./styles/index.css";

function App() {
  useEffect(() => {
    import("@features/missions/model").then(module => {
      try {
        module.unlockCompletedMissionFiles();
      } catch (error) {
        console.warn("Failed to unlock completed mission files:", error);
      }
    });
  }, []);

  const [theme, setTheme] = useState<Theme>(loadTheme);
  const [size, setSize] = useState<TerminalSize>(loadSize);
  const [userInfo, setUserInfo] = useState<UserInfo>(loadUserInfo);
  const [virusState, setVirusState] = useState<VirusState | null>(getVirusState());
  const [openApps, setOpenApps] = useState<AppState>(applicationManager.getState());
  const [zIndexes, setZIndexes] = useState<ZIndexState>(applicationManager.getZIndexes());

  useEffect(() => {
    saveTheme(theme);
    document.body.className = `theme-${theme}`;
    return () => {
      document.body.className = "";
    };
  }, [theme]);

  useEffect(() => {
    saveSize(size);
  }, [size]);

  useEffect(() => {
    saveUserInfo(userInfo);
  }, [userInfo]);

  useEffect(() => {
    applicationManager.setStateCallback(setOpenApps);
    applicationManager.setZIndexCallback(setZIndexes);
    return () => {
      applicationManager.setStateCallback(null);
      applicationManager.setZIndexCallback(null);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const saved = localStorage.getItem("cyberpunk_virus_state");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.isInfected && parsed.startTime) {
            const elapsed = Date.now() - parsed.startTime;
            const VIRUS_TIMEOUT = 45000; // 45 секунд

            if (
              elapsed >= VIRUS_TIMEOUT &&
              parsed.virusType !== "adware" &&
              parsed.virusType !== "corruption"
            ) {
              clearVirusState();
              setVirusState(null);
              createDestroyOverlay();
              return;
            }
          }
        }
      } catch (error) {
        console.warn("Failed to check virus timeout:", error);
      }

      const state = getVirusState();
      setVirusState(state);

      if (state && state.isInfected && state.timeRemaining > 0 && state.virusType !== "adware") {
        if (state.timeRemaining % 1000 < 100) {
          soundGenerator.playVirusTick();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleSizeChange = (newSize: TerminalSize) => {
    setSize(newSize);
  };

  const handleUserInfoChange = (newUserInfo: UserInfo) => {
    setUserInfo(newUserInfo);
  };

  return (
    <div className={`app theme-${theme}`}>
      <MatrixRain theme={theme} />
      <Terminal
        theme={theme}
        onThemeChange={handleThemeChange}
        size={size}
        onSizeChange={handleSizeChange}
        userInfo={userInfo}
        onUserInfoChange={handleUserInfoChange}
      />
      <VirusEffects
        isActive={virusState?.isInfected || false}
        timeRemaining={virusState?.timeRemaining || 0}
        theme={theme}
        virusType={virusState?.virusType || "trojan"}
      />
      {openApps.music && (
        <MusicPlayer
          theme={theme}
          onClose={() => applicationManager.closeApp("music")}
          zIndex={zIndexes.music}
          onFocus={() => applicationManager.bringToFront("music")}
        />
      )}
      {openApps.email && (
        <EmailClient
          theme={theme}
          onClose={() => applicationManager.closeApp("email")}
          zIndex={zIndexes.email}
          onFocus={() => applicationManager.bringToFront("email")}
        />
      )}
      {openApps.snake && (
        <SnakeGame
          theme={theme}
          onClose={() => applicationManager.closeApp("snake")}
          zIndex={zIndexes.snake}
          onFocus={() => applicationManager.bringToFront("snake")}
        />
      )}
    </div>
  );
}

export default App;
