import { Prompt, PromptBuilder } from '../core/prompts/promptBuilder';
import { getConfiguration, GetOllamaModelFromUser, handleError } from '../utils/utils';
import { OllamaServer } from '../core/prompts/ollama';
import { ActiveEditor, Editor } from '../core/editor/manageEditor';
import * as vscode from 'vscode';

export async function GenerateCommentCommand() {
    vscode.window.showInformationMessage('Generate Comment Command Executed!');
    try {
        const editor: ActiveEditor = new ActiveEditor();

        // connect to ollama server
        const serverUrl: string = getConfiguration<string>('serverURL', 'http://127.0.0.1:11434');
        const ollamaServer: OllamaServer = OllamaServer.getInstance(serverUrl);

        // get list of models
        const models: string[] = await ollamaServer.listModels();
        const model: string = await GetOllamaModelFromUser(models);

        // build the prompt
        const promptbuilder: PromptBuilder = new PromptBuilder(editor);
        // const selectedCode = editor.getSelection();

        // if (!selectedCode) {
        //     vscode.window.showWarningMessage('No code selected. Generating comments for the entire file.');
        //     promptbuilder.buildCodeBlock(editor.getEditorContent());
        // } else {
        //     promptbuilder.buildCodeBlock(selectedCode);
        // }

        let prompt: Prompt = promptbuilder.buildContext().buildPromptText().buildCodeBlock(editor.getSelection()).build();
        const fullPrompt: string = prompt.getFullPrompt();
        console.log("Generated Prompt:", fullPrompt);

        // generate comment
        const comment: string = await ollamaServer.generateComment(model, fullPrompt);
        console.log("Generated Comment:", comment);
        console.log("Language:", editor.getLanguage());

        // write comment to textEditor
        // comment will be added to the line above selection
        await editor.addCommentToFile(comment, editor.editor.selection);

        ollamaServer.abort();
    } catch (error: any) {
        handleError(error);
        vscode.window.showErrorMessage('Failed to generate comments. Please check the logs for more details.');
    }
}