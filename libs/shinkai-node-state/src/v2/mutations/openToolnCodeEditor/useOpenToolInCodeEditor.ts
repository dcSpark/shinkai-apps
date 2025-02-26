import { useMutation, UseMutationOptions } from '@tanstack/react-query';

import { FunctionKeyV2 } from '../../constants';
import { APIError } from '../../types';
import { openToolInCodeEditor } from '.';
import { OpenToolInCodeEditorInput, OpenToolInCodeEditorOutput } from './types';

export type UseOpenToolInCodeEditor = [
  FunctionKeyV2.OPEN_TOOL_IN_CODE_EDITOR,
  OpenToolInCodeEditorInput,
];

type Options = UseMutationOptions<
  OpenToolInCodeEditorOutput,
  APIError,
  OpenToolInCodeEditorInput
>;

export const useOpenToolInCodeEditor = (
  options?: Omit<Options, 'queryKey' | 'queryFn'>,
) => {
  return useMutation({
    mutationFn: openToolInCodeEditor,
    ...options,
  });
};
