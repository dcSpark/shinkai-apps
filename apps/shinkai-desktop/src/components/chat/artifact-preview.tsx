import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { ArrowBigLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { useChatStore } from './context/chat-context';

const ArtifactPreview = () => {
  const [code, setCode] = useState(`

import React, { useState } from 'react';

function App() {
  const [board, setBoard] = useState([
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ]);
  const [turn, setTurn] = useState('X');

  const handleclick = (row, col) => {
    if (board[row][col] !== '') return;
    const newBoard = [...board];
    newBoard[row][col] = turn;
    setBoard(newBoard);
    setTurn(turn === 'X' ? 'O' : 'X');
  };

  const handleReset = () => {
    setBoard([
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ]);
    setTurn('X');
  };

  return (
    <div>
      <h1>Tic Tac Toe</h1>
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center">
          {row.map((cell, cellIndex) => (
            <button
              key={cellIndex}
              onClick={() => handleclick(rowIndex, cellIndex)}
              disabled={board[rowIndex][cellIndex] !== ''}
             className={\`px-4 py-2 mx-1 my-1 bg-gray-100 border border-gray-500 rounded-lg \${board[rowIndex][cellIndex] === 'X' ? 'bg-red-200 text-red-600' : ''} \${board[rowIndex][cellIndex] === 'O' ? 'bg-blue-200 text-blue-600' : ''}\`}

            >
              {board[rowIndex][cellIndex]}
            </button>
          ))}
        </div>
      ))}
      <p className="text-center">Turn: {turn}</p>
      <button onClick={handleReset} className="px-4 py-2 my-1 bg-gray-200 border border-gray-500 rounded-lg text-gray-600">
        Reset
      </button>
    </div>
  );
}

export default App;

  `);

  const contentRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const toggleArtifactPanel = useChatStore(
    (state) => state.toggleArtifactPanel,
  );
  const handleRender = () => {
    if (!iframeRef.current?.contentWindow) return;

    iframeRef.current?.contentWindow?.postMessage(
      { type: 'UPDATE_COMPONENT', code },
      '*',
    );
  };

  const handleMessage = (event: any) => {
    if (event?.data?.type === 'INIT_COMPLETE') {
      setIframeLoaded(true);
      handleRender();
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    handleRender();
  }, [code]);

  return (
    <div
      className={
        'flex max-w-2xl flex-grow basis-full justify-stretch p-3 transition-[width]'
      }
    >
      <div className="h-full w-full overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between gap-2">
          <div>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="text-gray-80 flex items-center gap-2"
                    onClick={() => toggleArtifactPanel()}
                    size="icon"
                    variant="tertiary"
                  >
                    <ArrowBigLeft className="h-4 w-4" />
                    <span className="sr-only">Close Artifact Panel</span>
                  </Button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent className="flex flex-col items-center gap-1">
                    <p> Close Artifact Panel</p>
                    <div className="text-gray-80 flex items-center justify-center gap-2 text-center">
                      <span>⌘</span>
                      <span>B</span>
                    </div>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div>
            <button
              className="rounded-lg border border-gray-500 bg-gray-200 px-4 py-2 text-gray-600"
              onClick={() => handleRender()}
            >
              Render
            </button>
          </div>
        </div>
        <Tabs className="h-full" defaultValue="source">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="source">Source Code</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent
            className="h-full overflow-y-scroll whitespace-pre-line break-words px-4 py-2 font-mono"
            value="source"
          >
            <SyntaxHighlighter
              PreTag="div"
              codeTagProps={{
                style: {
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-inter)',
                },
              }}
              customStyle={{
                margin: 0,
                width: '100%',
                padding: '0.5rem 1rem',
                borderBottomLeftRadius: '8px',
                borderBottomRightRadius: '8px',
              }}
              language={'jsx'}
              style={oneDark}
            >
              {code}
            </SyntaxHighlighter>
          </TabsContent>
          <TabsContent className="h-full flex-grow px-4 py-2" value="preview">
            <div className="h-full w-full" ref={contentRef}>
              <iframe
                className="h-full w-full"
                loading="lazy"
                ref={iframeRef}
                src={
                  'http://localhost:1420/src/windows/shinkai-artifacts/index.html'
                }
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default ArtifactPreview;
