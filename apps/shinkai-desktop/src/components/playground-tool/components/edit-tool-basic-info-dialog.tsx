import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const toolBasicInfoSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  keywords: z.array(z.string()).min(1),
});
type ToolBasicInfoFormSchema = z.infer<typeof toolBasicInfoSchema>;

export default function EditToolBasicInfoDialog({
  toolName,
}: {
  toolName: string;
}) {
  const toolBasicInfoForm = useForm<ToolBasicInfoFormSchema>({
    resolver: zodResolver(toolBasicInfoSchema),
    defaultValues: {
      name: toolName,
    },
  });

  const onSubmit = (data: ToolBasicInfoFormSchema) => {
    console.log(data);
  };

  return (
    <Dialog>
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

                <FormField
                  control={toolBasicInfoForm.control}
                  name="keywords"
                  render={({ field }) => (
                    <TextField field={field} label={'Keywords'} />
                  )}
                />
              </div>

              <div className="ml-auto flex max-w-xs items-center justify-end gap-4">
                <DialogClose asChild>
                  <Button
                    // disabled={isPending}
                    // isLoading={isPending}
                    className="flex-1"
                    size="sm"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  // disabled={isPending}
                  // isLoading={isPending}
                  className="flex-1"
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
