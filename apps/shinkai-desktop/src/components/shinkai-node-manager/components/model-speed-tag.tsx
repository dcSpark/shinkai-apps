import { cn } from '@shinkai_network/shinkai-ui/utils';

import { OllamaModelSpeed } from '../../../lib/shinkai-node-manager/ollama-models';

export const ModelSpeedTag = ({ speed }: { speed: OllamaModelSpeed }) => {
  const emojiMap: { [key in OllamaModelSpeed]: string } = {
    [OllamaModelSpeed.VerySlow]: '🐌',
    [OllamaModelSpeed.Slow]: '🐢',
    [OllamaModelSpeed.Average]: '🐕',
    [OllamaModelSpeed.Fast]: '🐎',
    [OllamaModelSpeed.VeryFast]: '🐆',
  };
  return (
    <div className={cn('bg-gray-900 text-gray-400 whitespace-nowrap rounded-full border-0 px-2 py-1 font-normal capitalize')}>
      <span className='ml-2'>{emojiMap[speed]}</span> <span className='ml-2'>{speed}</span>
    </div>
  );
};
