import { partial } from 'filesize';
import { Loader2, Trash, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { fileIconMap,FileTypeIcon, PaperClipIcon } from '../assets';
import { getFileExt } from '../helpers/file';
import { cn } from '../utils';
import { Button } from './button';
import { ScrollArea } from './scroll-area';

const openFile = (file: File): void => {
  const fileURL = window.URL.createObjectURL(file);
  window.open(fileURL, '_blank');
  URL.revokeObjectURL(fileURL);
};

export const FileItem = ({
  file,
  actions,
}: {
  file: File;
  actions?: {
    label: string;
    icon: React.ReactNode;
    onClick: (file: File) => void;
  }[];
}) => {
  const size = partial({ standard: 'jedec' });
  const hasPreviewImage = file?.type?.includes('image/');

  return (
    <div className="bg-gray-350 relative flex items-center gap-2 rounded-xl px-3 py-1.5 pr-2">
      <span className="flex w-[30px] items-center justify-center">
        {hasPreviewImage ? (
          <FileImagePreview
            className="h-full rounded-md object-cover"
            file={file}
          />
        ) : fileIconMap[getFileExt(file.name)] ? (
          <FileTypeIcon
            className="text-gray-80 "
            type={getFileExt(file.name)}
          />
        ) : (
          <PaperClipIcon className="text-gray-80 h-4 w-4" />
        )}
      </span>
      <div className="line-clamp-1 flex flex-1 flex-col gap-1">
        <button
          className="text-left hover:underline"
          onClick={() => openFile(file)}
          type="button"
        >
          <span className="line-clamp-1 text-sm text-gray-50">
            {decodeURIComponent(file.name)}
          </span>
        </button>
        {file.size && (
          <span className="shrink-0 text-xs text-gray-100">
            {size(file.size)}
          </span>
        )}
      </div>
      {!!actions?.length && (
        <div className="shrink-0">
          {actions?.map((action) => (
            <Button
              className="h-8 w-8 bg-transparent"
              key={action.label}
              onClick={() => action.onClick(file)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <span className="sr-only">{action.label}</span>
              {action.icon}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export const FileUploader = ({
  value,
  onChange,
  maxFiles,
  accept,
  allowMultiple,
  disabled,
  descriptionText,
  shouldDisableScrolling,
}: {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  allowMultiple?: boolean;
  disabled?: boolean;
  descriptionText?: string;
  shouldDisableScrolling?: boolean;
}) => {
  const { getRootProps: getRootFileProps, getInputProps: getInputFileProps } =
    useDropzone({
      multiple: allowMultiple,
      maxFiles: maxFiles,
      onDrop: (acceptedFiles) => {
        onChange(acceptedFiles);
      },
      disabled: disabled,
    });

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div
        {...getRootFileProps({
          className:
            'dropzone py-4 bg-gray-400 group relative mt-3 flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-200 transition-colors hover:border-gray-100',
        })}
      >
        <div className="flex flex-col items-center justify-center space-y-1 px-2">
          <div className="bg-gray-350 rounded-full p-2 shadow-sm">
            <Upload className="h-4 w-4" />
          </div>
          <p className="text-sm text-white">Click to upload or drag and drop</p>
          {descriptionText && (
            <p className="text-gray-80 line-clamp-1 text-xs">
              {descriptionText}
            </p>
          )}
        </div>

        <input
          {...getInputFileProps({
            accept: accept,
          })}
        />
      </div>

      {!!value?.length && (
        <ScrollArea
          className={cn(
            'max-h-[40vh] flex-1 grow overflow-y-scroll pr-1 [&>div>div]:!block',
            shouldDisableScrolling && 'max-h-full pr-0',
          )}
        >
          <div className="flex flex-col gap-2">
            {value?.map((file, idx) => (
              <FileItem
                actions={[
                  {
                    label: 'Delete',
                    icon: <Trash className="text-gray-80 h-4 w-4" />,
                    onClick: (file) => {
                      const newFiles = [...value];
                      newFiles.splice(newFiles.indexOf(file), 1);
                      onChange(newFiles);
                    },
                  },
                ]}
                file={file}
                key={file.name + idx}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
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
