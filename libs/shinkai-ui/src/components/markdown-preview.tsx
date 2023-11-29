import ReactMarkdownPreview from '@uiw/react-markdown-preview';

import { cn } from '../utils';

export const MarkdownPreview = ({
  className,
  source,
}: {
  className?: string;
  source?: string;
}) => {
  return (
    <ReactMarkdownPreview
      className={cn(
        'wmde-markdown-var prose prose-gray prose-code:text-white prose-blockquote:text-gray-50 prose-blockquote:bg-gray-200',
        className,
      )}
      source={source}
      wrapperElement={{ 'data-color-mode': 'dark' }}
    />
  );
};
