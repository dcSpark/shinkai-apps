import { NodeFile } from '@shinkai_network/shinkai-node-state/lib/queries/getNodeFiles/types';
import { useGetNodeFiles } from '@shinkai_network/shinkai-node-state/lib/queries/getNodeFiles/useGetNodeFiles';
import {
  Badge,
  Button,
  DirectoryTypeIcon,
  FileTypeIcon,
} from '@shinkai_network/shinkai-ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

import { Header } from '../header/header';

export default function NodeFiles() {
  const { nodeFiles } = useGetNodeFiles();
  const prevActiveFileBranch = React.useRef<NodeFile[][]>([]);
  const [activeFileBranch, setActiveFileBranch] = React.useState<NodeFile[]>(
    [],
  );

  React.useEffect(() => {
    setActiveFileBranch(nodeFiles ?? []);
  }, [nodeFiles]);

  return (
    <div className="flex h-full flex-col space-y-3 overflow-hidden">
      <Header title={'Node Files'} />
      {prevActiveFileBranch.current.length > 0 && (
        <Button
          onClick={() => {
            setActiveFileBranch(prevActiveFileBranch.current.pop() || []);
          }}
          size={'icon'}
          variant="ghost"
        >
          <ChevronLeft />
        </Button>
      )}
      <div className="flex flex-col divide-y divide-gray-400">
        {activeFileBranch.map((file, index: number) => {
          return (
            <button
              className="flex items-center justify-between gap-2 py-3 hover:bg-gray-400"
              key={index}
              onClick={() => {
                if (file.type === 'folder') {
                  prevActiveFileBranch.current.push(activeFileBranch);
                  setActiveFileBranch(file.items || []);
                } else {
                  //open modal page to details
                }
              }}
            >
              <div>
                {file.type === 'folder' ? (
                  <DirectoryTypeIcon />
                ) : (
                  <FileTypeIcon />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-base font-medium">
                  {file.name}
                  {file.type === 'file' && (
                    <Badge className="text-gray-80 ml-2 bg-gray-400 text-xs uppercase">
                      {file.file_extension?.split('.').pop()}
                    </Badge>
                  )}
                </div>
                {file.type === 'file' ? (
                  <p className="text-sm text-gray-100">
                    <span>
                      {new Date(file.creation_date).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                    </span>{' '}
                    - <span>{file.size}</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-100">
                    <span>
                      {new Date(file.creation_date).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        },
                      )}
                    </span>{' '}
                    - <span>{file?.items?.length} files</span>
                  </p>
                )}
              </div>
              <ChevronRight />
            </button>
          );
        })}
      </div>
    </div>
  );
}
