import { TreeNode } from 'primereact/treenode';

import { FileInfo } from '../queries/getVRPathSimplified/types';

export function transformDataToTreeNodes(
  data: FileInfo[],
  parentPath = '/',
): TreeNode[] {
  const result: TreeNode[] = [];
  console.log('data: ', data);

  // Directly iterate over data assuming it's an array
  data.forEach((fileInfo) => {
    const pathWithSlash = fileInfo.path.startsWith('/') ? fileInfo.path : `/${fileInfo.path}`;
    const label = pathWithSlash.split('/').pop() || '';

    if (fileInfo.is_directory) {
      const folderNode: TreeNode = {
        key: fileInfo.path,
        label: label,
        data: fileInfo,
        icon: 'icon-folder',
        children: [], // Assuming you will populate this with child nodes
      };
      result.push(folderNode);
    } else {
      const itemNode: TreeNode = {
        key: fileInfo.path,
        label: label,
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

  // for (const item of data) {
  //   if (item.is_directory) {
  //     // Assuming you have a way to retrieve child items for a directory
  //     const childItems = getChildItemsForDirectory(item.path);
  //     result = result.concat(getFlatChildItems(childItems));
  //   } else {
  //     result.push(item);
  //   }
  // }

  return result;
}
