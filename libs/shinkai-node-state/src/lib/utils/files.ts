import { DirectoryContent } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';
import { TreeNode } from 'primereact/treenode';

export function transformDataToTreeNodes(
  data: DirectoryContent[],
  parentPath = '/',
): TreeNode[] {
  const result: TreeNode[] = [];

  data.forEach((fileInfo) => {
    const pathWithSlash = fileInfo.path.startsWith('/')
      ? fileInfo.path
      : `/${fileInfo.path}`;

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

export function getFlatChildItems(
  data: DirectoryContent[],
): DirectoryContent[] {
  const result: DirectoryContent[] = [];
  return result;
}
