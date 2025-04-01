import { DirectoryContent } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';
import { TreeNode } from 'primereact/treenode';

export function transformDataToTreeNodes(
  data: DirectoryContent[],
  parentPath = '/',
  selectedPaths?: string[],
): TreeNode[] {
  const result: TreeNode[] = [];

  for (const item of data ?? []) {
    console.log('Processing item:', item);
    const itemPath = item.path.startsWith('/') ? item.path : `/${item.path}`;
    console.log('Item path:', itemPath);
    
    const itemNode: TreeNode = {
      key: itemPath,
      label: item.name,
      data: item,
      icon: item.is_directory ? 'icon-folder' : 'icon-file',
      children: item.is_directory
        ? transformDataToTreeNodes(
            item.children ?? [],
            itemPath,
            selectedPaths,
          )
        : undefined,
      className: selectedPaths?.includes(itemPath) ? 'p-node-disabled' : '',
    };
    result.push(itemNode);
  }

  return result;
}
export function flattenDirectoryContents(
  data: DirectoryContent[],
): DirectoryContent[] {
  const result: DirectoryContent[] = [];

  for (const item of data ?? []) {
    result.push(item);
    if (item.is_directory) {
      result.push(...flattenDirectoryContents(item.children ?? []));
    }
  }

  return result;
}
