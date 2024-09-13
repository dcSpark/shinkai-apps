export const formatText = (text: string) => {
  const words = text.split('_');

  const formattedWords = words.map((word) => {
    return word
      .split(/(?=[A-Z])/)
      .map((part) => {
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      })
      .join(' ');
  });

  return formattedWords.join(' ');
};
