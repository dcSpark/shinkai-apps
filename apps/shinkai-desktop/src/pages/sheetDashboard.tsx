import { useCreateSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/createSheet/useCreateSheet';
import { useRemoveSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/removeSheet/useRemoveSheet';
import { useGetUserSheets } from '@shinkai_network/shinkai-node-state/lib/queries/getUserSheets/useGetUserSheets';
import {
  Button,
  buttonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shinkai_network/shinkai-ui';
import { SheetIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { MoreVertical, PlusIcon, Trash2Icon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../store/auth';
import { SimpleLayout } from './layout/simple-layout';

const SheetDashboard = () => {
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
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

  const { mutateAsync: createSheet } = useCreateSheet({
    onSuccess: (data) => {
      navigate(`/sheets/${data.data.sheet_id}`);
    },
  });
  const { mutateAsync: removeSheet } = useRemoveSheet();

  return (
    <SimpleLayout
      classname=""
      headerRightElement={
        <Button
          onClick={() => {
            createSheet({
              nodeAddress: auth?.node_address ?? '',
              profile: auth?.profile ?? '',
              shinkaiIdentity: auth?.shinkai_identity ?? '',
              sheetName: 'Untitled Project',
              my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
              my_device_identity_sk: auth?.my_device_identity_sk ?? '',
              node_encryption_pk: auth?.node_encryption_pk ?? '',
              profile_encryption_sk: auth?.profile_encryption_sk ?? '',
              profile_identity_sk: auth?.profile_identity_sk ?? '',
            });
          }}
          size="sm"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Sheet
        </Button>
      }
      title={'Shinkai Sheet'}
    >
      <div className="grid grid-cols-3 gap-4 py-5">
        {data?.map((sheet) => (
          <Link
            className={cn(
              buttonVariants({
                variant: 'outline',
                size: 'auto',
              }),
              'group relative flex flex-1 cursor-pointer flex-col items-start gap-3 overflow-hidden rounded-lg bg-gray-500 pb-6 pr-8 pt-8 text-left hover:bg-gray-500',
            )}
            key={sheet.uuid}
            to={`/sheets/${sheet.uuid}`}
          >
            <SheetIcon className="transition-transform duration-200 group-hover:-translate-y-0.5" />
            <span>{sheet?.sheet_name ?? '-'}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="absolute right-2 top-2 h-8 w-8 rounded-md bg-gray-300 hover:bg-gray-400"
                  size="icon"
                  variant="ghost"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[80px] bg-gray-300 px-1 py-1.5"
              >
                <DropdownMenuItem
                  className="gap-2 px-4 text-red-400"
                  onClick={(event) => {
                    event.preventDefault();
                    removeSheet({
                      nodeAddress: auth?.node_address ?? '',
                      profile: auth?.profile ?? '',
                      sheetId: sheet.uuid,
                      shinkaiIdentity: auth?.shinkai_identity ?? '',
                      my_device_encryption_sk:
                        auth?.my_device_encryption_sk ?? '',
                      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
                      node_encryption_pk: auth?.node_encryption_pk ?? '',
                      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
                      profile_identity_sk: auth?.profile_identity_sk ?? '',
                    });
                  }}
                >
                  <Trash2Icon className="size-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Link>
        ))}
      </div>
    </SimpleLayout>
  );
};
export default SheetDashboard;
