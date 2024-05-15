export const getFileName = (fileName: string): string => {
  const nameParts = fileName.split('.');
  return nameParts.slice(0, -1).join('.');
};
export const getFileExt = (fileName: string): string => {
  const nameParts = fileName.split('.');
  return nameParts.pop() || '';
};
