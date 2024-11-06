import ReactMarkdownPreview from '@uiw/react-markdown-preview';
import React from 'react';
import rehypeRaw from 'rehype-raw';
import rehypeRewrite, { RehypeRewriteOptions } from 'rehype-rewrite';
import { PluggableList } from 'unified';
import { SKIP, visit } from 'unist-util-visit';

import { cn } from '../utils';

function rehypeAntArtifact() {
  return (tree: any) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'p' && node.children.length > 0) {
        const firstChild = node.children[0];
        if (
          firstChild.type === 'raw' &&
          firstChild.value.startsWith('<antartifact')
        ) {
          const attributes = {};
          const attributeRegex = /(\w+)="([^"]*)"/g;
          let match;
          while ((match = attributeRegex.exec(firstChild.value)) !== null) {
            // @ts-expect-error lib
            attributes[match[1]] = match[2];
          }

          const newNode = {
            children: [
              {
                type: 'text',
                value: node.children
                  .slice(1, -1)
                  .map((child: any) => {
                    if (child.type === 'raw') {
                      return child.value;
                    } else if (child.type === 'text') {
                      return child.value;
                    } else if (
                      child.type === 'element' &&
                      child.tagName === 'a'
                    ) {
                      return child.children[0].value;
                    }
                    return '';
                  })
                  .join('')
                  .trim(),
              },
            ],
            properties: attributes,
            tagName: 'antartifact',
            type: 'element',
          };

          console.log(newNode, 'newNode');
          parent.children.splice(index, 1, newNode);

          return [SKIP, index];
        }
      }
    });
  };
}

const rehypePlugins: PluggableList = [
  [
    rehypeRewrite,
    {
      rewrite: (node, _, parent) => {
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
  [rehypeRaw],
  [rehypeAntArtifact],
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
        'prose-code:before:hidden prose-code:after:hidden',
        'prose-h1:!border-b-0 prose-h2:!border-b-0 prose-h3:!border-b-0 prose-h4:!border-b-0 prose-h5:!border-b-0 prose-h6:!border-b-0',
        'prose-hr:!border-b-0 prose-hr:!h-[2px] prose-hr:!bg-gray-50/80',
        className,
      )}
      components={{
        a: ({ node, ...props }) => (
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          <a {...props} target="_blank" />
        ),
        table: ({ node, ...props }) => (
          <div className="mb-2 size-full overflow-x-auto">
            <table className="w-full" {...props} />
          </div>
        ),
        ...components,
      }}
      rehypePlugins={rehypePlugins}
      rehypeRewrite={(node, _, parent) => {
        if (
          'tagName' in node &&
          node.tagName &&
          parent &&
          'tagName' in parent &&
          parent.tagName
        ) {
          if (node.tagName === 'a' && /^h([1-6])/.test(parent.tagName)) {
            // eslint-disable-next-line no-param-reassign
            parent.children = parent.children.slice(1);
          }
        }
      }}
      source={source}
      wrapperElement={{ 'data-color-mode': 'dark' }}
    />
  );
};
