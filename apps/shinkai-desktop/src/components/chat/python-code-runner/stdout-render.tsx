import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useState } from 'react';

export const StdoutRender = ({ stdout }: { stdout: string[] }) => {
  const i18n = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (stdout.length === 0) {
    return null;
  }

  return (
    <div className="border-official-official-gray-900 mt-4 rounded-md border bg-gray-50">
      <button
        className="hover:bg-official-official-gray-750 flex w-full items-center justify-between p-3 text-sm text-gray-700 transition-colors duration-200 focus:outline-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center">
          <span
            className={`mr-2 transition-transform duration-200 ${isExpanded ? 'rotate-90 transform' : ''}`}
          >
            ▶
          </span>
          {i18n.t('codeRunner.stdout')} ({stdout.length} line
          {stdout.length !== 1 ? 's' : ''})
        </span>
        <span className="text-official-gray-850">
          {isExpanded ? 'Hide' : 'Show'}
        </span>
      </button>
      {isExpanded && (
        <div className="border-official-official-gray-900 border-t">
          <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap break-words p-4 text-sm text-gray-800">
            {stdout.map((line, index) => (
              <div className="mb-1 last:mb-0" key={index}>
                <span className="text-official-gray-850 mr-2 select-none">
                  {index + 1}
                </span>
                {line}
              </div>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
};
