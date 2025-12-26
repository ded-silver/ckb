/**
 * Email Client Types
 */

export type EmailStatus = "unread" | "read" | "replied" | "starred" | "deleted";

export type EmailFolder = "inbox" | "sent" | "trash" | "drafts";

export type EmailPriority = "low" | "normal" | "high" | "urgent";

export interface EmailAttachment {
  id: string;
  filename: string;
  size: number; // bytes
  type: string; // mime type
  content?: string; // для текстовых файлов
  data?: string; // base64 для бинарных
}

export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: number;
  status: EmailStatus;
  folder: EmailFolder;
  priority: EmailPriority;
  attachments: EmailAttachment[];
  replyTo?: string; // id письма на которое это ответ
  tags?: string[]; // для фильтрации (mission, system, story, etc)
}

export interface EmailFilter {
  folder?: EmailFolder;
  status?: EmailStatus;
  from?: string;
  tag?: string;
  search?: string;
}

export interface EmailManagerState {
  emails: Email[];
  currentFolder: EmailFolder;
  selectedEmailId: string | null;
  unreadCount: number;
}
