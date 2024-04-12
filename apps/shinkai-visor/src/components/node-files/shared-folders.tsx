import { useGetMySharedFolders } from '@shinkai_network/shinkai-node-state/lib/queries/getMySharedFolders/useGetMySharedFolders';
import { ScrollArea, SharedFolderIcon } from '@shinkai_network/shinkai-ui';
import React from 'react';

import { formatDateToUSLocaleString } from '../../helpers/date';
import { useAuth } from '../../store/auth/auth';

export default function SharedFolders() {
  const auth = useAuth((state) => state.auth);
  const { data: sharedFolders } = useGetMySharedFolders({
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
    <div>
      <ScrollArea>
        <div className="grid flex-1 grid-cols-1 divide-y divide-gray-400">
          {sharedFolders?.map((folder) => (
            <div
              className="flex items-center justify-between gap-2 truncate px-2 py-3.5 hover:bg-gray-400"
              key={folder.path}
            >
              <SharedFolderIcon />
              <div className="flex-1 truncate text-left">
                <div className="truncate text-sm font-medium">
                  {folder.path.replace(/\//g, '')}
                </div>
                <p className="text-xs font-medium text-gray-100">
                  <span>
                    {formatDateToUSLocaleString(
                      new Date(folder?.tree?.last_modified ?? ''),
                    )}
                  </span>{' '}
                  -{' '}
                  <span>
                    {Object.keys(folder.tree.children || {}).length} items
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
