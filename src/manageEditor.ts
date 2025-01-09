import * as vscode from 'vscode';

export function getCurrentLine(editor: vscode.TextEditor) {
  const currentLine = editor.selection.active.line;
  console.log('currentLine: ', currentLine);

  return currentLine;
}

export async function addCommentToFile(fileURI: vscode.Uri, fileName: string, line: number, generatedComment: string,) {
  console.log('adding comment', line, generatedComment);
  const edit = new vscode.WorkspaceEdit();
  edit.insert(fileURI, new vscode.Position(line, 0), generatedComment.trim());
  await vscode.workspace.applyEdit(edit);
  vscode.window.showInformationMessage(`Commented added to ${fileName} at line ${line + 1}`);
}