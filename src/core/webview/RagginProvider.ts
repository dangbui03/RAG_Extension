import * as vscode from "vscode";
import { OllamaServer } from "../prompts/ollama";
import { getConfiguration, GetOllamaModelFromUser } from "../../utils/utils";
import { generateAnswer } from "../../utils/generator";
import { getNonce, getUri, replaceWebviewHtmlTokens } from "./utils";
import { Chat } from "../../../webview-ui/src/types";
import { RagCallFunction } from "../../commands/ragCallFunction";

const utf8TextDecoder = new TextDecoder("utf8");
export class RagginProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView | vscode.WebviewPanel;
  private readonly outputChannel: vscode.OutputChannel;
  // private disposables: vscode.Disposable[] = []

  constructor(
    private readonly _context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel
  ) {
    this.outputChannel = outputChannel;
    this.outputChannel.appendLine("RAGGIN Provider activated");
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
      try {
        switch (message.command) {
          // Add a handler for the askQuestion message
          case "askQuestion": {
            const question = message.text || "";
            const model = message.model;
            const chatId = message.chatId;

            if (!question || !model) {
              webviewView.webview.postMessage({
                command: "update",
                content: "⚠️ Please enter a valid question.",
                chatId: chatId,
              });
              return;
            }

            // Process the question
            if (this._view) {
              try {
                const chats = this._context.globalState.get<Chat[]>("chats", []);
                const currentChat = chats.find((c) => c.id === chatId);
                const optimizedContext = this.optimizeChatContext(currentChat);
                const fullPrompt = optimizedContext
                  ? `[Context]: \n${optimizedContext}\n\n[Question]: ${question}`
                  : question;

                // console.log("Full Prompt:", fullPrompt);
                const answer = await generateAnswer(
                  fullPrompt,
                  model,
                  this._view.webview
                );
                // console.log("Answer:", answer);
                webviewView.webview.postMessage({
                  command: "update",
                  content: answer,
                  chatId: chatId,
                });
              } catch (error) {
                console.error("Error generating answer:", error);
                webviewView.webview.postMessage({
                  command: "update",
                  content: "⚠️ Error generating answer.",
                  chatId: chatId,
                });
              }
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

          case "ragCall": {
            const model = message.model || "";
            const question = message.prompt || "";
            const nextJSVersion = message.nextJSVersion || "";
            const chatId = message.chatId;
            
            if (!model || !question || !nextJSVersion) {
              webviewView.webview.postMessage({
                command: "ragCallComplete",
                content: "⚠️ Missing required parameters for RAG call.",
                chatId: chatId
              });
              return;
            }
            
            try {
              const chats = this._context.globalState.get<Chat[]>("chats", []);
              const currentChat = chats.find((c) => c.id === chatId);
              const optimizedContext = this.optimizeChatContext(currentChat);
              const fullPrompt = optimizedContext
                ? `[Context]: \n${optimizedContext}\n\n[Question]: ${question}`
                : question;

              // Call the RAG function with the optimized context and question
              const answer = await RagCallFunction(model, fullPrompt, nextJSVersion);
              
              // Answer is expected to be a string or an object with a 'text' property
              webviewView.webview.postMessage({
                command: "ragCallComplete",
                content: answer,
                chatId: chatId,
              });
            } catch (error) {
              console.error("Error in RAG call:", error);
              webviewView.webview.postMessage({
                command: "ragCallComplete",
                success: false,
                content: String(error),
                chatId: chatId
              });
            }
            break;
          }

          case "fetchChats":
            await this.handleFetchChats();
            break;
          case "fetchChatById":
            await this.handleFetchChatById(message.chatId);
            break;
          case "storeChat":
            await this.handleStoreChat(message.chat);
            break;
          case "deleteChat":
            await this.handleDeleteChat(message.chatId);
            break;
          case "deleteAllChats":
            await this.handleDeleteAllChats();
            break;
          default:
            throw new Error(`Unknown command: ${message.command}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        vscode.window.showErrorMessage(`RAGGIN Error: ${errorMessage}`);
      }
    });

    webviewView.webview.html = await this._getHtmlForWebview(
      webviewView.webview
    );
  }

  private async getRootUri() {
    return this._context.extensionUri;
  }

  private async getWebviewsUri() {
    return vscode.Uri.joinPath(await this.getRootUri(), "webviews-ui");
  }

  private async _getHtmlForWebview(webview: vscode.Webview): Promise<string> {
    const nonce = getNonce();

    // The CSS file from the React build output
    const stylesUri = getUri(webview, this._context.extensionUri, [
      "webview-ui",
      "dist",
      "index.css",
    ]);
    // The JS file from the React build output
    const scriptUri = getUri(webview, this._context.extensionUri, [
      "webview-ui",
      "dist",
      "index.js",
    ]);

    const codiConsUri = getUri(webview, this._context.extensionUri, [
      "webview-ui",
      "node_modules",
      "@vscode",
      "codicons",
      "dist",
      "codicon.css",
    ]);
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
    `;
  }

  // Added helper method to optimize chat context for LLM
  private optimizeChatContext(chat: Chat | undefined): string {
    if (!chat || !chat.messages || chat.messages.length === 0) return "";

    // Limit to last 2 messages to keep context small (adjust based on model limits)
    const recentMessages = chat.messages.slice(-3);

    const prefixed = [
      "Previous sentence: \n",
      "the sentence before that: \n",
      "the sentence before that: \n",
    ];

    // const context = recentMessages
    // .map((msg, index) => `${prefixed[index]}${msg.user_prompt}`)
    // .join("\n");
    let context = "";
    recentMessages.forEach((msg, index) => {
      if (index < prefixed.length) {
        // Use the correct property names from the ChatMessage interface
        if (msg.user_prompt) {
          context += `${prefixed[index]}${msg.user_prompt}\n`;
        }
        if (msg.ai_answer && index == 0) {
          context += `${prefixed[index]}Response: ${msg.ai_answer}\n`;
        }
      }
    });

    // Add a separator to clearly distinguish context from the new question
    context += "\n---\n";

    // Optional: Further trim to a max length (e.g., 300 characters)
    return context.length > 500 ? context.substring(0, 500) + "...\n" : context;
  }

  // Fetch all chats from globalState
  private async handleFetchChats() {
    if (!this._view) throw new Error("Webview not initialized");
    try {
      const chats = this._context.globalState.get<Chat[]>("chats", []);
      this._view.webview.postMessage({ command: "chatsFetched", chats });
    } catch (error) {
      throw new Error(
        `Failed to fetch chats: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Fetch a specific chat by ID from globalState
  private async handleFetchChatById(chatId: string) {
    if (!this._view) throw new Error("Webview not initialized");
    try {
      if (!chatId) {
        throw new Error("No chat ID provided");
      }
      const chats = this._context.globalState.get<Chat[]>("chats", []);
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) {
        throw new Error(`Chat with ID ${chatId} not found`);
      }
      console.log("Chat fetched:", chat);
      this._view.webview.postMessage({ command: "chatFetched", chat });
    } catch (error) {
      throw new Error(
        `Failed to fetch chat by ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Store or update a chat in globalState
  private async handleStoreChat(chat: Chat) {
    try {
      if (!chat || !chat.id) {
        throw new Error("Invalid chat data provided");
      }
      const currentChats = this._context.globalState.get<Chat[]>("chats", []);
      const updatedChats = currentChats.filter((c) => c.id !== chat.id);
      updatedChats.unshift(chat); // Add to the top
      await this._context.globalState.update("chats", updatedChats);
      // Optionally notify the webview
      if (this._view) {
        this._view.webview.postMessage({
          command: "chatStored",
          success: true,
          chatId: chat.id,
        });
      }
    } catch (error) {
      throw new Error(
        `Failed to store chat: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Delete a specific chat from globalState
  private async handleDeleteChat(chatId: string) {
    if (!this._view) throw new Error("Webview not initialized");
    try {
      if (!chatId) {
        throw new Error("No chat ID provided");
      }
      const currentChats = this._context.globalState.get<Chat[]>("chats", []);
      const updatedChats = currentChats.filter((c) => c.id !== chatId);
      await this._context.globalState.update("chats", updatedChats);
      // this._view.webview.postMessage({
      //   command: "chatsFetched",
      //   chats: updatedChats,
      // });
      this._view.webview.postMessage({
        command: "chatDeleted",
        success: true,
        chatId: chatId,
        chats: updatedChats,
      });
    } catch (error) {
      throw new Error(
        `Failed to delete chat: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Delete all chats from globalState
  private async handleDeleteAllChats() {
    if (!this._view) throw new Error("Webview not initialized");
    try {
      await this._context.globalState.update("chats", []);
      // this._view.webview.postMessage({ command: "chatsFetched", chats: [] });
      this._view.webview.postMessage({
        command: "allChatsDeleted",
        success: true,
        chats: [],
      });
    } catch (error) {
      throw new Error(
        `Failed to delete all chats: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
