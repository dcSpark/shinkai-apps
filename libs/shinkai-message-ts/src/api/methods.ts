/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AgentCredentialsPayload,
  CreateChatInboxResponse,
  CredentialsPayload,
  JobCredentialsPayload,
  LastMessagesFromInboxCredentialsPayload,
  SetupPayload,
  ShinkaiMessage,
  SmartInbox,
} from '../models';
import {
  APIUseRegistrationCodeSuccessResponse,
  SubmitInitialRegistrationNoCodePayload,
} from '../models/Payloads';
import { SerializedAgent } from '../models/SchemaTypes';
import { InboxNameWrapper } from '../pkg/shinkai_message_wasm';
import { calculateMessageHash } from '../utils';
import { urlJoin } from '../utils/url-join';
import { FileUploader } from '../wasm/FileUploaderUsingSymmetricKeyManager';
import { SerializedAgentWrapper } from '../wasm/SerializedAgentWrapper';
import { ShinkaiMessageBuilderWrapper } from '../wasm/ShinkaiMessageBuilderWrapper';
import { ShinkaiNameWrapper } from '../wasm/ShinkaiNameWrapper';

// Helper function to handle HTTP errors
export const handleHttpError = async (response: Response): Promise<void> => {
  if (response.status < 200 || response.status >= 300) {
    let error: { code: string; error: string; message: string } | undefined;
    try {
      error = await response.json();
    } catch (e) {
      console.error(`Error parsing http error response ${response.body}`);
      error = undefined;
    }
    throw new Error(
      `HTTP error: ${response.status} ${error?.code}, ${error?.error}, ${error?.message}`,
    );
  }
};

export const fetchPublicKey =
  (nodeAddress: string) => async (): Promise<any> => {
    try {
      const response = await fetch(urlJoin(nodeAddress, '/get_public_key'));
      return response.json();
    } catch (error) {
      console.error('Error fetching public key:', error);
      throw error;
    }
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

  try {
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

    const response = await fetch(urlJoin(nodeAddress, '/v1/send'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });
    const data: CreateChatInboxResponse = await response.json();

    await handleHttpError(response);

    if (message.body && 'unencrypted' in message.body) {
      const inboxId = message.body.unencrypted.internal_metadata.inbox;
      return { inboxId };
    } else {
      return { inboxId: data.data.inbox };
    }
  } catch (error) {
    console.error('Error sending text message:', error);
    throw error;
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
  try {
    // Note(Nico): we are forcing to send messages from profiles by removing device related stuff
    const senderShinkaiName = new ShinkaiNameWrapper(
      sender + '/' + sender_subidentity,
    );
    const senderProfile = senderShinkaiName.get_profile_name;

    const messageStr =
      ShinkaiMessageBuilderWrapper.send_text_message_with_inbox(
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

    const response = await fetch(urlJoin(nodeAddress, '/v1/send'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });
    const data: CreateChatInboxResponse = await response.json();

    await handleHttpError(response);

    if (message.body && 'unencrypted' in message.body) {
      const inboxId = message.body.unencrypted.internal_metadata.inbox;
      return { inboxId };
    } else {
      return { inboxId: data.data.inbox };
    }
  } catch (error) {
    console.error('Error sending text message:', error);
    throw error;
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
): Promise<{ inboxId: string; message: ShinkaiMessage }> => {
  try {
    const fileUploader = new FileUploader(
      nodeAddress,
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      job_inbox,
      sender,
      sender_subidentity,
      receiver,
    );

    await fileUploader.createFolder();
    for (const fileToUpload of files) {
      await fileUploader.uploadEncryptedFile(fileToUpload);
    }
    const responseText = await fileUploader.finalizeAndSend(text_message, null);
    const message: ShinkaiMessage = JSON.parse(responseText);

    if (message.body && 'unencrypted' in message.body) {
      const inboxId = message.body.unencrypted.internal_metadata.inbox;
      return { inboxId, message };
    } else {
      console.warn('message body is null or encrypted');
      // TODO: workaround to skip error reading encrypted message
      return { inboxId: job_inbox, message };
    }
  } catch (error) {
    console.error('Error sending text message with file:', error);
    throw error;
  }
};

export const getAllInboxesForProfile = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  target_shinkai_name_profile: string,
  setupDetailsState: CredentialsPayload,
): Promise<SmartInbox[]> => {
  try {
    const messageString =
      ShinkaiMessageBuilderWrapper.get_all_inboxes_for_profile(
        setupDetailsState.profile_encryption_sk,
        setupDetailsState.profile_identity_sk,
        setupDetailsState.node_encryption_pk,
        sender,
        sender_subidentity,
        receiver,
        target_shinkai_name_profile,
      );

    const message = JSON.parse(messageString);

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/get_all_smart_inboxes_for_profile'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = await response.json();
    await handleHttpError(response);
    return data.data;
  } catch (error) {
    console.error('Error getting all inboxes for profile:', error);
    throw error;
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
  try {
    const messageString =
      ShinkaiMessageBuilderWrapper.update_shinkai_inbox_name(
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/update_smart_inbox_name'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = await response.json();
    await handleHttpError(response);
    return data;
  } catch (error) {
    console.error('Error updating inbox name:', error);
    throw error;
  }
};

export const getLastMessagesFromInbox = async (
  nodeAddress: string,
  inbox: string,
  count: number,
  lastKey: string | undefined,
  setupDetailsState: LastMessagesFromInboxCredentialsPayload,
): Promise<ShinkaiMessage[]> => {
  try {
    const messageStr =
      ShinkaiMessageBuilderWrapper.get_last_messages_from_inbox(
        setupDetailsState.profile_encryption_sk,
        setupDetailsState.profile_identity_sk,
        setupDetailsState.node_encryption_pk,
        inbox,
        count,
        lastKey,
        setupDetailsState.shinkai_identity,
        setupDetailsState.profile,
        setupDetailsState.shinkai_identity,
      );

    const message = JSON.parse(messageStr);

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/last_messages_from_inbox'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    await handleHttpError(response);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting last messages from inbox:', error);
    throw error;
  }
};

export const submitRequestRegistrationCode = async (
  nodeAddress: string,
  identity_permissions: string,
  code_type = 'profile',
  setupDetailsState: SetupPayload,
): Promise<string> => {
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/create_registration_code'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);
    const data = await response.json();
    return data.code;
  } catch (error) {
    console.error('Error creating registration code:', error);
    throw error;
  }
};

export const submitRegistrationCode = async (
  setupData: SetupPayload,
): Promise<
  { encryption_public_key: string; identity_public_key: string } | undefined
> => {
  try {
    const messageStr =
      ShinkaiMessageBuilderWrapper.use_code_registration_for_device(
        setupData.my_device_encryption_sk,
        setupData.my_device_identity_sk,
        setupData.profile_encryption_sk,
        setupData.profile_identity_sk,
        setupData.node_encryption_pk,
        setupData.registration_code,
        setupData.identity_type,
        setupData.permission_type,
        setupData.registration_name,
        setupData.profile || '', // sender_profile_name: it doesn't exist yet in the Node
        setupData.shinkai_identity,
      );

    const message = JSON.parse(messageStr);

    // Use node_address from setupData for API endpoint
    const response = await fetch(
      urlJoin(setupData.node_address, '/v1/use_registration_code'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);

    // Update the API_ENDPOINT after successful registration
    setupData.node_address;
    return response.json();
  } catch (error) {
    console.error('Error using registration code:', error);
    return undefined;
  }
};

export const health = async (payload: {
  node_address: string;
}): Promise<{
  status: 'ok';
  node_name: string;
  is_pristine: boolean;
  version: string;
}> => {
  const healthResponse = await fetch(
    urlJoin(payload.node_address, '/v1/shinkai_health'),
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    },
  );
  await handleHttpError(healthResponse);
  const responseData = await healthResponse.json();
  return responseData;
};

export const submitInitialRegistrationNoCode = async (
  payload: SubmitInitialRegistrationNoCodePayload,
): Promise<{
  success: boolean;
  data?: APIUseRegistrationCodeSuccessResponse;
}> => {
  try {
    // Used to fetch the shinkai identity
    const healthResponse = await fetch(
      urlJoin(payload.node_address, '/v1/shinkai_health'),
      {
        method: 'GET',
      },
    );
    await handleHttpError(healthResponse);
    const { status, node_name }: { status: 'ok'; node_name: string } =
      await healthResponse.json();
    if (status !== 'ok') {
      throw new Error(
        `Node status error, can't fetch shinkai identity from health ${status} ${node_name}`,
      );
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

    // Use node_address from setupData for API endpoint
    const response = await fetch(
      urlJoin(payload.node_address, '/v1/use_registration_code'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);

    // Update the API_ENDPOINT after successful registration
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error in initial registration:', error);
    return { success: false };
  }
};

export const pingAllNodes = async (nodeAddress: string): Promise<string> => {
  try {
    const response = await fetch(urlJoin(nodeAddress, '/ping_all'), {
      method: 'POST',
    });
    await handleHttpError(response);
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error pinging all nodes:', error);
    throw error;
  }
};

export const createJob = async (
  nodeAddress: string,
  scope: any,
  is_hidden: boolean,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: JobCredentialsPayload,
): Promise<string> => {
  try {
    const messageStr = ShinkaiMessageBuilderWrapper.job_creation(
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      scope,
      is_hidden,
      sender,
      sender_subidentity,
      receiver,
      receiver_subidentity,
    );

    const message = JSON.parse(messageStr);

    const response = await fetch(urlJoin(nodeAddress, '/v1/create_job'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });
    await handleHttpError(response);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

export const sendMessageToJob = async (
  nodeAddress: string,
  jobId: string,
  content: string,
  files_inbox: string,
  parent: string | null,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: JobCredentialsPayload,
): Promise<string> => {
  try {
    const messageStr = ShinkaiMessageBuilderWrapper.job_message(
      jobId,
      content,
      files_inbox,
      parent || '',
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      sender,
      sender_subidentity,
      receiver,
      receiver_subidentity,
    );

    const message = JSON.parse(messageStr);

    const response = await fetch(urlJoin(nodeAddress, '/v1/job_message'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });
    await handleHttpError(response);
    // TODO: response to create message job just contain an string replying "Job message processed successfully"
    return response.text();
  } catch (error) {
    console.error('Error sending message to job:', error);
    throw error;
  }
};

export const getProfileAgents = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  setupDetailsState: CredentialsPayload,
): Promise<SerializedAgent[]> => {
  try {
    const messageStr = ShinkaiMessageBuilderWrapper.get_profile_agents(
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      sender,
      sender_subidentity,
      receiver,
    );

    const message = JSON.parse(messageStr);
    console.log('Get Profile Agents Message:', message);
    const messageHash = calculateMessageHash(message);
    console.log('Get Profile Agents Message Hash:', messageHash);

    const response = await fetch(urlJoin(nodeAddress, '/v1/available_agents'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });
    await handleHttpError(response);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error sending message to job:', error);
    throw error;
  }
};

export const addAgent = async (
  nodeAddress: string,
  sender_subidentity: string,
  node_name: string,
  agent: SerializedAgent,
  setupDetailsState: AgentCredentialsPayload,
) => {
  try {
    const agent_wrapped = SerializedAgentWrapper.fromSerializedAgent(agent);
    const messageStr = ShinkaiMessageBuilderWrapper.request_add_agent(
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      node_name,
      sender_subidentity,
      node_name,
      agent_wrapped,
    );

    const message = JSON.parse(messageStr);

    const response = await fetch(urlJoin(nodeAddress, '/v1/add_agent'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });
    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message to add agent:', error);
    throw error;
  }
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
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/get_filenames_for_file_inbox'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    const data = await response.json();
    await handleHttpError(response);
    return data;
  } catch (error) {
    console.error('Error updating inbox name:', error);
    throw error;
  }
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
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/update_job_to_finished'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error archiving job:', error);
    throw error;
  }
};
export const createVRFolder = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  folderName: string,
  path: string = '/',
  setupDetailsState: CredentialsPayload,
): Promise<{ status: string }> => {
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/vec_fs/create_folder'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error createVRFolder:', error);
    throw error;
  }
};
export const retrieveVRPathSimplified = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  path: string = '/',
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/vec_fs/retrieve_path_simplified_json'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);
    const data = await response.json();
    return typeof data?.data === 'string'
      ? {
          data: JSON.parse(data.data),
          status: data.status,
        }
      : data;
  } catch (error) {
    console.error('Error retrieveVRPathSimplified:', error);
    throw error;
  }
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
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/vec_fs/retrieve_vector_search_simplified_json'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error retrieveVectorSearchSimplified:', error);
    throw error;
  }
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
  path: string = '/',
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/vec_fs/retrieve_vector_resource'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);
    const data = await response.json();
    return typeof data?.data === 'string'
      ? {
          data: JSON.parse(data.data),
          status: data.status,
        }
      : data;
  } catch (error) {
    console.error('Error retrieveVectorResource:', error);
    throw error;
  }
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
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/vec_fs/move_folder'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error moveFolderVR:', error);
    throw error;
  }
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
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/vec_fs/copy_folder'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error copyFolderVR:', error);
    throw error;
  }
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
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/vec_fs/remove_folder'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleteFolderVR:', error);
    throw error;
  }
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
  try {
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

    const response = await fetch(urlJoin(nodeAddress, '/v1/vec_fs/move_item'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });

    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error moveItemVR:', error);
    throw error;
  }
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
  try {
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

    const response = await fetch(urlJoin(nodeAddress, '/v1/vec_fs/copy_item'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });

    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error copyItemVR:', error);
    throw error;
  }
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
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/vec_fs/remove_item'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleteItemVR:', error);
    throw error;
  }
};
export const searchItemsVR = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  search: string,
  path: string = '/',
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/vec_fs/search_items'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error retrieveVectorSearchSimplified:', error);
    throw error;
  }
};
export const getAvailableSharedFolders = async (
  pageSize?: number,
  page?: number,
  priceFilter?: 'paid' | 'free' | 'all',
  search?: string,
): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    if (pageSize != null) queryParams.append('pageSize', pageSize.toString());
    if (page != null) queryParams.append('page', page.toString());
    if (priceFilter && priceFilter !== 'all')
      queryParams.append('price', priceFilter);
    if (search) queryParams.append('search', search);

    const response = await fetch(
      `https://sepolia-subscription-indexer.shinkai.com/api/v1/shared-items?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getAvailableSharedFolders:', error);
    throw error;
  }
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
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/available_shared_items'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);
    const data = await response.json();
    return typeof data?.data === 'string'
      ? {
          data: JSON.parse(data.data),
          status: data.status,
        }
      : data;
  } catch (error) {
    console.error('Error getMySharedFolders:', error);
    throw error;
  }
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
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/create_shareable_folder'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error createShareableFolder:', error);
    throw error;
  }
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
  try {
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

    const response = await fetch(urlJoin(nodeAddress, '/v1/unshare_folder'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });

    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error createShareableFolder:', error);
    throw error;
  }
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
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/subscribe_to_shared_folder'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error createShareableFolder:', error);
    throw error;
  }
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
  try {
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

    const response = await fetch(urlJoin(nodeAddress, '/v1/unsubscribe'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });

    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error createShareableFolder:', error);
    throw error;
  }
};
export const getMySubscriptions = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  try {
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

    const response = await fetch(urlJoin(nodeAddress, '/v1/my_subscriptions'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });

    await handleHttpError(response);
    const data = await response.json();
    return typeof data?.data === 'string'
      ? {
          data: JSON.parse(data.data),
          status: data.status,
        }
      : data;
  } catch (error) {
    console.error('Error getMySubscriptions:', error);
    throw error;
  }
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
  try {
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

    const response = await fetch(
      urlJoin(nodeAddress, '/v1/change_nodes_name'),
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error changeNodeName:', error);
    throw error;
  }
};
