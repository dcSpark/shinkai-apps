import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { McpServerType } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';
import { useAddMcpServer } from '@shinkai_network/shinkai-node-state/v2/mutations/addMcpServer/useAddMcpServer';
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
import { PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
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

interface AddMcpServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddMcpServerModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddMcpServerModalProps) => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: McpServerType.Command,
      command: '',
      env: [{ key: '', value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'env',
  });

  const serverType = form.watch('type');

  const { mutateAsync: addMcpServer } = useAddMcpServer({
    onSuccess: () => {
      toast.success('MCP Server added successfully');
      onSuccess();
      form.reset();
    },
    onError: (error: Error) => {
      toast.error('Failed to add MCP Server', {
        description: error?.message,
      });
    },
  });

  const onSubmit = async (values: FormSchemaType) => {
    if (!auth) return;

    setIsSubmitting(true);
    try {
      // Format the payload based on the server type
      if (values.type === McpServerType.Command) {
        const envRecord: Record<string, string> = {};

        // Convert the array of key-value pairs into a Record
        if (values.env && values.env.length > 0) {
          values.env.forEach(({ key, value }: EnvVar) => {
            if (key.trim()) {
              envRecord[key.trim()] = value;
            }
          });
        }

        await addMcpServer({
          nodeAddress: auth.node_address,
          token: auth.api_v2_key,
          name: values.name,
          type: McpServerType.Command,
          command: values.command,
          env: envRecord,
          is_enabled: true,
        });
      } else {
        await addMcpServer({
          nodeAddress: auth.node_address,
          token: auth.api_v2_key,
          name: values.name,
          type: McpServerType.Sse,
          url: values.url,
          is_enabled: true,
        });
      }
    } catch (error) {
      console.error('Failed to add MCP server:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add MCP Server</DialogTitle>
          <DialogDescription>
            Configure a new MCP server to connect with your Shinkai Node
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
                      field.onChange(value as McpServerType);

                      // Reset form fields based on type
                      if (value === McpServerType.Command) {
                        form.setValue('command', '');
                        form.setValue('env', [{ key: '', value: '' }]);
                      } else {
                        form.setValue('url', '');
                      }
                    }}
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

                  {fields.map((field, index) => (
                    <div className="flex items-center gap-2" key={field.id}>
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
                      <div className="px-2">=</div>
                      <FormField
                        control={form.control}
                        name={`env.${index}.value`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Input placeholder="value" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        className="h-9 w-9 shrink-0"
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
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
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Adding...' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
