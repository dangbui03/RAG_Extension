import * as vscode from "vscode";
import { handleError } from "../utils/utils";
import fs from 'fs';
import path from 'path';
import { ExplorerProvider } from "../ExplorerProvider";

function catchNextJsVersion() {
    if (!vscode.workspace.workspaceFolders) {
        vscode.window.showWarningMessage('No workspace is open.');
        return;
    }

    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const targetFiles = ['package.json', 'tsconfig.json'];
    let nextJsVersion: string | null = null; // Local variable to store Next.js version

    targetFiles.forEach((fileName) => {
        const filePath = path.join(workspaceRoot, fileName);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (fileName === 'package.json') {
                try {
                    const packageJson = JSON.parse(content);
                    if (packageJson.dependencies && packageJson.dependencies['next']) {
                        nextJsVersion = packageJson.dependencies['next'];
                        vscode.window.showInformationMessage(`Next.js Version: ${nextJsVersion}`);
                    } else {
                        vscode.window.showInformationMessage('Next.js not found in package.json dependencies.');
                    }
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to parse package.json.');
                }
            } else {
                vscode.window.showInformationMessage(`Content of ${fileName}: ${content}`);
            }
        } else {
            vscode.window.showWarningMessage(`${fileName} not found in the project.`);
        }
    });

    // Optionally, use the `nextJsVersion` variable later in your logic
    console.log('Detected Next.js version:', nextJsVersion);
    // vscode.window.showInformationMessage(`Detected Next.js version: ${nextJsVersion}`);
    return nextJsVersion;
}

function readSpecificFiles() {
    if (!vscode.workspace.workspaceFolders) {
        return;
    }

    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const targetFiles = ['package.json', 'tsconfig.json'];

    targetFiles.forEach((fileName) => {
        const filePath = path.join(workspaceRoot, fileName);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            // vscode.window.showInformationMessage(`Content of ${fileName}: ${content}`);
            console.log('Content:', content);
        } else {
            vscode.window.showWarningMessage(`${fileName} not found in the project.`);
        }
    });
}

async function createOrUpdateFile(fileName: string, content: string) {
    if (!vscode.workspace.workspaceFolders) {
        return;
    }

    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri;
    const filePath = vscode.Uri.joinPath(workspaceRoot, fileName);

    try {
        await vscode.workspace.fs.writeFile(filePath, Buffer.from(content, 'utf8'));
        vscode.window.showInformationMessage(`${fileName} created/updated successfully!`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create/update ${fileName}: ${error}`);
    }
}

export async function readEntireCodeBase() {
    vscode.window.showInformationMessage('Read Entire Code Base Command Executed!');
    try {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('No workspace is open.');
            return;
        }

        // Initialize Tree View
        const explorer = vscode.window.createTreeView('explorer', { treeDataProvider: new ExplorerProvider() });

        // Read Specific Files
        readSpecificFiles();
        const version = catchNextJsVersion();
        vscode.window.showInformationMessage(`Next.js Version: ${version}`);

        // Example of creating or modifying a file
        await createOrUpdateFile('new-config.json', JSON.stringify({ key: 'value' }, null, 2));

    } catch (err: any) {
        handleError(err);
        vscode.window.showErrorMessage('Failed to read entire code base. Please check the logs for more details.');
    }
}
