import { Button, Skeleton } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { PrismEditor } from 'prism-react-editor';
import { memo, MutableRefObject } from 'react';

import { usePlaygroundStore } from '../context/playground-context';
import ToolCodeEditor from '../tool-code-editor';
import { detectLanguage } from '../utils/code';

const getRandomWidth = () => {
  const widths = [
    'w-12',
    'w-16',
    'w-20',
    'w-24',
    'w-32',
    'w-40',
    'w-48',
    'w-56',
    'w-64',
    'w-72',
  ];
  return widths[Math.floor(Math.random() * widths.length)];
};

function CodePanelBase({
  codeEditorRef,
  resetCounter,
  handleApplyChangesCodeSubmit,
  resetToolCode,
  isDirtyCodeEditor,
  setIsDirtyCodeEditor,
  baseToolCodeRef,
}: {
  codeEditorRef: MutableRefObject<PrismEditor | null>;
  resetCounter: number;
  handleApplyChangesCodeSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  resetToolCode: () => void;
  isDirtyCodeEditor: boolean;
  setIsDirtyCodeEditor: (isDirty: boolean) => void;
  baseToolCodeRef: MutableRefObject<string>;
}) {
  const toolCode = usePlaygroundStore((state) => state.toolCode);
  const toolCodeStatus = usePlaygroundStore((state) => state.toolCodeStatus);

  const isToolCodeGenerationPending = toolCodeStatus === 'pending';
  const isToolCodeGenerationSuccess = toolCodeStatus === 'success';

  return (
    <div className="flex size-full min-h-[220px] flex-col">
      <div className="flex h-full flex-col">
        {/*{toolCode && (*/}
        {/*  <Tooltip>*/}
        {/*    <TooltipTrigger asChild>*/}
        {/*      <div>*/}
        {/*        <CopyToClipboardIcon*/}
        {/*          className="text-gray-80 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-transparent transition-colors hover:bg-gray-300 hover:text-white [&>svg]:h-3 [&>svg]:w-3"*/}
        {/*          string={toolCode ?? ''}*/}
        {/*        />*/}
        {/*      </div>*/}
        {/*    </TooltipTrigger>*/}
        {/*    <TooltipPortal>*/}
        {/*      <TooltipContent className="flex flex-col items-center gap-1">*/}
        {/*        <p>Copy Code</p>*/}
        {/*      </TooltipContent>*/}
        {/*    </TooltipPortal>*/}
        {/*  </Tooltip>*/}
        {/*)}*/}
        {/* </div> */}
        <div className="flex-1 overflow-auto">
          {isToolCodeGenerationPending && (
            <div className="flex w-full flex-col items-start gap-1 px-4 py-4 text-xs">
              {[...Array(20)].map((_, lineIndex) => (
                <div className="mb-2 flex gap-3" key={lineIndex}>
                  <Skeleton className="bg-official-gray-900 h-4 w-12 rounded" />
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {[...Array(Math.floor(Math.random() * 4) + 1)].map(
                        (_, blockIndex) => (
                          <Skeleton
                            className={cn(
                              getRandomWidth(),
                              'bg-official-gray-900 h-4 rounded',
                            )}
                            key={blockIndex}
                          />
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <p className="sr-only">Generating Code...</p>
            </div>
          )}
          {!isToolCodeGenerationPending &&
            !toolCode &&
            !isToolCodeGenerationSuccess && (
              <p className="text-gray-80 pt-6 text-center text-xs">
                No code generated yet. <br />
                Ask Shinkai AI to generate your tool code.
              </p>
            )}
          {isToolCodeGenerationSuccess && toolCode && (
            <form
              className="flex size-full flex-col"
              key={resetCounter}
              onSubmit={handleApplyChangesCodeSubmit}
            >
              <div className="flex h-[40px] shrink-0 items-center justify-between rounded-t-sm border-b border-gray-400 px-3 py-2">
                <span className="text-gray-80 inline-flex items-center gap-2 pl-2 text-xs font-medium">
                  {' '}
                  {detectLanguage(toolCode)}{' '}
                  {isDirtyCodeEditor && (
                    <span className="size-2 shrink-0 rounded-full bg-orange-500" />
                  )}
                </span>
                <AnimatePresence mode="popLayout">
                  {isDirtyCodeEditor && (
                    <motion.div
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-end gap-2"
                      exit={{ opacity: 0 }}
                      initial={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        className="!h-[28px] rounded-lg border-0 bg-transparent"
                        onClick={resetToolCode}
                        size="xs"
                        variant="ghost"
                      >
                        Reset
                      </Button>
                      <Button
                        className="!h-[28px] rounded-lg border-0 bg-transparent"
                        size="xs"
                        type="submit"
                        variant="ghost"
                      >
                        Apply Changes
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <ToolCodeEditor
                language="ts"
                name="editor"
                onUpdate={(currentCode) => {
                  setIsDirtyCodeEditor(currentCode !== baseToolCodeRef.current);
                }}
                ref={codeEditorRef}
                value={toolCode}
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export const CodePanel = memo(CodePanelBase, (prevProps, nextProps) => {
  if (prevProps.resetCounter !== nextProps.resetCounter) return false;
  if (prevProps.isDirtyCodeEditor !== nextProps.isDirtyCodeEditor) return false;
  return true;
});
