import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { PaperClipIcon } from '../../assets/icons';
import { getFileExt, getFileName } from '../../helpers/file';
import { cn } from '../../utils';

export type FileListProps = {
  files: { name: string }[];
  className?: string;
};

export const FileList = ({ files, className }: FileListProps) => {
  const animations = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  };

  return (
    <ul
      className={cn(
        'divide-y divide-gray-100 rounded-md border border-gray-200',
        className,
      )}
    >
      <AnimatePresence>
        {files?.map((file, index) => (
          <motion.li
            {...animations}
            className="flex items-center justify-between p-2 text-sm leading-6"
            key={index}
          >
            <div className="flex min-w-0 flex-1 flex-row items-center justify-between gap-2">
              <PaperClipIcon className="text-gray-80" />
              {getFileExt(decodeURIComponent(file.name)) === 'html' ? (
                <a
                  className="text-gray-80 grow truncate font-medium underline transition-colors hover:text-gray-50"
                  href={decodeURIComponent(file.name).split('.html')[0]}
                  rel="noreferrer"
                  target="_blank"
                >
                  {getFileName(decodeURIComponent(file.name))}
                </a>
              ) : (
                <span className="text-gray-80 grow truncate font-medium">
                  {getFileName(decodeURIComponent(file.name))}
                </span>
              )}
              <div className="flex shrink-0 flex-row space-x-1 overflow-hidden">
                <span className="text-gray-80 w-[40px] rounded-md bg-gray-200 px-1 text-center text-[10px] font-medium uppercase">
                  {getFileExt(decodeURIComponent(file.name))}
                </span>
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
};
