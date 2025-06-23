import mermaid from 'mermaid';
import { type FC, useEffect, useRef } from 'react';
import { cn } from '../utils';
import { type SyntaxHighlighterProps } from './markdown-preview';

export type MermaidDiagramProps = SyntaxHighlighterProps & {
  className?: string;
  isRunning?: boolean;
};

mermaid.initialize({ theme: 'dark' });

export const MermaidDiagram: FC<MermaidDiagramProps> = ({
  code,
  className,
  isRunning,
}) => {
  const ref = useRef<HTMLPreElement>(null);

  const isComplete = !isRunning;

  useEffect(() => {
    if (!isComplete) return;

    void (async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, code);
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (e) {
        console.warn('Failed to render Mermaid diagram:', e);
      }
    })();
  }, [code, isComplete]);

  return (
    <pre
      ref={ref}
      className={cn(
        'aui-mermaid-diagram text-official-gray-400 bg-official-gray-850 w-full rounded-b-lg p-2 text-center text-sm [&_svg]:mx-auto',
        className,
      )}
    >
      Drawing diagram...
    </pre>
  );
};
