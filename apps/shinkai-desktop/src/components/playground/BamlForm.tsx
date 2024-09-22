import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
} from '@shinkai_network/shinkai-ui';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

interface BamlFormProps {
  createJob: any;
  auth: any;
  defaulAgentId: string;
}

const BamlForm: React.FC<BamlFormProps> = ({
  createJob,
  auth,
  defaulAgentId,
}) => {
  const [isTwoColumnLayout, setIsTwoColumnLayout] = useState(true);

  const [selectedBamlScript, setSelectedBamlScript] = useState<
    'my' | 'extractResume' | 'classifyMessage'
  >('my');

  const [bamlFormData, setBamlFormData] = useState<{
    my: any;
    extractResume: any;
    classifyMessage: any;
  }>({
    my: {
      bamlInput: '',
      dslFile: '',
      functionName: '',
      paramName: '',
    },
    extractResume: {
      bamlInput: `John Doe
Education
- University of California, Berkeley
  - B.S. in Computer Science
  - 2020
Skills
- Python
- Java
- C++`,
      dslFile: `class Resume {
  name string
  education Education[] @description("Extract in the same order listed")
  skills string[] @description("Only include programming languages")
}

class Education {
  school string
  degree string
  year int
}

function ExtractResume(resume_text: string) -> Resume {
  client ShinkaiProvider

  // The prompt uses Jinja syntax. Change the models or this text and watch the prompt preview change!
  prompt #"
    Parse the following resume and return a structured representation of the data in the schema below.

    Resume:
    ---
    {{ resume_text }}
    ---

    {# special macro to print the output instructions. #}
    {{ ctx.output_format }}

    JSON:
  "#
}`,
      functionName: 'ExtractResume',
      paramName: 'resume_text',
    },
    classifyMessage: {
      bamlInput: `I can't access my account using my login credentials. I haven't received the promised reset password email. Please help.`,
      dslFile: `class Message {
  text string
  category string
}

function ClassifyMessage(message_text: string) -> Message {
  client ShinkaiProvider

  prompt #"
    Classify the following message into appropriate categories.

    Message:
    ---
    {{ message_text }}
    ---

    JSON:
  "#
}`,
      functionName: 'ClassifyMessage',
      paramName: 'message_text',
    },
  });

  const bamlForm = useForm({
    defaultValues: bamlFormData[selectedBamlScript],
  });

  // Function to escape content
  const escapeContent = (content: string) => {
    return content.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  };

  const onBamlSubmit = async (data: any) => {
    const { bamlInput, dslFile, functionName, paramName } = data;
    const escapedBamlInput = escapeContent(bamlInput);
    const escapedDslFile = escapeContent(dslFile);
    const workflowText = `
workflow ${functionName} v0.1 {
  step Initialize {
    $DSL = "${escapedDslFile}"
    $INPUT = "${escapedBamlInput}"
    $PARAM = "${paramName}"
    $FUNCTION = "${functionName}"
    $RESULT = call baml_inference($INPUT, "", "", $DSL, $FUNCTION, $PARAM)
  }
} @@localhost.arb-sep-shinkai
`;
    console.log('Generated Workflow:', workflowText);

    if (!auth) return;

    await createJob({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      llmProvider: defaulAgentId,
      content: escapedBamlInput,
      files: [],
      workflowCode: workflowText,
      isHidden: true,
      selectedVRFiles: [],
      selectedVRFolders: [],
      chatConfig: {
        stream: false,
        custom_prompt: '',
        temperature: 0.7, // Assuming DEFAULT_CHAT_CONFIG.temperature is 0.7
        top_p: 1,
        top_k: 40,
      },
    });

    // Save the form data after submission
    setBamlFormData((prevData) => ({
      ...prevData,
      [selectedBamlScript]: data,
    }));
  };

  // Handle BAML Script Selection
  const handleBamlScriptChange = useCallback(
    (script: 'my' | 'extractResume' | 'classifyMessage') => {
      const currentValues = bamlForm.getValues();

      // Save current form data
      setBamlFormData((prevData) => {
        const updatedData = {
          ...prevData,
          [selectedBamlScript]: currentValues,
        };
        return updatedData;
      });

      // Switch to the selected script
      setSelectedBamlScript(script);

      // Load the new form data
      bamlForm.reset(bamlFormData[script]);
    },
    [bamlForm, bamlFormData, selectedBamlScript],
  );

  const handleBamlSave = () => {
    // Implement save functionality for 'my' script
    console.log('Save BAML Script');
    // Example: You might want to send 'my' script data to a backend or local storage
  };

  const handleBamlLoad = () => {
    // Implement load functionality for 'my' script
    console.log('Load BAML Script');
    // Example: You might want to load 'my' script data from a backend or local storage
  };

  return (
    <div className="max-h-[calc(100vh_-_200px)] space-y-8 overflow-y-auto pr-2">
      {/* BAML Script Selection Buttons */}
      <div className="flex items-center gap-4">
        {/* My BAML Script Button */}
        <Button
          className="px-3 py-1.5 text-sm"
          onClick={() => handleBamlScriptChange('my')}
          variant={selectedBamlScript === 'my' ? 'default' : 'outline'}
        >
          My BAML Script
        </Button>

        {/* Examples Text */}
        <span className="text-lg text-white">Examples:</span>

        {/* Extract Resume Button */}
        <Button
          className="px-3 py-1.5 text-sm"
          onClick={() => handleBamlScriptChange('extractResume')}
          variant={
            selectedBamlScript === 'extractResume' ? 'default' : 'outline'
          }
        >
          Extract Resume
        </Button>

        {/* Classify Message Button */}
        <Button
          className="px-3 py-1.5 text-sm"
          onClick={() => handleBamlScriptChange('classifyMessage')}
          variant={
            selectedBamlScript === 'classifyMessage' ? 'default' : 'outline'
          }
        >
          Classify Message
        </Button>

        {/* Save and Load Buttons */}
        {selectedBamlScript === 'my' && (
          <div className="ml-auto flex gap-2">
            <Button
              className="px-3 py-1.5 text-sm"
              onClick={handleBamlSave}
              variant="outline"
            >
              Save
            </Button>
            <Button
              className="px-3 py-1.5 text-sm"
              onClick={handleBamlLoad}
              variant="outline"
            >
              Load
            </Button>
          </div>
        )}
      </div>

      {/* Layout Switch Button */}
      <Button
        className="px-3 py-1.5 text-sm"
        onClick={() => setIsTwoColumnLayout(!isTwoColumnLayout)}
        variant="outline"
      >
        Switch Layout
      </Button>

      {/* BAML Form */}
      <Form {...bamlForm}>
        <form
          className="space-y-8"
          onSubmit={bamlForm.handleSubmit(onBamlSubmit)}
        >
          {isTwoColumnLayout ? (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={bamlForm.control}
                name="bamlInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BAML Input</FormLabel>
                    <FormControl>
                      <Textarea
                        maxHeight={600}
                        minHeight={500}
                        placeholder="Enter BAML input"
                        resize="vertical"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bamlForm.control}
                name="dslFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DSL File</FormLabel>
                    <FormControl>
                      <Textarea
                        maxHeight={600}
                        minHeight={500}
                        placeholder="Enter DSL file content"
                        resize="vertical"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <>
              <FormField
                control={bamlForm.control}
                name="bamlInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BAML Input</FormLabel>
                    <FormControl>
                      <Textarea
                        maxHeight={300}
                        placeholder="Enter BAML input"
                        resize="vertical"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bamlForm.control}
                name="dslFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DSL File</FormLabel>
                    <FormControl>
                      <Textarea
                        maxHeight={300}
                        placeholder="Enter DSL file content"
                        resize="vertical"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={bamlForm.control}
              name="functionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Function Name</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-vertical"
                      placeholder="Enter function name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={bamlForm.control}
              name="paramName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Param Name</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-vertical"
                      placeholder="Enter param name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button className="w-full" size="sm" type="submit">
            Submit BAML
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default BamlForm;
