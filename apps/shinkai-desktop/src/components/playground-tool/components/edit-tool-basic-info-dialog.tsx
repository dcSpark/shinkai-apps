import { zodResolver } from '@hookform/resolvers/zod';
import { PopoverClose } from '@radix-ui/react-popover';
import { ToolMetadata } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import {
  Button,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from '@shinkai_network/shinkai-ui';
import { Form } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { usePlaygroundStore } from '../context/playground-context';
import { CreateToolCodeFormSchema } from '../hooks/use-tool-code';
import { useToolSave } from '../hooks/use-tool-save';

const toolBasicInfoSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});
type ToolBasicInfoFormSchema = z.infer<typeof toolBasicInfoSchema>;

export default function EditToolBasicInfoDialog({
  toolName,
  toolDescription,
  initialToolRouterKeyWithVersion,
  className,
}: {
  toolName: string;
  toolDescription: string;
  initialToolRouterKeyWithVersion: string;
  className?: string;
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

  const { handleSaveTool, isSavingTool } = useToolSave();

  useEffect(() => {
    toolBasicInfoForm.setValue('name', toolName);
    toolBasicInfoForm.setValue('description', toolDescription);
  }, [toolDescription, toolName, toolBasicInfoForm]);

  const onSubmit = (data: ToolBasicInfoFormSchema) => {
    handleSaveTool({
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
    <Popover
      onOpenChange={(open) => {
        if (open) {
          toolBasicInfoForm.reset({
            name: toolName,
            description: toolDescription,
          });
        }
        setIsOpen(open);
      }}
      open={isOpen}
    >
      <PopoverTrigger className={cn(
        "hover:bg-official-gray-900 transtion-colors flex max-w-[400px] items-center gap-2 truncate rounded-lg p-1 text-base font-medium",
        className
      )}>
        <span className="truncate">{toolName}</span>
        <Button size="xs" variant="ghost" className="px-2 h-6">Edit</Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="flex w-[450px] flex-col gap-4 p-4"
        side="bottom"
        sideOffset={10}
      >
        <h1 className="text-sm font-semibold leading-none tracking-tight">
          Update Tool
        </h1>
        <Form {...toolBasicInfoForm}>
          <form
            className="space-y-4"
            onSubmit={toolBasicInfoForm.handleSubmit(onSubmit)}
          >
            <FormField
              control={toolBasicInfoForm.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <Label className="text-xs font-medium" htmlFor="name">
                    Name
                  </Label>
                  <Input
                    autoFocus
                    className="placeholder-gray-80 bg-official-gray-900 !h-[40px] resize-none border-none py-0 pl-2 pt-0 text-xs caret-white focus-visible:ring-0 focus-visible:ring-white"
                    id="name"
                    onChange={field.onChange}
                    placeholder="Tool Name"
                    value={field.value}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={toolBasicInfoForm.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <Label className="text-xs font-medium" htmlFor="description">
                    Description
                  </Label>
                  <Textarea
                    className="placeholder-gray-80 bg-official-gray-900 resize-none border-none py-2 pl-2 pt-2 text-xs caret-white focus-visible:ring-0 focus-visible:ring-white"
                    id="description"
                    onChange={field.onChange}
                    placeholder="Tool Description"
                    value={field.value}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="ml-auto flex max-w-[200px] items-center justify-end gap-2">
              <PopoverClose asChild>
                <Button
                  className="flex-1"
                  disabled={isSavingTool}
                  size="xs"
                  variant="outline"
                >
                  Cancel
                </Button>
              </PopoverClose>
              <Button
                className="flex-1"
                disabled={isSavingTool}
                isLoading={isSavingTool}
                size="xs"
                type="submit"
              >
                Update
              </Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
}
