import * as vscode from 'vscode';
// If you're making HTTP calls, you might need node-fetch or Axios:
// import fetch from 'node-fetch';

export class RagginSidebar implements vscode.WebviewViewProvider {
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
                    const model = message.model;
                    // Example: call a server to get an answer
                    const answer = await this.askServer(question, model);
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
    private async askServer(question: string, model: string): Promise<string> {
        const ollama_endpoint = 'http://localhost:11434/api/generate';
        // Replace the below with your actual request to Ollama or another API
        try {
            // Example using fetch (if you have node-fetch or axios installed)
            const response = await fetch(ollama_endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: question, model: model, stream: false }),
            });
           const data = await response.json();
           return data.response || 'No response';
            // For now, just return a mock response
            // return `You asked: "${question}". (Replace this with real server response.)`;
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
            width: 100%;
            background: #252526;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
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
        }
    </style>
</head>
<body>

    <div class="container">
        <h3>Ask Something</h3>

        <label for="question">Your Question:</label>
        <textarea id="question" rows="3" placeholder="Type your question..."></textarea>

        <label for="model">Select a Model:</label>
        <select id="model">
            <option value="qwen2.5-coder:1.5b">qwen2.5-coder:1.5b</option>
            
        </select>

        <button class="btn" id="askBtn">Ask</button>

        <div id="response" class="response-box">Response will appear here.</div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        document.getElementById('askBtn').addEventListener('click', () => {
            const question = document.getElementById('question').value.trim();
            const model = document.getElementById('model').value;

            if (question === "") {
                document.getElementById('response').textContent = "⚠️ Please enter a question.";
                return;
            }

            vscode.postMessage({ command: 'askQuestion', text: question, model: model });
        });

        window.addEventListener('message', (event) => {
            const message = event.data;
            if (message.type === 'update') {
                document.getElementById('response').textContent = message.content || "No response received.";
            }
        });
    </script>

</body>
</html>
        `;
    }
}
