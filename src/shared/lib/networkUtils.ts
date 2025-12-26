export const generateRandomIP = (): string => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(
    Math.random() * 255
  )}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

export const generateRandomPort = (): number => {
  return Math.floor(Math.random() * 65536);
};

export const generateRandomMAC = (): string => {
  const hex = "0123456789ABCDEF";
  return Array.from({ length: 6 }, () =>
    Array.from({ length: 2 }, () => hex[Math.floor(Math.random() * 16)]).join("")
  ).join(":");
};
