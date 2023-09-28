export const srcUrlResolver = (url: string): string => {
  if (chrome?.runtime?.getURL) {
    return chrome.runtime.getURL(url);
  }
  return url;
};
