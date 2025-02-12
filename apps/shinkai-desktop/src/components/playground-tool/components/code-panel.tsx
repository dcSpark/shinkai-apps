import { Button } from '@shinkai_network/shinkai-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { PrismEditor } from 'prism-react-editor';
import { memo, MutableRefObject } from 'react';

import { usePlaygroundStore } from '../context/playground-context';
import ToolCodeEditor from '../tool-code-editor';
import { detectLanguage } from '../utils/code';

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
        {/* <div className="flex items-center justify-between gap-2"> */}
        {/* <div className="text-gray-80 flex flex-col gap-1 py-3 text-xs"> */}
        {/* <h2 className="flex items-center gap-2 font-mono font-semibold text-gray-50">
              Code{' '}
            </h2> */}
        {/* Here's the code generated by Shinkai AI based on your prompt. */}
        {/* </div> */}

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
            <div className="text-gray-80 flex flex-col items-center gap-2 py-4 text-xs">
              <Loader2 className="shrink-0 animate-spin" />
              Generating Code...
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
              <div className="flex h-[40px] shrink-0 items-center justify-between rounded-t-sm border-b border-gray-400 bg-gray-600 px-3 py-2">
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
