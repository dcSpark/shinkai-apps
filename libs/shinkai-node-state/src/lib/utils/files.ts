import { type DirectoryContent } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';

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
