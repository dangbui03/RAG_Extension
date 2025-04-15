import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AdditionalOptions, RetrieverOptions, GeneratorOptions } from "@/types";

const defaultRetrieverOptions: RetrieverOptions = {
  sparseWeight: 0.5,
  denseTextWeight: 1.0,
  denseCodeWeight: 0.9,
  topK: 5,
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
  temperature: 0.5,
  top_p: 0.9,
};

const defaultOptions: AdditionalOptions = {
  retriever_options: defaultRetrieverOptions,
  generator_options: defaultGeneratorOptions,
};

const AdvancedSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState<AdditionalOptions>(defaultOptions);

  // Load saved options from localStorage when component mounts
  useEffect(() => {
    const savedOptions = localStorage.getItem("advancedSettings");
    if (savedOptions) {
      try {
        setOptions(JSON.parse(savedOptions));
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    }
  }, []);

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleSave = () => {
    // Save options to localStorage
    localStorage.setItem("advancedSettings", JSON.stringify(options));

    // Go back to the previous page
    navigate(-1);
  };

  const handleRetrieverOptionChange = (
    key: keyof RetrieverOptions,
    value: unknown
  ) => {
    setOptions((prev) => ({
      ...prev,
      retriever_options: {
        ...prev.retriever_options,
        [key]: value,
      },
    }));
  };

  const handleGeneratorOptionChange = (
    key: keyof GeneratorOptions,
    value: number
  ) => {
    setOptions((prev) => ({
      ...prev,
      generator_options: {
        ...prev.generator_options,
        [key]: value,
      },
    }));
  };

  return (
    <div className="h-full bg-chat-darker text-white">
      {/* <div className="mx-auto p-4 md:p-6 max-w-4xl"> */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-base">Advanced Settings</h1>
        <div
          className="codicon codicon-discard rounded-xl cursor-pointer"
          title="New Chat"
          onClick={handleGoBack}
        />
      </div>

      <Tabs defaultValue="retriever" className="mt-4 rounded-none">
        <TabsList className="grid grid-cols-2 max-[350px]:grid-cols-1 max-[350px]:grid-rows-2 max-[350px]:h-max w-full bg-gray-800 mb-2">
          <TabsTrigger
            value="retriever"
            className="data-[state=active]:bg-gray-700"
          >
            <span className="codicon codicon-database"></span>
            Retriever Options
          </TabsTrigger>
          <TabsTrigger
            value="generator"
            className="data-[state=active]:bg-gray-700"
          >
            <span className="codicon codicon-terminal"></span>
            Generator Options
          </TabsTrigger>
        </TabsList>

        <TabsContent value="retriever" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Weights */}
            <div className="space-y-2 bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-base font-medium border-b border-gray-700 pb-2">
                <span className="codicon codicon-dashboard mr-2"></span>
                Weights
              </h3>

              <div className="space-y-3">
                {/* <div className="flex justify-between items-center">
                    <Label>Sparse Weight: {options.retriever_options.sparseWeight.toFixed(2)}</Label>
                  </div>
                  <Slider 
                    value={[options.retriever_options.sparseWeight]}
                    min={0} 
                    max={2} 
                    step={0.1}
                    onValueChange={(value) => handleRetrieverOptionChange('sparseWeight', value[0])}
                  /> */}
                <div className="flex justify-between items-center">
                  <Label>Sparese Weight:</Label>
                  <Input
                    type="number"
                    value={options.retriever_options.sparseWeight.toFixed(2)}
                    onChange={(e) =>
                      handleRetrieverOptionChange(
                        "sparseWeight",
                        parseFloat(e.target.value)
                      )
                    }
                    className="bg-gray-800 border-gray-700 w-18"
                    step={0.1}
                    min={0}
                    max={2}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {/* <div className="flex justify-between items-center">
                    <Label>Dense Text Weight: {options.retriever_options.denseTextWeight.toFixed(2)}</Label>
                  </div>
                  <Slider 
                    value={[options.retriever_options.denseTextWeight]}
                    min={0} 
                    max={2} 
                    step={0.1}
                    onValueChange={(value) => handleRetrieverOptionChange('denseTextWeight', value[0])}
                  /> */}
                <div className="flex justify-between items-center">
                  <Label>Dense Text Weight:</Label>
                  <Input
                    type="number"
                    value={options.retriever_options.denseTextWeight.toFixed(2)}
                    onChange={(e) =>
                      handleRetrieverOptionChange(
                        "denseTextWeight",
                        parseFloat(e.target.value)
                      )
                    }
                    className="bg-gray-800 border-gray-700 w-18"
                    step={0.1}
                    min={0}
                    max={2}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {/* <div className="flex justify-between items-center">
                  <Label>
                    Dense Code Weight:{" "}
                    {options.retriever_options.denseCodeWeight.toFixed(2)}
                  </Label>
                </div>
                <Slider
                  value={[options.retriever_options.denseCodeWeight]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={(value) =>
                    handleRetrieverOptionChange("denseCodeWeight", value[0])
                  }
                /> */}
                <div className="flex justify-between items-center">
                  <Label>Dense Code Weight:</Label>
                  <Input
                    type="number"
                    value={options.retriever_options.denseCodeWeight.toFixed(2)}
                    onChange={(e) =>
                      handleRetrieverOptionChange(
                        "denseCodeWeight",
                        parseFloat(e.target.value)
                      )
                    }
                    className="bg-gray-800 border-gray-700 w-18"
                    step={0.1}
                    min={0}
                    max={2}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {/* <div className="flex justify-between items-center">
                  <Label>Top K: {options.retriever_options.topK}</Label>
                </div>
                <Slider
                  value={[options.retriever_options.topK]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={(value) =>
                    handleRetrieverOptionChange("topK", value[0])
                  }
                /> */}
                <div className="flex justify-between items-center">
                  <Label>Top K:</Label>
                  <Input
                    type="number"
                    value={options.retriever_options.topK}
                    onChange={(e) =>
                      handleRetrieverOptionChange(
                        "topK",
                        parseInt(e.target.value, 10)
                      )
                    }
                    className="bg-gray-800 border-gray-700 w-18"
                    step={1}
                    min={1}
                    max={10}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <Switch
                  id="iterative-filter"
                  checked={options.retriever_options.iterativeFilter}
                  onCheckedChange={(checked: boolean) =>
                    handleRetrieverOptionChange("iterativeFilter", checked)
                  }
                  className="bg-gray-800 border-gray-700"
                />
                <Label htmlFor="iterative-filter">Iterative Filter</Label>
              </div>
            </div>

            {/* Radius and Range */}
            <div className="space-y-2 bg-gray-800/50 p-4 rounded-lg">
              <h3 className="text-base font-medium border-b border-gray-700">
                <span className="codicon codicon-circle-outline mr-2"></span>
                Radius and Range
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {/* <Label>
                    Radius Sparse:{" "}
                    {options.retriever_options.radius_sparse.toFixed(2)}
                  </Label>
                  <Slider
                    value={[options.retriever_options.radius_sparse]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(value) =>
                      handleRetrieverOptionChange("radius_sparse", value[0])
                    }
                  /> */}
                  <div className="space-y-2 md:flex md:items-center md:justify-between">
                    <Label>Radius Sparse:</Label>
                    <Input
                      type="number"
                      value={options.retriever_options.radius_sparse.toFixed(2)}
                      onChange={(e) =>
                        handleRetrieverOptionChange(
                          "radius_sparse",
                          parseFloat(e.target.value)
                        )
                      }
                      className="bg-gray-800 border-gray-700 w-18"
                      step={0.01}
                      min={0}
                      max={1}
                    />
                  </div>
                </div>

                <div className="space-y-2 ">
                  {/* <Label>
                    Range Sparse: {options.retriever_options.range_sparse}
                  </Label>
                  <Slider
                    value={[options.retriever_options.range_sparse]}
                    min={0}
                    max={2}
                    step={0.1}
                    onValueChange={(value) =>
                      handleRetrieverOptionChange("range_sparse", value[0])
                    }
                  /> */}
                  <div className="space-y-2 md:flex md:items-center md:justify-between">
                    <Label>Range Sparse:</Label>
                    <Input
                      type="number"
                      value={options.retriever_options.range_sparse}
                      onChange={(e) =>
                        handleRetrieverOptionChange(
                          "range_sparse",
                          parseFloat(e.target.value)
                        )
                      }
                      className="bg-gray-800 border-gray-700 w-18"
                      step={0.1}
                      min={0}
                      max={2}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  {/* <Label>
                    Radius Dense Text:{" "}
                    {options.retriever_options.radius_dense_text.toFixed(2)}
                  </Label>
                  <Slider
                    value={[options.retriever_options.radius_dense_text]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(value) =>
                      handleRetrieverOptionChange("radius_dense_text", value[0])
                    }
                  /> */}
                  <div className="space-y-2 md:flex md:items-center md:justify-between">
                    <Label>Radius Dense Text:</Label>
                    <Input
                      type="number"
                      value={options.retriever_options.radius_dense_text.toFixed(
                        2
                      )}
                      onChange={(e) =>
                        handleRetrieverOptionChange(
                          "radius_dense_text",
                          parseFloat(e.target.value)
                        )
                      }
                      className="bg-gray-800 border-gray-700 w-18"
                      step={0.01}
                      min={0}
                      max={1}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {/* <Label>
                    Range Dense Text:{" "}
                    {options.retriever_options.range_dense_text}
                  </Label>
                  <Slider
                    value={[options.retriever_options.range_dense_text]}
                    min={0}
                    max={2}
                    step={0.1}
                    onValueChange={(value) =>
                      handleRetrieverOptionChange("range_dense_text", value[0])
                    }
                  /> */}
                  <div className="space-y-2 md:flex md:items-center md:justify-between">
                    <Label>Range Dense Text:</Label>
                    <Input
                      type="number"
                      value={options.retriever_options.range_dense_text}
                      onChange={(e) =>
                        handleRetrieverOptionChange(
                          "range_dense_text",
                          parseFloat(e.target.value)
                        )
                      }
                      className="bg-gray-800 border-gray-700 w-18"
                      step={0.1}
                      min={0}
                      max={2}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  {/* <Label>
                    Radius Dense Code:{" "}
                    {options.retriever_options.radius_dense_code.toFixed(2)}
                  </Label>
                  <Slider
                    value={[options.retriever_options.radius_dense_code]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={(value) =>
                      handleRetrieverOptionChange("radius_dense_code", value[0])
                    }
                  /> */}
                  <div className="space-y-2 md:flex md:items-center md:justify-between">
                    <Label>Radius Dense Code:</Label>
                    <Input
                      type="number"
                      value={options.retriever_options.radius_dense_code.toFixed(
                        2
                      )}
                      onChange={(e) =>
                        handleRetrieverOptionChange(
                          "radius_dense_code",
                          parseFloat(e.target.value)
                        )
                      }
                      className="bg-gray-800 border-gray-700 w-18"
                      step={0.01}
                      min={0}
                      max={1}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {/* <Label>
                    Range Dense Code:{" "}
                    {options.retriever_options.range_dense_code}
                  </Label>
                  <Slider
                    value={[options.retriever_options.range_dense_code]}
                    min={0}
                    max={2}
                    step={0.1}
                    onValueChange={(value) =>
                      handleRetrieverOptionChange("range_dense_code", value[0])
                    }
                  /> */}
                  <div className="space-y-2 md:flex md:items-center md:justify-between">
                    <Label>Range Dense Code:</Label>
                    <Input
                      type="number"
                      value={options.retriever_options.range_dense_code}
                      onChange={(e) =>
                        handleRetrieverOptionChange(
                          "range_dense_code",
                          parseFloat(e.target.value)
                        )
                      }
                      className="bg-gray-800 border-gray-700 w-18"
                      step={0.1}
                      min={0}
                      max={2}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <Label htmlFor="filter-expr">Filter Expression</Label>
                <Input
                  id="filter-expr"
                  value={options.retriever_options.filter_expr || ""}
                  onChange={(e) =>
                    handleRetrieverOptionChange("filter_expr", e.target.value)
                  }
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="generator" className="space-y-6">
          <div className="bg-gray-800/50 p-6 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-medium border-b border-gray-700 pb-2 mb-6">
              <span className="codicon codicon-settings-gear mr-2"></span>
              Generator Settings
            </h3>

            <div className="space-y-6">
              <div className="space-y-3">
                {/* <div className="flex justify-between items-center">
                  <Label>
                    Temperature:{" "}
                    {options.generator_options.temperature.toFixed(2)}
                  </Label>
                </div>
                <Slider
                  value={[options.generator_options.temperature]}
                  min={0}
                  max={2}
                  step={0.01}
                  onValueChange={(value) =>
                    handleGeneratorOptionChange("temperature", value[0])
                  }
                /> */}
                <div className="flex justify-between items-center">
                  <Label>Temperature:</Label>
                  <Input
                    type="number"
                    value={options.generator_options.temperature.toFixed(2)}
                    onChange={(e) =>
                      handleGeneratorOptionChange(
                        "temperature",
                        parseFloat(e.target.value)
                      )
                    }
                    className="bg-gray-800 border-gray-700 w-18"
                    step={0.01}
                    min={0}
                    max={2}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Lower values produce more focused, deterministic responses.
                  Higher values produce more creative, varied responses.
                </p>
              </div>

              <div className="space-y-3 mt-8">
                {/* <div className="flex justify-between items-center">
                  <Label>
                    Top P: {options.generator_options.top_p.toFixed(2)}
                  </Label>
                </div>
                <Slider
                  value={[options.generator_options.top_p]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(value) =>
                    handleGeneratorOptionChange("top_p", value[0])
                  }
                /> */}
                <div className="flex justify-between items-center">
                  <Label>Top P:</Label>
                  <Input
                    type="number"
                    value={options.generator_options.top_p.toFixed(2)}
                    onChange={(e) =>
                      handleGeneratorOptionChange(
                        "top_p",
                        parseFloat(e.target.value)
                      )
                    }
                    className="bg-gray-800 border-gray-700 w-18"
                    step={0.01}
                    min={0}
                    max={1}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Controls diversity by considering only the tokens whose
                  cumulative probability exceeds the top_p value.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="relative transition-all flex justify-end mt-3 space-x-4 bottom-0 bg-chat-darker max-[350px]:flex-col max-[350px]:space-x-0 max-[350px]:space-y-2">
        <Button
          variant="outline"
          onClick={handleGoBack}
          className="bg-transparent border-gray-600 hover:bg-gray-800 px-6"
        >
          <span className="codicon codicon-chrome-close mr-2"></span>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 px-6"
        >
          <span className="codicon codicon-save mr-2"></span>
          Save Changes
        </Button>
      </div>
      {/* </div> */}
    </div>
  );
};

export default AdvancedSettingsPage;
