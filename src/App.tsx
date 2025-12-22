import { useState, useEffect } from "react";
import MatrixRain from "./components/MatrixRain";
import Terminal from "./components/Terminal";
import { Theme, TerminalSize, UserInfo } from "./types";
import { DEFAULT_THEME, THEMES } from "./constants";
import "./App.css";

const THEME_STORAGE_KEY = "cyberpunk_theme";
const SIZE_STORAGE_KEY = "cyberpunk_terminal_size";
const USER_INFO_STORAGE_KEY = "cyberpunk_user_info";

const DEFAULT_SIZE: TerminalSize = { width: 800, height: 600 };
const DEFAULT_USER_INFO: UserInfo = { username: "user", hostname: "cyberpunk" };

const loadTheme = (): Theme => {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme && THEMES.includes(savedTheme as Theme)) {
      return savedTheme as Theme;
    }
  } catch (e) {
    console.warn("Failed to load theme from localStorage", e);
  }
  return DEFAULT_THEME;
};

const saveTheme = (theme: Theme): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.warn("Failed to save theme to localStorage", e);
  }
};

const loadSize = (): TerminalSize => {
  try {
    const savedSize = localStorage.getItem(SIZE_STORAGE_KEY);
    if (savedSize) {
      const parsed = JSON.parse(savedSize);
      if (parsed.width && parsed.height) {
        return { width: parsed.width, height: parsed.height };
      }
    }
  } catch (e) {
    console.warn("Failed to load size from localStorage", e);
  }
  return DEFAULT_SIZE;
};

const saveSize = (size: TerminalSize): void => {
  try {
    localStorage.setItem(SIZE_STORAGE_KEY, JSON.stringify(size));
  } catch (e) {
    console.warn("Failed to save size to localStorage", e);
  }
};

const loadUserInfo = (): UserInfo => {
  try {
    const savedUserInfo = localStorage.getItem(USER_INFO_STORAGE_KEY);
    if (savedUserInfo) {
      const parsed = JSON.parse(savedUserInfo);
      if (parsed.username && parsed.hostname) {
        return { username: parsed.username, hostname: parsed.hostname };
      }
    }
  } catch (e) {
    console.warn("Failed to load user info from localStorage", e);
  }
  return DEFAULT_USER_INFO;
};

const saveUserInfo = (userInfo: UserInfo): void => {
  try {
    localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(userInfo));
  } catch (e) {
    console.warn("Failed to save user info to localStorage", e);
  }
};

function App() {
  useEffect(() => {
    import("./utils/missions").then((module) => {
      try {
        module.unlockCompletedMissionFiles();
      } catch (e) {}
    });
  }, []);

  const [theme, setTheme] = useState<Theme>(loadTheme);
  const [size, setSize] = useState<TerminalSize>(loadSize);
  const [userInfo, setUserInfo] = useState<UserInfo>(loadUserInfo);

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
    </div>
  );
}

export default App;
