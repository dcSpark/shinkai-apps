import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { type McpServer,McpServerType } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';
import type { AddMcpServerInput } from '@shinkai_network/shinkai-node-state/v2/mutations/addMcpServer/types';
import { useAddMcpServer } from '@shinkai_network/shinkai-node-state/v2/mutations/addMcpServer/useAddMcpServer';
import type { ImportMCPServerFromGithubURLOutput } from '@shinkai_network/shinkai-node-state/v2/mutations/importMCPServerFromGithubURL/types';
import { UpdateMcpServerInput } from '@shinkai_network/shinkai-node-state/v2/mutations/updateMcpServer/types';
import { useUpdateMcpServer } from '@shinkai_network/shinkai-node-state/v2/mutations/updateMcpServer/useUpdateMcpServer';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { PlusCircle, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../../store/auth';

// Define a schema for environment variable entry
interface EnvVar {
  key: string;
  value: string;
}

const envVarSchema = z.object({
  key: z.string().min(1, { message: 'Key is required' }),
  value: z.string().min(1, { message: 'Value is required' }),
});

// Define the form schema based on the McpServerType
const formSchema = z.discriminatedUnion('type', [
  z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    type: z.literal(McpServerType.Command),
    command: z.string().min(1, { message: 'Command is required' }),
    env: z.array(envVarSchema).optional(),
  }),
  z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    type: z.literal(McpServerType.Sse),
    url: z.string().url({ message: 'Invalid URL format' }),
  }),
]);

type FormSchemaType = z.infer<typeof formSchema>;

// Props for the Input component from shinkai-ui
type ShinkaiInputProps = React.ComponentProps<typeof Input>;

const PasswordToggleInput: React.FC<ShinkaiInputProps> = (props) => {
  const [showPassword] = useState(false);

  return (
    <div className="relative flex w-full items-center">
      <Input
        {...props}
        className={cn(props.className, 'pr-10')} // Ensure space for the icon button
        type={showPassword ? 'text' : 'password'}
      />

    </div>
  );
};

interface AddMcpServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: ImportMCPServerFromGithubURLOutput | McpServer;
  mode: 'Create' | 'Update';
}

export const AddMcpServerModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  mode,
}: AddMcpServerModalProps) => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: McpServerType.Command,
    } as FormSchemaType,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Branch for Command types (either Import or McpServer variant)
        if (initialData.type === McpServerType.Command) {
          const name = initialData.name || '';
          const command = (initialData as { command?: string }).command || '';
          const envRecord = (initialData as { env?: Record<string, any> }).env;

          let envArray: EnvVar[] = [];
          if (envRecord && typeof envRecord === 'object') {
            const transformedEnv = Object.entries(envRecord).map(([key, value]) => ({
              key,
              value: String(value),
            }));
            if (transformedEnv.length > 0) {
              envArray = transformedEnv;
            }
          }
          if (envArray.length === 0) {
            envArray.push({ key: '', value: '' });
          }
          form.reset({
            name,
            type: McpServerType.Command,
            command,
            env: envArray,
          });
        } else if (initialData.type === McpServerType.Sse) {
          // initialData is Extract<McpServer, { type: McpServerType.Sse }>
          const sseData = initialData as Extract<McpServer, { type: McpServerType.Sse }>; // Cast for clarity and safety
          form.reset({
            name: sseData.name || '',
            type: McpServerType.Sse,
            url: sseData.url || '',
          });
        } else {
          // Fallback to a default command form, trying to preserve name if possible.
          const name = (initialData as any).name || '';
          form.reset({
            name: name,
            type: McpServerType.Command,
            command: '',
            env: [{ key: '', value: '' }],
          });
        }
      } else {
        // No initialData, reset to a clean command form
        form.reset({
          name: '',
          type: McpServerType.Command,
          command: '',
          env: [{ key: '', value: '' }],
        });
      }
    } else {
      // Modal is closed, reset to a clean default state
      form.reset({
        name: '',
        type: McpServerType.Command,
        command: '',
        env: [{ key: '', value: '' }],
      });
    }
  }, [initialData, isOpen, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'env',
  });

  const serverType = form.watch('type');

  const { mutateAsync: addMcpServer } = useAddMcpServer({
    onSuccess: () => {
      toast.success('MCP Server added successfully');
      onSuccess();
      setIsSubmitting(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error('Failed to add MCP Server', {
        description: error?.message,
      });
      setIsSubmitting(false);
    },
  });

  const { mutateAsync: updateMcpServer } = useUpdateMcpServer({
    onSuccess: () => {
      toast.success('MCP Server updated successfully');
      onSuccess();
      setIsSubmitting(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error('Failed to update MCP Server', {
        description: error?.message,
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (values: FormSchemaType) => {
    if (!auth) return;
    setIsSubmitting(true);
    try {
      // Base structure for the payload, common to add and potentially update
      const commonPayload = {
        name: values.name,
        // Retain is_enabled from initialData if available (for updates or GitHub import),
        // otherwise default to true for new creations.
        is_enabled: typeof initialData?.is_enabled === 'boolean' ? initialData.is_enabled : true,
      };

      let specificPayload;
      if (values.type === McpServerType.Command) {
        const envRecord: Record<string, string> = {};
        if (values.env && values.env.length > 0) {
          values.env.forEach(({ key, value }) => {
            if (key.trim()) { // Ensure key is not empty or just whitespace
              envRecord[key.trim()] = value;
            }
          });
        }
        specificPayload = {
          ...commonPayload,
          type: McpServerType.Command as const,
          command: values.command,
          env: Object.keys(envRecord).length > 0 ? envRecord : undefined,
        };
      } else {
        specificPayload = {
          ...commonPayload,
          type: McpServerType.Sse as const,
          url: values.url,
        };
      }
      
      // Construct the full payload for the mutation hook
      const mutationInput = {
        nodeAddress: auth.node_address,
        token: auth.api_v2_key,
        ...specificPayload,
      } as AddMcpServerInput;

      if (mode === 'Create') {
        await addMcpServer(mutationInput);
      } else { // Update mode
        const serverId = (initialData as McpServer)?.id;
        if (serverId === undefined) {
          toast.error('Failed to update MCP server: Server ID is missing.');
          setIsSubmitting(false);
          return;
        }
        const updateInput: UpdateMcpServerInput = {
          nodeAddress: auth.node_address,
          token: auth.api_v2_key,
          id: serverId,
          ...specificPayload,
        };
        await updateMcpServer(updateInput);
      }
    } catch (error) {
      console.error(mode === 'Create' ? 'Failed to add MCP server:' : 'Failed to update MCP server:', error);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'Create' ? 'Add MCP Server' : 'Update MCP Server'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'Create'
              ? 'Configure a new MCP server to connect with your Shinkai Node'
              : `Updating configuration for MCP server: ${initialData?.name}`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My MCP Server" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={(value) => {
                      const newType = value as McpServerType;
                      field.onChange(newType);
                      form.setValue('type', newType, { shouldValidate: true });

                      if (newType === McpServerType.Command) {
                        form.setValue('command', form.getValues('command') || '');
                        form.setValue('env', form.getValues('env') || [{ key: '', value: '' }]);
                        form.clearErrors('url');
                        form.unregister('url');
                      } else if (newType === McpServerType.Sse) {
                        form.setValue('url', form.getValues('url') || '');
                        form.clearErrors('command');
                        form.clearErrors('env');
                        form.unregister('command');
                        form.unregister('env');
                      }
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select server type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={McpServerType.Command}>
                        Command
                      </SelectItem>
                      <SelectItem value={McpServerType.Sse}>SSE</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {serverType === McpServerType.Command && (
              <>
                <FormField
                  control={form.control}
                  name="command"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Command</FormLabel>
                      <FormControl>
                        <Input placeholder="python -m server" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      Environment Variables
                    </div>
                    <Button
                      className="h-8 gap-1"
                      onClick={() => append({ key: '', value: '' })}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </Button>
                  </div>

                  {fields.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      No environment variables added.
                    </p>
                  )}

                  {fields.map((item, index) => {
                    const currentEnvKey = form.watch(`env.${index}.key`) || '';
                    const sensitiveKeywords = ['secret', 'key', 'password'];
                    const isSensitive = sensitiveKeywords.some(keyword =>
                      currentEnvKey.toLowerCase().includes(keyword)
                    );

                    return (
                      <div className="flex items-end gap-2" key={item.id}>
                        <FormField
                          control={form.control}
                          name={`env.${index}.key`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Key</FormLabel>
                              <FormControl>
                                <Input placeholder="KEY" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="px-2 pb-2.5">=</div>
                        <FormField
                          control={form.control}
                          name={`env.${index}.value`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Value</FormLabel>
                              <FormControl>
                                {isSensitive ? (
                                  <PasswordToggleInput placeholder="Value" {...field} />
                                ) : (
                                  <Input placeholder="Value" type="text" {...field} />
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          className="mb-1.5 h-9 w-9 shrink-0"
                          disabled={fields.length === 1 && (!form.getValues(`env.${index}.key`) && !form.getValues(`env.${index}.value`))}
                          onClick={() => remove(index)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {serverType === McpServerType.Sse && (
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/sse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="mt-6">
              <Button
                disabled={isSubmitting}
                onClick={onClose}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting || (form.formState.isSubmitted && !form.formState.isValid)}
                isLoading={isSubmitting}
                type="submit"
              >
                {isSubmitting
                  ? mode === 'Create' ? 'Adding...' : 'Updating...'
                  : mode === 'Create' ? 'Add' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
