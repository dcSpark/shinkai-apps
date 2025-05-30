import { type ShinkaiToolHeader } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export const formatText = (text: string) => {
  const camelToSpaces = text.replace(/([a-z])([A-Z])/g, '$1 $2');
  const snakeToSpaces = camelToSpaces.replace(/_/g, ' ');
  return snakeToSpaces
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatCamelCaseText = (text: string) => {
  const words = text.split(/(?=[A-Z])/);

  const formattedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  const result = formattedWords.join(' ');

  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const getVersionFromTool = (toolRouterKey: ShinkaiToolHeader) => {
  if (toolRouterKey.version) {
    return toolRouterKey.version;
  }
  const parts = toolRouterKey.name.split(':::');
  if (parts.length === 4) {
    return parts[3];
  }
  return 'latest';
};
