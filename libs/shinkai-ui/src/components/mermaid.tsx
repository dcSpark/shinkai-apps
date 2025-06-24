import { RotateCcw, Download } from 'lucide-react';
import mermaid from 'mermaid';
import { type FC, useEffect, useRef, useState, useCallback } from 'react';
import svgPanZoom from 'svg-pan-zoom';
import { cn } from '../utils';
import { Button } from './button';
import { type SyntaxHighlighterProps } from './markdown-preview';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export type MermaidDiagramProps = SyntaxHighlighterProps & {
  className?: string;
  isRunning?: boolean;
};

mermaid.initialize({
  startOnLoad: true,
  mindmap: {
    useWidth: 800,
  },
  theme: 'dark',
  fontSize: 18,
  darkMode: true,
  fontFamily: 'Inter',
});

const generateId = () => `mermaid-${Math.random().toString(36).slice(2)}`;

const downloadBlob = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
};

export const MermaidDiagram: FC<MermaidDiagramProps> = ({
  code,
  className,
  isRunning,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const lastCode = useRef<string | null>(null);
  const [instance, setInstance] = useState<any>(null);

  const isComplete = !isRunning;

  const resetZoom = useCallback(() => {
    instance?.fit();
    instance?.center();
  }, [instance]);

  const downloadSVG = useCallback(() => {
    if (ref.current) {
      const svg = ref.current.innerHTML;
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      downloadBlob(blob, 'mermaid-diagram.svg');
    }
  }, []);

  const enableZoom = useCallback(() => {
    instance?.enablePan();
    instance?.enableZoom();
  }, [instance]);

  const disableZoom = useCallback(() => {
    instance?.disablePan();
    instance?.disableZoom();
  }, [instance]);

  const handleFocus = useCallback(() => {
    enableZoom();
  }, [enableZoom]);

  const handleBlur = useCallback(() => {
    disableZoom();
  }, [disableZoom]);

  const handleClick = useCallback(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!isComplete || !ref.current || !code) return;

    if (lastCode.current === code) return;

    void (async () => {
      try {
        const id = generateId();
        const { svg } = await mermaid.render(id, code);

        if (ref.current) {
          ref.current.innerHTML = svg;

          const svgElement = ref.current.querySelector('svg');
          if (svgElement) {
            // svgElement.setAttribute('height', '100%');
            // svgElement.setAttribute('width', '100%');

            const panZoomInstance = svgPanZoom(svgElement);
            panZoomInstance.fit();
            panZoomInstance.center();
            // panZoomInstance.zoom(1);
            panZoomInstance.zoomAtPoint(1, { x: 0, y: 0 });
            panZoomInstance.disablePan();
            panZoomInstance.disableZoom();
            setInstance(panZoomInstance);
          }
        }

        lastCode.current = code;
      } catch (e) {
        console.warn('Failed to render Mermaid diagram:', e);
      }
    })();
  }, [code, isComplete]);

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="tertiary"
              size="icon"
              onClick={resetZoom}
              className="text-official-gray-400"
            >
              <RotateCcw size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset Zoom</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="tertiary"
              size="icon"
              onClick={downloadSVG}
              className="text-official-gray-400"
            >
              <Download size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download SVG</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div
        onClick={handleClick}
        className="text-official-gray-400 bg-official-gray-800 absolute right-2 bottom-2 z-10 rounded px-2 py-1 text-xs"
      >
        Click to focus, then scroll to zoom & drag to pan
      </div>
      <div
        ref={ref}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        className={cn(
          'text-official-gray-400 bg-official-gray-850 focus:ring-opacity-50 w-full cursor-grab rounded-b-lg p-4 py-10 text-center text-sm focus:cursor-grabbing focus:ring-2 focus:ring-blue-500 focus:outline-none',
          className,
        )}
        style={{ width: '100%', minHeight: '200px' }}
      >
        Drawing diagram...
      </div>
    </div>
  );
};
