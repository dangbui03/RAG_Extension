import * as vscode from "vscode";
import { OllamaServer } from "../../ollama";
import { getConfiguration } from "../../utils/utils";
import { generateAnswer } from "../../utils/generator";
import { getNonce, replaceWebviewHtmlTokens } from "../utils";
// import './output.css';

const utf8TextDecoder = new TextDecoder("utf8");
const utf8TextEncoder = new TextEncoder();

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
      localResourceRoots: [await this.getRootUri()],
    };

    // Listen for messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "askQuestion": {
          const question = message.text || "";
          const model = message.model;
          // Example: call a server to get an answer
          // const answer = await this.askServer(question, model);
          if (this._view) {
            const answer = await generateAnswer(
              question,
              model,
              this._view.webview
            );
          }
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

    webviewView.webview.html = await this._getHtmlForWebview(webviewView.webview);
  }

  private async getRootUri() {
    return this._extensionUri;
  }

  private async  _getHtmlForWebview(webview: vscode.Webview): Promise<string> {

    const cssUri = webview.asWebviewUri(
      vscode.Uri.joinPath(await this.getRootUri(), "dist", "output.css")
    );

    const uri = vscode.Uri.joinPath(
      await this.getRootUri(),
      "src/webview/home/home.html"
    );

    try {
      // Read the file content as bytes
      const [bytes] = await Promise.all([vscode.workspace.fs.readFile(uri)]);
      
      // Decode the byte array to a string
      const htmlContent = utf8TextDecoder.decode(bytes);
  
      // Replace placeholders with dynamic content such as CSP source and nonce
      const html = replaceWebviewHtmlTokens(htmlContent, {
        cssUri: cssUri.toString(),
      });
  
      return html; // Return the modified HTML content
    } catch (error) {
      console.error("Error reading HTML file:", error);
      throw new Error("Failed to load HTML for webview.");
    }
    // return /* html */ `
    //     <!DOCTYPE html>
    //     <html lang="en">
    //     <head>
    //         <meta charset="UTF-8">
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //         <link href="${cssUri}" rel="stylesheet">
    //         <title>Ask AI</title>

    //         <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/15.0.6/marked.min.js" integrity="sha512-rvRITpPeEKe4hV9M8XntuXX6nuohzqdR5O3W6nhjTLwkrx0ZgBQuaK4fv5DdOWzs2IaXsGt5h0+nyp9pEuoTXg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    //     </head>
    //     <body>
    //     <header style="position: sticky; top: 0px;">
    //     <select id="model"  
    //         class="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-3 text-sm cursor-pointer focus:border-blue-500">
    //         <!-- <option value="qwen2.5-coder:1.5b">qwen2.5-coder:1.5b</option> -->
    //     </select>
    //     </header>
    //         <div class="flex flex-col items-center min-h-screen bg-gray-900 text-white p-5">
    //             <!-- Chat Container -->
    //             <h3 class="text-center text-yellow-300 text-xl mb-4">Chat with AI</h3>
    //             <div id="chatContent">
    //             </div>
    //             <div>               
    //                 <div class="chat-content flex-grow overflow-y-auto p-4 space-y-4">
    //                     <!-- Example response and question boxes -->
    //                     <!-- <div class="response-box bg-gray-700 border border-gray-600 rounded-md p-4 text-gray-300 text-sm">
    //                         Response will appear here.
    //                     </div>
    //                     <div class="grid justify-items-end">
    //                       <div class="question-sent-box bg-gray-700 text-right p-2 rounded-md w-fit">
    //                       Sent question be like this.
    //                       </div>
    //                     </div>
    //                      -->
    //                 </div>
    //             </div>

    //             <!-- Input Section -->
    //             <div class="w-full max-w-lg bg-gray-800 p-4 rounded-lg shadow-lg mt-5">
    //                 <div class="input-section space-y-4">
    //                     <textarea id="question" rows="2" placeholder="Type your question..."
    //                         class="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-3 text-sm outline-none focus:border-blue-500"></textarea/>
    //                 <div class="flex justify-end"><p>Press Enter to send, or use Shift+Enter for a new line</p></div>

    //                     <!-- <button id="askBtn"
    //                         class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition-all">
    //                         Ask
    //                     </button> -->
    //                     <div id="theEnd"></div>
    //                 </div>
    //             </div>
    //         </div>
        
    //         <script>
    //             const vscode = acquireVsCodeApi();

    //             document.addEventListener('DOMContentLoaded', () => {
    //                 // Populate the model dropdown dynamically
    //                 vscode.postMessage({ command: 'populateModels' });

    //                 // Set up the click event for the Ask button
    //                 // document.getElementById('askBtn').addEventListener('click', () => {
    //                  document.getElementById('question').addEventListener('keypress', () => {
    //                     if (event.key !== 'Enter') return;
    //                     else if (event.key === 'Enter' && event.shiftKey) return;
    //                     const question = document.getElementById('question').value.trim();
    //                     const model = document.getElementById('model').value;

    //                     if (question === "") {
    //                     document.getElementById('response').textContent = "⚠️ Please enter a question.";
    //                     return;
    //                     }

    //                     // Post a message to the VS Code extension with the question and selected model
    //                     const chatContent = document.getElementById('chatContent').innerHTML;
                        
    //                     document.getElementById('chatContent').innerHTML = chatContent
    //                     + '<div class="grid justify-items-end"> <div class="question-sent-box bg-gray-700 text-left p-2 rounded-md w-fit">' 
    //                     + question + '</div> </div>'
    //                     + '<div>' + model + '</div> <div id="response" class="bg-gray-700 text-left p-2 rounded-md w-fit">Please wait...</div>';

    //                     document.getElementById('question').value = '';
    //                     document.getElementById('question').disabled = true;
    //                     vscode.postMessage({ command: 'askQuestion', text: question, model: model });
    //                 });
    //             });

    //             window.addEventListener('message', (event) => {
    //                 const message = event.data;
    //                 if (message.command === 'populateModels') {
    //                     const modelSelect = document.getElementById('model');
    //                     modelSelect.innerHTML = ''; // Clear old options, if any

    //                     if (message.models && Array.isArray(message.models)) {
    //                         message.models.forEach((m) => {
    //                             const option = document.createElement('option');
    //                             option.value = m;
    //                             option.textContent = m;
    //                             modelSelect.appendChild(option);
    //                         });
    //                     } else {
    //                         // If there was an error or no models, you can handle that
    //                         const option = document.createElement('option');
    //                         option.value = '';
    //                         option.textContent = 'No models found';
    //                         modelSelect.appendChild(option);
    //                     }
    //                 }
    //                 else if (message.type === 'update') {
    //                     const rawMarkdown = message.content || "No response received.";
    //                     const chatContent = document.getElementById('chatContent').innerHTML;
    //                     document.getElementById('question').value = '';
    //                     // Convert chuỗi Markdown sang HTML
    //                     const renderedHtml = marked.parse(rawMarkdown);

    //                     // Thêm tên model vào câu trả lời
    //                     // const model = message.model || "Unknown Model";
    //                     // const renderedAnswer = model + ": " + renderedHtml;

    //                     // Render vào "response" bằng innerHTML
    //                     document.getElementById('response').innerHTML = renderedHtml;

    //                     // Tự scroll xuống bottom khi đang response
    //                     var bottom = document.getElementById('theEnd');
    //                     var pos = bottom.getBoundingClientRect();
    //                     window.scroll({
    //                         top: pos.top,
    //                         left: 0,
    //                         behavior: "smooth",
    //                         });
    //                 }
    //                 else if (message.type === 'updateDone') {
    //                     var response = document.getElementById('response');
    //                     var question = document.getElementById('question');
    //                     response.setAttribute('id', 'response-done');
    //                     response.outerHTML += '<div style="height: 10px;"></div>';
    //                     question.disabled = false;
    //                     question.focus();
    //                 }
    //             });
    //         </script>

    //     </body>
    //     </html>
    //     `;
  }
}
