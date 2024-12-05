import 'prism-react-editor/prism/languages/typescript';
import 'prism-react-editor/prism/languages/json';
import 'prism-react-editor/prism/languages/yaml';
import 'prism-react-editor/languages/typoscript';
import 'prism-react-editor/languages/json';
import 'prism-react-editor/languages/yaml';
import 'prism-react-editor/layout.css';
import 'prism-react-editor/code-folding.css';
import 'prism-react-editor/autocomplete.css';
import 'prism-react-editor/cursor';
import 'prism-react-editor/themes/github-dark.css';
import 'prism-react-editor/search.css';

import { Editor, EditorProps, PrismEditor } from 'prism-react-editor';
// import { addTextareaListener } from 'prism-react-editor';
import {
  completeSnippets,
  fuzzyFilter,
  registerCompletions,
  useAutoComplete,
} from 'prism-react-editor/autocomplete';
import {
  completeIdentifiers,
  completeKeywords,
  // completeScope,
  // globalReactAttributes,
  jsContext,
  jsDocCompletion,
  jsSnipets,
  // jsxTagCompletion,
  // reactTags,
} from 'prism-react-editor/autocomplete/javascript';
import {
  blockCommentFolding,
  markdownFolding,
  useReadOnlyCodeFolding,
} from 'prism-react-editor/code-folding';
import {
  useDefaultCommands,
  useEditHistory,
} from 'prism-react-editor/commands';
import { useCursorPosition } from 'prism-react-editor/cursor';
import { IndentGuides } from 'prism-react-editor/guides';
import { useHightlightBracketPairs } from 'prism-react-editor/highlight-brackets';
import { useBracketMatcher } from 'prism-react-editor/match-brackets';
import {
  useHighlightMatchingTags,
  useTagMatcher,
} from 'prism-react-editor/match-tags';
// import { useOverscroll } from 'prism-react-editor/overscroll';
import {
  useHighlightSelectionMatches,
  useSearchWidget,
  useShowInvisibles,
} from 'prism-react-editor/search';
import { useReactTooltip } from 'prism-react-editor/tooltips';
import React, { forwardRef, Suspense } from 'react';

function ReadOnly({ editor }: { editor: PrismEditor }) {
  const [portal] = useReactTooltip(editor, null, false);

  useReadOnlyCodeFolding(editor, blockCommentFolding, markdownFolding);

  return portal as unknown as React.ReactElement;
}

const Extensions = ({ editor }: { editor: PrismEditor }) => {
  useBracketMatcher(editor);
  useHightlightBracketPairs(editor);
  // useOverscroll(editor);
  useTagMatcher(editor);
  useHighlightMatchingTags(editor);
  useDefaultCommands(editor);
  useEditHistory(editor);
  useSearchWidget(editor);
  useHighlightSelectionMatches(editor);
  useCursorPosition(editor);
  useShowInvisibles(editor);
  useAutoComplete(editor, {
    filter: fuzzyFilter,
  });

  return (
    <>
      {editor.props.readOnly && (
        <Suspense>
          <ReadOnly editor={editor} />
        </Suspense>
      )}
      <IndentGuides editor={editor} />
    </>
  );
};

registerCompletions(['javascript', 'js', 'jsx', 'tsx', 'typescript', 'ts'], {
  context: jsContext,
  sources: [
    // completeScope(window),
    completeIdentifiers(),
    completeKeywords,
    jsDocCompletion,
    // jsxTagCompletion(reactTags, globalReactAttributes),
    completeSnippets(jsSnipets),
  ],
});

const ToolCodeEditor = forwardRef<
  PrismEditor,
  {
    value: EditorProps['value'];
    onUpdate?: EditorProps['onUpdate'];
    language: EditorProps['language'];
    name?: string;
    readOnly?: boolean;
    style?: React.CSSProperties;
  }
>(({ value, onUpdate, language, name, readOnly, style }, ref) => (
  <Editor
    insertSpaces={false}
    language={language}
    onUpdate={onUpdate}
    readOnly={readOnly}
    ref={ref}
    style={{
      fontSize: '0.75rem',
      lineHeight: '1.5',
      height: '100%',
      overflow: 'auto',
      ...style,
    }}
    textareaProps={{ name: name ?? 'editor' }}
    value={value}
  >
    {(editor) => <Extensions editor={editor} />}
  </Editor>
));

ToolCodeEditor.displayName = 'ToolCodeEditor';
export default ToolCodeEditor;
