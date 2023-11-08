import { partial } from 'filesize';
import { AnimatePresence, motion } from 'framer-motion';
import { Paperclip } from 'lucide-react';
import { ReactNode } from 'react';

import { cn } from '../../helpers/cn-utils';
import { getFileExt, getFileName } from '../../helpers/file-name-utils';

export type FileListProps = {
  files: { name: string; size?: number }[];
  actions: {
    render: ReactNode;
    onClick?: (index: number) => void;
  }[];
  className?: string;
};

export const FileList = ({ files, actions, className }: FileListProps) => {
  const size = partial({ standard: 'jedec' });
  const animations = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  };
  return (
    <ul className={cn("divide-y divide-gray-100 rounded-md border border-gray-200", className || '')}>
      <AnimatePresence>
        {files?.map((file, index) => (
          <motion.li
            {...animations}
            className="flex items-center justify-between p-2 text-sm leading-6"
            key={index}
          >
            <div className="flex w-0 flex-1 space-x-2 items-center">
              <Paperclip className="w-4 h-4"></Paperclip>
              <div className="ml-4 flex min-w-0 flex-1 gap-2 justify-between">
                <div className="flex flex-row overflow-hidden">
                  <span className="truncate font-medium">
                    {getFileName(decodeURIComponent(file.name))}
                  </span>
                  <span className="font-medium">.</span>
                  <span className="font-medium">
                    {getFileExt(decodeURIComponent(file.name))}
                  </span>
                </div>
                {file.size && (
                  <span className="flex-shrink-0 text-gray-400">
                    {size(file.size)}
                  </span>
                )}
              </div>
              <div className="flex flex-row space-x-1">
                {actions?.map((action, actionIndex) => {
                  return (
                    <div
                      key={actionIndex}
                      onClick={() => {
                        if (typeof action.onClick === 'function') {
                          action.onClick(index);
                        }
                      }}
                    >
                      {action.render}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
};
