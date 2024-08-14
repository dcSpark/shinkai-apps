import { zodResolver } from '@hookform/resolvers/zod';
import { Workflow } from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
import { useUpdateTool } from '@shinkai_network/shinkai-node-state/lib/mutations/updateTool/useUpdateTool';
import { useUpdateWorkflow } from '@shinkai_network/shinkai-node-state/lib/mutations/updateWorkflow/useUpdateWorkflow';
import { useGetTool } from '@shinkai_network/shinkai-node-state/lib/queries/getTool/useGetTool';
import { useGetToolsList } from '@shinkai_network/shinkai-node-state/lib/queries/getToolsList/useGetToolsList';
import {
  Avatar,
  AvatarFallback,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  ScrollArea,
  Switch,
  Textarea,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { BoltIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../store/auth';
import { formatWorkflowName } from './create-job';
import { SubpageLayout } from './layout/simple-layout';

export const Tools = () => {
  const auth = useAuth((state) => state.auth);
  const { data: toolsList } = useGetToolsList({
    nodeAddress: auth?.node_address ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const [selectedToolEdit, setSelectedToolEdit] = useState<Workflow | null>(
    null,
  );

  const { mutateAsync: updateTool } = useUpdateTool({});

  return (
    <SubpageLayout className="max-w-3xl" title={'Shinkai Tools'}>
      <ScrollArea className="pr-4 [&>div>div]:!block">
        <div className="grid grid-cols-2 gap-4">
          {toolsList?.map((tool) => (
            <div
              className={cn(
                'rounded-sm border border-gray-200 bg-transparent text-left text-sm shadow-sm',
                'rounded-lg bg-gray-500 text-left transition-shadow duration-200 hover:bg-gray-500 hover:shadow-xl',
              )}
              key={tool.name}
            >
              <div className="flex flex-col gap-2.5 px-4 py-3.5">
                <span className="text-sm font-medium text-white">
                  {formatWorkflowName(tool.name)}{' '}
                </span>
                <p className="text-gray-80 line-clamp-4 h-[80px] text-sm">
                  {tool.description}
                </p>
                <div className="flex items-center gap-2">
                  <Avatar className="bg-brand-gradient h-5 w-5 border text-xs text-gray-50">
                    <AvatarFallback className="">
                      {tool.author.replace(/@/g, '').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-gray-80 text-xs">{tool.author}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t px-4 py-2">
                <Button
                  className="min-h-auto h-auto rounded-md py-2"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedToolEdit(tool);
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <BoltIcon className="mr-1.5 h-4 w-4" />
                  Configure
                </Button>
                <Switch
                  // checked={tool.enabled}
                  onCheckedChange={async (value) => {
                    console.log(tool.name, '---value', value);
                    await updateTool({
                      nodeAddress: auth?.node_address ?? '',
                      shinkaiIdentity: auth?.shinkai_identity ?? '',
                      profile: auth?.profile ?? '',
                      my_device_encryption_sk:
                        auth?.my_device_encryption_sk ?? '',
                      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
                      node_encryption_pk: auth?.node_encryption_pk ?? '',
                      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
                      profile_identity_sk: auth?.profile_identity_sk ?? '',
                      // toolKey: tool.tool_router_key,
                      // enabled: value,
                    });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      {selectedToolEdit && (
        <UpdateToolDrawer
          open={!!selectedToolEdit}
          setOpen={(open) => {
            if (!open) {
              setSelectedToolEdit(null);
            }
          }}
          toolKey={selectedToolEdit.tool_router_key}
        />
      )}
    </SubpageLayout>
  );
};
const createToolFormSchema = z.object({
  toolRaw: z.string().min(1, 'Tool code is required'),
  toolDescription: z.string().min(1, 'Tool description is required'),
});
type CreateToolFormSchema = z.infer<typeof createToolFormSchema>;

function UpdateToolDrawer({
  toolKey,
  open,
  setOpen,
}: {
  toolKey: string;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}) {
  const auth = useAuth((state) => state.auth);
  const { data } = useGetTool({
    nodeAddress: auth?.node_address ?? '',
    toolKey: toolKey,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const createWorkflowForm = useForm<CreateToolFormSchema>({
    resolver: zodResolver(createToolFormSchema),
    defaultValues: {
      toolDescription: '',
      toolRaw: '',
    },
  });

  const { mutateAsync: updateWorkflow, isPending } = useUpdateWorkflow({
    onSuccess: () => {
      toast.success('Workflow updated successfully');
      setOpen(false);
    },
    onError: (error) => {
      toast.error('Failed to update workflow', {
        description: error.message,
      });
    },
  });

  const onSubmit = async (data: CreateToolFormSchema) => {
    await updateWorkflow({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      workflowRaw: data.toolRaw,
      workflowDescription: data.toolDescription ?? '',
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="bg-gray-500">
        <DialogHeader>
          <DialogTitle>Update workflow</DialogTitle>
          <div>
            <Form {...createWorkflowForm}>
              <form
                className="mt-5 flex flex-col gap-3"
                onSubmit={createWorkflowForm.handleSubmit(onSubmit)}
              >
                <FormField
                  control={createWorkflowForm.control}
                  name="toolRaw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workflow Code</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Textarea
                            className="!min-h-[130px] resize-none text-sm"
                            onKeyDown={(event) => {
                              if (
                                event.key === 'Enter' &&
                                (event.metaKey || event.ctrlKey)
                              ) {
                                createWorkflowForm.handleSubmit(onSubmit)();
                                return;
                              }
                            }}
                            spellCheck={false}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createWorkflowForm.control}
                  name="toolDescription"
                  render={({ field }) => (
                    <TextField
                      autoFocus
                      field={field}
                      label="Workflow Description"
                    />
                  )}
                />
                <Button
                  className="mt-4"
                  disabled={isPending}
                  isLoading={isPending}
                  type="submit"
                >
                  Update Tool
                </Button>
              </form>
            </Form>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
