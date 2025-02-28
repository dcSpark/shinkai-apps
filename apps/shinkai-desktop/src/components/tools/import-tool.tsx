import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useImportTool } from '@shinkai_network/shinkai-node-state/v2/mutations/importTool/useImportTool';
import { useImportToolZip } from '@shinkai_network/shinkai-node-state/v2/mutations/importToolZip/useImportToolZip';
import {
  Button,
  buttonVariants,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FileUploader,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { ImportIcon } from '@shinkai_network/shinkai-ui/assets';
import { useMeasure } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  DownloadIcon,
  Link,
  Package2Icon,
  XIcon,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../../store/auth';

const importToolFormSchema = z.object({
  url: z.string().url(),
});
type ImportToolFormSchema = z.infer<typeof importToolFormSchema>;

const importToolZipFormSchema = z.object({
  file: z.any(),
});
type ImportToolZipFormSchema = z.infer<typeof importToolZipFormSchema>;

export enum ImportToolView {
  Main = 'main',
  Url = 'url',
  Zip = 'zip',
}

export default function ImportToolModal() {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();

  const [elementRef, bounds] = useMeasure();
  const previousHeightRef = useRef<number | null>();

  const [importToolView, setImportToolView] = useState<ImportToolView>(
    ImportToolView.Main,
  );

  const navigate = useNavigate();
  const importToolForm = useForm<ImportToolFormSchema>({
    resolver: zodResolver(importToolFormSchema),
  });

  const importToolZipForm = useForm<ImportToolZipFormSchema>({
    resolver: zodResolver(importToolZipFormSchema),
  });

  const [isImportModalOpen, setImportModalOpen] = useState(false);

  const { mutateAsync: importTool, isPending: isPendingImportTool } =
    useImportTool({
      onSuccess: (data) => {
        setImportModalOpen(false);
        toast.success('Tool imported successfully', {
          action: {
            label: 'View',
            onClick: () => {
              navigate(`/tools/${data.tool_key}`);
            },
          },
        });
      },
      onError: (error) => {
        toast.error('Failed to import tool', {
          description: error.response?.data?.message ?? error.message,
        });
      },
    });

  const { mutateAsync: importToolZip, isPending: isPendingImportToolZip } =
    useImportToolZip({
      onSuccess: (data) => {
        setImportModalOpen(false);
        navigate(`/tools/${data.tool_key}`);
      },
      onError: (error) => {
        toast.error('Failed to import tool', {
          description: error.response?.data?.message ?? error.message,
        });
      },
    });

  const onSubmitUrl = async (data: ImportToolFormSchema) => {
    await importTool({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      url: data.url,
    });
  };
  const onSubmitZip = async (data: ImportToolZipFormSchema) => {
    await importToolZip({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      file: data.file?.[0],
    });
  };

  const opacityDuration = useMemo(() => {
    const currentHeight = bounds.height ?? 0;
    const previousHeight = previousHeightRef.current ?? 0;

    const MIN_DURATION = 0.15;
    const MAX_DURATION = 0.27;

    if (!previousHeightRef.current) {
      previousHeightRef.current = currentHeight;
      return MIN_DURATION;
    }

    const heightDifference = Math.abs(currentHeight - previousHeight);
    previousHeightRef.current = currentHeight;

    const duration = Math.min(
      Math.max(heightDifference / 500, MIN_DURATION),
      MAX_DURATION,
    );

    return duration;
  }, [bounds.height]);

  const renderContent = () => {
    switch (importToolView) {
      case ImportToolView.Main:
        return (
          <div>
            <DialogHeader>
              <DialogTitle className="text-center">Import </DialogTitle>
            </DialogHeader>
            <div className="mt-8 space-y-3">
              <Button
                className="hover:bg-official-gray-850 flex h-[auto] w-full items-center justify-start gap-4 rounded-md px-5 py-2.5 text-left"
                onClick={() => setImportToolView(ImportToolView.Url)}
                variant="outline"
              >
                <Link className="size-5" />
                <div>
                  <div className="text-sm font-semibold">Import from URL</div>
                  <div className="text-gray-80 text-sm">
                    Import a tool from a URL.
                  </div>
                </div>
              </Button>
              <Button
                className="hover:bg-official-gray-850 flex h-[auto] w-full items-center justify-start gap-4 rounded-md px-5 py-2.5 text-left"
                onClick={() => setImportToolView(ImportToolView.Zip)}
                variant="outline"
              >
                <Package2Icon className="size-5" />
                <div>
                  <div className="text-sm font-semibold">Import from Zip</div>
                  <div className="text-gray-80 text-sm">
                    Import a tool from a zip file.
                  </div>
                </div>
              </Button>
            </div>
          </div>
        );
      case ImportToolView.Url:
        return (
          <div>
            <DialogHeader>
              <DialogTitle className="text-center">Import From URL</DialogTitle>
            </DialogHeader>{' '}
            <Form {...importToolForm}>
              <form
                className="mt-8 flex flex-col gap-6"
                onSubmit={importToolForm.handleSubmit(onSubmitUrl)}
              >
                <FormField
                  control={importToolForm.control}
                  name="url"
                  render={({ field }) => (
                    <TextField
                      autoFocus
                      field={{
                        ...field,
                        placeholder: 'https://example.com/file.zip',
                      }}
                      label={'URL'}
                    />
                  )}
                />
                <DialogFooter>
                  <Button
                    className="w-full"
                    disabled={isPendingImportTool}
                    isLoading={isPendingImportTool}
                    size="auto"
                    type="submit"
                  >
                    Import
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        );
      case ImportToolView.Zip:
        return (
          <div>
            <DialogHeader>
              <DialogTitle className="text-center">Import From ZIP</DialogTitle>
            </DialogHeader>{' '}
            <Form {...importToolZipForm}>
              <form
                className="mt-8 flex flex-col gap-6"
                onSubmit={importToolZipForm.handleSubmit(onSubmitZip)}
              >
                <FormField
                  control={importToolZipForm.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">
                        {t('common.file')}
                      </FormLabel>
                      <FormControl>
                        <FileUploader
                          accept={['zip'].join(',')}
                          descriptionText={`Choose a zip file`}
                          maxFiles={1}
                          onChange={(acceptedFiles) => {
                            field.onChange(acceptedFiles);
                          }}
                          shouldDisableScrolling
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    className="w-full"
                    disabled={isPendingImportToolZip}
                    isLoading={isPendingImportToolZip}
                    size="auto"
                    type="submit"
                  >
                    Import
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        );
      default:
        throw new Error('Invalid view');
    }
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          importToolForm.reset();
          setImportToolView(ImportToolView.Main);
          return;
        }
        setImportModalOpen(open);
      }}
      open={isImportModalOpen}
    >
      <DialogTrigger
        className={cn(
          buttonVariants({
            variant: 'outline',
            size: 'xs',
            rounded: 'lg',
          }),
        )}
      >
        <ImportIcon className="size-4" />
        Import
      </DialogTrigger>
      <DialogContent
        className="max-w-[500px]"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <motion.div
          animate={{
            height: bounds.height ?? 0,
            transition: {
              duration: 0.27,
              ease: [0.25, 1, 0.5, 1],
            },
          }}
        >
          {importToolView !== ImportToolView.Main && (
            <Button
              className="absolute left-4 top-6"
              onClick={() => setImportToolView(ImportToolView.Main)}
              size="icon"
              variant="tertiary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <Button
            className="absolute right-4 top-6"
            onClick={() => {
              setImportModalOpen(false);
            }}
            size="icon"
            variant="tertiary"
          >
            <XIcon className="text-gray-80 h-5 w-5" />
          </Button>
          <div className="px-2 pt-2.5 antialiased" ref={elementRef}>
            <AnimatePresence
              custom={importToolView}
              initial={false}
              mode="popLayout"
            >
              <motion.div
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                initial={{ opacity: 0, scale: 0.96 }}
                key={importToolView}
                transition={{
                  duration: opacityDuration,
                  ease: [0.26, 0.08, 0.25, 1],
                }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
