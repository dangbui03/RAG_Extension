import * as vscode from "vscode";
import { versions } from "../../webview-ui/src/types";

export class readEntireCodeBase {
  private workspaceFolder: vscode.Uri | undefined;

  constructor() {
    // Use the first workspace folder if available
    if (
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
    ) {
      this.workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
    }
  }

  /**
   * Fetch all files from the workspace (excluding node_modules)
   * and return a list of relative file paths (e.g. "/package.json", "/src/main.tsx")
   */
  async fetchFileList(): Promise<string[]> {
    if (!this.workspaceFolder) {
      return [];
    }
    const files = await vscode.workspace.findFiles(
      "**/*",
      "**/node_modules/**"
    );
    return files.map((fileUri) => {
      const relativePath = vscode.workspace.asRelativePath(fileUri);
      return relativePath.startsWith("/") ? relativePath : "/" + relativePath;
    });
  }

  /**
   * Read the content of a file given its relative file name (starting with "/")
   * by finding the file in the workspace and returning its full content.
   */
  async readFile(fileName: string): Promise<string> {
    if (!this.workspaceFolder) {
      return "";
    }
    // Remove the leading "/" if present
    const trimmedFileName = fileName.startsWith("/")
      ? fileName.substring(1)
      : fileName;
    const fileUri = vscode.Uri.joinPath(this.workspaceFolder, trimmedFileName);
    try {
      const bytes = await vscode.workspace.fs.readFile(fileUri);
      return Buffer.from(bytes).toString("utf8");
    } catch (err) {
      console.error(`Failed to read file ${fileUri.fsPath}`, err);
      return "";
    }
  }

  private formatVersion(version: string): string {
    // Remove the caret symbol (^) and prepend with "v"
    return `v${version.replace("^", "")}`;
  }

  /**
   * Try to extract a Next.js version string from file content.
   * For JSON content (like package.json), it checks for the "next" dependency.
   * For other files (like README.md), it uses a regex.
   */
  private extractNextJsVersion(content: string): string | null {
    // Try JSON parsing (for package.json)
    try {
      const parsed = JSON.parse(content);
      if (parsed.dependencies && parsed.dependencies.next) {
        return this.formatVersion(parsed.dependencies.next);
      }
      if (parsed.devDependencies && parsed.devDependencies.next) {
        return this.formatVersion(parsed.devDependencies.next);
      }
    } catch {
      // Not valid JSON – fall through to regex check.
    }
    // Regex to find something like "Next.js vX.Y.Z" (case-insensitive)
    const regex = /next\.js\s+v?(\d+\.\d+\.\d+)/i;
    const match = content.match(regex);
    if (match) {
      return `v${match[1]}`;
    }
    return null;
  }

  /**
   * Automatically catch the Next.js version from the workspace by:
   *   1. Scanning package.json files for a dependency named "next"
   *   2. If not found, scanning README.md files (or similar) for a version pattern.
   */
  async catchNextJsVersion(): Promise<string | null> {
    // Check for package.json files first
    const packageFiles = await vscode.workspace.findFiles(
      "**/package.json",
      "**/node_modules/**"
    );
    for (const file of packageFiles) {
      const content = await this.readFileContent(file);
      try {
        const json = JSON.parse(content);
        if (json.dependencies && json.dependencies.next) {
          return this.formatVersion(json.dependencies.next);
        }
        if (json.devDependencies && json.devDependencies.next) {
          return this.formatVersion(json.devDependencies.next);
        }
      } catch (err) {
        console.error(`Error parsing JSON from ${file.fsPath}:`, err);
      }
    }

    // If not found, try scanning README.md files (or other similar files)
    const readmeFiles = await vscode.workspace.findFiles(
      "**/README.md",
      "**/node_modules/**"
    );
    for (const file of readmeFiles) {
      const content = await this.readFileContent(file);
      const version = this.extractNextJsVersion(content);
      if (version) {
        return version;
      } else {
        console.warn(`No Next.js version found in ${file.fsPath}`);
        return versions[versions.length - 1]; // Default to the last version in the list if not found
      }
    }
    return null;
  }

  // Existing method for reading file content from a given URI (for backward compatibility)
  async readFileContent(uri: vscode.Uri): Promise<string> {
    try {
      const bytes = await vscode.workspace.fs.readFile(uri);
      return Buffer.from(bytes).toString("utf8");
    } catch (err) {
      console.error(`Failed to read file ${uri.fsPath}`, err);
      return "";
    }
  }
}
