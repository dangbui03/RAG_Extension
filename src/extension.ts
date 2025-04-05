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
  Logger.initialize(outputChannel, "RAGGIN");
  const config = vscode.workspace.getConfiguration("RAGGIN");
  const logLevelSetting = config.get<string>("logLevel", "info").toUpperCase();
  Logger.setLogLevel(
    LogLevel[logLevelSetting as keyof typeof LogLevel] || LogLevel.INFO
  );
  Logger.info("RAGGIN extension activated");

  // Take minWidth
  const minWidth = config.get<number>("minWidth", 100);

  // Create the sidebar provider and register it.
  const ragginSidebar = new RagginProvider(context, outputChannel);
  let isProviderRegistered = true; // Track the registration status
  let sidebarRegistration = vscode.window.registerWebviewViewProvider(
    "raggin-sidebar",
    ragginSidebar
  );
  context.subscriptions.push(sidebarRegistration);

  // Create a status bar item, assign a command, show it, and add it to subscriptions.
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );
  statusBarItem.text = "Generate Comment";
  statusBarItem.command = "raggin.generateComment";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register commands directly and push them to the context's subscriptions.
  const commandDisposables = [
    vscode.commands.registerCommand(
      "raggin.generateComment",
      GenerateCommentCommand
    ),
    vscode.commands.registerCommand(
      "raggin.gfunctionComment",
      GfunctionCommentCommand
    ),
    vscode.commands.registerCommand(
      "raggin.readEntireCodeBase",
      readEntireCodeBase
    ),
  ];

  commandDisposables.forEach((disposable) =>
    context.subscriptions.push(disposable)
  );
  // Register command to handle width-based disposal from the webview
    const widthDisposalCommand = vscode.commands.registerCommand("raggin.handleWidthDisposal", (width: number) => {
      Logger.info(`Handling width disposal. Current width: ${width}px`);
      
      if (width < minWidth && isProviderRegistered) {
        // Dispose the sidebar registration
        sidebarRegistration.dispose();
        isProviderRegistered = false;
        vscode.window.showInformationMessage('RAGGIN sidebar disabled due to narrow width');
        Logger.info(`RAGGIN sidebar disposed due to narrow width (${width}px < ${minWidth}px)`);
      } else if (width >= minWidth && !isProviderRegistered) {
        // Re-register the provider if width is adequate again
        sidebarRegistration = vscode.window.registerWebviewViewProvider("raggin-sidebar", ragginSidebar);
        context.subscriptions.push(sidebarRegistration);
        isProviderRegistered = true;
        vscode.window.showInformationMessage('RAGGIN sidebar re-enabled');
        Logger.info(`RAGGIN sidebar re-enabled (${width}px >= ${minWidth}px)`);
      }
    });
    
    context.subscriptions.push(widthDisposalCommand);
    
    // Set up window change event listener for active editor width changes
    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(editor => {
        if (!editor) return;
        checkEditorWidth(editor, minWidth);
      })
    );
    
    // Set up configuration change event listener
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('RAGGIN.minWidth')) {
          const newConfig = vscode.workspace.getConfiguration('RAGGIN');
          const newMinWidth = newConfig.get<number>('minWidth', 300);
          const editor = vscode.window.activeTextEditor;
          if (editor) {
            checkEditorWidth(editor, newMinWidth);
          }
        }
      })
    );
    
    // Initial check on the current editor
    if (vscode.window.activeTextEditor) {
      checkEditorWidth(vscode.window.activeTextEditor, minWidth);
    }
    
    // Function to check editor width and trigger disposal if needed
    function checkEditorWidth(editor: vscode.TextEditor, minWidthThreshold: number) {
      try {
        const editorWidth = estimateEditorWidth(editor);
        Logger.debug(`Estimated editor width: ${editorWidth}px`);
        
        // Trigger the disposal command with the estimated width
        vscode.commands.executeCommand('raggin.handleWidthDisposal', editorWidth);
      } catch (error) {
        Logger.error(`Error checking editor width: ${error}`);
      }
    }
  }

  function estimateEditorWidth(editor: vscode.TextEditor): number {
    // Get the visible ranges of the editor
    const visibleRanges = editor.visibleRanges;
    
    if (visibleRanges.length > 0) {
      // Get the first visible line
      const firstVisibleLine = editor.document.lineAt(visibleRanges[0].start.line);
      
      // Get the longest line within the visible range
      let maxLength = firstVisibleLine.text.length;
      for (let i = visibleRanges[0].start.line; i <= visibleRanges[0].end.line; i++) {
        const lineLength = editor.document.lineAt(i).text.length;
        if (lineLength > maxLength) {
          maxLength = lineLength;
        }
      }
      
      // Estimate width based on character count and average character width
      // Using 8px as a rough average character width
      const averageCharWidth = 8;
      return maxLength * averageCharWidth;
    }

    return 0; // Default width if no visible ranges are found
}

// This method is called when your extension is deactivated.
export function deactivate() {
  Logger.info("Extension deactivated");
}
