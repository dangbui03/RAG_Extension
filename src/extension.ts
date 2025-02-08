import * as vscode from "vscode";
import { GenerateCommentCommand } from "./commands/generateComment";
import { GfunctionCommentCommand } from "./commands/functionComment";
import { readEntireCodeBase } from "./commands/readEntireCodeBase";
import { RagginSidebar } from "./webview/home/Raggin-home-view-provider";

// import { buildPrompt } from "./promptBuilder";
// import { generateComment } from './ollama';
// import { getCurrentLine, addCommentToFile } from './manageEditor';

export function activate(context: vscode.ExtensionContext) {
  // const sidebarProvider = new SidebarProvider(context.extensionUri);

  console.log('Congratulations, your extension "RAGGIN" is now active!');

  const ragginSidebar = new RagginSidebar(context.extensionUri);

  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );
  item.text = "Generate Comment";
  item.command = "raggin.generateComment";
  item.show();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("raggin-sidebar", ragginSidebar)
  );
  // const sidebarProvider = new SidebarProvider(context.extensionUri);
  // context.subscriptions.push(
  //   vscode.window.registerWebviewViewProvider(
  // 	"raggin-sidebar",
  // 	sidebarProvider
  //   )
  // );

  const ragdisposable = vscode.commands.registerCommand(
    "raggin.generateComment",
    GenerateCommentCommand
  );
  const ragFunctionDisposable = vscode.commands.registerCommand(
    "raggin.gfunctionComment",
    GfunctionCommentCommand
  );
  const ragEntireCodeBaseDisposable = vscode.commands.registerCommand(
    "raggin.readEntireCodeBase",
    readEntireCodeBase
  );

  context.subscriptions.push(ragdisposable);
  context.subscriptions.push(ragFunctionDisposable);
  context.subscriptions.push(ragEntireCodeBaseDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
