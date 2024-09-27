/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpClient } from '../http-client';
import {
  ColumnBehavior,
  CreateChatInboxResponse,
  CredentialsPayload,
  JobCredentialsPayload,
  LastMessagesFromInboxCredentialsPayload,
  LLMProvider,
  SetupPayload,
  ShinkaiMessage,
} from '../models';
import {
  APIUseRegistrationCodeSuccessResponse,
  SubmitInitialRegistrationNoCodePayload,
} from '../models/Payloads';
import { SerializedLLMProvider } from '../models/SchemaTypes';
import { InboxNameWrapper } from '../pkg/shinkai_message_wasm';
import { urlJoin } from '../utils/url-join';
import { FileUploader } from '../wasm/FileUploaderUsingSymmetricKeyManager';
import { ShinkaiMessageBuilderWrapper } from '../wasm/ShinkaiMessageBuilderWrapper';
import { ShinkaiNameWrapper } from '../wasm/ShinkaiNameWrapper';

export const fetchPublicKey =
  (nodeAddress: string) => async (): Promise<any> => {
    const response = await httpClient.get(
      urlJoin(nodeAddress, '/get_public_key'),
    );
    const data = await response.data;
    return data;
  };

export const createChatWithMessage = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  text_message: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ inboxId: string }> => {
  const senderShinkaiName = new ShinkaiNameWrapper(
    sender + '/' + sender_subidentity,
  );
  const receiverShinkaiName = new ShinkaiNameWrapper(
    receiver + '/' + receiver_subidentity,
  );

  const senderProfile = senderShinkaiName.extract_profile();
  const receiverProfile = receiverShinkaiName.extract_profile();

  const inbox = InboxNameWrapper.get_regular_inbox_name_from_params(
    senderProfile.get_node_name,
    senderProfile.get_profile_name,
    receiverProfile.get_node_name,
    receiverProfile.get_profile_name,
    true,
  );

  const messageStr = ShinkaiMessageBuilderWrapper.create_chat_with_message(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
    text_message,
    inbox.get_value,
  );

  const message: ShinkaiMessage = JSON.parse(messageStr);

  const response = await httpClient.post<CreateChatInboxResponse>(
    urlJoin(nodeAddress, '/v1/send'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;

  if (message.body && 'unencrypted' in message.body) {
    const inboxId = message.body.unencrypted.internal_metadata.inbox;
    return { inboxId };
  } else {
    return { inboxId: data.data.inbox };
  }
};

export const sendTextMessageWithInbox = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  text_message: string,
  inbox_name: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ inboxId: string }> => {
  // Note(Nico): we are forcing to send messages from profiles by removing device related stuff
  const senderShinkaiName = new ShinkaiNameWrapper(
    sender + '/' + sender_subidentity,
  );
  const senderProfile = senderShinkaiName.get_profile_name;

  const messageStr = ShinkaiMessageBuilderWrapper.send_text_message_with_inbox(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sender,
    senderProfile,
    receiver,
    '',
    inbox_name,
    text_message,
  );

  const message: ShinkaiMessage = JSON.parse(messageStr);

  const response = await httpClient.post<CreateChatInboxResponse>(
    urlJoin(nodeAddress, '/v1/send'),
    message,

    {
      responseType: 'json',
    },
  );
  const data: CreateChatInboxResponse = response.data;

  if (message.body && 'unencrypted' in message.body) {
    const inboxId = message.body.unencrypted.internal_metadata.inbox;
    return { inboxId };
  } else {
    return { inboxId: data.data.inbox };
  }
};

export const sendTextMessageWithFilesForInbox = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  text_message: string,
  job_inbox: string,
  files: File[],
  setupDetailsState: CredentialsPayload,
  workflow: string | undefined,
  workflowName: string | undefined,
): Promise<{ inboxId: string; message: ShinkaiMessage }> => {
  const fileUploader = new FileUploader(
    nodeAddress,
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    job_inbox,
    sender,
    sender_subidentity,
    receiver,
    workflow,
    workflowName,
  );

  await fileUploader.createFolder();
  for (const fileToUpload of files) {
    await fileUploader.uploadEncryptedFile(fileToUpload);
  }
  const message = await fileUploader.finalizeAndSend(text_message, null);

  if (message.body && 'unencrypted' in message.body) {
    const inboxId = message.body.unencrypted.internal_metadata.inbox;
    return { inboxId, message };
  } else {
    console.warn('message body is null or encrypted');
    // TODO: workaround to skip error reading encrypted message
    return { inboxId: job_inbox, message };
  }
};

export const updateInboxName = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  setupDetailsState: CredentialsPayload,
  inboxName: string,
  inboxId: string,
): Promise<{ success: string; data: null }> => {
  const messageString = ShinkaiMessageBuilderWrapper.update_shinkai_inbox_name(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sender,
    sender_subidentity,
    receiver,
    '',
    inboxId,
    inboxName,
  );

  const message = JSON.parse(messageString);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/update_smart_inbox_name'),
    message,

    { responseType: 'json' },
  );
  const data = response.data;
  return data;
};

export const submitRequestRegistrationCode = async (
  nodeAddress: string,
  identity_permissions: string,
  code_type = 'profile',
  setupDetailsState: SetupPayload,
): Promise<string> => {
  // TODO: refactor the profile name to be a constant
  // maybe we should add ShinkaiName and InboxName to the wasm library (just ADDED them this needs refactor)
  const sender_profile_name =
    setupDetailsState.profile +
    '/device/' +
    setupDetailsState.registration_name;

  const messageStr = ShinkaiMessageBuilderWrapper.request_code_registration(
    setupDetailsState.my_device_encryption_sk,
    setupDetailsState.my_device_identity_sk,
    setupDetailsState.node_encryption_pk,
    identity_permissions,
    code_type,
    sender_profile_name,
    setupDetailsState.shinkai_identity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/create_registration_code'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data.code;
};

export const submitInitialRegistrationNoCode = async (
  payload: SubmitInitialRegistrationNoCodePayload,
): Promise<{
  status: 'success' | 'error' | 'non-pristine';
  data?: APIUseRegistrationCodeSuccessResponse;
}> => {
  try {
    // Used to fetch the shinkai identity
    const healthResponse = await httpClient.get<{
      status: 'ok';
      node_name: string;
      is_pristine: boolean;
    }>(urlJoin(payload.node_address, '/v2/health_check'));
    const { status, node_name, is_pristine } = healthResponse.data;
    if (status !== 'ok') {
      return { status: 'error' };
    }
    if (!is_pristine) {
      return { status: 'non-pristine' };
    }

    const messageStr =
      ShinkaiMessageBuilderWrapper.initial_registration_with_no_code_for_device(
        payload.my_device_encryption_sk,
        payload.my_device_identity_sk,
        payload.profile_encryption_sk,
        payload.profile_identity_sk,
        payload.registration_name,
        payload.registration_name,
        payload.profile || '', // sender_profile_name: it doesn't exist yet in the Node
        node_name,
      );

    const message = JSON.parse(messageStr);

    const response = await httpClient.post(
      urlJoin(payload.node_address, '/v1/use_registration_code'),
      message,
      {
        responseType: 'json',
      },
    );
    const data = response.data.data;
    return { status: 'success', data };
  } catch (error) {
    console.error('Error in initial registration:', error);
    return { status: 'error' };
  }
};

export const pingAllNodes = async (nodeAddress: string): Promise<string> => {
  const response = await httpClient.post(urlJoin(nodeAddress, '/ping_all'));
  const data = response.data;
  return data.result;
};

export const updateAgentInJob = async (
  nodeAddress: string,
  jobId: string,
  newAgentId: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: string; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.updateAgentInJob(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    jobId,
    newAgentId,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/change_job_agent'),
    message,
    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data;
};
export const sendMessageToJob = async (
  nodeAddress: string,
  jobId: string,
  content: string,
  files_inbox: string,
  parent: string | null,
  workflow: string | undefined,
  workflowName: string | undefined,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: JobCredentialsPayload,
): Promise<{
  message_id: string;
  parent_message_id: string;
  inbox: string;
  scheduled_time: string;
}> => {
  const messageStr = ShinkaiMessageBuilderWrapper.job_message(
    jobId,
    content,
    files_inbox,
    parent || '',
    workflow,
    workflowName,
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/job_message'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data.data;
};

export const getFileNames = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  setupDetailsState: {
    profile_encryption_sk: string;
    profile_identity_sk: string;
    node_encryption_pk: string;
  },
  inboxId: string,
  fileInbox: string,
): Promise<{ success: string; data: string[] }> => {
  const messageString =
    ShinkaiMessageBuilderWrapper.get_filenames_for_file_inbox(
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      sender,
      sender_subidentity,
      receiver,
      '',
      inboxId,
      fileInbox,
    );

  const message = JSON.parse(messageString);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/get_filenames_for_file_inbox'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data;
};
export const archiveJob = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  inbox: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.archive_job(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
    inbox,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/update_job_to_finished'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const createVRFolder = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  folderName: string,
  path = '/',
  setupDetailsState: CredentialsPayload,
): Promise<{ status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.createFolder(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    folderName,
    path,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/vec_fs/create_folder'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const retrieveVRPathSimplified = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  path = '/',
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.retrievePathSimplified(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    path,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/vec_fs/retrieve_path_simplified_json'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return typeof data?.data === 'string'
    ? {
        data: JSON.parse(data.data),
        status: data.status,
      }
    : data;
};
export const createWorkflow = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  workflowRaw: string,
  workflowDescription: string,
  setupDetailsState: CredentialsPayload,
) => {
  const messageStr = ShinkaiMessageBuilderWrapper.createWorkflow(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    workflowRaw,
    workflowDescription,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/add_workflow'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const updateWorkflow = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  workflowRaw: string,
  workflowDescription: string,
  setupDetailsState: CredentialsPayload,
) => {
  const messageStr = ShinkaiMessageBuilderWrapper.updateWorkflow(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    workflowRaw,
    workflowDescription,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/update_workflow'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const removeWorkflow = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  workflowKey: string,
  setupDetailsState: CredentialsPayload,
) => {
  const messageStr = ShinkaiMessageBuilderWrapper.removeWorkflow(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    workflowKey,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/delete_workflow'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};

export const retrieveVectorSearchSimplified = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  searchQuery: string,
  path: string | null = null,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr =
    ShinkaiMessageBuilderWrapper.retrieveVectorSearchSimplified(
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      searchQuery,
      path,
      10,
      null,
      sender,
      sender_subidentity,
      receiver,
      receiver_subidentity,
    );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/vec_fs/retrieve_vector_search_simplified_json'),
    message,
    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};

export const uploadFilesToVR = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  destinationPath: string,
  files: File[],
  setupDetailsState: CredentialsPayload,
): Promise<{ status: string }> => {
  try {
    const fileUploader = new FileUploader(
      nodeAddress,
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      '',
      sender,
      sender_subidentity,
      receiver,
      undefined,
      undefined,
    );

    await fileUploader.createFolder();
    for (const fileToUpload of files) {
      await fileUploader.uploadEncryptedFile(fileToUpload);
    }
    const response =
      await fileUploader.finalizeAndAddItemsToDb(destinationPath);

    return response;
  } catch (error) {
    console.error('Error uploadFilesToVR:', error);
    throw error;
  }
};

// fetch details of vr file
export const retrieveVectorResource = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  path = '/',
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.retrieveResource(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    path,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/vec_fs/retrieve_vector_resource'),
    message,
    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return typeof data?.data === 'string'
    ? {
        data: JSON.parse(data.data),
        status: data.status,
      }
    : data;
};
export const moveFolderVR = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  originPath: string,
  destionationPath: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.moveFolder(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    originPath,
    destionationPath,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/vec_fs/move_folder'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const copyFolderVR = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  originPath: string,
  destionationPath: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.copyFolder(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    originPath,
    destionationPath,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/vec_fs/copy_folder'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const deleteFolderVR = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  folderPath: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.deleteFolder(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    folderPath,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/vec_fs/remove_folder'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const moveItemVR = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  originPath: string,
  destionationPath: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.moveItem(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    originPath,
    destionationPath,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/vec_fs/move_item'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const copyItemVR = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  originPath: string,
  destionationPath: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.copyItem(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    originPath,
    destionationPath,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/vec_fs/copy_item'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const deleteItemVR = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  itemPath: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.deleteItem(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    itemPath,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/vec_fs/remove_item'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const searchItemsVR = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  search: string,
  path = '/',
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.searchItems(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    search,
    path,
    null,
    null,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/vec_fs/search_items'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const getAvailableSharedFolders = async (
  pageSize?: number,
  page?: number,
  priceFilter?: 'paid' | 'free' | 'all',
  search?: string,
): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (pageSize != null) queryParams.append('pageSize', pageSize.toString());
  if (page != null) queryParams.append('page', page.toString());
  if (priceFilter && priceFilter !== 'all')
    queryParams.append('price', priceFilter);
  if (search) queryParams.append('search', search);

  const response = await httpClient.get(
    `https://sepolia-subscription-indexer.shinkai.com/api/v1/shared-items?${queryParams.toString()}`,
    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const getMySharedFolders = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  streamer_node_name: string,
  streamer_profile_name: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.getMySharedFolders(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
    streamer_node_name,
    streamer_profile_name,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/available_shared_items'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return typeof data?.data === 'string'
    ? {
        data: JSON.parse(data.data),
        status: data.status,
      }
    : data;
};

export const createShareableFolder = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  folderPath: string,
  folderDescription: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.createShareableFolder(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    folderPath,
    folderDescription,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/create_shareable_folder'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const unshareFolder = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  folderPath: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.unshareFolder(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    folderPath,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/unshare_folder'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const subscribeToSharedFolder = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  path: string,
  streamer_node_name: string,
  streamer_profile_name: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.subscribeToSharedFolder(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    path,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
    streamer_node_name,
    streamer_profile_name,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/subscribe_to_shared_folder'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const unsubscribeToSharedFolder = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  path: string,
  streamer_node_name: string,
  streamer_profile_name: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.unsubscribeToSharedFolder(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    path,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
    streamer_node_name,
    streamer_profile_name,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/unsubscribe'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const getMySubscriptions = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.getMySubscriptions(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/my_subscriptions'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return typeof data?.data === 'string'
    ? {
        data: JSON.parse(data.data),
        status: data.status,
      }
    : data;
};
export const getSubscriptionNotifications = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.getSubscriptionNotifications(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/get_last_notifications'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};

export const updateNodeName = async (
  nodeAddress: string,
  newNodeName: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.updateNodeName(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    newNodeName,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/change_nodes_name'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data;
};
export const downloadVectorResource = async (
  nodeAddress: string,
  path: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.downloadVectorResource(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    path,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/retrieve_vrkai'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data;
};
export const deleteLLMProvider = async (
  nodeAddress: string,
  agentId: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.deleteLLMProvider(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    agentId,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/remove_agent'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data;
};

export const scanOllamaModels = async (
  nodeAddress: string,
  sender_subidentity: string,
  node_name: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ model: string }[]> => {
  const messageStr = ShinkaiMessageBuilderWrapper.scanOllamaModels(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    node_name,
    sender_subidentity,
    node_name,
    '',
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/scan_ollama_models'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data;
};

export const addOllamaModels = async (
  nodeAddress: string,
  senderSubidentity: string,
  nodeName: string,
  setupDetailsState: CredentialsPayload,
  payload: { models: string[] },
) => {
  const messageStr = ShinkaiMessageBuilderWrapper.addOllamaModels(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    nodeName,
    senderSubidentity,
    nodeName,
    senderSubidentity,
    payload,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/add_ollama_models'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data;
};

export const getUserSheets = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
) => {
  const messageStr = ShinkaiMessageBuilderWrapper.getUserSheets(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/user_sheets'),
    message,
    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const createSheet = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  sheetName: string,
  setupDetailsState: CredentialsPayload,
) => {
  const messageStr = ShinkaiMessageBuilderWrapper.createSheet(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sheetName,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/create_sheet'),
    message,
    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const removeSheet = async (
  nodeAddress: string,
  sheetId: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
) => {
  const messageStr = ShinkaiMessageBuilderWrapper.removeSheet(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sheetId,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/remove_sheet'),
    message,
    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const getSheet = async (
  nodeAddress: string,
  sheetId: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
) => {
  const messageStr = ShinkaiMessageBuilderWrapper.getSheet(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sheetId,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/get_sheet'),
    message,
    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const setCellSheet = async (
  nodeAddress: string,
  sheetId: string,
  columnId: string,
  rowId: string,
  value: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
) => {
  const messageStr = ShinkaiMessageBuilderWrapper.setCellSheet(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sheetId,
    columnId,
    rowId,
    value,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/set_cell_value'),
    message,
    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const setColumnSheet = async (
  nodeAddress: string,
  sheetId: string,
  columnId: string | undefined,
  columnName: string,
  columnBehavior: ColumnBehavior,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
) => {
  try {
    const messageStr = ShinkaiMessageBuilderWrapper.setColumnSheet(
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      sheetId,
      columnId,
      columnName,
      columnBehavior,
      sender,
      sender_subidentity,
      receiver,
      receiver_subidentity,
    );

    const message = JSON.parse(messageStr);

    const response = await httpClient.post(
      urlJoin(nodeAddress, '/v1/set_column'),
      message,
      {
        responseType: 'json',
      },
    );

    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error setColumnSheet:', error);
    throw error;
  }
};
export const removeColumnSheet = async (
  nodeAddress: string,
  sheetId: string,
  columnId: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
) => {
  const messageStr = ShinkaiMessageBuilderWrapper.removeColumnSheet(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sheetId,
    columnId,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/remove_column'),
    message,
    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const addRowsSheet = async (
  nodeAddress: string,
  sheetId: string,
  numberOfRows: number,
  startingRow: number | undefined,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
) => {
  const messageStr = ShinkaiMessageBuilderWrapper.addRowsSheet(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sheetId,
    numberOfRows,
    startingRow,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/add_rows'),
    message,
    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const removeRowsSheet = async (
  nodeAddress: string,
  sheetId: string,
  rowIds: string[],
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
) => {
  const messageStr = ShinkaiMessageBuilderWrapper.removeRowsSheet(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sheetId,
    rowIds,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/remove_rows'),
    message,
    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
