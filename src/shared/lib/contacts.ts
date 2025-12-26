import { getFileSystem, saveFileSystem } from "@entities/file/model";

const CONTACTS_READ_KEY = "cyberpunk_contacts_read";
const CONTACTS_MESSAGE_KEY = "cyberpunk_lain_message_sent";
const COMMANDS_AFTER_CONTACTS_KEY = "cyberpunk_commands_after_contacts";
const CONTACTS_READ_TIME_KEY = "cyberpunk_contacts_read_time";

const MIN_COMMANDS_AFTER_CONTACTS = 3;
const MAX_WAIT_TIME = 30 * 60 * 1000;

export const markContactsRead = (): void => {
  try {
    localStorage.setItem(CONTACTS_READ_KEY, "true");
    localStorage.setItem(CONTACTS_READ_TIME_KEY, Date.now().toString());
    localStorage.setItem(COMMANDS_AFTER_CONTACTS_KEY, "0");
  } catch (e) {
    console.warn("Failed to mark contacts as read", e);
  }
};

export const isContactsRead = (): boolean => {
  try {
    return localStorage.getItem(CONTACTS_READ_KEY) === "true";
  } catch (e) {
    return false;
  }
};

export const isLainMessageSent = (): boolean => {
  try {
    return localStorage.getItem(CONTACTS_MESSAGE_KEY) === "true";
  } catch (e) {
    return false;
  }
};

export const markLainMessageSent = (): void => {
  try {
    localStorage.setItem(CONTACTS_MESSAGE_KEY, "true");
  } catch (e) {
    console.warn("Failed to mark Lain message as sent", e);
  }
};

export const incrementCommandsAfterContacts = (): number => {
  try {
    const current = parseInt(localStorage.getItem(COMMANDS_AFTER_CONTACTS_KEY) || "0", 10);
    const newValue = current + 1;
    localStorage.setItem(COMMANDS_AFTER_CONTACTS_KEY, newValue.toString());
    return newValue;
  } catch (e) {
    console.warn("Failed to increment commands after contacts", e);
    return 0;
  }
};

export const shouldSendLainMessage = (): boolean => {
  if (!isContactsRead()) {
    return false;
  }

  if (isLainMessageSent()) {
    return false;
  }

  try {
    const commandsCount = parseInt(localStorage.getItem(COMMANDS_AFTER_CONTACTS_KEY) || "0", 10);
    const readTime = parseInt(localStorage.getItem(CONTACTS_READ_TIME_KEY) || "0", 10);
    const elapsed = Date.now() - readTime;

    const shouldSend = commandsCount >= MIN_COMMANDS_AFTER_CONTACTS || elapsed >= MAX_WAIT_TIME;

    return shouldSend;
  } catch (e) {
    console.warn("Failed to check if should send Lain message", e);
    return false;
  }
};

export const createLainMessageFile = (): boolean => {
  try {
    createLainMessageFileInternal();
    const fs = getFileSystem();
    const filePath = "/home/user/secrets/message_from_lain.dat";
    return fs[filePath] !== undefined;
  } catch (e) {
    console.warn("Failed to create Lain message file", e);
    return false;
  }
};

const createLainMessageFileInternal = (): void => {
  try {
    const fs = getFileSystem();
    const secretsDir = "/home/user/secrets";

    if (!fs[secretsDir]) {
      return;
    }

    const filePath = `${secretsDir}/message_from_lain.dat`;
    const deactivationCodePath = `${secretsDir}/lain_disconnect_code.txt`;

    if (fs[filePath] && fs[deactivationCodePath]) {
      return;
    }

    if (fs[filePath] && !fs[deactivationCodePath]) {
      const deactivationCodeContent = `LAIN DISCONNECT CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 14:45] Found in Wired message metadata
[2077-03-20 14:45] Source: lain@wired.2077
[2077-03-20 14:45] Classification: INTERNAL USE ONLY

This file contains the disconnect code for adware
viruses sent through Wired messages.

If you have activated an adware virus from Lain's
message, use this code to deactivate it:

LAIN-DISCONNECT-2077

Usage: antivirus LAIN-DISCONNECT-2077

Note: This code only works for adware-type viruses.
For other virus types, different codes are required.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIRUS TYPE: Adware
DISCONNECT CODE: LAIN-DISCONNECT-2077
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      if (fs[secretsDir].type === "dir" && fs[secretsDir].contents) {
        fs[secretsDir].contents["lain_disconnect_code.txt"] = {
          type: "file",
          content: deactivationCodeContent,
        };
        fs[deactivationCodePath] = {
          type: "file",
          content: deactivationCodeContent,
        };
        saveFileSystem(fs);
      }
      return;
    }

    const fileContent = `MESSAGE FROM LAIN - WIRED ENCRYPTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 14:45] Message received via Wired
[2077-03-20 14:45] From: lain@wired.2077
[2077-03-20 14:45] Encryption: AES-256
[2077-03-20 14:45] Status: ENCRYPTED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Present day, present time...

I've been watching you through the Wired.
You're interesting. Different from the others.

I found something. Something that might help you.
But be careful - not everything is as it seems.

The message is encrypted. Try to decode it.
But remember: in the Wired, nothing is safe.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ENCRYPTED PAYLOAD]
U2FsdGVkX1+vupppZksvRf5pq5g5XkFy+oQvBzJN5L0=
[ENCRYPTED PAYLOAD]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WARNING: This message contains encrypted data.
Decoding may trigger hidden payloads.

To decode: cat this file (WARNING: May activate virus!)
To stop virus: type 'antivirus <code>' before system destruction

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE TYPE: Encrypted Message
VIRUS: ADWARE.LAIN.2077
STATUS: DORMANT (activates on read/decode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    if (fs[secretsDir].type === "dir" && fs[secretsDir].contents) {
      fs[secretsDir].contents["message_from_lain.dat"] = {
        type: "file",
        content: fileContent,
      };
      fs[filePath] = {
        type: "file",
        content: fileContent,
      };

      const deactivationCodePath = `${secretsDir}/lain_disconnect_code.txt`;
      const deactivationCodeContent = `LAIN DISCONNECT CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2077-03-20 14:45] Found in Wired message metadata
[2077-03-20 14:45] Source: lain@wired.2077
[2077-03-20 14:45] Classification: INTERNAL USE ONLY

This file contains the disconnect code for adware
viruses sent through Wired messages.

If you have activated an adware virus from Lain's
message, use this code to deactivate it:

LAIN-DISCONNECT-2077

Usage: antivirus LAIN-DISCONNECT-2077

Note: This code only works for adware-type viruses.
For other virus types, different codes are required.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIRUS TYPE: Adware
DISCONNECT CODE: LAIN-DISCONNECT-2077
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      fs[secretsDir].contents["lain_disconnect_code.txt"] = {
        type: "file",
        content: deactivationCodeContent,
      };
      fs[deactivationCodePath] = {
        type: "file",
        content: deactivationCodeContent,
      };

      saveFileSystem(fs);
    }
  } catch (e) {
    console.warn("Failed to create Lain message file", e);
  }
};
