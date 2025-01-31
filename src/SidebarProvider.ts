import * as vscode from 'vscode';
// If you're making HTTP calls, you might need node-fetch or Axios:
// import fetch from 'node-fetch';

export class SidebarProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(webviewView: vscode.WebviewView): void {
        this._view = webviewView;

        // Allow scripts in the webview
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        // Listen for messages from the webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'askQuestion': {
                    const question = message.text || '';
                    // Example: call a server to get an answer
                    const answer = await this.askServer(question);
                    // Update the webview with the answer
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
     * Send a message to the webview to update the content area
     */
    public updateContent(content: string): void {
        if (this._view) {
            this._view.webview.postMessage({ type: 'update', content });
        }
    }

    /**
     * Example function that calls your server (replace with real logic).
     */
    private async askServer(question: string): Promise<string> {
        // Replace the below with your actual request to Ollama or another API
        try {
            // Example using fetch (if you have node-fetch or axios installed)
            /*
            const response = await fetch('http://localhost:11411/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: question })
            });
            const data = await response.json();
            return data.completion || 'No response';
            */
            // For now, just return a mock response
            return `You asked: "${question}". (Replace this with real server response.)`;
        } catch (error) {
            console.error(error);
            return 'Error contacting the server.';
        }
    }

    /**
     * Generate the HTML for the sidebar webview
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

                    // When the user clicks "Ask", send the question to the extension
                    document.getElementById('askBtn').addEventListener('click', () => {
                        const question = document.getElementById('question').value;
                        vscode.postMessage({ command: 'askQuestion', text: question });
                    });

                    // Listen to messages from the extension
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
