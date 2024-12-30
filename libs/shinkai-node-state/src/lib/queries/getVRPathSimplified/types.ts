import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';
import { QueryObserverOptions } from '@tanstack/react-query';

import { FunctionKey } from '../../constants';

type ResourceSource = {
  Standard: {
    FileRef: {
      file_name: string;
      file_type: {
        Document: string;
      };
      original_creation_datetime: null;
      text_chunking_strategy: string;
    };
  };
};

type ResourceKeywords = {
  keyword_list: string[];
  keywords_embedding: null;
};

export type FileInfo = {
  created_time: string;
  has_embeddings: boolean;
  is_directory: boolean;
  modified_time: string;
  path: string;
};

export type VRItem = FileInfo;
export type VRFolder = FileInfo;

export type GetVRPathSimplifiedInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  path: string;
};
export type UseGetMySharedFolders = [
  FunctionKey.GET_VR_FILES,
  GetVRPathSimplifiedInput,
];

export type GetVRPathSimplifiedOutput = VRFolder;

export type Options = QueryObserverOptions<
  GetVRPathSimplifiedOutput,
  Error,
  GetVRPathSimplifiedOutput,
  GetVRPathSimplifiedOutput,
  UseGetMySharedFolders
>;
