import ReactMarkdownPreview from '@uiw/react-markdown-preview';
import type { RehypeRewriteOptions } from 'rehype-rewrite';
import rehypeRewrite from 'rehype-rewrite';
import { PluggableList } from 'unified';

import { cn } from '../utils';

const rehypePlugins: PluggableList = [
  [
    rehypeRewrite,
    {
      rewrite: (node, index, parent) => {
        if (
          node.type === 'element' &&
          node.tagName === 'a' &&
          parent &&
          parent.type === 'element' &&
          /^h([123456])/.test(parent.tagName)
        ) {
          parent.children = [parent.children[1]];
        }
      },
    } as RehypeRewriteOptions,
  ],
];

export const MarkdownPreview = ({
  className,
  source,
  components,
}: {
  className?: string;
  source?: string;
  components?: Parameters<typeof ReactMarkdownPreview>[0]['components'];
}) => {
  return (
    <ReactMarkdownPreview
      className={cn(
        'wmde-markdown-var',
        'max-w-none text-white',
        'prose prose-gray',
        'prose-h1:!text-[1.203125rem] prose-h1:!leading-[1.5] prose-h1:!my-3.5 prose-h1:!font-bold',
        'prose-h2:!text-[1.09375rem] prose-h2:!leading-[1.25] prose-h2:!my-3.5 prose-h2:!font-bold',
        'prose-h3:!text-base prose-h3:!leading-[1.25] prose-h3:!my-3.5 prose-h3:!font-bold',
        'prose-code:text-white prose-blockquote:text-gray-50 prose-blockquote:bg-gray-200 prose-strong:text-white prose-headings:text-white prose-p:whitespace-pre-wrap',
        'prose-h1:!border-b-0 prose-h2:!border-b-0 prose-h3:!border-b-0 prose-h4:!border-b-0 prose-h5:!border-b-0 prose-h6:!border-b-0',
        'prose-hr:!border-b-0 prose-hr:!h-[2px] prose-hr:!bg-gray-50/80',
        className,
      )}
      components={components}
      rehypePlugins={rehypePlugins}
      source={source}
      wrapperElement={{ 'data-color-mode': 'dark' }}
    />
  );
};
