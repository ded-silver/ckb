import { storageManager } from "@shared/lib/storage";

import type { UserInfo, TerminalSize } from "../types";

const USER_INFO_STORAGE_KEY = "cyberpunk_user_info";
const SIZE_STORAGE_KEY = "cyberpunk_terminal_size";

const DEFAULT_SIZE: TerminalSize = { width: 800, height: 600 };
const DEFAULT_USER_INFO: UserInfo = { username: "user", hostname: "cyberpunk" };

export const loadUserInfo = (): UserInfo => {
  const savedUserInfo = storageManager.get<UserInfo>(USER_INFO_STORAGE_KEY);
  if (savedUserInfo && savedUserInfo.username && savedUserInfo.hostname) {
    return savedUserInfo;
  }
  return DEFAULT_USER_INFO;
};

export const saveUserInfo = (userInfo: UserInfo): void => {
  storageManager.set(USER_INFO_STORAGE_KEY, userInfo);
};

export const loadSize = (): TerminalSize => {
  const savedSize = storageManager.get<TerminalSize>(SIZE_STORAGE_KEY);
  if (savedSize && savedSize.width && savedSize.height) {
    return savedSize;
  }
  return DEFAULT_SIZE;
};

export const saveSize = (size: TerminalSize): void => {
  storageManager.set(SIZE_STORAGE_KEY, size);
};
