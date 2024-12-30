import { transformFileInfo } from './transformations';

describe('transformFileInfo', () => {
  it('should add name, extension, and file_size to a file', () => {
    const data = [{
      created_time: "2024-12-30T05:27:59.764041184+00:00",
      has_embeddings: false,
      is_directory: false,
      modified_time: "2024-12-30T05:27:59.764041184+00:00",
      path: "nico/file.txt"
    }];

    const result = transformFileInfo(data);
    expect(result).toEqual([{
      created_time: "2024-12-30T05:27:59.764041184+00:00",
      has_embeddings: false,
      is_directory: false,
      modified_time: "2024-12-30T05:27:59.764041184+00:00",
      path: "nico/file.txt",
      name: "file.txt",
      extension: "txt",
      file_size: "0"
    }]);
  });

  it('should add name and set extension and file_size to null for a directory', () => {
    const data = [{
      created_time: "2024-12-30T05:27:59.764041184+00:00",
      has_embeddings: false,
      is_directory: true,
      modified_time: "2024-12-30T05:27:59.764041184+00:00",
      path: "nico"
    }];

    const result = transformFileInfo(data);
    expect(result).toEqual([{
      created_time: "2024-12-30T05:27:59.764041184+00:00",
      has_embeddings: false,
      is_directory: true,
      modified_time: "2024-12-30T05:27:59.764041184+00:00",
      path: "nico",
      name: "nico",
      extension: null,
      file_size: null
    }]);
  });

  it('should handle paths with a leading slash', () => {
    const data = [{
      created_time: "2024-12-30T05:27:59.764041184+00:00",
      has_embeddings: false,
      is_directory: false,
      modified_time: "2024-12-30T05:27:59.764041184+00:00",
      path: "/nico/file.txt"
    }];

    const result = transformFileInfo(data);
    expect(result).toEqual([{
      created_time: "2024-12-30T05:27:59.764041184+00:00",
      has_embeddings: false,
      is_directory: false,
      modified_time: "2024-12-30T05:27:59.764041184+00:00",
      path: "/nico/file.txt",
      name: "file.txt",
      extension: "txt",
      file_size: "0"
    }]);
  });

  it('should handle files without an extension', () => {
    const data = [{
      created_time: "2024-12-30T05:27:59.764041184+00:00",
      has_embeddings: false,
      is_directory: false,
      modified_time: "2024-12-30T05:27:59.764041184+00:00",
      path: "nico/file"
    }];

    const result = transformFileInfo(data);
    expect(result).toEqual([{
      created_time: "2024-12-30T05:27:59.764041184+00:00",
      has_embeddings: false,
      is_directory: false,
      modified_time: "2024-12-30T05:27:59.764041184+00:00",
      path: "nico/file",
      name: "file",
      extension: null,
      file_size: "0"
    }]);
  });
}); 