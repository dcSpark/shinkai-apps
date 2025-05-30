import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { type FunctionKeyV2 } from '../../constants';
import { type APIError } from '../../types';
import { type OpenToolInCodeEditorInput, type OpenToolInCodeEditorOutput } from './types';
import { openToolInCodeEditor } from '.';

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
