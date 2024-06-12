import { Placeholder } from '@tiptap/extension-placeholder';
import { EditorContent, Extension, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useEffect, useLayoutEffect, useRef } from 'react';
import * as React from 'react';
import { Markdown } from 'tiptap-markdown';

import { DotsLoader } from '../dots-loader';

export const ChatInputArea = ({
  value,
  onChange,
  onSubmit,
  setInitialValue,
  disabled,
  isLoading,
  placeholder,
  topAddons,
  bottomAddons,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  setInitialValue?: string;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  topAddons?: React.ReactNode;
  bottomAddons?: React.ReactNode;
}) => {
  // onSubmitRef is used to keep the latest onSubmit function
  const onSubmitRef = useRef(onSubmit);
  useLayoutEffect(() => {
    onSubmitRef.current = onSubmit;
  });

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm focus:outline-none break-all',
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
  });

  useEffect(() => {
    editor?.setOptions({ editable: !disabled });
  }, [disabled, editor]);

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
    <div className="flex min-h-[60px] w-full max-w-full flex-col rounded-md border border-gray-200 bg-gray-400 px-1 py-1  text-sm shadow-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-50">
      {topAddons}
      <div
        aria-disabled={disabled}
        className="relative flex cursor-text flex-col aria-disabled:cursor-not-allowed"
        onClick={() => editor?.chain().focus().run()}
      >
        {isLoading ? (
          <DotsLoader className="absolute left-4 top-6 z-50" />
        ) : null}
        <EditorContent editor={editor} />
        {bottomAddons}
      </div>
    </div>
  );
};
