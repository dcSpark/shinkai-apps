import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { fileIconMap, FileTypeIcon, PaperClipIcon } from '../../assets/icons';
import { getFileExt } from '../../helpers/file';
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
            className="flex w-full items-center justify-between p-2 text-sm leading-6"
            key={index}
          >
            <div className="flex w-full flex-1 items-center justify-between gap-2">
              {fileIconMap[getFileExt(file.name)] ? (
                <FileTypeIcon
                  className="text-gray-80 h-5 w-5"
                  type={getFileExt(file.name)}
                />
              ) : (
                <PaperClipIcon className="text-gray-80 h-4 w-4" />
              )}
              {getFileExt(decodeURIComponent(file.name)) === 'html' ? (
                <a
                  className="text-gray-80 grow truncate break-all font-medium underline transition-colors hover:text-gray-50"
                  href={decodeURIComponent(file.name).split('.html')[0]}
                  rel="noreferrer"
                  target="_blank"
                >
                  {decodeURIComponent(file.name)}
                </a>
              ) : (
                <span className="text-gray-80 grow truncate break-all  font-medium">
                  {decodeURIComponent(file.name)}
                </span>
              )}
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
};
