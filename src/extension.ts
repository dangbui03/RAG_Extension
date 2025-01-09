// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
const fetch = require("node-fetch"); // You may need to install this package for making HTTP requests.

import { buildPrompt } from "./promptBuilder";
import { generateComment } from './ollama';
import { getCurrentLine, addCommentToFile } from './manageEditor';

const BASE_PROMPT = 'You are a helpful code tutor. Your job is to teach the user with simple descriptions and sample code of the concept. Respond with a guided overview of the concept in a series of messages. Do not give the user the answer directly, but guide them to find the answer themselves. If the user asks a non-programming question, politely decline to respond.';

const EXERCISES_PROMPT = 'You are a helpful tutor. Your job is to teach the user with fun, simple exercises that they can complete in the editor. Your exercises should start simple and get more complex as the user progresses. Move one concept at a time, and do not move on to the next concept until the user provides the correct answer. Give hints in your exercises to help the user learn. If the user is stuck, you can provide the answer and explain why it is the answer. If the user asks a non-programming question, politely decline to respond.';

const MODEL_SELECTOR: vscode.LanguageModelChatSelector = {
	vendor: 'copilot',
	family: 'gpt-4o'
  };

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const generateCommentCommand = vscode.commands.registerCommand('ragify.generateComment', async () => {

        vscode.window.showInformationMessage('Generating comment, please wait');

        const editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
            vscode.window.showErrorMessage('Failed to retrieve editor');
            return;
        }

        const prompt = await buildPrompt(editor);
        console.log('prompt', prompt);

        if (prompt === undefined) {
            vscode.window.showErrorMessage('Failed to generate prompt');
            return;
        }

		const comment = await generateComment(prompt);
        console.log('generated comment: ', comment);

        if (comment === undefined) {
            vscode.window.showErrorMessage('Failed to generate comment');
            return;
        }

		const fileURI = editor.document.uri;
        const fileName = editor.document.fileName;
        const currentLine = getCurrentLine(editor);

        addCommentToFile(fileURI, fileName, currentLine, comment);
    });

	context.subscriptions.push(generateCommentCommand);

	// define a chat handler
	const handler: vscode.ChatRequestHandler = async (
		request: vscode.ChatRequest,
		context: vscode.ChatContext,
		stream: vscode.ChatResponseStream,
		token: vscode.CancellationToken
  	) => {
		// initialize the prompt and model
		let prompt = BASE_PROMPT;
	
		if (request.command === 'exercise') {
			prompt = EXERCISES_PROMPT;
		}
	
		const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
	
		// make sure the model is available
		if (model) {
			// initialize the messages array with the prompt
			const messages = [vscode.LanguageModelChatMessage.User(prompt)];
		
			// get all the previous participant messages
			const previousMessages = context.history.filter(
				h => h instanceof vscode.ChatResponseTurn
			);
		
			// add the previous messages to the messages array
			previousMessages.forEach(m => {
				let fullMessage = '';
				m.response.forEach(r => {
					const mdPart = r as vscode.ChatResponseMarkdownPart;
					fullMessage += mdPart.value.value;
				});
				messages.push(vscode.LanguageModelChatMessage.Assistant(fullMessage));
			});
		
			// add in the user's message
			messages.push(vscode.LanguageModelChatMessage.User(request.prompt));
		
			// send the request
			const chatResponse = await model.sendRequest(messages, {}, token);
		
			// stream the response
			for await (const fragment of chatResponse.text) {
				stream.markdown(fragment);
			}
		}
	
		return;
	};

	// create participant
	const tutor = vscode.chat.createChatParticipant('chat-tutorial.code-tutor', handler);

	// add icon to participant
	tutor.iconPath = vscode.Uri.joinPath(context.extensionUri, 'tutor.jpeg');

	
}

// This method is called when your extension is deactivated
export function deactivate() {}
