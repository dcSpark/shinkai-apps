export const formatText = (text: string) => {
  const words = text.split('_');

  const formattedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  const result = formattedWords.join(' ');

  return result.charAt(0).toUpperCase() + result.slice(1);
};
