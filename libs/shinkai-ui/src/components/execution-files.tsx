import { DialogClose } from '@radix-ui/react-dialog';
import { useGetShinkaiFileProtocol } from '@shinkai_network/shinkai-node-state/v2/queries/getShinkaiFileProtocol/useGetShinkaiFileProtocol';
import { save } from '@tauri-apps/plugin-dialog';
import * as fs from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
import { FileTypeIcon, LoaderIcon, Paperclip, XIcon } from 'lucide-react';
import { useEffect,useState } from 'react';
import { toast } from 'sonner';

import { fileIconMap } from '../assets/icons/file';
import { cn } from '../utils';
import { Button } from './button';
import { Dialog, DialogContent, DialogTrigger } from './dialog';

// TODO: Find a better way to inject auth details without prop drilling or depending on a specific store structure
// This is a temporary workaround. Ideally, context or a shared service should provide auth.
interface AuthDetails {
  node_address?: string;
  api_v2_key?: string;
}

interface ExecutionFilesProps extends React.HTMLAttributes<HTMLDivElement> {
  files: string[];
  auth: AuthDetails;
}

export function ExecutionFiles({
  files,
  auth,
  className,
  ...props
}: ExecutionFilesProps) {
  if (!files || files.length === 0) {
    return null;
  }

  return (
    <div
      className={cn('mt-4 flex flex-col items-start gap-1', className)}
      {...props}
    >
      <span className="text-gray-80 text-xs">Generated Files</span>
      <div className="mt-2 flex w-full flex-wrap gap-2">
        {files.map((filePath) => (
          <ToolResultFileCard auth={auth} filePath={filePath} key={filePath} />
        ))}
      </div>
    </div>
  );
}

// Helper to get file extension
const getFileExt = (fileName: string): string => {
  return fileName?.split('.').pop()?.toLowerCase() ?? '';
};

// Simple Preview Renderer (can be expanded)
const FilePreviewRenderer = ({
  blob,
  fileName,
}: {
  blob: Blob | null;
  fileName: string;
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);

  const fileType = blob?.type ?? '';
  const extension = getFileExt(fileName);
  const isTextPreviewable = fileType.startsWith('text/') || ['json', 'log', 'txt', 'md', 'py', 'js', 'ts', 'tsx', 'jsx', 'html', 'css'].includes(extension);
  const isImagePreviewable = fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension);
  const isVideoPreviewable = fileType.startsWith('video/') || ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(extension);
  const isAudioPreviewable = fileType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma', 'm4b', 'm4p', 'm4b', 'm4p'].includes(extension);
  
  console.log('fileType', fileType);
  console.log('extension', extension);
  console.log('isTextPreviewable', isTextPreviewable);
  console.log('isImagePreviewable', isImagePreviewable);
  console.log('isVideoPreviewable', isVideoPreviewable);
  console.log('isAudioPreviewable', isAudioPreviewable);  
  
  useEffect(() => {
    if (blob && (isImagePreviewable || isVideoPreviewable || isAudioPreviewable)) {
      const url = URL.createObjectURL(blob);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url); // Clean up object URL
    }
    setObjectUrl(null);
  }, [blob, isImagePreviewable, isVideoPreviewable, isAudioPreviewable]);

  useEffect(() => {
    if (blob && isTextPreviewable) {
      setIsLoadingText(true);
      setTextContent(null);
      blob
        .text()
        .then(setTextContent)
        .catch(() => setTextContent('Error reading file content.'))
        .finally(() => setIsLoadingText(false));
    } else {
      setTextContent(null);
      setIsLoadingText(false);
    }
  }, [blob, isTextPreviewable]);

  if (!blob) {
    return <div className="text-center text-gray-400">No content to display.</div>;
  }

  if (isImagePreviewable && objectUrl) {
    return (
      <img
        alt={fileName}
        className="max-h-[80vh] max-w-full object-contain"
        src={objectUrl}
      />
    );
  }

  if (isVideoPreviewable && objectUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <video className="max-h-[80vh] max-w-full" controls src={objectUrl}>
            Your browser does not support the video tag.
          </video>
        </div>
    );
  }

  if (isAudioPreviewable && objectUrl) {
    return (
        <div className="flex h-full w-full items-center justify-center">
          <audio className="w-full" controls src={objectUrl}>
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

  if (isTextPreviewable) {
    if (isLoadingText) {
       return (
        <div className="flex items-center justify-center text-gray-400">
          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" /> Loading preview...
        </div>
      );
    }

    return (
      <pre className="max-h-[80vh] overflow-auto whitespace-pre-wrap break-words bg-gray-700 p-4 text-xs text-gray-50">
        {textContent ?? 'Unable to load text content.'}
      </pre>
    );
  }

  return <div className="text-center text-gray-400">Preview not available for this file type.</div>;
};

function ToolResultFileCard({
  filePath,
  auth,
}: {
  filePath: string;
  auth: AuthDetails;
}) {
  const [open, setOpen] = useState(false);
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep hook disabled, refetch manually
  const { refetch, isFetching } = useGetShinkaiFileProtocol(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      file: filePath,
    },
    {
      enabled: false, // Keep disabled initially
      retry: 1, // Don't retry endlessly on error
    },
  );

  const fileName = filePath.split('/').pop() ?? 'unknown_file';
  const fileExtension = getFileExt(fileName);
  const fileIcon = fileExtension && fileIconMap[fileExtension];

  const handleOpenPreview = async () => {
    if (fileBlob) { // Already fetched
      setOpen(true);
      return;
    }
    setIsLoading(true);
    setError(null);
    setFileBlob(null);
    try {
      const { data, isError, error: fetchError } = await refetch();
      if (isError || !data) {
        console.error('Error fetching file for preview:', fetchError);
        setError(
          (fetchError as any)?.message || 'Failed to fetch file data.',
        );
        setFileBlob(null);
      } else {
        setFileBlob(data as Blob); // Assuming data is Blob
        setError(null);
        setOpen(true); // Open dialog only on success
      }
    } catch (err: any) {
      console.error('Exception fetching file for preview:', err);
      setError(err?.message || 'An unexpected error occurred.');
      setFileBlob(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      let blobToSave = fileBlob;
      // Fetch if not already fetched for preview
      if (!blobToSave) {
        setIsLoading(true); // Show loading on button maybe?
        const { data, isError, error: fetchError } = await refetch();
         if (isError || !data) {
            toast.error('Failed to fetch file for download.', { description: (fetchError as any)?.message });
            setIsLoading(false);
            return;
         }
         blobToSave = data as Blob;
         setFileBlob(blobToSave); // Cache for potential preview later
         setIsLoading(false);
      }

      if (!blobToSave) {
        toast.error('No file data available to download.');
        return;
      }

      const arrayBuffer = await blobToSave.arrayBuffer();
      const content = new Uint8Array(arrayBuffer);

      const savePath = await save({
        defaultPath: fileName,
        filters: [{ name: 'File', extensions: [fileExtension] }],
      });

      if (!savePath) {
        toast.info('File saving cancelled.');
        return;
      }

      await fs.writeFile(savePath, content, { baseDir: BaseDirectory.Download });
      toast.success(`${fileName} downloaded successfully`);

    } catch (err: any) {
      console.error('Error downloading file:', err);
      toast.error('Failed to download file.', {
        description: err?.message || 'An unknown error occurred.',
      });
       setIsLoading(false); // Ensure loading state is reset on error
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          className="flex max-w-[200px] justify-start gap-2"
          disabled={isLoading || isFetching}
          isLoading={isLoading || isFetching} // Show loading state on button
          onClick={handleOpenPreview} // Trigger fetch and open
          rounded="lg"
          size="xs"
          title={`Preview ${fileName}`} // Add tooltip title
          variant="outline"
        >
          <div className="flex shrink-0 items-center">
            {fileIcon ? (
              <img
                alt={fileExtension}
                className="h-[18px] w-[18px] shrink-0"
                src={fileIcon}
              />
            ) : (
              <Paperclip className="text-gray-80 h-3.5 w-3.5 shrink-0" />
            )}
          </div>
          <div className="truncate text-left text-xs">{fileName}</div>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-auto max-h-[95vh] min-h-[300px] w-auto min-w-[400px] max-w-[95vw] flex-col gap-2 p-4">
         {/* Header */}
         <div className="flex items-center justify-between border-b border-gray-600 pb-2">
           <span className="truncate text-sm font-medium text-gray-100" title={fileName}>
             {fileName}
           </span>
           <DialogClose asChild>
             <Button className="h-6 w-6 text-gray-400 hover:text-gray-100" size="icon" variant="ghost">
               <XIcon className="h-4 w-4" />
             </Button>
           </DialogClose>
         </div>

         {/* Content / Preview Area */}
         <div className="flex flex-1 items-center justify-center overflow-auto py-4">
           {error ? (
             <div className="text-center text-red-400">Error: {error}</div>
           ) : (
             <FilePreviewRenderer blob={fileBlob} fileName={fileName} />
           )}
         </div>

         {/* Footer / Download Button */}
         <div className="flex justify-end border-t border-gray-600 pt-2">
           <Button
             disabled={isLoading || isFetching} // Disable while fetching
             onClick={handleDownload}
             size="sm"
             variant="outline"
            // Consider adding loading state to download button too if fetch happens here
           >
             Download
           </Button>
         </div>
      </DialogContent>
    </Dialog>
  );
}