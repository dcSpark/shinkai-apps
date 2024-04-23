import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  TreePassThroughMethodOptions,
  TreePassThroughOptions,
} from 'primereact/tree';

export const allowedFileExtensions = [
  '.eml',
  '.html',
  '.mhtml',
  '.json',
  '.md',
  '.msg',
  '.rst',
  '.rtf',
  '.txt',
  '.xml',
  '.jpeg',
  '.png',
  '.csv',
  '.doc',
  '.docx',
  '.epub',
  '.odt',
  '.pdf',
  '.ppt',
  '.pptx',
  '.tsv',
  '.xlsx',
  '.jobkai',
  '.vrkai',
  '.vrpack',
];

export const treeOptions: TreePassThroughOptions = {
  root: {
    className: cn(
      '',
      'my-3 w-full rounded-md border border-gray-400 bg-transparent p-0 text-white',
    ),
  },
  label: { className: 'text-white text-sm line-clamp-1 break-all' },
  container: {
    className: 'm-0 p-0 list-none overflow-auto',
  },
  node: { className: 'p-0 outline-none' },
  content: {
    className: cn(
      'text-gray-80 mb-1 rounded-lg bg-transparent p-1 shadow-none hover:bg-gray-400 hover:text-white',
      'cursor-pointer select-none',
    ),
  },
  toggler: ({ context }: TreePassThroughMethodOptions) => ({
    className: cn(
      'relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center overflow-hidden',
      'mr-2 h-8 w-8 rounded-full border-0 bg-transparent transition duration-200',
      context.selected
        ? 'text-blue-600 hover:bg-white/30'
        : 'hover:text-gray-80 text-white hover:bg-gray-400',
      // @ts-expect-error - TS doesn't know about the isLeaf property
      context.isLeaf && 'invisible',
    ),
  }),
  nodeIcon: { className: 'mr-2 text-gray-50' },
  subgroup: {
    className: cn('m-0 list-none', 'space-y-1 p-0 pl-4'),
  },
};
