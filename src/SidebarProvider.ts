import * as vscode from 'vscode';
import { OllamaServer } from './ollama';

export class SidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    this._view = webviewView;

    // Allow scripts in the webview and set the local resource roots.
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    // Listen for messages from the webview.
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'askQuestion': {
          const question = message.text || '';
          const answer = await this.askServer(question);
          this.updateContent(answer);
          break;
        }
        default:
          break;
      }
    });

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  /**
   * Posts an update message to the webview.
   */
  public updateContent(content: string): void {
    if (this._view) {
      this._view.webview.postMessage({ type: 'update', content });
    }
  }

  /**
   * Calls the OllamaServer to get a response.
   */
  private async askServer(question: string): Promise<string> {
    try {
      // Change this URL if your server is running elsewhere.
      const hostUrl = 'http://127.0.0.1:11434';
      const ollamaServer = OllamaServer.getInstance(hostUrl);
      // Replace 'your-model' with the desired model name.
      const answer = await ollamaServer.generateComment('your-model', question);
      return answer;
    } catch (error) {
      console.error(error);
      return 'Error contacting the server.';
    }
  }

  /**
   * Generates the HTML content for the sidebar.
   */
  private _getHtmlForWebview(webview: vscode.Webview): string {
    return /* html */ `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ask AI</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 10px;
            margin: 0;
          }
          .box {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 10px;
            background-color: #f9f9f9;
            margin-top: 10px;
          }
          #question {
            width: 100%;
            box-sizing: border-box;
          }
          #askBtn {
            margin-top: 5px;
          }
          #response {
            margin-top: 10px;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <h3>Ask Something</h3>
        <textarea id="question" rows="3" placeholder="Type your question..."></textarea><br/>
        <button id="askBtn">Ask</button>
        <div id="response" class="box">Response will appear here.</div>
        <script>
          const vscode = acquireVsCodeApi();
          document.getElementById('askBtn').addEventListener('click', () => {
            const question = document.getElementById('question').value;
            vscode.postMessage({ command: 'askQuestion', text: question });
          });
          window.addEventListener('message', (event) => {
            const message = event.data;
            if (message.type === 'update') {
              document.getElementById('response').textContent = message.content;
            }
          });
        </script>
      </body>
      </html>
    `;
  }
}
