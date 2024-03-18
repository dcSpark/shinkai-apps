import { Placeholder } from '@tiptap/extension-placeholder';
import { EditorContent, Extension, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useEffect, useLayoutEffect, useRef } from 'react';
import * as React from 'react';
import { Markdown } from 'tiptap-markdown';

import { DotsLoader } from './dots-loader';

export const MessageEditor = ({
  value,
  onChange,
  onSubmit,
  setInitialValue,
  disabled,
  isLoading,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  setInitialValue?: string;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}) => {
  // onSubmitRef is used to keep the latest onSubmit function
  const onSubmitRef = useRef(onSubmit);
  useLayoutEffect(() => {
    onSubmitRef.current = onSubmit;
  });

  const editor = useEditor(
    {
      editorProps: {
        attributes: {
          class:
            'prose prose-invert prose-sm mx-auto focus:outline-none break-words',
        },
      },
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: placeholder ?? 'Enter message',
        }),
        Markdown,
        Extension.create({
          addKeyboardShortcuts() {
            return {
              Enter: () => {
                onSubmitRef?.current?.();
                return this.editor.commands.clearContent();
              },
              'Mod-Enter': () => {
                onSubmitRef?.current?.();
                return this.editor.commands.clearContent();
              },
              'Shift-Enter': ({ editor }) =>
                editor.commands.first(({ commands }) => [
                  () => commands.newlineInCode(),
                  () => commands.splitListItem('listItem'),
                  () => commands.createParagraphNear(),
                  () => commands.liftEmptyBlock(),
                  () => commands.splitBlock(),
                ]),
            };
          },
        }),
      ],
      content: value,
      autofocus: true,
      onUpdate({ editor }) {
        onChange(editor.storage.markdown.getMarkdown());
      },
      editable: !disabled,
    },
    [disabled],
  );

  useEffect(() => {
    setInitialValue === undefined
      ? editor?.commands.setContent('')
      : editor?.commands.setContent(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setInitialValue]);

  useEffect(() => {
    if (value === '') editor?.commands.setContent('');
  }, [value, editor]);

  return (
    <>
      {isLoading ? <DotsLoader className="absolute left-4 top-6 z-50" /> : null}
      <EditorContent editor={editor} />
    </>
  );
};
