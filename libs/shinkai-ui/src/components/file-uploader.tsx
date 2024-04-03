import { Trash, Upload } from 'lucide-react';
import React from 'react';
import { Accept, useDropzone } from 'react-dropzone';

import { Button, PaperClipIcon, ScrollArea } from '../index';

const FileUploader = ({
  value,
  onChange,
  maxFiles,
  accept,
  allowMultiple,
  disabled,
  descriptionText,
}: {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: Accept;
  allowMultiple?: boolean;
  disabled?: boolean;
  descriptionText?: string;
}) => {
  const { getRootProps: getRootFileProps, getInputProps: getInputFileProps } =
    useDropzone({
      multiple: allowMultiple,
      maxFiles: maxFiles,
      accept,
      onDrop: (acceptedFiles) => {
        onChange(acceptedFiles);
      },
      disabled: disabled,
    });

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        {...getRootFileProps({
          className:
            'dropzone py-4 bg-gray-400 group relative mt-3 flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-100 transition-colors hover:border-white',
        })}
      >
        <div className="flex flex-col items-center justify-center space-y-1">
          <div>
            <Upload className="h-4 w-4" />
          </div>
          <p className="text-sm text-white">Click to upload or drag and drop</p>
          {descriptionText && (
            <p className="text-gray-80 text-xs">{descriptionText}</p>
          )}
        </div>

        <input {...getInputFileProps({})} />
      </div>

      {!!value?.length && (
        <ScrollArea className="max-h-[40vh] flex-1 grow overflow-y-scroll  pr-2 [&>div>div]:!block">
          <div className="flex flex-col gap-2">
            {value?.map((file, idx) => (
              <div
                className="relative flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-1.5"
                key={idx}
              >
                <PaperClipIcon className="text-gray-100" />
                <span className="text-gray-80 flex-1 truncate text-sm">
                  {file.name}
                </span>
                <Button
                  onClick={() => {
                    const newFiles = [...value];
                    newFiles.splice(newFiles.indexOf(file), 1);
                    onChange(newFiles);
                  }}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Trash className="h-4 w-4 text-gray-100" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
export { FileUploader };
