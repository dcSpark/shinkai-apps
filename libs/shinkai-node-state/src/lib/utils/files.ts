import { TreeNode } from 'primereact/treenode';

import { VRFolder, VRItem } from '../queries/getVRPathSimplified/types';

export function transformDataToTreeNodes(
  data: VRFolder,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parentPath: string = '/',
): TreeNode[] {
  const result: TreeNode[] = [];

  for (const folder of data?.child_folders ?? []) {
    const folderNode: TreeNode = {
      key: folder.path,
      label: folder.name,
      data: folder,
      icon: 'icon-folder',
      children: transformDataToTreeNodes(folder, folder.path),
    };
    result.push(folderNode);
  }

  for (const item of data.child_items ?? []) {
    const itemNode: TreeNode = {
      key: item.path,
      label: item.name,
      data: item,
      icon: 'icon-file',
    };
    result.push(itemNode);
  }

  return result;
}

export function getFlatChildItems(data: VRFolder): VRItem[] {
  let result: VRItem[] = [];

  for (const folder of data?.child_folders ?? []) {
    result = result.concat(getFlatChildItems(folder));
  }

  for (const item of data.child_items ?? []) {
    result.push(item);
  }

  return result;
}
