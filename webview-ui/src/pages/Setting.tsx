/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Import zod schemas for validation
import {
  additionalOptionsSchema,
  RetrieverOptions,
  GeneratorOptions,
  AdditionalOptions,
} from "@/components/setting/OptionSchema";

/**
 * -------------------------------------------------------------------------
 * Default values (these are identical to the ones you had before)
 * -------------------------------------------------------------------------
 */
const defaultRetrieverOptions: RetrieverOptions = {
  sparse_weight: 0.5,
  dense_text_weight: 1.0,
  dense_code_weight: 0.9,
  top_k: 5,
  filter_expr: "tag == 'documentation'",
  iterativeFilter: true,
  radius_sparse: 0.08,
  range_sparse: 1,
  radius_dense_text: 0.6,
  range_dense_text: 1,
  radius_dense_code: 0.6,
  range_dense_code: 1,
};

const defaultGeneratorOptions: GeneratorOptions = {
  microstat: 0,
  microstat_eta: 0.1,
  mirostat_tau: 5,
  num_ctx: 2048,
  repeat_last_n: 33,
  repeat_penalty: 1,
  seed: 42,
  stop: "",
  num_predict: 42,
  temperature: 0.8,
  top_k: 40,
  top_p: 0.9,
  min_p: 0.0,
};

const defaultOptions: AdditionalOptions = {
  retriever_options: defaultRetrieverOptions,
  generator_options: defaultGeneratorOptions,
};

/**
 * -------------------------------------------------------------------------
 * AdvancedSettingsPage – now powered by react‑hook‑form + zod
 * -------------------------------------------------------------------------
 */
const AdvancedSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  /**
   * ---------------------------------------------------------------------
   * useForm initialisation – zodResolver gives us schema‑level validation.
   * We start with `defaultOptions`; if the user has something in localStorage
   * we load it and `reset()` the form (see useEffect below).
   * ---------------------------------------------------------------------
   */
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(additionalOptionsSchema),
    defaultValues: defaultOptions,
    mode: "onBlur", // feel free to change (onChange, onSubmit, etc.)
  });

  /**
   * ---------------------------------------------------------------------
   * Load persisted settings once. If they validate against the schema we
   * hydrate the form state.
   * ---------------------------------------------------------------------
   */
  useEffect(() => {
    const savedOptions = localStorage.getItem("advancedSettings");
    if (savedOptions) {
      try {
        const parsed = JSON.parse(savedOptions);
        const validated = additionalOptionsSchema.parse(parsed);
        reset(validated);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to parse saved settings:", error);
      }
    }
  }, [reset]);

  /**
   * ---------------------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------------------
   */
  const handleGoBack = () => navigate(-1);

  const onSubmit = (data: AdditionalOptions) => {
    localStorage.setItem("advancedSettings", JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  /**
   * Dynamic classes for invalid inputs (keeps your red border logic)
   */
  const invalidClass = "border-red-500";
  const baseInputClass = "bg-gray-800 border-gray-700 w-22";
  const getInputClass = (path: string) =>
    baseInputClass +
    (path
      .split(".")
      .reduce((prev: any, curr: string) => prev && (prev as any)[curr], errors)
      ? ` ${invalidClass}`
      : "");

  /**
   * Convenience component for simple numeric / text inputs that are wired
   * directly with `register`. For anything that is *not* a native input
   * (e.g. Switch) we use <Controller /> below.
   */
  const RHFInput = ({
    name,
    label,
    step,
    min,
    max,
    type = "number",
  }: {
    name: Parameters<typeof register>[0];
    label: string;
    step?: number;
    min?: number;
    max?: number;
    type?: "number" | "text";
  }) => {
    const value = watch(name) as number | string;
    const err = name
      .split(".")
      .reduce((prev: any, curr: string) => prev && (prev as any)[curr], errors);

    return (
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Input
                  type={type}
                  step={step}
                  min={min}
                  max={max}
                  value={typeof value === "number" ? value : (value ?? "")}
                  className={getInputClass(name)}
                  {...register(name as any, {
                    valueAsNumber: type === "number",
                  })}
                />
              </div>
            </TooltipTrigger>
            {err?.message && (
              <TooltipContent className="bg-red-900 text-white">
                {err.message as string}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  /**
   * ---------------------------------------------------------------------
   * Render
   * ---------------------------------------------------------------------
   */
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="h-full bg-chat-darker text-white"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-base">Advanced Settings</h1>
        <div
          className="codicon codicon-discard rounded-xl cursor-pointer"
          title="Go Back"
          onClick={handleGoBack}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="retriever" className="mt-4 rounded-none">
        <TabsList className="grid grid-cols-2 max-[350px]:grid-cols-1 max-[350px]:grid-rows-2 max-[350px]:h-max w-full bg-gray-800 mb-2">
          <TabsTrigger
            value="retriever"
            className="data-[state=active]:bg-gray-700"
          >
            <span className="codicon codicon-database" />
            Retriever Options
          </TabsTrigger>
          <TabsTrigger
            value="generator"
            className="data-[state=active]:bg-gray-700"
          >
            <span className="codicon codicon-terminal" />
            Generator Options
          </TabsTrigger>
        </TabsList>

        {/* -------------------------------- Retriever Tab -------------------------------- */}
        <TabsContent value="retriever" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Weights */}
            <div className="space-y-2 bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-base font-medium border-b border-gray-700 pb-2">
                <span className="codicon codicon-dashboard mr-2" />
                Weights
              </h3>

              <div className="space-y-3">
                <RHFInput
                  name="retriever_options.sparse_weight"
                  label="Sparse Weight:"
                  step={0.1}
                  min={0}
                  max={2}
                />

                <RHFInput
                  name="retriever_options.dense_text_weight"
                  label="Dense Text Weight:"
                  step={0.1}
                  min={0}
                  max={2}
                />

                <RHFInput
                  name="retriever_options.dense_code_weight"
                  label="Dense Code Weight:"
                  step={0.1}
                  min={0}
                  max={2}
                />

                <RHFInput
                  name="retriever_options.top_k"
                  label="Top K:"
                  step={1}
                  min={1}
                  max={10}
                />
              </div>
            </div>

            {/* Radius & Range */}
            <div className="space-y-2 bg-gray-800/50 p-4 rounded-lg">
              <div className="flex flex-col mb-2 border-b border-gray-700">
                <h3 className="text-base font-medium">
                  <span className="codicon codicon-circle-outline mr-2" />
                  Radius and Range
                </h3>
                <a className="text-sm text-gray-400 mb-4 text-wrap">
                  Before adjusting any of the parameters below, please refer to
                  the documentation for usage{" "}
                  <a
                    className="text-blue-500 font-medium underline"
                    href="https://milvus.io/docs/range-search.md#Range-Search"
                  >
                    instructions.
                  </a>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 max-[350px]:grid-cols-1">
                <RHFInput
                  name="retriever_options.radius_sparse"
                  label="Radius Sparse:"
                  step={0.01}
                  min={0}
                  max={1}
                />
                <RHFInput
                  name="retriever_options.range_sparse"
                  label="Range Sparse:"
                  step={0.1}
                  min={0}
                  max={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 max-[350px]:grid-cols-1">
                <RHFInput
                  name="retriever_options.radius_dense_text"
                  label="Radius Dense Text:"
                  step={0.01}
                  min={0}
                  max={1}
                />
                <RHFInput
                  name="retriever_options.range_dense_text"
                  label="Range Dense Text:"
                  step={0.1}
                  min={0}
                  max={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 max-[350px]:grid-cols-1">
                <RHFInput
                  name="retriever_options.radius_dense_code"
                  label="Radius Dense Code:"
                  step={0.01}
                  min={0}
                  max={1}
                />
                <RHFInput
                  name="retriever_options.range_dense_code"
                  label="Range Dense Code:"
                  step={0.1}
                  min={0}
                  max={2}
                />
              </div>
            </div>

            {/* Filter */}
            <div className="space-y-2 bg-gray-800/50 p-4 rounded-lg">
              <div className="flex flex-col mb-2 border-b border-gray-700">
                <h3 className="text-base font-medium">
                  <span className="codicon codicon-circle-outline mr-2" />
                  Filter
                </h3>
                <a className="text-sm text-gray-400 mb-4 text-wrap">
                  Before adjusting any of the parameters below, please refer to
                  the documentation for usage{" "}
                  <a
                    className="text-blue-500 font-medium underline"
                    href="https://milvus.io/docs/filtered-search.md#Iterative-Filtering"
                  >
                    instructions.
                  </a>
                </a>
              </div>

              <div className="space-y-2 pt-1">
                {/* Switch – needs Controller */}
                <div className="flex items-center space-x-3">
                  <Controller
                    control={control}
                    name="retriever_options.iterativeFilter"
                    render={({ field }) => (
                      <Switch
                        id="iterative-filter"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-700 border border-gray-600 transition-colors"
                      />
                    )}
                  />
                  <Label htmlFor="iterative-filter">Iterative Filter</Label>
                </div>

                {/* Filter expression (text) */}
                <Label htmlFor="filter-expr">Filter Expression</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        id="filter-expr"
                        className={
                          getInputClass("retriever_options.filter_expr") +
                          " w-50 text-wrap"
                        }
                        {...register("retriever_options.filter_expr" as const)}
                      />
                    </TooltipTrigger>
                    {errors.retriever_options?.filter_expr?.message && (
                      <TooltipContent className="bg-red-900 text-white">
                        {errors.retriever_options.filter_expr.message}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* -------------------------------- Generator Tab -------------------------------- */}
        <TabsContent value="generator" className="space-y-6">
          <div className="bg-gray-800/50 p-6 rounded-lg max-w-2xl mx-auto">
            <div className="flex flex-col mb-2 border-b border-gray-700">
              <h3 className="text-lg font-medium">
                <span className="codicon codicon-settings-gear mr-2" />
                Generator Settings
              </h3>
              <a className="text-sm text-gray-400 mb-4 text-wrap">
                Before adjusting any of the parameters below, please refer to
                the documentation for usage{" "}
                <a
                  className="text-blue-500 font-medium underline"
                  href="https://github.com/ollama/ollama/blob/main/docs/modelfile.md#valid-parameters-and-values"
                >
                  instructions.
                </a>
              </a>
            </div>

            {/* Grid 1 */}
            <div className="grid grid-cols-2 gap-4 max-[350px]:grid-cols-1">
              <RHFInput
                name="generator_options.microstat"
                label="Microstat:"
                step={0.01}
                min={0}
                max={1}
              />
              <RHFInput
                name="generator_options.microstat_eta"
                label="Microstat Eta:"
                step={0.01}
                min={0}
                max={1}
              />
            </div>

            {/* Grid 2 */}
            <div className="grid grid-cols-2 gap-4 mt-6 max-[350px]:grid-cols-1">
              <RHFInput
                name="generator_options.mirostat_tau"
                label="Mirostat Tau:"
                step={0.1}
                min={0}
                max={5}
              />
              <RHFInput
                name="generator_options.num_ctx"
                label="Num Context:"
                step={1}
                min={1}
                max={4096}
              />
            </div>

            {/* Grid 3 */}
            <div className="grid grid-cols-2 gap-4 mt-6 max-[350px]:grid-cols-1">
              <RHFInput
                name="generator_options.repeat_last_n"
                label="Repeat Last N:"
                step={1}
                min={0}
                max={100}
              />
              <RHFInput
                name="generator_options.repeat_penalty"
                label="Repeat Penalty:"
                step={1}
                min={-1}
                max={100}
              />
            </div>

            {/* Grid 4 */}
            <div className="grid grid-cols-2 gap-4 mt-6 max-[350px]:grid-cols-1">
              <RHFInput
                name="generator_options.temperature"
                label="Temperature:"
                step={0.1}
                min={0}
                max={5}
              />
              <RHFInput
                name="generator_options.seed"
                label="Seed:"
                step={1}
                min={0}
                max={1000}
              />
            </div>

            {/* Grid 5 */}
            <div className="grid grid-cols-2 gap-4 mt-6 max-[350px]:grid-cols-1">
              <RHFInput
                name="generator_options.stop"
                label="Stop Sequence:"
                type="text"
              />
              <RHFInput
                name="generator_options.num_predict"
                label="Num Predict:"
                step={1}
                min={1}
                max={1000}
              />
            </div>

            {/* Grid 6 */}
            <div className="grid grid-cols-2 gap-4 mt-6 max-[350px]:grid-cols-1">
              <RHFInput
                name="generator_options.top_k"
                label="Top K:"
                step={1}
                min={0}
                max={100}
              />
              <RHFInput
                name="generator_options.min_p"
                label="Min P:"
                step={0.01}
                min={0}
                max={1}
              />
            </div>

            {/* Grid 7 */}
            <div className="grid grid-cols-2 gap-4 mt-6 max-[350px]:grid-cols-1">
              <RHFInput
                name="generator_options.top_p"
                label="Top P:"
                step={0.01}
                min={0}
                max={1}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer buttons */}
      <div className="relative transition-all flex justify-end mt-3 space-x-4 bottom-0 bg-chat-darker max-[350px]:flex-col max-[350px]:space-x-0 max-[350px]:space-y-2">
        <Button
          variant="outline"
          type="button"
          onClick={handleGoBack}
          className="bg-transparent border-gray-600 hover:bg-gray-800 px-6"
        >
          <span className="codicon codicon-chrome-close mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-6"
          disabled={saved}
        >
          <span
            className={`codicon ${saved ? "codicon-check" : "codicon-save"} mr-2`}
          />
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default AdvancedSettingsPage;
