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
import { ArrowBigLeft, ChevronsRight } from 'lucide-react';
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
    <Tabs
      className="flex h-screen w-full flex-col overflow-hidden"
      defaultValue="source"
    >
      <div className={'flex h-screen flex-grow justify-stretch p-3'}>
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 px-2">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="text-gray-80 flex items-center gap-2"
                      onClick={() => toggleArtifactPanel()}
                      size="icon"
                      variant="tertiary"
                    >
                      <ChevronsRight className="h-4 w-4" />
                      <span className="sr-only">Close Artifact Panel</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent className="flex flex-col items-center gap-1">
                      <p> Close Artifact Panel</p>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
              <h1 className="text-sm font-medium text-white">TicTacToe</h1>
            </div>
            <TabsList className="grid grid-cols-2 rounded-lg border border-gray-400 bg-transparent p-0.5">
              <TabsTrigger
                className="flex h-8 items-center gap-1.5 text-xs font-semibold"
                value="source"
              >
                Code
              </TabsTrigger>
              <TabsTrigger
                className="flex h-8 items-center gap-1.5 text-xs font-semibold"
                value="preview"
              >
                Preview
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            className="mt-1 h-full overflow-y-scroll whitespace-pre-line break-words px-4 py-2 font-mono"
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
        </div>
      </div>
    </Tabs>
  );
};
export default ArtifactPreview;
