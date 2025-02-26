import { QueryObserverOptions, useQuery } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { openToolInCodeEditor } from '.';
import { OpenToolInCodeEditorInput, OpenToolInCodeEditorOutput } from './types';

export type UseOpenToolInCodeEditor = [
  FunctionKeyV2.OPEN_TOOL_IN_CODE_EDITOR,
  OpenToolInCodeEditorInput,
];

type Options = QueryObserverOptions<
  OpenToolInCodeEditorOutput,
  Error,
  OpenToolInCodeEditorOutput,
  OpenToolInCodeEditorOutput,
  UseOpenToolInCodeEditor
>;

export const useOpenToolInCodeEditor = (
  input: OpenToolInCodeEditorInput,
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: [FunctionKeyV2.OPEN_TOOL_IN_CODE_EDITOR, input],
    queryFn: () => openToolInCodeEditor(input),
    ...options,
  });
};
