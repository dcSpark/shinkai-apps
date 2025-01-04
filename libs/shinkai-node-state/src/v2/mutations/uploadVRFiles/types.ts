export type UploadVRFilesOutput = {
  status: string;
};

export type UploadVRFilesInput = {
  nodeAddress: string;
  token: string;
  destinationPath: string;
  files: File[];
};

