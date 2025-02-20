import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { ToolMetadata } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shinkai_network/shinkai-ui';
import { TextField } from '@shinkai_network/shinkai-ui';
import { FormField } from '@shinkai_network/shinkai-ui';
import { Form } from '@shinkai_network/shinkai-ui';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { usePlaygroundStore } from '../context/playground-context';
import { useAutoSaveTool } from '../hooks/use-create-tool-and-save';
import { CreateToolCodeFormSchema } from '../hooks/use-tool-code';

const toolBasicInfoSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});
type ToolBasicInfoFormSchema = z.infer<typeof toolBasicInfoSchema>;

export default function EditToolBasicInfoDialog({
  toolName,
  toolDescription,
  initialToolRouterKeyWithVersion,
}: {
  toolName: string;
  toolDescription: string;
  initialToolRouterKeyWithVersion: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const toolCode = usePlaygroundStore((state) => state.toolCode);
  const toolMetadata = usePlaygroundStore((state) => state.toolMetadata);

  const form = useFormContext<CreateToolCodeFormSchema>();

  const toolBasicInfoForm = useForm<ToolBasicInfoFormSchema>({
    resolver: zodResolver(toolBasicInfoSchema),
    defaultValues: {
      name: toolName,
      description: '',
    },
  });

  const { handleAutoSave, isSavingTool } = useAutoSaveTool();

  useEffect(() => {
    toolBasicInfoForm.setValue('name', toolName);
    toolBasicInfoForm.setValue('description', toolDescription);
  }, [toolDescription, toolName, toolBasicInfoForm]);

  // TODO: move description out of metadata
  const onSubmit = (data: ToolBasicInfoFormSchema) => {
    handleAutoSave({
      toolMetadata: toolMetadata as ToolMetadata,
      toolCode: toolCode ?? '',
      toolDescription: data.description,
      tools: form.getValues('tools'),
      ...(data.name !== toolName
        ? {
            previousToolRouterKeyWithVersion:
              initialToolRouterKeyWithVersion ?? '',
          }
        : {}),
      toolName: data.name,
      language: form.getValues('language'),
      onSuccess: () => {
        toast.success('Your tool has been saved successfully!');
        setIsOpen(false);
      },
    });
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger>
        <button className="hover:bg-official-gray-900 transtion-colors flex items-center gap-2 truncate rounded-lg p-1 text-base font-medium">
          {toolName}
          <ChevronDown className="size-3" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tool Details</DialogTitle>
          <DialogDescription>Edit the basic info of the tool</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Form {...toolBasicInfoForm}>
            <form
              className="space-y-10"
              onSubmit={toolBasicInfoForm.handleSubmit(onSubmit)}
            >
              <div className="space-y-6">
                <FormField
                  control={toolBasicInfoForm.control}
                  name="name"
                  render={({ field }) => (
                    <TextField field={field} label={'Name'} />
                  )}
                />
                <FormField
                  control={toolBasicInfoForm.control}
                  name="description"
                  render={({ field }) => (
                    <TextField field={field} label={'Description'} />
                  )}
                />
              </div>

              <div className="ml-auto flex max-w-xs items-center justify-end gap-4">
                <DialogClose asChild>
                  <Button
                    className="flex-1"
                    disabled={isSavingTool}
                    size="sm"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  className="flex-1"
                  disabled={isSavingTool}
                  isLoading={isSavingTool}
                  size="sm"
                  type="submit"
                >
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
