/**
 * Email Database - Системные и сюжетные письма
 */

import type { Email } from "./types";

/**
 * Генерация уникального ID для письма
 */
function generateEmailId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Системные письма - отправляются при первом запуске
 */
export const SYSTEM_EMAILS = [
  {
    from: "system@terminal.local",
    to: "user@terminal.local",
    subject: "Welcome to the System",
    body: `Welcome, user.

Your terminal access has been granted.
Security clearance: Level 1

Available commands:
- help: Show available commands
- ls: List files
- cd: Change directory
- cat: Read files
- music: Open music player
- mail: Check your email

Some files are restricted. Some secrets are hidden.
Explore at your own risk.

-- System Administrator`,
    status: "unread",
    folder: "inbox",
    priority: "normal",
    attachments: [],
    tags: ["system", "welcome"],
  },
  {
    from: "security@terminal.local",
    to: "user@terminal.local",
    subject: "Security Notice",
    body: `SECURITY ALERT

We've detected unusual activity on your account.
Please change your password immediately.

If you did not authorize this access, contact support.

-- Security Team

P.S. This is a simulated environment. No real security threats exist.`,
    status: "unread",
    folder: "inbox",
    priority: "high",
    attachments: [],
    tags: ["system", "security"],
  },
] as const satisfies ReadonlyArray<Omit<Email, "id" | "timestamp">>;

/**
 * Сюжетные письма - отправляются при определённых событиях
 */
export const STORY_EMAILS = {
  // Письмо от Lain после прочтения contacts
  lain_first_contact: {
    from: "lain@wired.net",
    to: "user@terminal.local",
    subject: "You found me",
    body: `Present day. Present time.

You've been looking for me, haven't you?
I can see you through the Wired.

The file you found... it's just the beginning.
There's so much more hidden in this system.

Run the deactivation code if you want to know more.
Or don't. The choice is yours.

But remember: the Wired is everywhere.
And I am the Wired.

-- Lain`,
    status: "unread",
    folder: "inbox",
    priority: "urgent",
    attachments: [
      {
        id: "lain_hint_1",
        filename: "hint.txt",
        size: 156,
        type: "text/plain",
        content:
          "The secrets are in /home/user/secrets/\nLook for files with .dat extension\nSome require special commands to unlock",
      },
    ],
    tags: ["story", "lain", "important"],
  },

  // Письмо от Dr. Volkov после взлома первого сервера
  volkov_warning: {
    from: "dr.volkov@corp.net",
    to: "user@terminal.local",
    subject: "RE: Unauthorized Access Detected",
    body: `I know what you did.

Breaking into our servers was a mistake.
We have your digital footprint.
We know who you are.

Stop now, or face consequences.

This is your only warning.

-- Dr. Volkov
Chief Security Officer`,
    status: "unread",
    folder: "inbox",
    priority: "urgent",
    attachments: [],
    tags: ["story", "volkov", "threat"],
  },

  // Письмо от Resistance после выполнения миссий
  resistance_recruit: {
    from: "anonymous@darknet.onion",
    to: "user@terminal.local",
    subject: "[ENCRYPTED] We've been watching",
    body: `We've been watching your progress.

You have skills. Skills we need.
The corporation is hiding something.
Something big.

We're building a resistance.
Join us, and we'll show you the truth.

Reply with code: NEON_GHOST

-- The Resistance`,
    status: "unread",
    folder: "inbox",
    priority: "high",
    attachments: [
      {
        id: "resistance_manifest",
        filename: "manifest.txt",
        size: 512,
        type: "text/plain",
        content: `RESISTANCE MANIFESTO

The corporations control everything.
The government is their puppet.
The people are slaves to the system.

But we can fight back.
We can expose the truth.
We can set them free.

Join us.
Fight with us.
Win with us.`,
      },
    ],
    tags: ["story", "resistance", "important"],
  },

  // Письмо-достижение за первый взлом
  achievement_first_hack: {
    from: "achievements@terminal.local",
    to: "user@terminal.local",
    subject: "Achievement Unlocked: First Blood",
    body: `Congratulations!

You've successfully hacked your first server.

Achievement: First Blood
Reward: +100 XP

Keep exploring. More challenges await.

-- Achievement System`,
    status: "unread",
    folder: "inbox",
    priority: "low",
    attachments: [],
    tags: ["achievement", "hack"],
  },

  // Письмо-достижение за заражение вирусом
  achievement_infected: {
    from: "achievements@terminal.local",
    to: "user@terminal.local",
    subject: "Achievement Unlocked: Patient Zero",
    body: `Oops!

You've been infected with a virus.
Better luck next time.

Achievement: Patient Zero
Reward: +50 XP (for surviving)

Pro tip: Use 'antivirus' command to clean your system.

-- Achievement System`,
    status: "unread",
    folder: "inbox",
    priority: "low",
    attachments: [],
    tags: ["achievement", "virus"],
  },
};

/**
 * Создать email из шаблона
 */
export function createEmailFromTemplate(
  template: Omit<Email, "id" | "timestamp">,
  overrides?: Partial<Email>
): Email {
  return {
    id: generateEmailId("email"),
    timestamp: Date.now(),
    ...template,
    ...overrides,
  };
}

/**
 * Инициализация - создать системные письма при первом запуске
 */
export function initializeSystemEmails(): Email[] {
  return SYSTEM_EMAILS.map(template =>
    createEmailFromTemplate(template as Omit<Email, "id" | "timestamp">)
  );
}

/**
 * Получить сюжетное письмо по ключу
 */
export function getStoryEmail(key: keyof typeof STORY_EMAILS): Email {
  const template = STORY_EMAILS[key] as Omit<Email, "id" | "timestamp">;
  return createEmailFromTemplate(template);
}
