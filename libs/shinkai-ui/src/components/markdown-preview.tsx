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
        'prose-h1:!text-xl prose-h1:!mb-3 prose-h2:!text-lg prose-h2:!mb-2 prose-h3:!text-base',
        'prose-code:text-white prose-blockquote:text-gray-50 prose-blockquote:bg-gray-200 prose-strong:text-white prose-headings:text-white prose-p:whitespace-pre-wrap',
        'prose-h1:!border-b-0 prose-h2:!border-b-0 prose-h3:!border-b-0 prose-h4:!border-b-0 prose-h5:!border-b-0 prose-h6:!border-b-0',
        className,
      )}
      components={components}
      rehypePlugins={rehypePlugins}
      source={source}
      wrapperElement={{ 'data-color-mode': 'dark' }}
    />
  );
};
