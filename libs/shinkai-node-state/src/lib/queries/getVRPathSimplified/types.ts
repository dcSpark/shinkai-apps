import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type GetVRPathSimplifiedInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  path: string;
};

type ResourceSource = {
  Reference: {
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
  //
  last_modified_datetime: Date;
  last_read_datetime: Date;
  merkle_hash: string;
  name: string;
};

//
// {
//   "path": "/",
//   "child_folders": [
//   {
//     "name": "paulclindo",
//     "path": "/paulclindo",
//     "child_folders": [],
//     "child_items": [
//       {
//         "name": "AlgoExpert_Receipt",
//         "path": "/paulclindo/AlgoExpert_Receipt",
//         "vr_header": {
//           "resource_name": "AlgoExpert_Receipt",
//           "resource_id": "80ecf6ec02e454d1f526020420d1f3e335559380d343557340ff4cb655cf6d5d",
//           "resource_base_type": "Document",
//           "resource_source": {
//             "Reference": {
//               "FileRef": {
//                 "file_name": "AlgoExpert_Receipt",
//                 "file_type": {
//                   "Document": "Pdf"
//                 },
//                 "original_creation_datetime": null,
//                 "text_chunking_strategy": "V1"
//               }
//             }
//           },
//           "resource_embedding": null,
//           "resource_created_datetime": "2024-03-14T15:23:44.576027Z",
//           "resource_last_written_datetime": "2024-03-14T15:24:01.174128Z",
//           "resource_embedding_model_used": {
//             "TextEmbeddingsInference": "AllMiniLML6v2"
//           },
//           "resource_merkle_root": "19762bd86e72113836d47273a9cf15a9e90a6bc5789b059564c3c5652230f06d",
//           "resource_keywords": {
//             "keyword_list": [
//               "access period) payment date: 2024-02-27 (utc)payment date: 2024-02-27 (utc) expiration date: 2025-02-27 (utc)the algoexpert team algoexpert llcalgoexpert llc 401 ryland street suite 200-a reno",
//               "name: paul ccariname: paul ccari purchase id: s-ch_3oow64fsbhafd8pu1ti72jdzpurchase id: s-ch_3oow64fsbhafd8pu1ti72jdz account id: z2l0ahvifdrhytc0mjqzlwe2ytutndvlms1injcwltg1zjrknjhizda4mg==account id: z2l0ahvifdrhytc0mjqzlwe2ytutndvlms1injcwltg1zjrknjhizda4mg== account type: githubaccount type: github product(s): algoexpert",
//               "systemsexpertaccess type: annual (you",
//               "purchase receipt;",
//               "purchase details",
//               "nv 89502",
//               "blockchainexpert",
//               "frontendexpert",
//               "infraexpert",
//               "iosexpert",
//               "mlexpert",
//               "billed"
//             ],
//             "keywords_embedding": null
//           },
//           "data_tag_names": [],
//           "metadata_index_keys": [
//             "page_numbers"
//           ]
//         },
//         "created_datetime": "2024-03-14T15:23:44.576027Z",
//         "last_written_datetime": "2024-03-14T15:24:01.174128Z",
//         "last_read_datetime": "2024-03-14T15:24:01.175605Z",
//         "vr_last_saved_datetime": "2024-03-14T15:24:01.175605Z",
//         "source_file_map_last_saved_datetime": "2024-03-14T15:24:01.175605Z",
//         "distribution_origin": null,
//         "vr_size": 183527,
//         "source_file_map_size": 245217,
//         "merkle_hash": "19762bd86e72113836d47273a9cf15a9e90a6bc5789b059564c3c5652230f06d"
//       }
//     ],
//     "created_datetime": "2024-03-13T21:24:30.457050Z",
//     "last_read_datetime": "2024-03-13T23:22:39.114753Z",
//     "last_modified_datetime": "2024-03-14T15:24:01.175605Z",
//     "last_written_datetime": "2024-03-14T15:24:01.175605Z",
//     "merkle_hash": "3d65e31df3badbcdd4484de5c9847dab265b53a54e7f36c8f21ab4af5ef389c5"
//   },
//   {
//     "name": "paucl1",
//     "path": "/paucl1",
//     "child_folders": [],
//     "child_items": [],
//     "created_datetime": "2024-03-13T23:22:39.122708Z",
//     "last_read_datetime": "2024-03-13T23:22:39.122702Z",
//     "last_modified_datetime": "2024-03-13T23:22:39.122702Z",
//     "last_written_datetime": "2024-03-13T23:22:39.122792Z",
//     "merkle_hash": "af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262"
//   }
// ],
//   "created_datetime": "2024-03-12T23:16:58.464571Z",
//   "last_written_datetime": "2024-03-14T15:24:01.185255Z",
//   "merkle_root": "0a25f12d4b182faf4486b709a94a04cb162ad85c5c0ef1157859b3fe2ed0b963"
// }
