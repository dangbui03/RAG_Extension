import * as vscode from 'vscode';
import { ErrorType, getConfiguration, MyError } from "../../utils/utils";
import { Editor } from "../editor/manageEditor";

export class Prompt {
  private context: string = "";
  private promptText: string = "";
  private codeBlock: string = "";
  private fullPrompt: string = "";

  setContext(contex: string) { this.context = contex; }
  setPromptText(prompt: string) { this.promptText = prompt; }
  setCodeBlock(codeBlock: string) { this.codeBlock = codeBlock; }
  setFullPrompt(fullPrompt: string) { this.fullPrompt = fullPrompt; }

  getContext() { return this.context; }
  getPromptText() { return this.promptText; }
  getCodeBlock() { return this.codeBlock; }
  getFullPrompt() { return this.fullPrompt; };
}

// builer interface
interface PromptBuilderInterface {
  buildContext(): PromptBuilderInterface
  buildPromptText(): PromptBuilderInterface
  buildCodeBlock(codeBlock: string): PromptBuilderInterface
  buildFunctionPrompt(): PromptBuilderInterface
  build(): Prompt
}

// concrete builder
export class PromptBuilder implements PromptBuilderInterface {
  private prompt: Prompt;
  private editor: Editor;

  constructor(editor: Editor) {
      this.editor = editor;
      this.prompt = new Prompt();
  }
  
  buildFunctionPrompt(): PromptBuilderInterface {
      let language: string = this.editor.getLanguage();
      let prompt: string = getConfiguration<string>("prompt").replace("{language}", language).replace("{codeblock}", "function");
      prompt = `\n${prompt}\n`;
      this.prompt.setPromptText(prompt);
      return this;
  }

  buildContext(): PromptBuilderInterface {
      if (getConfiguration<boolean>("giveContext")) {
          let context: string = this.editor.getEditorContent();
          context = `code context : 
          \`${context}\`\n`;
          this.prompt.setContext(context);
      }
      return this;
  }

  buildPromptText(): PromptBuilderInterface {
      let language: string = this.editor.getLanguage();
      let prompt: string = getConfiguration<string>("prompt").replace("{language}", language);
      prompt = `\n${prompt}\n`;
      this.prompt.setPromptText(prompt);
      return this;
  }

  buildCodeBlock(codeBlock: string): PromptBuilderInterface {

      if (codeBlock === "" || codeBlock === undefined) {
          throw new MyError("please select code", ErrorType.INFO);
      }
      codeBlock = `code block:
                      \n\`${codeBlock}\`\n`;
      this.prompt.setCodeBlock(codeBlock);
      return this;
  }

  build(): Prompt {
      let context: string = this.prompt.getContext();
      let promptText: string = this.prompt.getPromptText();
      let codeBlock: string = this.prompt.getCodeBlock();
      this.prompt.setFullPrompt(context + promptText + codeBlock);
      return this.prompt;
  }
}

// function getScriptContext(editor: vscode.TextEditor) {
//   let document = editor.document;
//   const codeContext = document.getText();
//   return codeContext;
// }

// async function getCodeBlock() {
//   const codeBlock = await vscode.env.clipboard.readText().then((text) => {
//     return text;
//   });

//   return codeBlock;
// }

// function selectCommentSyntax(editor: vscode.TextEditor) {
//   const fileExtension = editor.document.fileName.toLowerCase().split('.').at(-1);
//   const commentSyntax = fileExtension === 'js' ? '//' : '#';
//   return commentSyntax;
// }

// export async function buildPrompt(editor: vscode.TextEditor) {
//     const codeBlock = await getCodeBlock();
//     const codeContext = getScriptContext(editor);
//     const commentSyntax = selectCommentSyntax(editor);
  
//     if (codeBlock === undefined || codeContext === undefined) {
//       return;
//     }
  
//     let prompt = `
//       complete code:
//       "
//       {CONTEXT}
//       "
  
//       Given the code block below, write a brief, insightful comment that explains its purpose and functionality within the script. If applicable, mention any inputs expected in the code block.
//       Keep the comment concise (maximum 2 lines). Wrap the comment with the appropriate comment syntax ({COMMENT-SYNTAX}). Avoid assumptions about the complete code and focus on the provided block. Don't rewrite the code block.
  
//       code block:
//       "
//       {CODE-BLOCK}
//       "
//       `;
  
//     prompt = prompt
//       .replace('{CONTEXT}', codeContext)
//       .replace('{CODE-BLOCK}', codeBlock)
//       .replace('{COMMENT-SYNTAX}', commentSyntax);
//     return prompt;
//   }