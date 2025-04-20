import * as vscode from "vscode";
import { OllamaServer } from "../prompts/ollama";
import { getConfiguration, GetOllamaModelFromUser } from "../../utils/utils";
import { generateAnswer } from "../../utils/generator";
import { getNonce, getUri, replaceWebviewHtmlTokens } from "./utils";
import { Chat } from "../../../webview-ui/src/share/types";
import {
  RagCallFunction,
  GetNextjsVersionDownloadedList,
  GetNextjsVersionList,
  RetrieveNextjsVersion,
  DeleteNextjsVersionData,
  RepairNextjsVersionData,
} from "../ragCallFunction";
import { Logger } from "../../utils/logging";
import { readEntireCodeBase } from "../readEntireCodeBase";

const utf8TextDecoder = new TextDecoder("utf8");
export class RagginProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView | vscode.WebviewPanel;
  private readonly outputChannel: vscode.OutputChannel;
  private disposables: vscode.Disposable[] = [];
  private _persistedState: any = {}; // Add state storage

  constructor(
    private readonly _context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel
  ) {
    this.outputChannel = outputChannel;
    this.outputChannel.appendLine("RAGGIN Provider activated");

    // Load any persisted state from extensionContext.globalState
    this._persistedState = this._context.globalState.get(
      "ragginProviderState",
      {}
    );
  }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView
  ): Promise<void> {
    this._view = webviewView;
    const readCodeBase = new readEntireCodeBase();

    // Allow scripts in the webview
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [await this.getRootUri()],
    };

    // Add visibility change handler
    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        // Restore state when view becomes visible again
        if (
          this._persistedState &&
          Object.keys(this._persistedState).length > 0
        ) {
          webviewView.webview.postMessage({
            command: "restoreState",
            state: this._persistedState,
          });
        }
      }
    });

    // Listen for messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      try {
        switch (message.command) {
          case "saveState": {
            this._persistedState = message.state || {};
            await this._context.globalState.update(
              "ragginProviderState",
              this._persistedState
            );
            break;
          }

          // Handle width change event
          case "widthChanged": {
            const width = message.width;
            const minWidth = vscode.workspace
              .getConfiguration("RAGGIN")
              .get<number>("minWidth", 300);

            // Report width change to output channel for debugging
            Logger.debug(
              `Webview width changed: ${width}px (min: ${minWidth}px)`
            );

            // Trigger the disposal command if needed
            vscode.commands.executeCommand("raggin.handleWidthDisposal", width);
            break;
          }

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
                const chats = this._context.globalState.get<Chat[]>(
                  "chats",
                  []
                );
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
            const question = message.text || "";
            const nextJSVersion = message.nextJSVersion || "";
            const fileList = message.fileList || [];
            const additionalOptions = message.additionalOptions || {};
            const chatId = message.chatId;

            if (!model || !question || !nextJSVersion) {
              vscode.window.showWarningMessage(
                `⚠️ Need to provide model, question, and Next.js version.`
              );
              webviewView.webview.postMessage({
                command: "ragCallComplete",
                content: "⚠️ Missing required parameters for RAG call.",
                chatId: chatId,
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
              const answer = await RagCallFunction(
                model,
                fullPrompt,
                nextJSVersion,
                additionalOptions
              );

              // Answer is expected to be a string or an object with a 'text' property
              webviewView.webview.postMessage({
                command: "ragCallComplete",
                content: answer.response,
                chatId: chatId,
                fileList,
              });
            } catch (error) {
              console.error("Error in RAG call:", error);
              webviewView.webview.postMessage({
                command: "ragCallComplete",
                success: false,
                content: String(error),
                chatId: chatId,
              });
            }
            break;
          }

          // Handler to fetch the list of files in the workspace
          case "getFileList": {
            // Call fetchFileList() on the readEntireCodeBase instance,
            // which returns an array of relative file names.
            const files = await this.fetchFileList(readCodeBase);
            webviewView.webview.postMessage({
              command: "fileList",
              files,
            });
            break;
          }

          // Handler to read the content of a selected file
          case "getFileContent": {
            const filePath = message.filePath;
            const content = await this.readFile(readCodeBase, filePath);
            webviewView.webview.postMessage({
              command: "fileContent",
              content,
              filePath,
            });
            break;
          }

          case "readNextJsVersion":
            await this.fetchNextJsVersion(readCodeBase);
            break;
          case "getNextJsVersionDownloadedList":
            const nextJsVersionList = await GetNextjsVersionDownloadedList();
            webviewView.webview.postMessage({
              command: "nextJsVersionDownloadedList",
              versionList: nextJsVersionList,
            });
            break;
          case "getNextJsVersionList":
            const nextJsVersion = await GetNextjsVersionList();
            webviewView.webview.postMessage({
              command: "nextJsVersionList",
              versionList: nextJsVersion,
            });
            break;
          case "retrieveNextJsVersion":
            const version = message.version || "";
            const retrieveResult = await RetrieveNextjsVersion(version);

            webviewView.webview.postMessage({
              command: "retrievedNextJsVersion",
              version: retrieveResult,
              version_name: version,
            });
            break;
          case "deleteNextJsVersion":
            const deleteVersion = message.version || "";
            const deleteResult = await DeleteNextjsVersionData(deleteVersion);

            webviewView.webview.postMessage({
              command: "deletedNextJsVersion",
              version: deleteResult,
              version_name: deleteVersion,
            });
            break;
          case "repairNextJsVersion":
            const repairVersion = message.version || "";
            const repairResult = await RepairNextjsVersionData(repairVersion);

            webviewView.webview.postMessage({
              command: "repairedNextJsVersion",
              version: repairResult,
              version_name: repairVersion,
            });
            break;
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
            vscode.window.showInformationMessage(
              `All chats have been deleted.`
            );
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

  public dispose() {
    // Dispose all registered disposables
    this.disposables.forEach((d) => d.dispose());
    this.disposables.length = 0;
    this._view = undefined;
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
        <body>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <div id="root"></div>
          <script type="module" src="${scriptUri}" nonce="${nonce}"></script>
        </body>
      </html>
    `;
  }

  // Added helper method to optimize chat context for LLM
  private optimizeChatContext(chat: Chat | undefined): string {
    if (!chat || !chat.messages || chat.messages.length === 0) {
      return "";
    }

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
        if (msg.ai_answer && index === 0) {
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
    if (!this._view) {
      throw new Error("Webview not initialized");
    }
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
    if (!this._view) {
      throw new Error("Webview not initialized");
    }
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
    if (!this._view) {
      throw new Error("Webview not initialized");
    }
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
    if (!this._view) {
      throw new Error("Webview not initialized");
    }
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

  // --- Next.js Version Extraction and Other Handlers ---
  /**
   * Fetch the Next.js version from the workspace.
   * This function uses the readEntireCodeBase class to find the version
   * in package.json or other relevant files.
   * It then sends the version back to the webview.
   */
  private async fetchNextJsVersion(readEntireCodeBase: readEntireCodeBase) {
    if (!this._view) {
      throw new Error("Webview not initialized");
    }
    try {
      let nextjsVersion = "";
      await readEntireCodeBase.catchNextJsVersion().then((version) => {
        if (version) {
          vscode.window.showInformationMessage(
            `Found Next.js version: ${version}`
          );
          nextjsVersion = version;
        } else {
          vscode.window.showWarningMessage(
            "Next.js version not found in workspace."
          );
          nextjsVersion = "Not found";
        }
      });
      this._view.webview.postMessage({
        command: "nextJsVersionFetched",
        version: nextjsVersion,
      });
    } catch (error) {
      throw new Error(
        `Failed to fetch Next.js version: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // --- Helper Methods for File Handling ---

  /**
   * Fetch the list of files from the workspace.
   * Calls the readEntireCodeBase.fetchFileList() method which returns an array
   * of relative file paths (e.g., "/package.json", "/src/main.tsx").
   * This method then maps those strings to objects with a 'name' property.
   */
  private async fetchFileList(
    readEntireCodeBase: readEntireCodeBase
  ): Promise<{ name: string }[]> {
    // const catcher = new NextJsVersionCatcher();
    return await readEntireCodeBase.fetchFileList();
    // return files.map((file) => ({ name: file }));
  }

  /**
   * Read the content of a single file given its relative path.
   * Calls the readEntireCodeBase.readFile() method with the file name.
   * Returns the full file content as a UTF-8 string.
   */
  private async readFile(
    readEntireCodeBase: readEntireCodeBase,
    filePath: string
  ): Promise<string> {
    try {
      const content = await readEntireCodeBase.readFile(filePath);
      return content;
    } catch (err) {
      console.error(`Failed to read file ${filePath}`, err);
      return "";
    }
  }
}
