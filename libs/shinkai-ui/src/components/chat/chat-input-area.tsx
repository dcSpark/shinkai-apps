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
  disabled,
  isLoading,
  placeholder,
  topAddons,
  bottomAddons,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
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
    content: value,
    onUpdate({ editor }) {
      onChange(editor.storage.markdown.getMarkdown());
    },
    autofocus: 'end',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm focus:outline-none break-all',
      },
    },
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder ?? 'Send a message',
      }),
      Markdown.configure({ html: false, transformCopiedText: true }),
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
  });

  useEffect(() => {
    editor?.chain().focus().run();
  }, [editor]);

  useEffect(() => {
    editor?.setOptions({ editable: !disabled });
  }, [disabled, editor]);

  useEffect(() => {
    if (editor && value !== editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(value);
      editor?.commands.focus('end');
    }
  }, [editor, value]);

  return (
    <div className="flex w-full max-w-full flex-col rounded-lg border border-gray-300 bg-gray-400 px-1 py-1 text-sm shadow-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-50">
      {topAddons}
      <div
        aria-disabled={disabled}
        className="relative flex cursor-text flex-col aria-disabled:cursor-not-allowed"
        onClick={() => editor?.chain().focus().run()}
      >
        {isLoading ? (
          <DotsLoader className="absolute left-4 top-6 z-50" />
        ) : null}
        <EditorContent
          className="prose-h1:text-xl prose-h1:font-semibold prose-h2:text-lg prose-h2:font-semibold prose-h3:text-base prose-h3:font-semibold"
          editor={editor}
        />
        {bottomAddons}
      </div>
    </div>
  );
};
