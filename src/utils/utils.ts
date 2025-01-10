import * as vscode from "vscode";
import { ErrorType, MyError } from "./type";

export async function GetOllamaModelFromUser(models: string[]): Promise<string> {
    let model = getConfiguration<string>("modelName");
    if (model === "" || model === undefined) {
        if (models.length === 0) {
            throw new Error("No model found");
        }
        let selectedModel: string | undefined = await vscode.window.showQuickPick(models, {
            title: 'Select an Ollama Model',
            placeHolder: 'Choose a model to use',
            canPickMany: false,
            ignoreFocusOut: true,
        });
        if (selectedModel === undefined || selectedModel === "") {
            throw new Error("select a model");
        }
        return selectedModel;
    }
    return model;
}


export function getConfiguration<T>(section: string, defaultValue: any = "", setting: string = "ollama"): T {
    const config = vscode.workspace.getConfiguration(setting);
    return config.get<T>(section, defaultValue);
}

export function handleError(error: any) {
    if (error?.name === "FetchError") {
        vscode.window.showErrorMessage(`Fetch Error : make sure ollama server is running`);
    } else if (error?.type === ErrorType.ERROR) {
        vscode.window.showErrorMessage(error?.message);
    }
    else if (error?.type === ErrorType.WARNING) {
        vscode.window.showWarningMessage(error?.message);
    } else {
        vscode.window.showInformationMessage(error?.message);
    }
}

export { ErrorType, MyError };