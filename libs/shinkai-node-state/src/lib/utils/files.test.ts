import { FileInfo } from '../queries/getVRPathSimplified/types';
import { transformDataToTreeNodes } from './files';

describe('transformDataToTreeNodes', () => {
  it('should handle paths without a leading slash', () => {
    const data: FileInfo[] = [{
      created_time: "2024-12-30T05:27:59.764041184+00:00",
      has_embeddings: false,
      is_directory: true,
      modified_time: "2024-12-30T05:27:59.764041184+00:00",
      path: "nico"
    }];

    const result = transformDataToTreeNodes(data);
    expect(result).toEqual([
      {
        key: "nico",
        label: "nico",
        data: data[0],
        icon: "icon-folder",
        children: []
      }
    ]);
  });

  it('should handle paths with a leading slash', () => {
    const data: FileInfo[] = [{
      created_time: "2024-12-30T05:27:59.764041184+00:00",
      has_embeddings: false,
      is_directory: true,
      modified_time: "2024-12-30T05:27:59.764041184+00:00",
      path: "/nico"
    }];

    const result = transformDataToTreeNodes(data);
    expect(result).toEqual([
      {
        key: "/nico",
        label: "nico",
        data: data[0],
        icon: "icon-folder",
        children: []
      }
    ]);
  });

  it('should handle multiple items', () => {
    const data: FileInfo[] = [
      {
        created_time: "2024-12-30T05:27:59.764041184+00:00",
        has_embeddings: false,
        is_directory: true,
        modified_time: "2024-12-30T05:27:59.764041184+00:00",
        path: "nico"
      },
      {
        created_time: "2024-12-30T05:27:59.764041184+00:00",
        has_embeddings: false,
        is_directory: false,
        modified_time: "2024-12-30T05:27:59.764041184+00:00",
        path: "nico/file.txt"
      }
    ];

    const result = transformDataToTreeNodes(data);
    expect(result).toEqual([
      {
        key: "nico",
        label: "nico",
        data: data[0],
        icon: "icon-folder",
        children: []
      },
      {
        key: "nico/file.txt",
        label: "file.txt",
        data: data[1],
        icon: "icon-file"
      }
    ]);
  });
}); 