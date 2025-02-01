import * as vscode from "vscode";
import { GenerateCommentCommand } from './commands/generateComment';
import { GfunctionCommentCommand } from './commands/functionComment';
import { readEntireCodeBase } from "./commands/readEntireCodeBase";
import { SidebarProvider } from "./RagginSidebar";
// import { SidebarProvider } from "./SidebarProvider";

// import { SidebarProvider } from './SidebarProvider';

// import { buildPrompt } from "./promptBuilder";
// import { generateComment } from './ollama';
// import { getCurrentLine, addCommentToFile } from './manageEditor';

export function activate(context: vscode.ExtensionContext) {
    // const sidebarProvider = new SidebarProvider(context.extensionUri);

	console.log('Congratulations, your extension "RAGGIN" is now active!');

	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
	  vscode.window.registerWebviewViewProvider(
		"raggin-sidebar",
		sidebarProvider
	  )
	);

	const ragdisposable = vscode.commands.registerCommand('ragify.generateComment', GenerateCommentCommand);
	const ragFunctionDisposable = vscode.commands.registerCommand('ragify.gfunctionComment', GfunctionCommentCommand);
    const ragEntireCodeBaseDisposable = vscode.commands.registerCommand('ragify.readEntireCodeBase', readEntireCodeBase);

	context.subscriptions.push(ragdisposable);
	context.subscriptions.push(ragFunctionDisposable);
    context.subscriptions.push(ragEntireCodeBaseDisposable);
	
}

// This method is called when your extension is deactivated
export function deactivate() {}
