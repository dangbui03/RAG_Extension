import * as vscode from "vscode";
import { OllamaServer } from "../prompts/ollama";
import { getConfiguration } from "../../utils/utils";
import { generateAnswer } from "../../utils/generator";
import { getNonce, getUri, replaceWebviewHtmlTokens } from "./utils";
import { Chat } from "../../../webview-ui/src/types";

const utf8TextDecoder = new TextDecoder("utf8");

export class RagginProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView | vscode.WebviewPanel;
  // private disposables: vscode.Disposable[] = []

  constructor(
    // private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext,
    private readonly outputChannel: vscode.OutputChannel,
  ) {
    this.outputChannel.appendLine("RAGGIN Provider activated");
  }

     // Method to store a chat
  private storeChat(chat: Chat): void {
    try {
      // Get existing chats history or initialize an empty array
      const chats = this._context.globalState.get<Chat[]>('chats-history', []);
      
      // Check if the chat already exists
      const existingIndex = chats.findIndex(c => c.id === chat.id);
      
      if (existingIndex >= 0) {
        // Update existing chat
        chats[existingIndex] = chat;
      } else {
        // Add new chat
        chats.push(chat);
      }
      
      // Save chats
      this._context.globalState.update('chats-history', chats);
      
      this.outputChannel.appendLine(`Stored chat in history. ID: ${chat.id}. Total chats: ${chats.length}`);
    } catch (error) {
      this.outputChannel.appendLine(`Error storing chat: ${error}`);
    }
  }

  // Method to clear the chats history
  public clearChatsHistory(): void {
    try {
      this._context.globalState.update('chats-history', []);
      this.outputChannel.appendLine('Chats history cleared');
    } catch (error) {
      this.outputChannel.appendLine(`Error clearing chats history: ${error}`);
    }
  }
  
  // Method to get chats history
  public getChatsHistory(): Chat[] {
    return this._context.globalState.get<Chat[]>('chats-history', []);
  }

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
        // Add a handler for the askQuestion message
        case "askQuestion": {
          const question = message.text || "";
          const model = message.model;
          const chatId = message.chatId;
          
          if (!question) {
            webviewView.webview.postMessage({
              command: "update",
              content: "⚠️ Please enter a valid question.",
            });
            return;
          }

          // Process the question
          if (this._view) {
            const answer = await generateAnswer(question, model, this._view.webview);

            webviewView.webview.postMessage({
              command: "update",
              content: answer,
              chatId: chatId
            });
          }

          break;
        }
        // Add a handler for the populateModels message
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
        case "storeChat": {
          // Handle request to store a chat
          const chat = message.chat;
          if (chat) {
            this.storeChat(chat);
            webviewView.webview.postMessage({
              command: "chatStored",
              success: true,
              chatId: chat.id
            });
          }
          break;
        }
        case "getChatsHistory": {
          // Handle request for chats history
          const history = this.getChatsHistory();
          webviewView.webview.postMessage({
            command: "chatsHistory",
            history: history
          });
          break;
        }
        case "clearChatsHistory": {
          this.clearChatsHistory();
          webviewView.webview.postMessage({
            command: "chatsHistory",
            history: []
          });
          break;
        }
        default:
          break;
      }
    });

    webviewView.webview.html = await this._getHtmlForWebview(webviewView.webview);
  }

  private async getRootUri() {
    return this._context.extensionUri;
  }

  private async getWebviewsUri() {
    return vscode.Uri.joinPath(await this.getRootUri(), "webviews-ui");
  }

  private async  _getHtmlForWebview(webview: vscode.Webview): Promise<string> {

    const nonce = getNonce();
  
    // The CSS file from the React build output
    const stylesUri = getUri(webview, this._context.extensionUri, ["webview-ui", "dist", "index.css"]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, this._context.extensionUri, ["webview-ui", "dist", "index.js"]);

    const codiConsUri = getUri(webview, this._context.extensionUri, ["webview-ui", 'node_modules', '@vscode', "codicons", "dist", "codicon.css"]);
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${stylesUri}" rel="stylesheet">
            <link href="${codiConsUri}" rel="stylesheet">
            <title>Ask AI</title>
        
            <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/15.0.6/marked.min.js" integrity="sha512-rvRITpPeEKe4hV9M8XntuXX6nuohzqdR5O3W6nhjTLwkrx0ZgBQuaK4fv5DdOWzs2IaXsGt5h0+nyp9pEuoTXg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
        
        </head>
        <body>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <div id="root"></div>
          <script src="${scriptUri}" nonce="${nonce}"></script>
        </body>
      </html>
    `
  }
}