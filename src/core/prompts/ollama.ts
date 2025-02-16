import { Ollama, ListResponse, GenerateResponse } from 'ollama';
import fetch from 'cross-fetch';

// singleton
export class OllamaServer {

  private ollama: Ollama;
  private static server: OllamaServer;

  private constructor(url: string) {
      this.ollama = new Ollama({ host: url, fetch: fetch });
  }

  public static getInstance(hostUrl: string): OllamaServer {
      if (!OllamaServer.server) {
          OllamaServer.server = new OllamaServer(hostUrl);
      }
      return OllamaServer.server;
  }

  public async listModels(): Promise<string[]> {
      let list: ListResponse = await this.ollama.list();
      let models: string[] = [];
      for (const model of list.models) {
          models.push(model.name);
      }
      return models;
  }

  public async generateComment(model: string, prompt: string): Promise<string> {
      const t0 = performance.now();
      const response: GenerateResponse = await this.ollama.generate({
          model: model,
          prompt: prompt,
      });

      const t1 = performance.now();
      console.log('LLM took: ', t1 - t0, ', seconds');

      return response.response;
  }

  public abort() {
      this.ollama.abort();
  }
}