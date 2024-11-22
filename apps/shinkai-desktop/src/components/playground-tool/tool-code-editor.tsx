import 'prism-react-editor/prism/languages/typescript';
import 'prism-react-editor/prism/languages/json';
import 'prism-react-editor/prism/languages/yaml';
import 'prism-react-editor/languages/typoscript';
import 'prism-react-editor/languages/json';
import 'prism-react-editor/languages/yaml';
import 'prism-react-editor/layout.css';
import 'prism-react-editor/themes/github-dark.css';
import 'prism-react-editor/search.css';

import { Editor, EditorProps } from 'prism-react-editor';

const ToolCodeEditor = ({
  code,
  onUpdate,
  language,
  name,
}: {
  code: string;
  onUpdate: EditorProps['onUpdate'];
  language: EditorProps['language'];
  name: string;
}) => (
  <Editor
    language={language}
    onUpdate={onUpdate}
    style={{
      fontSize: '0.75rem',
      lineHeight: '1.5',
      maxHeight: '40vh',
      height: '100%',
      overflowY: 'auto',
    }}
    textareaProps={{ name: name ?? 'editor' }}
    value={code}
  />
);

export default ToolCodeEditor;
