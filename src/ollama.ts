import { Ollama } from 'ollama';
import fetch from 'cross-fetch';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434', fetch: fetch });

export async function generateComment(prompt: string) {
    const t0 = performance.now();
    const req = await ollama.generate({
      model: 'qwen2.5-coder:1.5b',
      prompt: prompt,
    });
  
    const t1 = performance.now();
    console.log('LLM took: ', t1 - t0, ', seconds')
    return req.response;
  }