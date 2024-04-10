import { partial } from 'filesize';
import { Loader2, Trash, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { Button, PaperClipIcon, ScrollArea } from '../index';
import { cn } from '../utils';

const openFile = (file: File): void => {
  const fileURL = window.URL.createObjectURL(file);
  window.open(fileURL, '_blank');
  URL.revokeObjectURL(fileURL);
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
  const size = partial({ standard: 'jedec' });

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
            'dropzone py-4 bg-gray-400 group relative mt-3 flex cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-100 transition-colors hover:border-white',
        })}
      >
        <div className="flex flex-col items-center justify-center space-y-1 px-2">
          <div className="rounded-full bg-gray-300 p-2 shadow-sm">
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
            {value?.map((file, idx) => {
              const hasPreviewImage = file?.type?.includes('image/');
              return (
                <div
                  className="relative flex items-center gap-2 rounded-xl bg-gray-300 px-3 py-1.5 pr-2"
                  key={idx}
                >
                  <span className="flex w-[30px] items-center justify-center">
                    {hasPreviewImage ? (
                      <FileImagePreview
                        className="h-full rounded-md object-cover"
                        file={file}
                      />
                    ) : (
                      <PaperClipIcon className="text-gray-80 h-5 w-5" />
                    )}
                  </span>
                  <div className="flex flex-1 flex-col gap-1">
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
                      <span className="shrink-0 text-gray-100">
                        {size(file.size)}
                      </span>
                    )}
                  </div>
                  <Button
                    className="h-8 w-8 bg-transparent"
                    onClick={() => {
                      const newFiles = [...value];
                      newFiles.splice(newFiles.indexOf(file), 1);
                      onChange(newFiles);
                    }}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <Trash className="text-gray-80 h-4 w-4" />
                  </Button>
                </div>
              );
            })}
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
