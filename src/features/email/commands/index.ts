/**
 * Email Commands
 */

import { emailManager } from "@features/email/lib";
import type { Email } from "@features/email/lib";
import { applicationManager } from "@shared/lib/applicationManager";

import type { CommandResult } from "../../../types";

export async function handleMailCommand(args: string[]): Promise<CommandResult> {
  const subcommand = args[0]?.toLowerCase();

  if (!subcommand || subcommand === "open" || subcommand === "gui") {
    applicationManager.openApp("email");
    return {
      output: ["Opening mail client..."],
    };
  }

  if (subcommand === "list" || subcommand === "ls") {
    const folderArg = args[1] || "inbox";
    const validFolders = ["inbox", "sent", "trash", "drafts"] as const;
    type ValidFolder = (typeof validFolders)[number];
    const folder = (
      validFolders.includes(folderArg as ValidFolder) ? folderArg : "inbox"
    ) as ValidFolder;
    const emails = emailManager.getEmailsByFolder(folder);

    if (emails.length === 0) {
      return {
        output: [`No emails in ${folder}`],
      };
    }

    const output = [
      `Emails in ${folder}:`,
      "",
      "ID  | FROM                    | SUBJECT                        | DATE",
      "----|-------------------------|--------------------------------|-------------",
    ];

    emails.slice(0, 10).forEach((email: Email, index: number) => {
      const id = index + 1;
      const from = email.from.substring(0, 23).padEnd(23);
      const subject =
        (email.status === "unread" ? "[NEW] " : "") + email.subject.substring(0, 30).padEnd(30);
      const date = new Date(email.timestamp).toLocaleDateString();

      output.push(`${id.toString().padStart(3)} | ${from} | ${subject} | ${date}`);
    });

    if (emails.length > 10) {
      output.push("", `... and ${emails.length - 10} more emails`);
    }

    output.push("", `Use 'mail read <id>' to read an email`);

    return { output };
  }

  if (subcommand === "read") {
    const emailId = parseInt(args[1]);

    if (!emailId || isNaN(emailId)) {
      return {
        output: ["Usage: mail read <id>", "Example: mail read 1"],
        isError: true,
      };
    }

    const emails = emailManager.getAllEmails();
    const email = emails[emailId - 1];

    if (!email) {
      return {
        output: [`Email #${emailId} not found`],
        isError: true,
      };
    }

    const output = [
      "=".repeat(60),
      `From: ${email.from}`,
      `To: ${email.to}`,
      `Subject: ${email.subject}`,
      `Date: ${new Date(email.timestamp).toLocaleString()}`,
      "=".repeat(60),
      "",
      ...email.body.split("\n"),
      "",
    ];

    if (email.attachments.length > 0) {
      output.push(
        "-".repeat(60),
        "Attachments:",
        ...email.attachments.map(att => `  📎 ${att.filename} (${Math.round(att.size / 1024)}KB)`),
        ""
      );
    }

    if (email.status === "unread") {
      emailManager.markAsRead(email.id);
    }

    return { output };
  }

  if (subcommand === "delete" || subcommand === "del" || subcommand === "rm") {
    const emailId = parseInt(args[1]);

    if (!emailId || isNaN(emailId)) {
      return {
        output: ["Usage: mail delete <id>", "Example: mail delete 1"],
        isError: true,
      };
    }

    const emails = emailManager.getAllEmails();
    const email = emails[emailId - 1];

    if (!email) {
      return {
        output: [`Email #${emailId} not found`],
        isError: true,
      };
    }

    emailManager.deleteEmail(email.id);

    return {
      output: [`Email "${email.subject}" moved to trash`],
    };
  }

  if (subcommand === "stats" || subcommand === "status") {
    const stats = emailManager.getStats();

    return {
      output: [
        "Email Statistics:",
        "",
        `Total:   ${stats.total} emails`,
        `Unread:  ${stats.unread} emails`,
        `Inbox:   ${stats.inbox} emails`,
        `Sent:    ${stats.sent} emails`,
        `Trash:   ${stats.trash} emails`,
        `Starred: ${stats.starred} emails`,
      ],
    };
  }

  if (subcommand === "help" || subcommand === "--help" || subcommand === "-h") {
    return {
      output: [
        "",
        "MAIL CLIENT COMMANDS:",
        "═══════════════════════════════════════════════",
        "",
        "EMAIL:",
        "  list [folder]   - List emails in folder",
        "                    Folders: inbox, sent, trash, starred",
        "  read <id>       - Read email by ID",
        "  delete <id>     - Delete email (move to trash)",
        "  stats           - Show email statistics",
        "",
        "GENERAL:",
        "  help            - Show this help",
        "  clear           - Clear terminal",
        "  theme <name>    - Change color theme",
        "  size <w> <h>    - Change window size",
        "  close / exit    - Close mail client",
        "",
        "═══════════════════════════════════════════════",
        "",
      ],
    };
  }

  return {
    output: [`Unknown subcommand: ${subcommand}`, "Use 'mail help' for available commands"],
    isError: true,
  };
}
