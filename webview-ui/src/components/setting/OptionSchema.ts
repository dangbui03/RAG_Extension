import { z } from "zod";

// Retriever Options Schema
export const retrieverOptionsSchema = z.object({
  sparse_weight: z
    .number()
    .min(0, "Sparse weight must be at least 0")
    .max(2, "Sparse weight must be at most 2")
    .default(0.5),

  dense_text_weight: z
    .number()
    .min(0, "Dense‑text weight must be at least 0")
    .max(2, "Dense‑text weight must be at most 2")
    .default(1.0),

  dense_code_weight: z
    .number()
    .min(0, "Dense‑code weight must be at least 0")
    .max(2, "Dense‑code weight must be at most 2")
    .default(0.9),

  top_k: z
    .number()
    .int("Top‑k must be an integer")
    .min(1, "Top‑k must be ≥ 1")
    .max(10, "Top‑k must be ≤ 10")
    .default(5),

  filter_expr: z.string().default("tag == 'documentation'"),

  iterativeFilter: z.boolean().default(true),

  radius_sparse: z
    .number()
    .min(0, "Radius (sparse) must be between 0 and 1")
    .max(1, "Radius (sparse) must be between 0 and 1")
    .default(0.08),

  range_sparse: z
    .number()
    .min(0, "Range (sparse) must be between 0 and 2")
    .max(2, "Range (sparse) must be between 0 and 2")
    .default(1),

  radius_dense_text: z
    .number()
    .min(0, "Radius (dense‑text) must be between 0 and 1")
    .max(1, "Radius (dense‑text) must be between 0 and 1")
    .default(0.6),

  range_dense_text: z
    .number()
    .min(0, "Range (dense‑text) must be between 0 and 2")
    .max(2, "Range (dense‑text) must be between 0 and 2")
    .default(1),

  radius_dense_code: z
    .number()
    .min(0, "Radius (dense‑code) must be between 0 and 1")
    .max(1, "Radius (dense‑code) must be between 0 and 1")
    .default(0.6),

  range_dense_code: z
    .number()
    .min(0, "Range (dense‑code) must be between 0 and 2")
    .max(2, "Range (dense‑code) must be between 0 and 2")
    .default(1),
});

// Generator Options Schema
export const generatorOptionsSchema = z.object({
  microstat: z
    .number()
    .min(0, "Microstat must be between 0 and 1")
    .max(1, "Microstat must be between 0 and 1")
    .default(0),

  microstat_eta: z
    .number()
    .min(0, "Microstat eta must be between 0 and 1")
    .max(1, "Microstat eta must be between 0 and 1")
    .default(0.6),

  mirostat_tau: z
    .number()
    .min(0, "Mirostat tau must be between 0 and 1")
    .max(1, "Mirostat tau must be between 0 and 1")
    .default(0.8),

  num_ctx: z
    .number()
    .int("Context length must be an integer")
    .min(1, "Context length must be ≥ 1")
    .max(2048, "Context length must be ≤ 2048")
    .default(1024),

  repeat_last_n: z
    .number()
    .int("Repeat‑last‑N must be an integer")
    .min(0, "Repeat‑last‑N must be ≥ 0")
    .max(100, "Repeat‑last‑N must be ≤ 100")
    .default(33),

  repeat_penalty: z
    .number()
    .min(0, "Repeat penalty must be between 0 and 2")
    .max(2, "Repeat penalty must be between 0 and 2")
    .default(1.1),

  temperature: z
    .number()
    .min(0, "Temperature must be between 0 and 2")
    .max(2, "Temperature must be between 0 and 2")
    .default(0.8),

  seed: z
    .number()
    .int("Seed must be an integer")
    .min(0, "Seed must be ≥ 0")
    .max(1000, "Seed must be ≤ 1000")
    .default(42),

  stop: z.string().default(""),

  num_predict: z
    .number()
    .int("Num‑predict must be an integer")
    .min(1, "Num‑predict must be ≥ 1")
    .max(1000, "Num‑predict must be ≤ 1000")
    .default(42),

  top_k: z
    .number()
    .int("Top‑k must be an integer")
    .min(0, "Top‑k must be ≥ 0")
    .max(100, "Top‑k must be ≤ 100")
    .default(20),

  min_p: z
    .number()
    .min(0, "Min‑p must be between 0 and 1")
    .max(1, "Min‑p must be between 0 and 1")
    .default(0.0),

  top_p: z
    .number()
    .min(0, "Top‑p must be between 0 and 1")
    .max(1, "Top‑p must be between 0 and 1")
    .default(0.9),
});

// Additional Options Schema
export const additionalOptionsSchema = z.object({
  retriever_options: retrieverOptionsSchema,
  generator_options: generatorOptionsSchema,
});

// Inferred Types
export type RetrieverOptions = z.infer<typeof retrieverOptionsSchema>;
export type GeneratorOptions  = z.infer<typeof generatorOptionsSchema>;
export type AdditionalOptions = z.infer<typeof additionalOptionsSchema>;
