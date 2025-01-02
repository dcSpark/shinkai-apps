import { transformFileInfo } from './transformations';

describe('transformFileInfo', () => {
  it('should handle a directory', () => {
    const input = [{
      children: null,
      created_time: "2024-12-30T05:27:59.764041184+00:00",
      has_embeddings: false,
      is_directory: true,
      modified_time: "2024-12-30T05:27:59.764041184+00:00",
      name: "nico",
      path: "nico",
      size: 0
    }];

    const result = transformFileInfo(input);
    expect(result).toEqual([{
      children: null,
      created_time: "2024-12-30T05:27:59.764041184+00:00",
      has_embeddings: false,
      is_directory: true,
      modified_time: "2024-12-30T05:27:59.764041184+00:00",
      name: "nico",
      path: "/nico",
      size: 0,
      extension: null,
      file_size: null
    }]);
  });

  it('should handle a file', () => {
    const input = [{
      children: null,
      created_time: "2025-01-02T15:06:30.697154651+00:00",
      has_embeddings: true,
      is_directory: false,
      modified_time: "2025-01-02T15:06:30.697297610+00:00",
      name: "file.txt",
      path: "nico/file.txt",
      size: 956232
    }];

    const result = transformFileInfo(input);
    expect(result).toEqual([{
      children: null,
      created_time: "2025-01-02T15:06:30.697154651+00:00",
      has_embeddings: true,
      is_directory: false,
      modified_time: "2025-01-02T15:06:30.697297610+00:00",
      name: "file.txt",
      path: "/nico/file.txt",
      size: 956232,
      extension: "txt",
      file_size: "956232"
    }]);
  });

  it('should handle an empty array', () => {
    const input = [];

    const result = transformFileInfo(input);
    expect(result).toEqual([]);
  });

  it('should handle multiple items', () => {
    const input = [
      {
        children: null,
        created_time: "2024-12-30T05:27:59.764041184+00:00",
        has_embeddings: false,
        is_directory: true,
        modified_time: "2024-12-30T05:27:59.764041184+00:00",
        name: "nico",
        path: "nico",
        size: 0
      },
      {
        children: null,
        created_time: "2025-01-02T15:06:30.697154651+00:00",
        has_embeddings: true,
        is_directory: false,
        modified_time: "2025-01-02T15:06:30.697297610+00:00",
        name: "file.txt",
        path: "nico/file.txt",
        size: 956232
      }
    ];

    const result = transformFileInfo(input);
    expect(result).toEqual([
      {
        children: null,
        created_time: "2024-12-30T05:27:59.764041184+00:00",
        has_embeddings: false,
        is_directory: true,
        modified_time: "2024-12-30T05:27:59.764041184+00:00",
        name: "nico",
        path: "/nico",
        size: 0,
        extension: null,
        file_size: null
      },
      {
        children: null,
        created_time: "2025-01-02T15:06:30.697154651+00:00",
        has_embeddings: true,
        is_directory: false,
        modified_time: "2025-01-02T15:06:30.697297610+00:00",
        name: "file.txt",
        path: "/nico/file.txt",
        size: 956232,
        extension: "txt",
        file_size: "956232"
      }
    ]);
  });
}); 