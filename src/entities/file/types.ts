export interface FileSystemNode {
  type: "file" | "dir";
  content?: string;
  contents?: Record<string, FileSystemNode>;
}
