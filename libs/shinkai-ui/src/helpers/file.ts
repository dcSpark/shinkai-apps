export const getFileName = (fileName: string): string => {
  const nameParts = fileName.split('.');
  return nameParts.slice(0, -1).join('.');
};
export const getFileExt = (fileName: string): string => {
  const nameParts = fileName.split('.');
  return nameParts.pop() || '';
};

export const isFileTypeImageOrPdf = (file: File): boolean => {
  if (!file) return false;
  return (
    file?.type.startsWith('image/') || file?.type.startsWith('application/pdf')
  );
};
