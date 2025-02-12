import { useMutation } from "@tanstack/react-query";

import { openToolInCodeEditor } from ".";
import { OpenToolInCodeEditorInput } from "./types";

export const useOpenToolInCodeEditor = (input: OpenToolInCodeEditorInput) => {
  return useMutation({
    mutationFn: () => openToolInCodeEditor(input),
  });
};
