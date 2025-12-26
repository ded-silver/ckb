/**
 * Email Triggers - Триггеры для отправки сюжетных писем
 */

import { getStoryEmail } from "./emailDatabase";
import { emailManager } from "./emailManager";

/**
 * Флаги отправленных писем (сохраняются в localStorage)
 */
const SENT_FLAGS_KEY = "email_sent_flags";

interface SentFlags {
  lain_first_contact: boolean;
  volkov_warning: boolean;
  resistance_recruit: boolean;
  achievement_first_hack: boolean;
  achievement_infected: boolean;
}

function getSentFlags(): SentFlags {
  const saved = localStorage.getItem(SENT_FLAGS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return {
    lain_first_contact: false,
    volkov_warning: false,
    resistance_recruit: false,
    achievement_first_hack: false,
    achievement_infected: false,
  };
}

function setSentFlag(key: keyof SentFlags): void {
  const flags = getSentFlags();
  flags[key] = true;
  localStorage.setItem(SENT_FLAGS_KEY, JSON.stringify(flags));
}

function isSent(key: keyof SentFlags): boolean {
  return getSentFlags()[key];
}

/**
 * Отправить письмо от Lain после прочтения contacts
 */
export function triggerLainFirstContact(): void {
  if (isSent("lain_first_contact")) return;

  const email = getStoryEmail("lain_first_contact");
  emailManager.addEmail(email);

  setSentFlag("lain_first_contact");
  console.log("[Email Trigger] Sent: Lain First Contact");
}

/**
 * Отправить письмо от Dr. Volkov после взлома первого сервера
 */
export function triggerVolkovWarning(): void {
  if (isSent("volkov_warning")) return;

  const email = getStoryEmail("volkov_warning");
  emailManager.addEmail(email);

  setSentFlag("volkov_warning");
  console.log("[Email Trigger] Sent: Volkov Warning");
}

/**
 * Отправить письмо от Resistance после выполнения миссий
 */
export function triggerResistanceRecruit(): void {
  if (isSent("resistance_recruit")) return;

  const email = getStoryEmail("resistance_recruit");
  emailManager.addEmail(email);

  setSentFlag("resistance_recruit");
  console.log("[Email Trigger] Sent: Resistance Recruit");
}

/**
 * Отправить достижение за первый взлом
 */
export function triggerAchievementFirstHack(): void {
  if (isSent("achievement_first_hack")) return;

  const email = getStoryEmail("achievement_first_hack");
  emailManager.addEmail(email);

  setSentFlag("achievement_first_hack");
  console.log("[Email Trigger] Sent: Achievement First Hack");
}

/**
 * Отправить достижение за заражение вирусом
 */
export function triggerAchievementInfected(): void {
  if (isSent("achievement_infected")) return;

  const email = getStoryEmail("achievement_infected");
  emailManager.addEmail(email);

  setSentFlag("achievement_infected");
}

/**
 * Сброс всех флагов (для тестирования)
 */
export function resetAllEmailTriggers(): void {
  localStorage.removeItem(SENT_FLAGS_KEY);
  console.log("[Email Trigger] All flags reset");
}
