// import * as vscode from "vscode";
// import { handleError } from "../utils/utils";
// import fs from 'fs';
// import path from 'path';
// import { ExplorerProvider } from "../core/explorer/ExplorerProvider";

// function catchNextJsVersion() {
//     if (!vscode.workspace.workspaceFolders) {
//         vscode.window.showWarningMessage('No workspace is open.');
//         return;
//     }

//     const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
//     const targetFiles = ['package.json', 'tsconfig.json'];
//     let nextJsVersion: string | null = null; // Local variable to store Next.js version

//     targetFiles.forEach((fileName) => {
//         const filePath = path.join(workspaceRoot, fileName);
//         if (fs.existsSync(filePath)) {
//             const content = fs.readFileSync(filePath, 'utf8');
//             if (fileName === 'package.json') {
//                 try {
//                     const packageJson = JSON.parse(content);
//                     if (packageJson.dependencies && packageJson.dependencies['next']) {
//                         nextJsVersion = packageJson.dependencies['next'];
//                         vscode.window.showInformationMessage(`Next.js Version: ${nextJsVersion}`);
//                     } else {
//                         vscode.window.showInformationMessage('Next.js not found in package.json dependencies.');
//                     }
//                 } catch (error) {
//                     vscode.window.showErrorMessage('Failed to parse package.json.');
//                 }
//             } else {
//                 vscode.window.showInformationMessage(`Content of ${fileName}: ${content}`);
//             }
//         } else {
//             vscode.window.showWarningMessage(`${fileName} not found in the project.`);
//         }
//     });

//     // Optionally, use the `nextJsVersion` variable later in your logic
//     console.log('Detected Next.js version:', nextJsVersion);
//     // vscode.window.showInformationMessage(`Detected Next.js version: ${nextJsVersion}`);
//     return nextJsVersion;
// }

// function readSpecificFiles() {
//     if (!vscode.workspace.workspaceFolders) {
//         return;
//     }

//     const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
//     const targetFiles = ['package.json', 'tsconfig.json'];

//     targetFiles.forEach((fileName) => {
//         const filePath = path.join(workspaceRoot, fileName);
//         if (fs.existsSync(filePath)) {
//             const content = fs.readFileSync(filePath, 'utf8');
//             // vscode.window.showInformationMessage(`Content of ${fileName}: ${content}`);
//             console.log('Content:', content);
//         } else {
//             vscode.window.showWarningMessage(`${fileName} not found in the project.`);
//         }
//     });
// }

// async function createOrUpdateFile(fileName: string, content: string) {
//     if (!vscode.workspace.workspaceFolders) {
//         return;
//     }

//     const workspaceRoot = vscode.workspace.workspaceFolders[0].uri;
//     const filePath = vscode.Uri.joinPath(workspaceRoot, fileName);

//     try {
//         await vscode.workspace.fs.writeFile(filePath, Buffer.from(content, 'utf8'));
//         vscode.window.showInformationMessage(`${fileName} created/updated successfully!`);
//     } catch (error) {
//         vscode.window.showErrorMessage(`Failed to create/update ${fileName}: ${error}`);
//     }
// }

// export async function readEntireCodeBase() {
//     vscode.window.showInformationMessage('Read Entire Code Base Command Executed!');
//     try {
//         if (!vscode.workspace.workspaceFolders) {
//             vscode.window.showErrorMessage('No workspace is open.');
//             return;
//         }

//         // Initialize Tree View
//         const explorer = vscode.window.createTreeView('explorer', { treeDataProvider: new ExplorerProvider() });

//         // Read Specific Files
//         readSpecificFiles();
//         const version = catchNextJsVersion();
//         vscode.window.showInformationMessage(`Next.js Version: ${version}`);

//         // Example of creating or modifying a file
//         await createOrUpdateFile('new-config.json', JSON.stringify({ key: 'value' }, null, 2));

//     } catch (err: any) {
//         handleError(err);
//         vscode.window.showErrorMessage('Failed to read entire code base. Please check the logs for more details.');
//     }
// }

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
   * Fetch all file URIs from the workspace (excluding node_modules)
   */
  async fetchAllFiles(): Promise<vscode.Uri[]> {
    if (!this.workspaceFolder) {
      return [];
    }
    return vscode.workspace.findFiles("**/*", "**/node_modules/**");
  }

  /**
   * Read the content of a file as a UTF-8 string
   */
  async readFileContent(uri: vscode.Uri): Promise<string> {
    try {
      const bytes = await vscode.workspace.fs.readFile(uri);
      return Buffer.from(bytes).toString("utf8");
    } catch (err) {
      console.error(`Failed to read file ${uri.fsPath}`, err);
      return "";
    }
  }

  private formatVersion(version: string): string {
    // Remove the caret symbol (^) and prepend with "v"
    return `v${version.replace('^', '')}`;
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
        // Skip files that cannot be parsed as JSON
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
        return versions[versions.length - 1]; // Default to the first version in the list if not found
      }
    }
    return null;
  }
}
