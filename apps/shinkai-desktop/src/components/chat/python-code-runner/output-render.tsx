import { useTranslation } from '@shinkai_network/shinkai-i18n';
import Plot from 'react-plotly.js';

import { ErrorRender } from './error-render';
import { preparePlotlyFigure } from './plotly-compatibility';
import { type RunResult } from './python-code-runner-web-worker';
import { StderrRender } from './stderr-render';
import { StdoutRender } from './stdout-render';

export type OutputRender = {
  result: RunResult;
};

const PlotlyFigureRender = ({ data }: { data: string }) => {
  try {
    const figure = preparePlotlyFigure(JSON.parse(data));
    return (
      <Plot
        config={{ responsive: true, displayModeBar: true, scrollZoom: false }}
        data={figure.data}
        frames={figure.frames}
        layout={{
          ...figure.layout,
          autosize: true,
          margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
          height: 400,
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    );
  } catch (error) {
    return (
      <ErrorRender
        error={
          error instanceof Error
            ? error.message
            : 'This chart cannot be displayed.'
        }
      />
    );
  }
};

export const OutputRender = ({ result }: { result: RunResult }) => {
  const i18n = useTranslation();

  if (result?.state === 'error') {
    return (
      <div className="flex flex-col space-y-2">
        <ErrorRender error={result.message} />
        <StdoutRender stdout={result.stdout || []} />
        <StderrRender stderr={result.stderr || []} />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col space-y-2">
        {result?.result?.figures?.map((figure, index) => {
          return figure.type === 'plotly' ? (
            <div className="mb-4" key={index}>
              <PlotlyFigureRender data={figure.data} />
            </div>
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: figure.data }}
              key={index}
            />
          );
        })}
      </div>

      <details className="rounded-md bg-gray-100 p-4">
        <summary className="mb-2 cursor-pointer font-bold">
          {i18n.t('codeRunner.output')}
        </summary>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
          {result.result.rawOutput}
        </pre>
      </details>
      <StdoutRender stdout={result.stdout || []} />
    </div>
  );
};
