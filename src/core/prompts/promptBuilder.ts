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