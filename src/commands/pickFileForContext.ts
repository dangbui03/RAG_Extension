import * as vscode from "vscode";
import fs from 'fs';
import path from 'path';

export async function pickFilesForContext(): Promise<Record<string, string>> {
    // Lấy danh sách file đang mở
    let openFiles = vscode.window.visibleTextEditors.map(editor => editor.document.uri.fsPath);
    
    // Lấy danh sách file trong workspace
    let workspaceFiles = await vscode.workspace.findFiles('**/*.{js,ts,py,txt,md}', '**/node_modules/**');
    let workspaceFilePaths = workspaceFiles.map(f => f.fsPath);
    
    // Gộp danh sách và loại bỏ trùng lặp
    let allFiles = [...new Set([...openFiles, ...workspaceFilePaths])];

    // Hiển thị danh sách file
    let selectedFiles = await vscode.window.showQuickPick(allFiles, {
        canPickMany: true,
        placeHolder: 'Chọn các file để thêm vào context'
    });

    if (!selectedFiles) { return {}; }

    // Đọc nội dung file
    let fileContents: Record<string, string> = {};
    for (let file of selectedFiles) {
        try {
            let content = fs.readFileSync(file, 'utf8');
            fileContents[file] = optimizeContext(content);
        } catch (error) {
            console.error(`Không thể đọc file: ${file}`, error);
        }
    }
    return fileContents;
}

// Tối ưu context bằng cách lấy phần quan trọng
function optimizeContext(text: string): string {
    let lines = text.split('\n');
    if (lines.length > 100) {
        return lines.slice(0, 20).join('\n') + '\n...\n' + lines.slice(-20).join('\n');
    }
    return text;
}