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

type VRHeader = {
  resource_name: string;
  resource_id: string;
  resource_base_type: 'Document';
  resource_source: ResourceSource;
  resource_embedding: null;
  resource_created_datetime: Date;
  resource_last_written_datetime: Date;
  resource_embedding_model_used: {
    TextEmbeddingsInference: string;
  };
  resource_merkle_root: string;
  resource_keywords: ResourceKeywords;
  data_tag_names: string[];
  metadata_index_keys: string[];
};

export type VRItem = {
  name: string;
  path: string;
  vr_header: VRHeader;
  created_datetime: Date;
  last_written_datetime: Date;
  last_read_datetime: Date;
  vr_last_saved_datetime: Date;
  source_file_map_last_saved_datetime: Date;
  distribution_origin: null;
  vr_size: number;
  source_file_map_size: number;
  merkle_hash: string;
};

export type VRFolder = {
  path: string;
  child_folders: VRFolder[];
  child_items: Array<VRItem>;
  created_datetime: Date;
  last_written_datetime: Date;
  merkle_root: string;
  last_modified_datetime: Date;
  last_read_datetime: Date;
  merkle_hash: string;
  name: string;
};

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
