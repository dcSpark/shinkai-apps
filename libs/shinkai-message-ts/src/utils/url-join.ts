// It safe join url chunks avoiding double '/' between paths
// Warning: It doesn't supports all cases but it's enough for join shinkai-node api urls
export const urlJoin = (...chunks: string[]): string => {
  return chunks
    .map((chunk) => chunk.replace(/(^\/+|\/+$)/gm, ''))
    .filter((chunk) => !!chunk)
    .join('/');
};
