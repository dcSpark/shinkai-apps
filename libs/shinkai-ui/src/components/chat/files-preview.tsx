import { partial } from 'filesize';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import React, { ReactNode, useEffect, useState } from 'react';

import { PaperClipIcon } from '../../assets/icons';
import { getFileExt, getFileName } from '../../helpers/file';
import { cn } from '../../utils';

export type FileListProps = {
  files: ({ name: string; size?: number } | File)[];
  actions: {
    render: ReactNode;
    onClick?: (index: number) => void;
  }[];
  className?: string;
};

interface FileImagePreview extends React.HTMLAttributes<HTMLDivElement> {
  file: File;
}

const FileImagePreview = ({ file, ...props }: FileImagePreview) => {
  const [imageSrc, setImageSrc] = useState('');
  useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      function () {
        setImageSrc(reader.result as string);
      },
      false,
    );
    if (file) {
      reader.readAsDataURL(file);
    }
  }, [file]);
  return imageSrc ? (
    <img alt="preview" src={imageSrc} {...props} />
  ) : (
    <Loader2 />
  );
};
export const FileList = ({ files, actions, className }: FileListProps) => {
  const size = partial({ standard: 'jedec' });
  const animations = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 },
  };
  const hasPreview = (file: File): boolean => {
    return file?.type?.includes('image/');
  };
  const getFilePreview = (file: File): ReactNode | undefined => {
    if (file?.type?.includes('image/')) {
      return (
        <FileImagePreview
          className="h-full rounded-lg object-cover"
          file={file}
        />
      );
    }
  };
  return (
    <ul
      className={cn(
        'divide-y divide-gray-100 rounded-md border border-gray-100',
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
            <div className="flex w-full flex-col space-y-2 overflow-hidden">
              {file instanceof File && hasPreview(file) && (
                <div className="h-10 self-center">{getFilePreview(file)}</div>
              )}
              <div className="flex min-w-0 flex-1 flex-row items-center justify-between gap-2">
                <PaperClipIcon className="h-4 w-4 text-gray-100" />
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
                  {file.size && (
                    <span className="w-[70px] shrink-0 text-center text-gray-200">
                      {size(file.size)}
                    </span>
                  )}
                  <div className="flex flex-row items-center space-x-1">
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
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
};
