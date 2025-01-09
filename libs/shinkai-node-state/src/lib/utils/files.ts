import { DirectoryContent } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';
import { TreeNode } from 'primereact/treenode';

export function transformDataToTreeNodes(
  data: DirectoryContent[],
  parentPath = '/',
  selectedPaths?: string[],
): TreeNode[] {
  const result: TreeNode[] = [];

  for (const item of data ?? []) {
    const itemNode: TreeNode = {
      key: item.path,
      label: item.name,
      data: item,
      icon: item.is_directory ? 'icon-folder' : 'icon-file',
      children: item.is_directory
        ? transformDataToTreeNodes(
            item.children ?? [],
            item.path,
            selectedPaths,
          )
        : undefined,
      className: selectedPaths?.includes(item.path) ? 'p-node-disabled' : '',
    };
    result.push(itemNode);
  }

  return result;
}
export function getFlatChildItems(
  data: DirectoryContent[],
): DirectoryContent[] {
  const result: DirectoryContent[] = [];
  return result;
}
