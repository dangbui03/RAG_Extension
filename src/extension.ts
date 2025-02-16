import * as vscode from "vscode";
import { GenerateCommentCommand } from "./commands/generateComment";
import { GfunctionCommentCommand } from "./commands/functionComment";
import { readEntireCodeBase } from "./commands/readEntireCodeBase";
import { RagginProvider } from "./core/webview/RagginProvider";
import { Logger } from "./utils/logging";


let outputChannel: vscode.OutputChannel

export function activate(context: vscode.ExtensionContext) {
  // const sidebarProvider = new SidebarProvider(context.extensionUri);
  outputChannel = vscode.window.createOutputChannel("RAGGIN")
	context.subscriptions.push(outputChannel)

  console.log('Congratulations, your extension "RAGGIN" is now active!');
  Logger.initialize(outputChannel);
	Logger.log("RAGGIN extension activated");

  const disposables: vscode.Disposable[] = [];
  context.subscriptions.push(
    new vscode.Disposable(() => vscode.Disposable.from(...disposables).dispose())
  );

  const ragginSidebar = new RagginProvider(
    context,
    outputChannel
    // HomeViewProvider.viewType,
    // new HomeViewProvider(context)
  );

  const item = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );
  item.text = "Generate Comment";
  item.command = "raggin.generateComment";
  item.show();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("raggin-sidebar", ragginSidebar)
  );
  // disposables.push(homeViewProvider);
  
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
