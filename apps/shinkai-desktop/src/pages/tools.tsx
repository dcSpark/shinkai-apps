import { useGetToolsList } from '@shinkai_network/shinkai-node-state/lib/queries/getToolsList/useGetToolsList';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Edit3Icon, Trash2Icon } from 'lucide-react';

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

  return (
    <SubpageLayout title={'Shinkai Tools'}>
      <div className="flex grow flex-col space-y-2 overflow-hidden">
        {toolsList?.map((tool) => (
          <div
            className={cn(
              'group relative flex min-h-[70px] w-full flex-col gap-1 rounded-sm px-3 py-2.5 pr-8 text-left text-sm hover:bg-gray-300',
            )}
            key={tool.name}
            // onClick={() => {
            //   setWorkflowSelected(workflow);
            //   setWorkflowSelectionDrawerOpen(false);
            //   onSelectWorkflow?.(workflow);
            // }}
            role="button"
            tabIndex={0}
          >
            <div className="absolute right-1 top-1 flex translate-x-[150%] items-center gap-0.5 transition duration-200 group-hover:translate-x-0">
              <button
                className="text-gray-80 rounded-full p-2 transition-colors hover:bg-gray-400 hover:text-white"
                onClick={(event) => {
                  event.stopPropagation();
                  // setSelectedWorkflowEdit(workflow);
                }}
                type="button"
              >
                <Edit3Icon className="h-4 w-4" />
              </button>

              <button
                className="text-gray-80 rounded-full p-2 transition-colors hover:bg-gray-400 hover:text-white"
                onClick={async (event) => {
                  event.stopPropagation();
                  // await removeWorkflow({
                  //   profile: auth?.profile ?? '',
                  //   nodeAddress: auth?.node_address ?? '',
                  //   shinkaiIdentity: auth?.shinkai_identity ?? '',
                  //   workflowKey: `${workflow.name}:::${workflow.version}`,
                  //   my_device_encryption_sk:
                  //     auth?.profile_encryption_sk ?? '',
                  //   my_device_identity_sk:
                  //     auth?.profile_identity_sk ?? '',
                  //   node_encryption_pk: auth?.node_encryption_pk ?? '',
                  //   profile_encryption_sk:
                  //     auth?.profile_encryption_sk ?? '',
                  //   profile_identity_sk: auth?.profile_identity_sk ?? '',
                  // });
                }}
                type="button"
              >
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
            <span className="text-sm font-medium">
              {formatWorkflowName(tool.name)}{' '}
              {/*{workflowSelected?.name === workflow.name && (*/}
              {/*  <Badge*/}
              {/*    className="bg-brand ml-2 text-gray-50"*/}
              {/*    variant="default"*/}
              {/*  >*/}
              {/*    Selected*/}
              {/*  </Badge>*/}
              {/*)}*/}
            </span>
            <p className="text-gray-80 text-xs">{tool.description}</p>
          </div>
        ))}
      </div>
    </SubpageLayout>
  );
};
