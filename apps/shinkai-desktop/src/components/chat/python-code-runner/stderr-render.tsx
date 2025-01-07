import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useState } from 'react';

export const StderrRender = ({ stderr }: { stderr: string[] }) => {
  const i18n = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (stderr.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-red-700">{i18n.t('codeRunner.stderr')}</h3>
        <button
          className="text-sm text-red-600 transition-colors duration-200 hover:text-red-800 focus:outline-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide' : 'Show'} ({stderr.length})
          <span className="ml-1">{isExpanded ? '▲' : '▼'}</span>
        </button>
      </div>
      {isExpanded && (
        <div className="mt-2 max-h-60 overflow-y-auto">
          {stderr.map((error: string, index: number) => (
            <div className="mb-2 text-red-600 last:mb-0" key={index}>
              <span className="mr-2 rounded bg-red-100 px-1 py-0.5 font-mono">
                {index + 1}
              </span>
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
