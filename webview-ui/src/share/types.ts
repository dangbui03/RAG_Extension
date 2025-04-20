export interface AIModel {
  id: string;
  name: string;
  provider?: string;
  description?: string;
  recommended?: boolean;
}

export interface ChatMessage {
  id: string;
  user_prompt: string;
  ai_answer?: string;
  model: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FileModel {
  fileName: string;
  fileExtension: string;
  fileContent: string;
}

export interface RetrieverOptions {
  sparse_weight: number;
  dense_text_weight: number;
  dense_code_weight: number;
  top_k: number;
  filter_expr?: string;
  iterativeFilter: boolean;
  radius_sparse: number;
  range_sparse: number;
  radius_dense_text: number;
  range_dense_text: number;
  radius_dense_code: number;
  range_dense_code: number;
}

export interface GeneratorOptions {
  microstat: number;
  microstat_eta: number;
  mirostat_tau: number;
  num_ctx: number;
  repeat_last_n: number;
  repeat_penalty: number;
  temperature: number;
  seed: number;
  stop: string;
  num_predict: number;
  top_k: number;
  top_p: number;
  min_p: number;
}

export interface AdditionalOptions {
  retriever_options: RetrieverOptions;
  generator_options: GeneratorOptions;
}

export interface NextjsVersionItem {
  version_name: string;
  downloaded: boolean;
}

export type NextjsVersionList = NextjsVersionItem[];