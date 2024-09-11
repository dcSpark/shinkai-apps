import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { fileIconMap, FileTypeIcon, PaperClipIcon } from '../../assets/icons';
import { getFileExt } from '../../helpers/file';
import { cn } from '../../utils';

export type FileListProps = {
  files: { name: string; preview?: string }[];
  className?: string;
};

export const isImageFile = (file: string) => {
  return file.match(/\.(jpg|jpeg|png|gif)$/i);
};

export const FileList = ({ files, className }: FileListProps) => {
  const animations = {
    initial: { scale: 0.8, opacity: 0, y: 20 },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <ul className={cn('flex w-full flex-wrap gap-1', className)}>
      <AnimatePresence>
        {files?.map((file, index) => (
          <motion.li
            {...animations}
            className={cn(
              'flex w-full items-center justify-between p-1 text-sm leading-6',
              isImageFile(file.name) ? 'aspect-square max-w-64' : 'max-w-56',
            )}
            key={index}
          >
            {isImageFile(file.name) ? (
              <div className="flex aspect-square w-full max-w-64 items-center justify-between gap-2 overflow-hidden rounded-md">
                <img
                  alt={file.name}
                  className="h-full max-h-64 w-full max-w-full overflow-hidden rounded-lg object-cover object-center opacity-100 transition-opacity duration-300"
                  src={file.preview}
                />
              </div>
            ) : (
              <div className="flex w-full items-center justify-between gap-2 rounded-md bg-gray-200 p-2">
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
                  <span className="grow truncate break-all text-xs text-gray-50">
                    {decodeURIComponent(file.name)}
                  </span>
                )}
              </div>
            )}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
};
