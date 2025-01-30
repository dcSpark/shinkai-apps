import { DialogClose } from '@radix-ui/react-dialog';
import { save } from '@tauri-apps/plugin-dialog';
import * as fs from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
import { partial } from 'filesize';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleSlashIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import React from 'react';
import { toast } from 'sonner';

import { fileIconMap, FileTypeIcon, PaperClipIcon } from '../../assets/icons';
import { getFileExt } from '../../helpers/file';
import { cn } from '../../utils';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Button } from '../button';
import { Dialog, DialogContent } from '../dialog';
import { MarkdownText } from '../markdown-preview';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '../tooltip';

export type FileListProps = {
  files: FilePreviewProps[];
  className?: string;
};

export const isImageFile = (file: string) => {
  return file.match(/\.(jpg|jpeg|png|gif)$/i);
};

const size = partial({ standard: 'jedec' });

type FilePreviewProps = {
  name: string;
  preview?: string;
  size?: number;
  content?: string;
  blob?: Blob;
};

const ImagePreview = ({
  file,
  onFullscreen,
}: {
  file: FilePreviewProps;
  onFullscreen: (open: boolean) => void;
}) => (
  <button
    className="flex h-14 w-full min-w-[210px] max-w-[210px] shrink-0 cursor-pointer items-center gap-2 rounded-md border border-gray-100/40 py-1.5 pl-2 pr-1.5 text-left hover:bg-gray-300/30"
    onClick={() => onFullscreen(true)}
  >
    <Avatar className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-gray-300 text-gray-100 transition-colors">
      <AvatarImage
        alt={file.name}
        className="aspect-square h-full w-full rounded-sm border border-gray-400 object-cover"
        src={file.preview}
      />
      <AvatarFallback>
        <CircleSlashIcon className="h-4 w-4 text-gray-100" />
      </AvatarFallback>
    </Avatar>
    <FileInfo fileName={file.name} fileSize={file.size} />
  </button>
);

const FileInfo = ({
  fileSize,
  fileName,
}: {
  fileSize?: number;
  fileName: string;
}) => (
  <div className="text-gray-80 grid flex-1 -translate-x-px gap-1 py-0.5 text-xs leading-none">
    <div className="overflow-hidden truncate font-medium text-gray-50">
      {decodeURIComponent(fileName.split('/').at(-1) ?? '')}
    </div>
    {fileSize && (
      <div className="text-gray-80 line-clamp-1 aspect-auto font-normal">
        {size(fileSize)}
      </div>
    )}
  </div>
);

const FullscreenDialog = ({
  open,
  preview,
  fileName,
  onDownload,
  content,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  preview: string | null;
  fileName: string;
  content?: string;
  onDownload?: () => void;
}) => (
  <Dialog onOpenChange={setOpen} open={open}>
    <DialogContent className="flex size-full max-h-[99vh] max-w-[99vw] flex-col gap-2 bg-gray-600 bg-transparent p-1 py-8">
      <div className="flex w-full items-center justify-between gap-16 px-10">
        <div className="text-gray-80 max-w-3xl truncate text-left text-sm">
          {decodeURIComponent(fileName.split('/').at(-1) ?? '')}
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={onDownload} size="xs" variant="outline">
            Download
          </Button>
          <DialogClose>
            <XIcon className="text-gray-80 h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>
      </div>
      <div className="flex size-full flex-col overflow-hidden rounded-l-xl p-10 text-white">
        <FilePreviewAlternate
          content={content ?? preview ?? ''}
          extension={getFileExt(fileName)}
          fileName={fileName}
        />
      </div>
    </DialogContent>
  </Dialog>
);
const FileButton = ({
  name,
  preview,
  size,
  onFullscreen,
}: FilePreviewProps & { onFullscreen: (open: boolean) => void }) => (
  <button
    className="flex h-14 w-full min-w-[210px] max-w-[210px] shrink-0 cursor-pointer items-center gap-2 rounded-md border border-gray-100/40 py-1.5 pl-2 pr-1.5 text-left hover:bg-gray-300/30"
    onClick={() => onFullscreen(true)}
  >
    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-gray-300 text-gray-100 transition-colors">
      {fileIconMap[getFileExt(name)] ? (
        <FileTypeIcon
          className="text-gray-80 h-5 w-5"
          type={getFileExt(name)}
        />
      ) : (
        <PaperClipIcon className="text-gray-80 h-4 w-4" />
      )}
    </span>
    <FileInfo fileName={name} fileSize={size} />
  </button>
);

type FilePreviewPropsA = {
  extension: string;
  fileName: string;
  onDownload?: () => void;
  content: string | null;
};

export const FilePreviewAlternate: React.FC<FilePreviewPropsA> = ({
  content,
  extension,
  fileName,
}) => {
  if (!content) return <div>Loading preview...</div>;

  switch (extension?.toLowerCase()) {
    case 'txt':
    case 'json':
    case 'js':
    case 'ts':
    case 'log':
    case 'tsx':
    case 'jsx': {
      return (
        <pre className="h-full overflow-auto whitespace-pre-wrap break-words bg-gray-600 p-4 pt-10 font-mono text-xs">
          {content}
        </pre>
      );
    }
    case 'md': {
      return (
        <div className="h-full overflow-auto p-4 pt-10">
          <MarkdownText content={content ?? ''} />
        </div>
      );
    }
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return (
        <div className="flex h-full w-full items-center justify-center">
          <img
            alt={fileName}
            className="max-h-full max-w-full object-contain"
            src={content}
          />
        </div>
      );
    default:
      return (
        <div className="flex h-full flex-col items-center justify-center gap-6 text-gray-50">
          <span>Preview not available for this file type</span>
        </div>
      );
  }
};

export const FilePreview = ({
  name,
  preview,
  size,
  content,
  blob,
}: FilePreviewProps) => {
  const [open, setOpen] = useState(false);

  const fileName = decodeURIComponent(name).split('/').at(-1) ?? '';

  const children = isImageFile(name) ? (
    <ImagePreview
      file={{ name, preview, size, content }}
      onFullscreen={setOpen}
    />
  ) : (
    <FileButton
      content={content}
      name={name}
      onFullscreen={setOpen}
      preview={preview}
      size={size}
    />
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>{children}</div>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent className="max-w-4xl" side="top">
          <p>{fileName}</p>
        </TooltipContent>
      </TooltipPortal>
      <FullscreenDialog
        content={content}
        fileName={name}
        onDownload={async () => {
          const currentFile =
            blob ??
            new Blob([content ?? ''], {
              type: 'application/octet-stream',
            });
          const arrayBuffer = await currentFile.arrayBuffer();
          const currentContent = new Uint8Array(arrayBuffer);
          const savePath = await save({
            defaultPath: fileName,
            filters: [
              {
                name: 'File',
                extensions: [getFileExt(name)],
              },
            ],
          });
          if (!savePath) {
            toast.info('File saving cancelled');
            return;
          }

          await fs.writeFile(savePath, currentContent, {
            baseDir: BaseDirectory.Download,
          });

          toast.success(`${fileName} downloaded successfully`);
        }}
        open={open}
        preview={preview ?? ''}
        setOpen={setOpen}
      />
    </Tooltip>
  );
};

const animations = {
  initial: { scale: 0.97, opacity: 0, y: 10 },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
      mass: 0.8,
      velocity: 1,
      duration: 0.6,
    },
  },
  exit: {
    scale: 0.97,
    opacity: 0,
    y: -10,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 15,
      duration: 0.4,
    },
  },
};

export const FileList = ({ files, className }: FileListProps) => {
  return (
    <ul className={cn('flex flex-wrap gap-3', className)}>
      <AnimatePresence>
        {files?.map((file, index) => (
          <motion.li {...animations} key={index}>
            <FilePreview {...file} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
};
