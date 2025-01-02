import { TreeNode } from 'primereact/treenode';

import { FileInfo } from '../queries/getVRPathSimplified/types';

export function transformDataToTreeNodes(
  data: FileInfo[],
  parentPath = '/',
): TreeNode[] {
  const result: TreeNode[] = [];

  data.forEach((fileInfo) => {
    const pathWithSlash = fileInfo.path.startsWith('/') ? fileInfo.path : `/${fileInfo.path}`;

    if (fileInfo.is_directory) {
      const folderNode: TreeNode = {
        key: pathWithSlash,
        label: fileInfo.name,
        data: fileInfo,
        icon: 'icon-folder',
        children: [], // Assuming you will populate this with child nodes
      };
      result.push(folderNode);
    } else {
      const itemNode: TreeNode = {
        key: pathWithSlash,
        label: fileInfo.name,
        data: fileInfo,
        icon: 'icon-file',
      };
      result.push(itemNode);
    }
  });

  return result;
}

export function getFlatChildItems(data: FileInfo[]): FileInfo[] {
  const result: FileInfo[] = [];
  return result;
}
