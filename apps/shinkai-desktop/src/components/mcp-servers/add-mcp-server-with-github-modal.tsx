import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import type { ImportMCPServerFromGithubURLOutput } from '@shinkai_network/shinkai-node-state/v2/mutations/importMCPServerFromGithubURL/types';
import { useImportMCPServerFromGithubURL } from '@shinkai_network/shinkai-node-state/v2/mutations/importMCPServerFromGithubURL/useImportMCPServerFromGithubURL';
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
} from '@shinkai_network/shinkai-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../../store/auth';

// Define the form schema
const formSchema = z.object({
  githubUrl: z.string().url({ message: 'Invalid GitHub URL format' }),
});

type FormSchemaType = z.infer<typeof formSchema>;

interface AddMcpServerWithGithubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: ImportMCPServerFromGithubURLOutput) => void;
}

export const AddMcpServerWithGithubModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddMcpServerWithGithubModalProps) => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      githubUrl: '',
    },
  });

  const { mutateAsync: importMcpServer, isPending: isImporting } = 
    useImportMCPServerFromGithubURL({
      onSuccess: (data) => {
        toast.success('MCP Server details fetched successfully from GitHub');
        onSuccess(data);
        form.reset();
      },
      onError: (error: Error) => {
        toast.error('Failed to fetch MCP Server details from GitHub', {
          description: error?.message,
        });
      },
    });

  const onSubmit = async (values: FormSchemaType) => {
    if (!auth) {
      toast.error('Authentication details are missing.');
      return;
    }
    setIsSubmitting(true);
    try {
      await importMcpServer({
        nodeAddress: auth.node_address,
        token: auth.api_v2_key,
        githubUrl: values.githubUrl,
      });
    } catch (error) {
      console.error('Failed to initiate import MCP server from GitHub:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add MCP Server from GitHub</DialogTitle>
          <DialogDescription>
            Enter the GitHub URL of the MCP server repository. After fetching, you will be prompted to review the proposed MCP server configuration before it is added to your node.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="githubUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Repository URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/user/repo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-6">
              <Button
                disabled={isSubmitting || isImporting}
                onClick={onClose}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting || isImporting} type="submit">
                {isSubmitting || isImporting ? 'Fetching...' : 'Fetch and Continue'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 