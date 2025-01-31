import * as vscode from "vscode";
import { GenerateCommentCommand } from './commands/generateComment';
import { GfunctionCommentCommand } from './commands/functionComment';
import { readEntireCodeBase } from "./commands/readEntireCodeBase";

// import { SidebarProvider } from './SidebarProvider';

// import { buildPrompt } from "./promptBuilder";
// import { generateComment } from './ollama';
// import { getCurrentLine, addCommentToFile } from './manageEditor';

export function activate(context: vscode.ExtensionContext) {
    // const sidebarProvider = new SidebarProvider(context.extensionUri);

	console.log('Congratulations, your extension "ragify" is now active!');

	const ragdisposable = vscode.commands.registerCommand('ragify.generateComment', GenerateCommentCommand);
	const ragFunctionDisposable = vscode.commands.registerCommand('ragify.gfunctionComment', GfunctionCommentCommand);
    const ragEntireCodeBaseDisposable = vscode.commands.registerCommand('ragify.readEntireCodeBase', readEntireCodeBase);

	context.subscriptions.push(ragdisposable);
	context.subscriptions.push(ragFunctionDisposable);
    context.subscriptions.push(ragEntireCodeBaseDisposable);
	
}

// This method is called when your extension is deactivated
export function deactivate() {}
