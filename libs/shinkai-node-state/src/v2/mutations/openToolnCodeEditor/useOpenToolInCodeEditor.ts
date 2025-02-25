import { useQuery } from "@tanstack/react-query";

import { FunctionKeyV2 } from '../../constants';
import { openToolInCodeEditor } from ".";
import { OpenToolInCodeEditorInput } from "./types";
export const useOpenToolInCodeEditor = (input: OpenToolInCodeEditorInput) => {
  return useQuery({
    queryKey: [FunctionKeyV2.OPEN_TOOL_IN_CODE_EDITOR, input],
    queryFn: () => openToolInCodeEditor(input),
  });
};
