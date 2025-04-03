import { getConfiguration, GetOllamaModelFromUser, handleError } from "../utils/utils";
import * as vscode from "vscode";
import axios from "axios";

export async function RagCallFunction (model: string, prompt: string, nextJSVersion:string) {
    vscode.window.showInformationMessage('Rag Call Function Command Executed!');
    try {
        const payload = {
            "model": model,
            "query": prompt,
            "versionName": nextJSVersion
        }

        const response = await axios.post('http://localhost:8080/generate_response', payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        const data = response.data;
        console.log(data);
        return data;

    } catch (err: any) {
        handleError(err);
        // Trả về lỗi để component gọi hàm có thể xử lý
        throw new Error(`RAG call failed: ${err.message}`);
    }
};