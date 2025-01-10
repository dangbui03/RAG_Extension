import { ActiveEditor } from "../manageEditor";
import { OllamaServer } from "../ollama";
import { Prompt, PromptBuilder } from "../promptBuilder";
import { getConfiguration, GetOllamaModelFromUser, handleError } from "../utils/utils";
import * as vscode from "vscode";

export async function GfunctionCommentCommand() {
    vscode.window.showInformationMessage('Gfunction Comment Command Executed!');
    try {
        let editor: ActiveEditor = new ActiveEditor();
        // show the quickPick

        let selectedfunction: string | undefined = await vscode.window.showQuickPick(editor.getAllFunctionName(), {
            title: "Generate comment to functions",
            canPickMany: false,
            placeHolder: "search function",
            ignoreFocusOut: true,
        });

        // connect to ollama server
        const serverUrl: string = getConfiguration<string>('serverURL', 'http://127.0.0.1:11434');
        const ollamaServer: OllamaServer = OllamaServer.getInstance(serverUrl);
        const model: string = await GetOllamaModelFromUser(await ollamaServer.listModels());

        // build prompt
        const promptBuilder = new PromptBuilder(editor);
        const codeBlock = await editor.getSelectedFunction(selectedfunction!);
        let prompt: Prompt = promptBuilder.buildContext().buildFunctionPrompt().buildCodeBlock(codeBlock).build();
        let fullPrompt: string = prompt.getFullPrompt();
        console.log(fullPrompt);

        //generate Comment
        let symbol: vscode.DocumentSymbol = await editor.getFunction(selectedfunction!);
        let line: number = symbol.range.start.line;
        let comment: string = await ollamaServer.generateComment(model, fullPrompt);
        await editor.addCommentToFile(comment, symbol.range);

    } catch (err: any) {
        handleError(err);
    }
}