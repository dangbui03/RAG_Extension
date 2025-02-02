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
    var answer = "";
    const output = await ollama.generate({
      model: model,
      prompt: question,
      stream: true,
    });
    for await (const chunk of output) {
        // console.log(chunk.response);
        // console.log(answer);
        answer = answer.concat(chunk.response.toString());
        webview.postMessage({ type: "update", model: model, content: answer });
    }

    webview.postMessage({ type: "updateDone" });
    return answer;
  } catch (error) {
    console.error(error);
    return "Error contacting the server.";
  }
  return "";
}
