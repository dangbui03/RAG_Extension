import * as vscode from "vscode";
import { ErrorType, MyError } from "../../utils/type";

export interface Editor {
    editor: vscode.TextEditor,
    document: vscode.TextDocument
    version: string,
    getLanguage(): string,
    getEditorContent(): string,
    getSelection(): string,
}

export class ActiveEditor implements Editor {
    editor: vscode.TextEditor;
    document: vscode.TextDocument;
    version: string;
    constructor() {
        this.editor = this.getActiveEditor();
        this.document = this.editor.document;
        this.version = "";
    }


    private getActiveEditor(): vscode.TextEditor {
        const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        if (editor === undefined) {
            throw new MyError("Failed to retrieve editor", ErrorType.ERROR);
        }
        return editor;
    }

    public getLanguage(): string {
        return this.editor.document.languageId;
    }

    getEditorContent(): string {
        let document: vscode.TextDocument = this.editor.document;
        let content = document.getText();
        return content;
    }

    getSelection(): string {
        let selection: vscode.Selection = this.editor.selection;
        const codeBlock: string = this.editor.document.getText(selection);
        return codeBlock;
    }

    async getLineNumber(selection: vscode.Range): Promise<number> {
        const startLine = selection.start.line;
        let lineAbove = selection.start.line - 1;

        if (lineAbove < 0) {
            const position = new vscode.Position(0, 0);
            await this.editor.edit((editBuilder) => {
                editBuilder.insert(position, '\n');
                lineAbove = lineAbove + 1;
            });
        } else {
            await this.editor.edit((editBuilder) => {
                const position = new vscode.Position(startLine, 0);
                editBuilder.insert(position, '\n');
                lineAbove = lineAbove + 1;
            });
        }
        return lineAbove;
    }

    private async getAllSymbols(): Promise<vscode.DocumentSymbol[]> {
        const allsymbols: vscode.DocumentSymbol[] = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', this.document.uri);
        if (allsymbols.length === 0) {
            throw new MyError("No Symbol found", ErrorType.INFO);
        }
        return allsymbols;
    }

    public async getAllFunctionName(): Promise<string[]> {
        let allFunctions = new Array();
        let allSymbols: vscode.DocumentSymbol[] = await this.getAllSymbols();
        for (let symbol of allSymbols) {
            if (symbol.kind === vscode.SymbolKind.Function) {
                allFunctions.push(symbol.name);
            }
        }
        return allFunctions;
    }

    public async getFunction(func: string): Promise<vscode.DocumentSymbol> {
        let allSymbols: vscode.DocumentSymbol[] = await this.getAllSymbols();
        for (let symbol of allSymbols) {
            if (symbol.kind === vscode.SymbolKind.Function && symbol.name === func) {
                return symbol;
            }
        }
        throw new MyError("Function not found ", ErrorType.ERROR);
    }

    public async getSelectedFunction(func: string): Promise<string> {
        let symbol: vscode.DocumentSymbol = await this.getFunction(func);
        let functionString: string = this.editor.document.getText(symbol.range);
        return functionString;
    }

    public async addCommentToFile(generatedComment: string, selection: vscode.Range) {
        const fileURI = this.document.uri;
        const fileName = this.document.fileName;
        const edit = new vscode.WorkspaceEdit();
        const lineNumber = selection.end.line + 1; // Add comment to the line below the code line
        edit.insert(fileURI, new vscode.Position(lineNumber, 1), generatedComment.trim() + '\n');
        await vscode.workspace.applyEdit(edit);
        vscode.window.showInformationMessage(`Comment added to ${fileName} at line ${lineNumber + 1}`);
    }
}