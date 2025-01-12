import * as vscode from "vscode";
import { handleError } from "../utils/utils";
import fs from 'fs';
import path from 'path';
import { ExplorerProvider } from "../ExplorerProvider";

function readSpecificFiles() {
    if (!vscode.workspace.workspaceFolders) {
        return;
    }

    const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const targetFiles = ['version.txt', 'framework.config'];

    targetFiles.forEach((fileName) => {
        const filePath = path.join(workspaceRoot, fileName);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            vscode.window.showInformationMessage(`Content of ${fileName}: ${content}`);
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

        // Example of creating or modifying a file
        await createOrUpdateFile('new-config.json', JSON.stringify({ key: 'value' }, null, 2));

    } catch (err: any) {
        handleError(err);
        vscode.window.showErrorMessage('Failed to read entire code base. Please check the logs for more details.');
    }
}
