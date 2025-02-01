import * as vscode from "vscode";
import { ErrorType, MyError } from "./type";
import { ReadableStream } from "node:stream/web";
import ollama from 'ollama';

export async function generateAnswer(
  question: string,
  model: string,
  webview: vscode.Webview
): Promise<string> {
  try {
    let chunks = [];
    const output = await ollama.generate({
      model: model,
      prompt: question,
      stream: true,
    });
    for await (const chunk of output) {
        // console.log(chunk.response);
        chunks.push(chunk.response);
        webview.postMessage({ type: "update", content: chunks.join("") });
    }
    return chunks.join("");
  } catch (error) {
    console.error(error);
    return "Error contacting the server.";
  }
  return "";
}
