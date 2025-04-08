import { getConfiguration, GetOllamaModelFromUser, handleError } from "../utils/utils";
import * as vscode from "vscode";
import axios from "axios";
import { RagRequest, RagResponse } from "../utils/type";
import { FileModel } from "../../webview-ui/src/types";


export async function RagCallFunction(
    model: string, 
    prompt: string, 
    nextJSVersion: string, 
    fileList?: FileModel[]
) {
    vscode.window.showInformationMessage('Rag Call Function Command Executed!');
    try {
        // Prepare the payload according to the API description
        const payload: RagRequest = {
            versionName: nextJSVersion,
            query: prompt,
            model: model,
        };

        // Add optional file_list if provided
        if (fileList && fileList.length > 0) {
            payload.file_list = fileList;
        }

        const response = await axios.post('http://localhost:8000/generate_response', payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        // Extract the full response data according to the API description
        const responseData: RagResponse = response.data;
        console.log('RAG Retrieved Data:', responseData.retrieved_data);
        
        return {
            model: responseData.model,
            response: responseData.response,
            retrievedData: responseData.retrieved_data
        };

    } catch (err: any) {
        handleError(err);
        // Return error for the calling component to handle
        throw new Error(`RAG call failed: ${err.message}`);
    }
};