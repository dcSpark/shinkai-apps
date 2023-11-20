import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCreateAgent } from "../api/mutations/createAgent/useCreateAgent";
import { Button } from "../components/ui/button";
import ErrorMessage from "../components/ui/error-message";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { CREATE_JOB_PATH } from "../routes/name";
import { useAuth } from "../store/auth";
import SimpleLayout from "./layout/simple-layout";

const addAgentSchema = z.object({
  agentName: z.string(),
  externalUrl: z.string().url(),
  performLocally: z.boolean(),
  apikey: z.string(),
  model: z.string(),
  modelType: z.string(),
});

const CreateAgentPage = () => {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const addAgentForm = useForm<z.infer<typeof addAgentSchema>>({
    resolver: zodResolver(addAgentSchema),
    defaultValues: {
      performLocally: false,
      modelType: "gpt-3.5-turbo-1106",
    },
  });
  const {
    mutateAsync: createAgent,
    isPending,
    isError,
    error,
  } = useCreateAgent({
    onSuccess: () => {
      navigate(CREATE_JOB_PATH);
    },
  });

  const { model, modelType } = addAgentForm.watch();

  const onSubmit = async (data: z.infer<typeof addAgentSchema>) => {
    const modelMapping: Record<string, { model_type: string }> = {
      OpenAI: { model_type: modelType },
    };

    if (!auth) return;
    createAgent({
      sender_subidentity: auth.profile,
      node_name: auth.shinkai_identity,
      agent: {
        allowed_message_senders: [],
        api_key: data.apikey,
        external_url: data.externalUrl,
        full_identity_name: `${auth.shinkai_identity}/${auth.profile}/agent/${data.agentName}`,
        id: data.agentName,
        perform_locally: data.performLocally,
        storage_bucket_permissions: [],
        toolkit_permissions: [],
        model: {
          [model]: modelMapping[model],
        },
      },
      setupDetailsState: {
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      },
    });
  };

  return (
    <SimpleLayout title="Add Agent AI">
      <Form {...addAgentForm}>
        <form className="space-y-10" onSubmit={addAgentForm.handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Eg: Personal AI Agent" {...field} />
                  </FormControl>
                </FormItem>
              )}
              control={addAgentForm.control}
              name="agentName"
            />
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Eg: https://api.openai.com" {...field} />
                  </FormControl>
                </FormItem>
              )}
              control={addAgentForm.control}
              name="externalUrl"
            />
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Api Key</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Eg: xYz1DFa..." />
                  </FormControl>
                  <FormDescription className="pt-1 text-left text-xs">
                    Enter the API key for your agent
                  </FormDescription>
                </FormItem>
              )}
              control={addAgentForm.control}
              name="apikey"
            />

            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select your Model</FormLabel>
                  <Select defaultValue={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your Model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="OpenAI">OpenAI</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
              control={addAgentForm.control}
              name="model"
            />

            {model && (
              <FormField
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{model} Model Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Eg: gpt-3.5-turbo" {...field} />
                    </FormControl>
                  </FormItem>
                )}
                control={addAgentForm.control}
                name="modelType"
              />
            )}
          </div>

          {isError && <ErrorMessage message={error.message} />}

          <Button
            className="w-full"
            disabled={isPending}
            isLoading={isPending}
            type="submit"
          >
            Create Agent
          </Button>
        </form>
      </Form>
    </SimpleLayout>
  );
};
export default CreateAgentPage;
