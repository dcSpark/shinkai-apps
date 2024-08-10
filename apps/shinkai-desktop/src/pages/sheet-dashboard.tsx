import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { useCreateSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/createSheet/useCreateSheet';
import { useRemoveSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/removeSheet/useRemoveSheet';
import { useGetUserSheets } from '@shinkai_network/shinkai-node-state/lib/queries/getUserSheets/useGetUserSheets';
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
  Form,
  FormField,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { SheetIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { MoreHorizontal, PlusIcon, Trash2Icon } from 'lucide-react';
import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../store/auth';
import { SimpleLayout } from './layout/simple-layout';

const SheetDashboard = () => {
  const auth = useAuth((state) => state.auth);

  const { data } = useGetUserSheets({
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
      classname=""
      headerRightElement={<CreateSheetModal />}
      title={'Shinkai Sheet'}
    >
      <div className="grid gap-5 py-5 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {!!data?.length &&
          data?.map((sheet) => (
            <SheetCard
              key={sheet.uuid}
              sheetId={sheet.uuid}
              sheetName={sheet?.sheet_name ?? '-'}
            />
          ))}
        {!data?.length && (
          <div className="col-span-3 flex flex-col items-center justify-center gap-10">
            <span className="text-gray-50">
              {' '}
              No sheets found (todo: add empty state)
            </span>
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
}: {
  sheetId: string;
  sheetName: string;
}) {
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
          <SheetIcon className="h-8 w-8 text-gray-50" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="line-clamp-1">{sheetName}</span>
          <span className="text-gray-80 text-xs"> Updated 2 days ago</span>
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
                // e.preventDefault();
                setDeleteModalOpen(true);
              }}
            >
              <Trash2Icon className="size-4" />
              Delete Project
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
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="pb-0">Create Project</DialogTitle>
        <Form {...shareFolderForm}>
          <form
            className="mt-2 flex flex-col gap-6"
            onSubmit={shareFolderForm.handleSubmit(onSubmit)}
          >
            <FormField
              control={shareFolderForm.control}
              name="projectName"
              render={({ field }) => (
                <TextField autoFocus field={field} label={'Project Name'} />
              )}
            />
            <DialogFooter>
              <Button className="w-full" size="auto" type="submit">
                Create
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

  const { mutateAsync: removeSheet, isPending } = useRemoveSheet({
    onSuccess: () => {
      toast.success(`Sheet deleted successfully`);
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="pb-0">Delete this Project?</DialogTitle>
        <DialogDescription>
          This project will be deleted immediately. You can not undo this
          action.
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
                Cancel
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
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
