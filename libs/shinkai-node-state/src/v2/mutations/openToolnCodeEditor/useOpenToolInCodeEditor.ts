import { useQuery } from "@tanstack/react-query";

import { openToolInCodeEditor } from ".";
import { OpenToolInCodeEditorInput } from "./types";

export const useOpenToolInCodeEditor = (input: OpenToolInCodeEditorInput) => {
  return useQuery({
    queryKey: ["openToolInCodeEditor", input],
    queryFn: () => openToolInCodeEditor(input),
  });
};
