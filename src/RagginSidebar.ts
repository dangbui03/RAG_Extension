import * as vscode from "vscode";
// If you're making HTTP calls, you might need node-fetch or Axios:
// import fetch from 'node-fetch';
import { OllamaServer } from "./ollama";
import { getConfiguration } from "./utils/utils";
import { generateAnswer } from "./utils/generator";

export class RagginSidebar implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public async resolveWebviewView(
    webviewView: vscode.WebviewView
  ): Promise<void> {
    this._view = webviewView;

    // Allow scripts in the webview
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    // Listen for messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "askQuestion": {
          const question = message.text || "";
          const model = message.model;
          // Example: call a server to get an answer
          // const answer = await this.askServer(question, model);
          const answer = await generateAnswer(
            question,
            model,
            this._view.webview
          );
          // Update the webview with the answer
          // this.updateContent(answer);
          break;
        }
        case "populateModels": {
          // The Webview is requesting models
          const serverUrl: string = getConfiguration(
            "serverURL",
            "http://127.0.0.1:11434"
          );
          const ollamaServer = OllamaServer.getInstance(serverUrl);

          try {
            const models = await ollamaServer.listModels();
            // Send the list of models back to the Webview
            webviewView.webview.postMessage({
              command: "populateModels",
              models: models || [],
            });
          } catch (error) {
            console.error("Error fetching models:", error);
            // You could also send an error message back
            webviewView.webview.postMessage({
              command: "populateModels",
              models: [],
              error: String(error),
            });
          }
          break;
        }
        default:
          break;
      }
    });

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    return /* html */ `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ask AI</title>

            <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/15.0.6/marked.min.js" integrity="sha512-rvRITpPeEKe4hV9M8XntuXX6nuohzqdR5O3W6nhjTLwkrx0ZgBQuaK4fv5DdOWzs2IaXsGt5h0+nyp9pEuoTXg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #1e1e1e;
                    color: #ffffff;
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .container {
                    max-width: 600px;
                    margin: auto;
                    width: 100%;
                    background: #252526;
                    padding: 10px;
                    border-radius: 8px;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
                }

                .chat-content {
                    flex-grow: 1;
                    overflow-y: auto;
                    padding: 15px;
                }

                .response-box {
                    background-color: #2d2d30;
                    border: 1px solid #3c3c3c;
                    border-radius: 6px;
                    padding: 15px;
                    margin-bottom: 10px;
                    white-space: pre-wrap;
                    font-size: 14px;
                    color: #cccccc;
                }

                h3 {
                    margin-bottom: 15px;
                    text-align: center;
                    font-size: 20px;
                    color: #dcdcaa;
                }

                label {
                    font-size: 14px;
                    font-weight: bold;
                    color: #bbbbbb;
                    display: block;
                    margin-top: 15px;
                }

                textarea, select {
                    width: 100%;
                    background-color: #2d2d30;
                    color: #ffffff;
                    border: 1px solid #3c3c3c;
                    border-radius: 5px;
                    padding: 10px;
                    font-size: 14px;
                    outline: none;
                    transition: border 0.2s ease-in-out;
                }
                
                #question {
                    width: 100%;
                }

                textarea {
                    resize: vertical;
                }

                textarea:focus, select:focus {
                    border: 1px solid #007acc;
                }

                select {
                    cursor: pointer;
                    height: 40px;
                }

                .btn {
                    width: 100%;
                    background: #007acc;
                    color: white;
                    border: none;
                    padding: 12px;
                    font-size: 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    margin-top: 15px;
                    transition: background 0.2s ease-in-out;
                }

                .btn:hover {
                    background: #005f99;
                }

                .response-box {
                    background-color: #2d2d30;
                    border: 1px solid #3c3c3c;
                    border-radius: 6px;
                    padding: 15px;
                    margin-top: 20px;
                    white-space: pre-wrap;
                    min-height: 50px;
                    font-size: 14px;
                    color: #cccccc;
                    width: auto;
                }

                .question-sent-box {
                    background-color: #2d2d30;
                    align-self: flex-end;
                    margin-right: 0;
                    text-align: right;
                    width: auto;
                }
            </style>
        </head>
        <body>

            <div class="container">
                <!-- Chat Content -->
                <h3 style="text-align: center; color: #dcdcaa;">Chat with AI</h3>
                <div class="chat-content" id="chatContent">
                    <!-- <div id="mock-response" class="response-box">
                        Response will appear here.
                    </div> 
                    <div class="question-sent-box">
                        Sent question be like this.
                    </div>
                    -->
                </div>

                <!-- Input Section (Fixed at Bottom) -->
                <div class="input-section">
                    <label for="question">Your Question:</label>
                    <textarea id="question" rows="2" placeholder="Type your question..."></textarea>

                    <label for="model">Select a Model:</label>
                    <select id="model">
                        <option value="qwen2.5-coder:1.5b">qwen2.5-coder:1.5b</option>
                    </select>

                    <button class="btn" id="askBtn">Ask</button>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                document.addEventListener('DOMContentLoaded', () => {
                    // Populate the model dropdown dynamically
                    vscode.postMessage({ command: 'populateModels' });

                    // Set up the click event for the Ask button
                    document.getElementById('askBtn').addEventListener('click', () => {
                        const question = document.getElementById('question').value.trim();
                        const model = document.getElementById('model').value;

                        if (question === "") {
                        document.getElementById('response').textContent = "⚠️ Please enter a question.";
                        return;
                        }

                        // Post a message to the VS Code extension with the question and selected model
                        const chatContent = document.getElementById('chatContent').innerHTML;
                        document.getElementById('chatContent').innerHTML = chatContent + '<div class="question-sent-box">'+question+'</div> <div id="response" class="response-box">Please wait...</div>';
                        document.getElementById('question').value = '';
                        vscode.postMessage({ command: 'askQuestion', text: question, model: model });
                    });
                });

                window.addEventListener('message', (event) => {
                    const message = event.data;
                    if (message.command === 'populateModels') {
                        const modelSelect = document.getElementById('model');
                        modelSelect.innerHTML = ''; // Clear old options, if any

                        if (message.models && Array.isArray(message.models)) {
                            message.models.forEach((m) => {
                                const option = document.createElement('option');
                                option.value = m;
                                option.textContent = m;
                                modelSelect.appendChild(option);
                            });
                        } else {
                            // If there was an error or no models, you can handle that
                            const option = document.createElement('option');
                            option.value = '';
                            option.textContent = 'No models found';
                            modelSelect.appendChild(option);
                        }
                    }
                    else if (message.type === 'update') {
                        const rawMarkdown = message.content || "No response received.";
                        const chatContent = document.getElementById('chatContent').innerHTML;
                        // Convert chuỗi Markdown sang HTML
                        const renderedHtml = marked.parse(rawMarkdown);
                        // Render vào "response" bằng innerHTML
                        document.getElementById('response').innerHTML = renderedHtml;
                        // document.getElementById('response').innerHTML = renderedHtml;
                    }
                    else if (message.type === 'updateDone') {
                        document.getElementById('response').setAttribute('id', 'response-done');
                    }
                });
            </script>

        </body>
        </html>
        `;
  }
}
