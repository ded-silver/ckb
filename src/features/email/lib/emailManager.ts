/**
 * Email Manager - Управление почтой
 */

import type { Email, EmailFolder, EmailFilter, EmailManagerState } from "./types";

const STORAGE_KEY = "cyberpunk_emails";

type StateCallback = (state: EmailManagerState) => void;

class EmailManager {
  private static instance: EmailManager;
  private emails: Map<string, Email>;
  private stateCallback: StateCallback | null = null;
  private currentFolder: EmailFolder = "inbox";
  private selectedEmailId: string | null = null;

  private constructor() {
    this.emails = new Map();
    this.loadEmails();
  }

  public static getInstance(): EmailManager {
    if (!EmailManager.instance) {
      EmailManager.instance = new EmailManager();
    }
    return EmailManager.instance;
  }

  public setStateCallback(callback: StateCallback | null): void {
    this.stateCallback = callback;
    if (callback) {
      callback(this.getState());
    }
  }

  public getState(): EmailManagerState {
    return {
      emails: this.getAllEmails(),
      currentFolder: this.currentFolder,
      selectedEmailId: this.selectedEmailId,
      unreadCount: this.getUnreadCount(),
    };
  }

  private notifyStateChange(): void {
    if (this.stateCallback) {
      this.stateCallback(this.getState());
    }
  }

  public addEmail(email: Email): void {
    this.emails.set(email.id, email);
    this.saveEmails();
    this.notifyStateChange();
  }

  public getEmail(id: string): Email | undefined {
    return this.emails.get(id);
  }

  public getAllEmails(): Email[] {
    return Array.from(this.emails.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  public getEmailsByFolder(folder: EmailFolder): Email[] {
    return this.getAllEmails().filter(email => email.folder === folder);
  }

  public getEmailsByFilter(filter: EmailFilter): Email[] {
    let result = this.getAllEmails();

    if (filter.folder) {
      result = result.filter(email => email.folder === filter.folder);
    }

    if (filter.status) {
      result = result.filter(email => email.status === filter.status);
    }

    if (filter.from) {
      result = result.filter(email =>
        email.from.toLowerCase().includes(filter.from!.toLowerCase())
      );
    }

    if (filter.tag) {
      result = result.filter(email => email.tags?.includes(filter.tag!));
    }

    if (filter.search) {
      const search = filter.search.toLowerCase();
      result = result.filter(
        email =>
          email.subject.toLowerCase().includes(search) ||
          email.body.toLowerCase().includes(search) ||
          email.from.toLowerCase().includes(search)
      );
    }

    return result;
  }

  public markAsRead(id: string): void {
    const email = this.emails.get(id);
    if (email && email.status === "unread") {
      email.status = "read";
      this.emails.set(id, email);
      this.saveEmails();
      this.notifyStateChange();
    }
  }

  public markAsUnread(id: string): void {
    const email = this.emails.get(id);
    if (email) {
      email.status = "unread";
      this.emails.set(id, email);
      this.saveEmails();
      this.notifyStateChange();
    }
  }

  public toggleStar(id: string): void {
    const email = this.emails.get(id);
    if (email) {
      email.status = email.status === "starred" ? "read" : "starred";
      this.emails.set(id, email);
      this.saveEmails();
      this.notifyStateChange();
    }
  }

  public deleteEmail(id: string): void {
    const email = this.emails.get(id);
    if (email) {
      if (email.folder === "trash") {
        this.emails.delete(id);
      } else {
        email.folder = "trash";
        email.status = "deleted";
        this.emails.set(id, email);
      }
      this.saveEmails();
      this.notifyStateChange();
    }
  }

  public restoreEmail(id: string): void {
    const email = this.emails.get(id);
    if (email && email.folder === "trash") {
      email.folder = "inbox";
      email.status = email.status === "deleted" ? "unread" : email.status;
      this.emails.set(id, email);
      this.saveEmails();
      this.notifyStateChange();
    }
  }

  public getUnreadCount(): number {
    return this.getAllEmails().filter(
      email => email.status === "unread" && email.folder !== "trash"
    ).length;
  }

  public setCurrentFolder(folder: EmailFolder): void {
    this.currentFolder = folder;
    this.notifyStateChange();
  }

  public setSelectedEmail(id: string | null): void {
    this.selectedEmailId = id;
    this.notifyStateChange();
  }

  private saveEmails(): void {
    try {
      const emailsArray = Array.from(this.emails.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emailsArray));
    } catch (error) {
      console.error("Failed to save emails:", error);
    }
  }

  private loadEmails(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const emailsArray: Email[] = JSON.parse(saved);
        this.emails = new Map(emailsArray.map(email => [email.id, email]));
      }
    } catch (error) {
      console.error("Failed to load emails:", error);
    }
  }

  public clearAllEmails(): void {
    this.emails.clear();
    this.saveEmails();
    this.notifyStateChange();
  }

  public initializeIfEmpty(): void {
    if (this.emails.size === 0) {
      console.log("Initializing email system with welcome messages...");
    }
  }

  public hasEmails(): boolean {
    return this.emails.size > 0;
  }

  public getStats() {
    const all = this.getAllEmails();
    return {
      total: all.length,
      unread: all.filter(e => e.status === "unread").length,
      inbox: all.filter(e => e.folder === "inbox").length,
      sent: all.filter(e => e.folder === "sent").length,
      trash: all.filter(e => e.folder === "trash").length,
      starred: all.filter(e => e.status === "starred").length,
    };
  }
}

export const emailManager = EmailManager.getInstance();
