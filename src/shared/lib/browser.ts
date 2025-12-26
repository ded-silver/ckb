type NavigatorWithExperimental = Navigator & {
  hardwareConcurrency?: number;
  deviceMemory?: number;
};

export interface BrowserInfo {
  userAgent: string;
  browser: string;
  browserVersion: string;
  os: string;
  platform: string;
  language: string;
  languages: string[];
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  timezone: string;
  timezoneOffset: number;
  online: boolean;
  cpuCores?: number;
  deviceMemory?: number;
  cookieEnabled: boolean;
  doNotTrack: string | null;
}

/**
 * Определяет информацию о браузере и системе пользователя.
 * Извлекает данные из navigator, screen и других Web API.
 */
export function getBrowserInfo(): BrowserInfo {
  const nav = navigator;
  const screen = window.screen;

  const ua = nav.userAgent;
  let browser = "Unknown";
  let browserVersion = "Unknown";
  let os = "Unknown";

  if (ua.includes("Chrome") && !ua.includes("Edg") && !ua.includes("OPR")) {
    browser = "Chrome";
    const match = ua.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  } else if (ua.includes("Firefox")) {
    browser = "Firefox";
    const match = ua.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browser = "Safari";
    const match = ua.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  } else if (ua.includes("Edg")) {
    browser = "Edge";
    const match = ua.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  } else if (ua.includes("OPR")) {
    browser = "Opera";
    const match = ua.match(/OPR\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  }

  if (ua.includes("Windows NT")) {
    const match = ua.match(/Windows NT (\d+\.\d+)/);
    if (match) {
      const version = match[1];
      if (version === "10.0") os = "Windows 10/11";
      else if (version === "6.3") os = "Windows 8.1";
      else if (version === "6.2") os = "Windows 8";
      else if (version === "6.1") os = "Windows 7";
      else os = `Windows ${version}`;
    } else {
      os = "Windows";
    }
  } else if (ua.includes("Mac OS X")) {
    const match = ua.match(/Mac OS X (\d+[._]\d+)/);
    os = match ? `macOS ${match[1].replace("_", ".")}` : "macOS";
  } else if (ua.includes("Linux")) {
    os = "Linux";
  } else if (ua.includes("Android")) {
    const match = ua.match(/Android (\d+\.\d+)/);
    os = match ? `Android ${match[1]}` : "Android";
  } else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) {
    const match = ua.match(/OS (\d+[._]\d+)/);
    os = match ? `iOS ${match[1].replace("_", ".")}` : "iOS";
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneOffset = new Date().getTimezoneOffset();

  return {
    userAgent: ua,
    browser,
    browserVersion,
    os,
    platform: nav.platform,
    language: nav.language,
    languages: [...(nav.languages || [nav.language])],
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    timezone,
    timezoneOffset,
    online: nav.onLine,
    cpuCores: (nav as NavigatorWithExperimental).hardwareConcurrency,
    deviceMemory: (nav as NavigatorWithExperimental).deviceMemory,
    cookieEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack,
  };
}

export function formatSystemInfo(info: BrowserInfo): string[] {
  const lines = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "SYSTEM INFORMATION",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    `OS: ${info.os}`,
    `Platform: ${info.platform}`,
    `Browser: ${info.browser} ${info.browserVersion}`,
    `Language: ${info.language}`,
    `Screen: ${info.screenWidth}x${info.screenHeight} @ ${info.colorDepth}bit`,
    `Timezone: ${info.timezone} (UTC${
      info.timezoneOffset > 0 ? "-" : "+"
    }${Math.abs(info.timezoneOffset / 60)})`,
    `Network: ${info.online ? "ONLINE" : "OFFLINE"}`,
  ];

  if (info.cpuCores) {
    lines.push(`CPU Cores: ${info.cpuCores}`);
  }

  if (info.deviceMemory) {
    lines.push(`RAM: ${info.deviceMemory} GB`);
  }

  lines.push(`Cookies: ${info.cookieEnabled ? "ENABLED" : "DISABLED"}`);

  if (info.doNotTrack) {
    lines.push(`Do Not Track: ${info.doNotTrack}`);
  }

  lines.push("Status: OPERATIONAL");
  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  lines.push("");

  return lines;
}

/**
 * Форматирует информацию о пользователе в виде строк для вывода в терминал.
 */
export function formatUserInfo(info: BrowserInfo): string[] {
  const lines = [
    `User: ${info.browser} User`,
    `Browser: ${info.browser} ${info.browserVersion}`,
    `OS: ${info.os}`,
    `Platform: ${info.platform}`,
    `Language: ${info.language}`,
    `Timezone: ${info.timezone}`,
    `Access Level: ${info.online ? "ONLINE" : "OFFLINE"}`,
    `Permissions: ${info.cookieEnabled ? "COOKIES_ENABLED" : "COOKIES_DISABLED"}`,
    "",
  ];

  return lines;
}
