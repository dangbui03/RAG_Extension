import { Prompt, PromptBuilder } from '../promptBuilder';
import { getConfiguration, GetOllamaModelFromUser, handleError } from '../utils/utils';
import { OllamaServer } from '../ollama';
import { ActiveEditor } from '../manageEditor';
import * as vscode from 'vscode';



export async function GenerateCommentCommand() {
    vscode.window.showInformationMessage('Generate Comment Command Executed!');
    try {
        const editor: ActiveEditor = new ActiveEditor();

        // connect to ollama server
        const serverUrl: string = getConfiguration<string>('serverURL', 'http://127.0.0.1:11434');
        const ollamaServer: OllamaServer = OllamaServer.getInstance(serverUrl);
        const models: string[] = await ollamaServer.listModels();
        const model: string = await GetOllamaModelFromUser(models);

        // build the prompt
        const promptbuilder: PromptBuilder = new PromptBuilder(editor);
        let prompt: Prompt = promptbuilder.buildContext().buildPromptText().buildCodeBlock(editor.getSelection()).build();
        const fullPrompt: string = prompt.getFullPrompt();
        console.log(fullPrompt);

        // generate comment
        const comment: string = await ollamaServer.generateComment(model, fullPrompt);
        console.log(comment);

        // write comment to textEditor
        // comment will be added to the line above selection
        await editor.addCommentToFile(comment, editor.editor.selection);

        ollamaServer.abort();
    } catch (error: any) {
        handleError(error);
        console.log(error);
    }
}