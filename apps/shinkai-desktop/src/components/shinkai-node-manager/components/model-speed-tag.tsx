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
    <div className={cn('  px-2 font-normal capitalize')}>
      {speed} {emojiMap[speed]}
    </div>
  );
};
