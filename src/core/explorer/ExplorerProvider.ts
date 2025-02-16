import * as vscode from 'vscode';


export class ExplorerProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): Thenable<vscode.TreeItem[]> { //element?: vscode.TreeItem
        if (!vscode.workspace.workspaceFolders) {
            return Promise.resolve([]);
        }

        const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        return Promise.resolve(this.getFilesAndFolders(workspaceRoot));
    }

    private getFilesAndFolders(rootPath: string): vscode.TreeItem[] {
        const fs = require('fs');
        const path = require('path');

        const filesAndFolders = fs.readdirSync(rootPath).map((file: string) => {
            const fullPath = path.join(rootPath, file);
            const isDirectory = fs.statSync(fullPath).isDirectory();
            const label = file;

            return new vscode.TreeItem(
                label,
                isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
            );
        });

        return filesAndFolders;
    }
}
