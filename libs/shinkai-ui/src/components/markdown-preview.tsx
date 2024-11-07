import React from 'react';
import ReactMarkdown, { type Options } from 'react-markdown';
import { Components } from 'react-markdown/lib';
import rehypeRaw from 'rehype-raw';
import rehypeRewrite, { RehypeRewriteOptions } from 'rehype-rewrite';
import { PluggableList } from 'unified';

import { cn } from '../utils';
import { CopyToClipboardIcon } from './copy-to-clipboard-icon';

// TODO: remove @uiw/react-markdown-preview dependency to use the main library react-markdown for better control

const rehypePlugins: PluggableList = [
  rehypeRaw,
  // rehypeRewrite,
  // {
  //   rewrite: (node, _, parent) => {
  //     if (
  //       node.type === 'element' &&
  //       node.tagName === 'a' &&
  //       parent &&
  //       parent.type === 'element' &&
  //       /^h([123456])/.test(parent.tagName)
  //     ) {
  //       parent.children = [parent.children[1]];
  //     }
  //   },
  // } as RehypeRewriteOptions,
];

export const CodeHeader = ({ language, code }) => {
  return (
    <div className="code-header-root">
      <span className="code-header-language">{language}</span>
      <CopyToClipboardIcon string={code} />
      {/*<TooltipIconButton tooltip={tooltip} onClick={onCopy}>*/}
      {/*  {!isCopied && <CopyIcon />}*/}
      {/*  {isCopied && <CheckIcon />}*/}
      {/*</TooltipIconButton>*/}
    </div>
  );
};

const defaultComponents: Options['components'] = {
  h1: ({ node, className, ...props }) => (
    <h1 className={cn('md-h1', className)} {...props} />
  ),
  h2: ({ node, className, ...props }) => (
    <h2 className={cn('md-h2', className)} {...props} />
  ),
  h3: ({ node, className, ...props }) => (
    <h3 className={cn('md-h3', className)} {...props} />
  ),
  h4: ({ node, className, ...props }) => (
    <h4 className={cn('md-h4', className)} {...props} />
  ),
  h5: ({ node, className, ...props }) => (
    <h5 className={cn('md-h5', className)} {...props} />
  ),
  h6: ({ node, className, ...props }) => (
    <h6 className={cn('md-h6', className)} {...props} />
  ),
  p: ({ node, className, ...props }) => (
    <p className={cn('md-p', className)} {...props} />
  ),
  a: ({ node, className, ...props }) => (
    <a className={cn('md-a', className)} {...props} />
  ),
  blockquote: ({ node, className, ...props }) => (
    <blockquote className={cn('md-blockquote', className)} {...props} />
  ),
  ul: ({ node, className, ...props }) => (
    <ul className={cn('md-ul', className)} {...props} />
  ),
  ol: ({ node, className, ...props }) => (
    <ol className={cn('md-ol', className)} {...props} />
  ),
  hr: ({ node, className, ...props }) => (
    <hr className={cn('md-hr', className)} {...props} />
  ),
  table: ({ node, className, ...props }) => (
    <table className={cn('md-table', className)} {...props} />
  ),
  th: ({ node, className, ...props }) => (
    <th className={cn('md-th', className)} {...props} />
  ),
  td: ({ node, className, ...props }) => (
    <td className={cn('md-td', className)} {...props} />
  ),
  tr: ({ node, className, ...props }) => (
    <tr className={cn('md-tr', className)} {...props} />
  ),
  sup: ({ node, className, ...props }) => (
    <sup className={cn('md-sup', className)} {...props} />
  ),
  pre: ({ node, className, ...props }) => (
    <pre className={cn('md-pre', className)} {...props} />
  ),
  code: ({ node, className, ...props }) => {
    // const isCodeBlock = useIsMarkdownCodeBlock();
    const isCodeBlock = true;
    return (
      <code
        className={cn(!isCodeBlock && 'md-inline-code', className)}
        {...props}
      />
    );
  },
  CodeHeader,
};

export const MarkdownPreview = ({
  className,
  source,
  components,
}: {
  className?: string;
  source?: string;
  components?: Components;
}) => {
  return (
    <ReactMarkdown
      className={cn(
        // 'wmde-markdown-var',
        // 'max-w-none text-white',
        // 'prose prose-gray',
        // 'prose-h1:!text-[1.203125rem] prose-h1:!leading-[1.5] prose-h1:!my-3.5 prose-h1:!font-bold',
        // 'prose-h2:!text-[1.09375rem] prose-h2:!leading-[1.25] prose-h2:!my-3.5 prose-h2:!font-bold',
        // 'prose-h3:!text-base prose-h3:!leading-[1.25] prose-h3:!my-3.5 prose-h3:!font-bold',
        // 'prose-code:text-white prose-blockquote:text-gray-50 prose-blockquote:bg-gray-200 prose-strong:text-white prose-headings:text-white prose-p:whitespace-pre-wrap',
        // 'prose-code:before:hidden prose-code:after:hidden',
        // 'prose-h1:!border-b-0 prose-h2:!border-b-0 prose-h3:!border-b-0 prose-h4:!border-b-0 prose-h5:!border-b-0 prose-h6:!border-b-0',
        // 'prose-hr:!border-b-0 prose-hr:!h-[2px] prose-hr:!bg-gray-50/80',
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
        ...defaultComponents,
      }}
      rehypePlugins={rehypePlugins}
      // rehypeRewrite={(node, _, parent) => {
      //   if (
      //     'tagName' in node &&
      //     node.tagName &&
      //     parent &&
      //     'tagName' in parent &&
      //     parent.tagName
      //   ) {
      //     if (node.tagName === 'a' && /^h([1-6])/.test(parent.tagName)) {
      //       // eslint-disable-next-line no-param-reassign
      //       parent.children = parent.children.slice(1);
      //     }
      //   }
      // }}

      // wrapperElement={{ 'data-color-mode': 'dark' }}
    >
      {source}
    </ReactMarkdown>
  );
};
