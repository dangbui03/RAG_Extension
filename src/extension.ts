import * as vscode from "vscode";
import { GenerateCommentCommand } from './commands/generateComment';
import { GfunctionCommentCommand } from './commands/functionComment';
import { readEntireCodeBase } from "./commands/readEntireCodeBase";

// import { buildPrompt } from "./promptBuilder";
// import { generateComment } from './ollama';
// import { getCurrentLine, addCommentToFile } from './manageEditor';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "ragify" is now active!');

	const ragdisposable = vscode.commands.registerCommand('ragify.generateComment', GenerateCommentCommand);
	const ragFunctionDisposable = vscode.commands.registerCommand('ragify.gfunctionComment', GfunctionCommentCommand);
    const ragEntireCodeBaseDisposable = vscode.commands.registerCommand('ragify.readEntireCodeBase', readEntireCodeBase);

	context.subscriptions.push(ragdisposable);
	context.subscriptions.push(ragFunctionDisposable);
    context.subscriptions.push(ragEntireCodeBaseDisposable);
	// const model = 'qwen-2.5-coder:1.5B';

	// const generateCommentCommand = vscode.commands.registerCommand('ragify.generateComment', async () => {

    //     vscode.window.showInformationMessage('Generating comment, please wait');

    //     const editor = vscode.window.activeTextEditor;
    //     if (editor === undefined) {
    //         vscode.window.showErrorMessage('Failed to retrieve editor');
    //         return;
    //     }

    //     const prompt = await buildPrompt(editor);
    //     console.log('prompt', prompt);

    //     if (prompt === undefined) {
    //         vscode.window.showErrorMessage('Failed to generate prompt');
    //         return;
    //     }

	// 	const comment = await generateComment(model, prompt);
    //     console.log('generated comment: ', comment);

    //     if (comment === undefined) {
    //         vscode.window.showErrorMessage('Failed to generate comment');
    //         return;
    //     }

	// 	const fileURI = editor.document.uri;
    //     const fileName = editor.document.fileName;
    //     const currentLine = getCurrentLine(editor);

    //     addCommentToFile(fileURI, fileName, currentLine, comment);
    // });

	// context.subscriptions.push(generateCommentCommand);


}

// This method is called when your extension is deactivated
export function deactivate() {}
