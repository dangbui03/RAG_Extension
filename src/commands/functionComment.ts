import { ActiveEditor } from "../core/editor/manageEditor";
import { OllamaServer } from "../core/prompts/ollama";
import { Prompt, PromptBuilder } from "../core/prompts/promptBuilder";
import {
  getConfiguration,
  GetOllamaModelFromUser,
  handleError,
} from "../utils/utils";
import * as vscode from "vscode";

export async function GfunctionCommentCommand() {
  vscode.window.showInformationMessage("Gfunction Comment Command Executed!");
  try {
    let editor: ActiveEditor = new ActiveEditor();
    // show the quickPick

    let selectedfunction: string | undefined =
      await vscode.window.showQuickPick(editor.getAllFunctionName(), {
        title: "Generate comment to functions",
        canPickMany: false,
        placeHolder: "search function",
        ignoreFocusOut: true,
      });

    // connect to ollama server
    const serverUrl: string = getConfiguration<string>(
      "serverURL",
      "http://127.0.0.1:11434"
    );
    const ollamaServer: OllamaServer = OllamaServer.getInstance(serverUrl);
    const model: string = await GetOllamaModelFromUser(
      await ollamaServer.listModels()
    );

    // build prompt
    const promptBuilder = new PromptBuilder(editor);
    const codeBlock = await editor.getSelectedFunction(selectedfunction!);
    let prompt: Prompt = promptBuilder
      .buildContext()
      .buildFunctionPrompt()
      .buildCodeBlock(codeBlock)
      .build();
    let fullPrompt: string = prompt.getFullPrompt();
    console.log(fullPrompt);

    //generate Comment
    let symbol: vscode.DocumentSymbol = await editor.getFunction(
      selectedfunction!
    );
    let line: number = symbol.range.start.line;
    let comment: string = await ollamaServer.generateComment(model, fullPrompt);

    // --- Apply Hover (Tooltip) ---
    await vscode.languages.registerHoverProvider("javascript", {
      provideHover(document, position, token) {
        if (symbol.range.contains(position)) {
          return new vscode.Hover(comment);
        }
        return undefined;
      },
    });

    // --- Apply Editor Decorations ---
    const decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: "rgba(255, 255, 0, 0.3)", // Yellow background for decoration
      border: "1px solid yellow",
      isWholeLine: true,
    });

    const editorInstance = vscode.window.activeTextEditor;
    if (editorInstance) {
      editorInstance.setDecorations(decorationType, [symbol.range]);
    }
    // await editor.addCommentToFile(comment, symbol.range);
  } catch (err: any) {
    handleError(err);
  }
}
