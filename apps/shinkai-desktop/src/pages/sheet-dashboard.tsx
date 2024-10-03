import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { SheetFileFormat } from '@shinkai_network/shinkai-message-ts/api/sheet/types';
import { useCreateSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/createSheet/useCreateSheet';
import { useRemoveSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/removeSheet/useRemoveSheet';
import { useGetUserSheets } from '@shinkai_network/shinkai-node-state/lib/queries/getUserSheets/useGetUserSheets';
import { useImportSheet } from '@shinkai_network/shinkai-node-state/v2/mutations/importSheet/useImportSheet';
import {
  Button,
  buttonVariants,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  FileUploader,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { SheetFileIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { formatDistanceToNow } from 'date-fns';
import { FileUpIcon, MoreHorizontal, PlusIcon, Trash2Icon } from 'lucide-react';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../store/auth';
import { SimpleLayout } from './layout/simple-layout';

const SheetDashboard = () => {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const { isSuccess, data, isPending } = useGetUserSheets({
    nodeAddress: auth?.node_address ?? '',
    profile: auth?.profile ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  return (
    <SimpleLayout
      headerRightElement={
        isSuccess &&
        data.length > 0 && (
          <div>
            <CreateSheetModal />
            <ImportSheetModal />
          </div>
        )
      }
      title={t('sheet.label')}
    >
      <div className="grid gap-5 py-5 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {isSuccess &&
          !!data.length &&
          data?.map((sheet) => (
            <SheetCard
              key={sheet.uuid}
              sheetId={sheet.uuid}
              sheetLastUpdated={sheet?.last_updated ?? ''}
              sheetName={sheet?.sheet_name ?? '-'}
            />
          ))}
        {isPending &&
          Array.from({ length: 8 }).map((_, index) => (
            <div
              className={cn(
                buttonVariants({
                  variant: 'outline',
                  size: 'auto',
                }),
                'flex animate-pulse flex-col items-center justify-center gap-3 rounded-md bg-gray-500 p-6',
              )}
              key={index}
            >
              <div className="flex aspect-square w-full items-center justify-center rounded-sm bg-gray-600/30">
                <SheetFileIcon className="h-8 w-8 text-gray-50" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="h-4 w-24 rounded-sm bg-gray-500" />
                <span className="h-3 w-16 rounded-sm bg-gray-500" />
              </div>
            </div>
          ))}
        {isSuccess && !data.length && (
          <div className="col-span-4 flex flex-col items-center justify-center gap-3 rounded-md p-6">
            <svg
              className="h-8 w-8"
              fill="currentColor"
              height="1em"
              stroke="currentColor"
              strokeWidth="0"
              viewBox="0 0 16 16"
              width="1em"
            >
              <path d="m.5 3 .04.87a2 2 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8h1.005l.256-2.819A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2m5.672-1a1 1 0 0 1 .707.293L7.586 3H2.19q-.362.002-.683.12L1.5 2.98a1 1 0 0 1 1-.98z" />
              <path d="M13.5 9a.5.5 0 0 1 .5.5V11h1.5a.5.5 0 1 1 0 1H14v1.5a.5.5 0 1 1-1 0V12h-1.5a.5.5 0 0 1 0-1H13V9.5a.5.5 0 0 1 .5-.5" />
            </svg>
            <div className="flex flex-col items-center">
              <h2 className="text-lg font-medium">
                {t('sheet.emptyStateTitle')}
              </h2>
              <p className="text-gray-80 text-sm">
                {t('sheet.emptyStateDescription')}
              </p>
            </div>
            <CreateSheetModal />
          </div>
        )}
      </div>
    </SimpleLayout>
  );
};
export default SheetDashboard;

function SheetCard({
  sheetId,
  sheetName,
  sheetLastUpdated,
}: {
  sheetId: string;
  sheetName: string;
  sheetLastUpdated: string;
}) {
  const { t } = useTranslation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <Fragment>
      <Link
        className={cn(
          buttonVariants({
            variant: 'outline',
            size: 'auto',
          }),
          'group relative flex flex-1 cursor-pointer flex-col items-start gap-4 rounded-lg bg-gray-500 p-4 py-5 text-left transition-shadow duration-200 hover:bg-gray-500 hover:shadow-xl',
        )}
        key={sheetId}
        to={`/sheets/${sheetId}`}
      >
        <div className="flex aspect-square w-full items-center justify-center rounded-sm bg-gray-600/30">
          <SheetFileIcon className="h-8 w-8 text-gray-50" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="line-clamp-1">{sheetName}</span>
          <span className="text-gray-80 text-xs">
            Updated {formatDistanceToNow(sheetLastUpdated)}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="invisible absolute right-2 top-2 flex h-8 w-8 rounded-md bg-transparent hover:bg-gray-300 group-hover:visible data-[state=open]:visible data-[state=open]:bg-gray-300"
              size="icon"
              variant="ghost"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[80px] bg-gray-300 px-1 py-1.5"
          >
            <DropdownMenuItem
              className="flex items-center gap-2 px-4 text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteModalOpen(true);
              }}
            >
              <Trash2Icon className="size-4" />
              {t('sheet.actions.deleteProject')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Link>
      <RemoveSheetModal
        onOpenChange={setDeleteModalOpen}
        open={deleteModalOpen}
        sheetId={sheetId}
      />
    </Fragment>
  );
}

const createSheetFormSchema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
});
type CreateSheetFormSchema = z.infer<typeof createSheetFormSchema>;

function CreateSheetModal() {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const shareFolderForm = useForm<CreateSheetFormSchema>({
    resolver: zodResolver(createSheetFormSchema),
    defaultValues: {
      projectName: 'Untitled Project',
    },
  });

  const navigate = useNavigate();

  const { mutateAsync: createSheet } = useCreateSheet({
    onSuccess: (data) => {
      navigate(`/sheets/${data.data.sheet_id}`);
      toast.success('Sheet created successfully');
    },
  });

  const onSubmit = async (data: CreateSheetFormSchema) => {
    await createSheet({
      nodeAddress: auth?.node_address ?? '',
      profile: auth?.profile ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      sheetName: data.projectName,
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2" size="sm">
          <PlusIcon className="size-4" />
          {t('sheet.actions.createProject')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="pb-0">
          {t('sheet.actions.createProject')}
        </DialogTitle>
        <Form {...shareFolderForm}>
          <form
            className="mt-2 flex flex-col gap-6"
            onSubmit={shareFolderForm.handleSubmit(onSubmit)}
          >
            <FormField
              control={shareFolderForm.control}
              name="projectName"
              render={({ field }) => (
                <TextField
                  autoFocus
                  field={{ ...field, onFocus: (e) => e.currentTarget.select() }}
                  label={t('sheet.form.projectName')}
                />
              )}
            />
            <DialogFooter>
              <Button className="w-full" size="auto" type="submit">
                {t('common.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const importSheetFormSchema = z.object({
  file: z.any(),
});
type ImportSheetFormSchema = z.infer<typeof importSheetFormSchema>;

function ImportSheetModal() {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const importSheetForm = useForm<ImportSheetFormSchema>({
    resolver: zodResolver(importSheetFormSchema),
  });

  const navigate = useNavigate();

  const { mutateAsync: importSheet } = useImportSheet({
    onSuccess: (data) => {
      navigate(`/sheets/${data.sheet_id}`);
    },
  });

  const onSubmit = async (data: ImportSheetFormSchema) => {
    const fileSelected = data.file?.[0];
    const fileFormat = fileSelected?.name?.split('.')?.pop();

    await importSheet({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      file: fileSelected,
      fileFormat:
        fileFormat === SheetFileFormat.XLSX
          ? SheetFileFormat.XLSX
          : SheetFileFormat.CSV,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2" size="sm" variant="tertiary">
          <FileUpIcon className="size-4" />
          Import CSV / XLSX
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="pb-0">
          {t('sheet.actions.createProject')}
        </DialogTitle>
        <Form {...importSheetForm}>
          <form
            className="mt-2 flex flex-col gap-6"
            onSubmit={importSheetForm.handleSubmit(onSubmit)}
          >
            <FormField
              control={importSheetForm.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">{t('common.file')}</FormLabel>
                  <FormControl>
                    <FileUploader
                      accept={['csv', 'xlsx'].join(',')}
                      descriptionText={['csv', 'xlsx']?.join(' | ')}
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
              <Button className="w-full" size="auto" type="submit">
                {t('common.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function RemoveSheetModal({
  sheetId,
  open,
  onOpenChange,
}: {
  sheetId: string;

  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const auth = useAuth((state) => state.auth);
  const { t } = useTranslation();
  const { mutateAsync: removeSheet, isPending } = useRemoveSheet({
    onSuccess: () => {
      toast.success(`Sheet deleted successfully`);
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="pb-0">
          {t('sheet.actions.deleteProjectConfirmationTitle')}
        </DialogTitle>
        <DialogDescription>
          {t('sheet.actions.deleteProjectConfirmationDescription')}
        </DialogDescription>

        <DialogFooter>
          <div className="flex gap-2 pt-4">
            <DialogClose asChild className="flex-1">
              <Button
                className="min-w-[100px] flex-1"
                size="sm"
                type="button"
                variant="ghost"
              >
                {t('common.cancel')}
              </Button>
            </DialogClose>
            <Button
              className="min-w-[100px] flex-1"
              disabled={isPending}
              isLoading={isPending}
              onClick={async () => {
                await removeSheet({
                  nodeAddress: auth?.node_address ?? '',
                  profile: auth?.profile ?? '',
                  sheetId: sheetId ?? '',
                  shinkaiIdentity: auth?.shinkai_identity ?? '',
                  my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
                  my_device_identity_sk: auth?.my_device_identity_sk ?? '',
                  node_encryption_pk: auth?.node_encryption_pk ?? '',
                  profile_encryption_sk: auth?.profile_encryption_sk ?? '',
                  profile_identity_sk: auth?.profile_identity_sk ?? '',
                });
              }}
              size="sm"
            >
              {t('common.delete')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
