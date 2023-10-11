import { Paperclip } from 'lucide-react';

import { getFileExt, getFileName } from '../../helpers/file-name-utils';

export const FileList = ({ files }: { files: File[] }) => {
  return (
    <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
      {files?.map((file, index) => (
        <li
          className="flex items-center justify-between p-2 text-sm leading-6"
          key={index}
        >
          <div className="flex w-0 flex-1 items-center">
            <Paperclip className="w-4 h-4"></Paperclip>
            <div className="ml-4 flex min-w-0 flex-1 gap-2 justify-between">
              <div className="flex flex-row overflow-hidden">
                <span className="truncate font-medium">
                  {getFileName(decodeURIComponent(file.name))}
                </span>
                <span className="font-medium">.</span>
                <span className="font-medium">
                  {getFileExt(decodeURIComponent(file.name))}
                </span>
              </div>
              <span className="flex-shrink-0 text-gray-400">
                {(file.size / 1024 ** 2).toFixed(3)}mb
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
