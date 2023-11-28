import { ExternalLink, Trash, Upload } from 'lucide-react';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { cn } from '../../helpers/cn-utils';
import { getFileExt } from '../../helpers/file-name-utils';
import { FileList } from '../file-list/file-list';

export type FileInputProps = {
  value: File[];
  extensions?: string[];
  openExternal?: boolean;
  multiple?: boolean;
  onFilesAdded?: (files: File[]) => void;
  onFileRemoved?: (file: File, index: number) => void;
  onValueChange?: (files: File[]) => void;
};

export const FileInput = ({
  value,
  extensions,
  multiple,
  onFilesAdded: onFileAdded,
  onFileRemoved,
  onValueChange: onValueChanged,
}: FileInputProps) => {
  const files = useRef<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [, updateState] = useState<number>(0);
  const forceUpdate = useCallback(() => updateState(Date.now()), []);
  const onAddFiles = (event: ChangeEvent<HTMLInputElement>): void => {
    const filesAdded = Array.from(event?.target?.files || []);
    files.current = [...files.current, ...filesAdded];
    if (typeof onFileAdded === 'function') {
      onFileAdded(filesAdded);
    }
    if (typeof onValueChanged === 'function') {
      onValueChanged(files.current);
    }
  };
  const removeFile = (index: number): void => {
    const file = files.current[index];
    // Warn: We are mutating files
    files.current.splice(index, 1);
    if (typeof onFileRemoved === 'function') {
      onFileRemoved(file, index);
    }
    if (typeof onValueChanged === 'function') {
      onValueChanged(files.current);
    }
  };
  const openFile = (index: number): void => {
    const file = files.current[index];
    const fileURL = window.URL.createObjectURL(file);
    window.open(fileURL, '_blank');
    URL.revokeObjectURL(fileURL);
  };
  const isAccepted = (file: File): boolean => {
    return !!extensions?.includes(`.${getFileExt(file.name)}`);
  };
  const onDropFiles = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    let draggedFiles: File[] = [];
    if (event.dataTransfer.items) {
      Array.from(event.dataTransfer.items || []).forEach((item, i) => {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (!file) {
            return;
          }
          draggedFiles.push(file);
        }
      });
    } else {
      draggedFiles.push(...Array.from(event.dataTransfer.files || []));
    }
    draggedFiles = draggedFiles.filter((file) => isAccepted(file));
    files.current = [...files.current, ...draggedFiles];
    if (typeof onFileAdded === 'function') {
      onFileAdded(draggedFiles);
    }
    if (typeof onValueChanged === 'function') {
      onValueChanged(files.current);
    }
  };
  const onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };
  useEffect(() => {
    files.current = value;
    forceUpdate();
  }, [value, forceUpdate]);
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center justify-center">
        <label
          className={cn(
            'flex h-[100px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-100 bg-gray-400 p-2',
            isDragging && 'border-solid',
          )}
          htmlFor="dropzone-file"
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onDragOver={(event) => onDragOver(event)}
          onDrop={(event) => onDropFiles(event)}
        >
          <div
            className={cn(
              'flex w-full flex-col items-center justify-center space-y-1',
              isDragging && 'pointer-events-none',
            )}
          >
            <div>
              <Upload
                className={cn('h-4 w-4', isDragging && 'animate-pulse')}
              />
            </div>
            <p className="text-sm text-white">
              <FormattedMessage id="click-to-upload" />
            </p>
            <p className="w-full truncate text-xs text-gray-100">
              {extensions?.join(' | ')}
            </p>
          </div>
          <input
            accept={extensions?.join(',')}
            alt="files input"
            className="hidden"
            id="dropzone-file"
            multiple={multiple}
            onChange={(event) => onAddFiles(event)}
            type="file"
          />
        </label>
      </div>

      {!!files?.current.length && (
        <FileList
          actions={[
            {
              render: <ExternalLink className="h-4 w-4 cursor-pointer" />,
              onClick: (file) => openFile(file),
            },
            {
              render: <Trash className="h-4 w-4 cursor-pointer" />,
              onClick: (index) => removeFile(index),
            },
          ]}
          files={files.current}
        />
      )}
    </div>
  );
};
