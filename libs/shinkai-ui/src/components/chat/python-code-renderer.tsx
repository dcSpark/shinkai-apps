import { useEffect, useState } from 'react';
import usePython from 'react-pyodide/dist/hooks/use-python';

type PythonCodeRendererProps = {
  code: string;
};

const PythonCodeRenderer = ({ code }: PythonCodeRendererProps) => {
  const { runPython, stdout, stderr, isLoading } = usePython();
  const [output, setOutput] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      console.log('Running Python code:', code);
      runPython(code)
        .then(() => {
          console.log('Python stdout:', stdout);
          console.log('Python stderr:', stderr);
          setOutput(stdout || stderr);
        })
        .catch((err) => {
          console.error('Error running Python code:', err);
          setOutput(err.message);
        });
    }
  }, [isLoading, runPython, code, stdout, stderr]);

  if (isLoading) {
    return <div>Loading Python environment...</div>;
  }

  return <div>{output}</div>;
};

export default PythonCodeRenderer;
