export type NodeFile = {
  type: 'folder' | 'file';
  name: string;
  creation_date: string;
  size?: number;
  file_extension?: string;
  selected?: boolean;
  items?: NodeFile[];
};
