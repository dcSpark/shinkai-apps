import { cn } from '@shinkai_network/shinkai-ui/utils';

import { OllamaModelSpeed } from '../../../lib/shinkai-node-manager/ollama-models';

export const ModelSpeedTag = ({ speed }: { speed: OllamaModelSpeed }) => {
  const emojiMap: { [key in OllamaModelSpeed]: string } = {
    [OllamaModelSpeed.Average]: '🐕',
    [OllamaModelSpeed.Fast]: '🐎',
    [OllamaModelSpeed.VeryFast]: '🐆',
  };
  const colorMap: { [key in OllamaModelSpeed]: string } = {
    [OllamaModelSpeed.Average]: 'text-orange-200 bg-orange-900',
    [OllamaModelSpeed.Fast]: 'text-yellow-200 bg-yellow-900',
    [OllamaModelSpeed.VeryFast]: 'text-green-200 bg-green-900',
  };
  return (
    <div
      className={cn(
        'flex flex-row items-center justify-center whitespace-nowrap rounded-full border-0 bg-gray-900 px-2 py-1 font-normal capitalize text-gray-400',
        colorMap[speed],
      )}
    >
      <span>{emojiMap[speed]}</span>
      <span className="ml-2">{speed}</span>
    </div>
  );
};
