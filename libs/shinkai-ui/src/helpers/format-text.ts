import { ShinkaiToolHeader } from "@shinkai_network/shinkai-message-ts/api/tools/types";

export const formatText = (text: string) => {
  const words = text.split('_');

  const formattedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  const result = formattedWords.join(' ');

  return result.charAt(0).toUpperCase() + result.slice(1);
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
