import * as vscode from "vscode";
import { GenerateCommentCommand } from "./commands/generateComment";
import { GfunctionCommentCommand } from "./commands/functionComment";
import { readEntireCodeBase } from "./commands/readEntireCodeBase";
import { RagginProvider } from "./core/webview/RagginProvider";
import { Logger, LogLevel } from "./utils/logging";

export function activate(context: vscode.ExtensionContext) {
  // Create the output channel and add it to the subscriptions.
  const outputChannel = vscode.window.createOutputChannel("RAGGIN");
  context.subscriptions.push(outputChannel);

  console.log('Congratulations, your extension "RAGGIN" is now active!');

  // Initialize the logger with the output channel.
  Logger.initialize(outputChannel, 'RAGGIN');
  const config = vscode.workspace.getConfiguration('RAGGIN');
  const logLevelSetting = config.get<string>('logLevel', 'info').toUpperCase();
  Logger.setLogLevel(LogLevel[logLevelSetting as keyof typeof LogLevel] || LogLevel.INFO);

  Logger.info("RAGGIN extension activated");

  // Create the sidebar provider and register it.
  const ragginSidebar = new RagginProvider(context, outputChannel);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("raggin-sidebar", ragginSidebar)
  );

  // Create a status bar item, assign a command, show it, and add it to subscriptions.
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
  statusBarItem.text = "Generate Comment";
  statusBarItem.command = "raggin.generateComment";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register commands directly and push them to the context's subscriptions.
  context.subscriptions.push(
    vscode.commands.registerCommand("raggin.generateComment", GenerateCommentCommand),
    vscode.commands.registerCommand("raggin.gfunctionComment", GfunctionCommentCommand),
    vscode.commands.registerCommand("raggin.readEntireCodeBase", readEntireCodeBase)
  );
}

// This method is called when your extension is deactivated.
export function deactivate() {
  Logger.info('Extension deactivated');
}
