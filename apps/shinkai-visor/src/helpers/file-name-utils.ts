export const getFileName = (fileName: string): string => {
  const nameParts = fileName.split('.');
  console.log('nameparts', nameParts, nameParts.slice(0, -1), 'asdsd');
  return nameParts.slice(0, -1).join('.');
};
export const getFileExt = (fileName: string): string => {
  const nameParts = fileName.split('.');
  return nameParts.pop() || '';
};
