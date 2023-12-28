/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MessageSchemaType,
  SerializedAgent,
  ShinkaiMessage,
  ShinkaiMessageBuilder,
  ShinkaiName,
  TSEncryptionMethod,
  UnencryptedMessageBody,
} from '@shinkai_network/shinkai-typescript';
import { Buffer } from 'buffer';

import {
  AgentCredentialsPayload,
  CredentialsPayload,
  JobCredentialsPayload,
  LastMessagesFromInboxCredentialsPayload,
  SetupPayload,
  SmartInbox,
} from '../models';
import {
  APIUseRegistrationCodeSuccessResponse,
  SubmitInitialRegistrationNoCodePayload,
} from '../models/Payloads';
import { calculateMessageHash } from '../utils';
import { urlJoin } from '../utils/url-join';
import { ApiConfig } from './api_config';
import { FileUploader } from './files/file_uploader';
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

export const fetchPublicKey = () => async (): Promise<any> => {
  const apiEndpoint = ApiConfig.getInstance().getEndpoint();
  try {
    const response = await fetch(`${apiEndpoint}/get_public_key`);
    return response.json();
  } catch (error) {
    console.error('Error fetching public key:', error);
    throw error;
  }
};

export const createChatWithMessage = async (
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  text_message: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ inboxId: string; message: ShinkaiMessage }> => {
  const receiverShinkaiName = new ShinkaiName(
    receiver + '/' + receiver_subidentity,
  );

  try {
    const shinkaiMessageBuilder = new ShinkaiMessageBuilder(
      Buffer.from(setupDetailsState.profile_encryption_sk, 'hex'),
      Buffer.from(setupDetailsState.profile_identity_sk, 'hex'),
      Buffer.from(setupDetailsState.node_encryption_pk, 'hex'),
    );

    await shinkaiMessageBuilder.init();

    shinkaiMessageBuilder.set_message_raw_content(text_message);
    shinkaiMessageBuilder.set_message_schema_type(
      MessageSchemaType.TextContent,
    );
    shinkaiMessageBuilder.set_internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      TSEncryptionMethod.None,
    );
    shinkaiMessageBuilder.set_external_metadata_with_intra_sender(
      receiverShinkaiName.fullName,
      sender,
      sender_subidentity,
    );
    shinkaiMessageBuilder.set_body_encryption(
      TSEncryptionMethod.DiffieHellmanChaChaPoly1305,
    );

    const message: ShinkaiMessage = await shinkaiMessageBuilder.build();

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(urlJoin(apiEndpoint, '/v1/send'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });

    await handleHttpError(response);

    if (message.body instanceof UnencryptedMessageBody) {
      const inboxId = message.body.unencrypted.internal_metadata.inbox;
      return { inboxId, message };
    } else {
      throw new Error('message body is null or encrypted');
    }
  } catch (error) {
    console.error('Error sending text message:', error);
    throw error;
  }
};

export const sendTextMessageWithInbox = async (
  sender: string,
  sender_subidentity: string,
  receiver: string,
  text_message: string,
  inbox_name: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ inboxId: string; message: ShinkaiMessage }> => {
  try {
    const message = await ShinkaiMessageBuilder.sendTextMessageWithInbox(
      Buffer.from(setupDetailsState.profile_encryption_sk, 'hex'),
      Buffer.from(setupDetailsState.profile_identity_sk, 'hex'),
      Buffer.from(setupDetailsState.node_encryption_pk, 'hex'),
      sender,
      sender_subidentity,
      receiver,
      '',
      inbox_name,
      text_message,
    );
    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(urlJoin(apiEndpoint, '/v1/send'), {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });
    await handleHttpError(response);
    if (message.body instanceof UnencryptedMessageBody) {
      const inboxId = message.body.unencrypted.internal_metadata.inbox;
      return { inboxId, message };
    } else {
      throw new Error('message body is null or encrypted');
    }
  } catch (error) {
    console.error('Error sending text message:', error);
    throw error;
  }
};

export const sendTextMessageWithFilesForInbox = async (
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
      ApiConfig.getInstance().getEndpoint(),
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
    const responseText = await fileUploader.finalizeAndSend(text_message);
    const message: ShinkaiMessage = JSON.parse(responseText);

    if (message.body instanceof UnencryptedMessageBody) {
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
  sender: string,
  sender_subidentity: string,
  receiver: string,
  target_shinkai_name_profile: string,
  setupDetailsState: CredentialsPayload,
): Promise<SmartInbox[]> => {
  try {
    const message = await ShinkaiMessageBuilder.getAllInboxesForProfile(
      Buffer.from(setupDetailsState.profile_encryption_sk, 'hex'),
      Buffer.from(setupDetailsState.profile_identity_sk, 'hex'),
      Buffer.from(setupDetailsState.node_encryption_pk, 'hex'),
      target_shinkai_name_profile,
      sender_subidentity,
      sender,
      receiver,
    );
    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(
      urlJoin(apiEndpoint, '/v1/get_all_smart_inboxes_for_profile'),
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
  sender: string,
  sender_subidentity: string,
  receiver: string,
  setupDetailsState: CredentialsPayload,
  inboxName: string,
  inboxId: string,
): Promise<{ success: string; data: null }> => {
  try {
    const message = await ShinkaiMessageBuilder.updateInboxName(
      Buffer.from(setupDetailsState.profile_encryption_sk, 'hex'),
      Buffer.from(setupDetailsState.profile_identity_sk, 'hex'),
      Buffer.from(setupDetailsState.node_encryption_pk, 'hex'),
      sender,
      sender_subidentity,
      receiver,
      '',
      inboxId,
      inboxName,
    );
    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(
      urlJoin(apiEndpoint, '/v1/update_smart_inbox_name'),
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
  inbox: string,
  count: number,
  lastKey: string | null,
  setupDetailsState: LastMessagesFromInboxCredentialsPayload,
): Promise<ShinkaiMessage[]> => {
  try {
    const message = await ShinkaiMessageBuilder.getLastMessagesFromInbox(
      Buffer.from(setupDetailsState.profile_encryption_sk, 'hex'),
      Buffer.from(setupDetailsState.profile_identity_sk, 'hex'),
      Buffer.from(setupDetailsState.node_encryption_pk, 'hex'),
      inbox,
      count,
      lastKey,
      setupDetailsState.profile,
      setupDetailsState.shinkai_identity,
      setupDetailsState.shinkai_identity,
    );
    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(
      urlJoin(apiEndpoint, '/v1/last_messages_from_inbox'),
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

    const message = await ShinkaiMessageBuilder.requestCodeRegistration(
      Buffer.from(setupDetailsState.profile_encryption_sk, 'hex'),
      Buffer.from(setupDetailsState.profile_identity_sk, 'hex'),
      Buffer.from(setupDetailsState.node_encryption_pk, 'hex'),
      identity_permissions,
      code_type,
      sender_profile_name,
      setupDetailsState.shinkai_identity,
      setupDetailsState.shinkai_identity,
    );
    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(
      urlJoin(apiEndpoint, '/v1/create_registration_code'),
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
    const message = await ShinkaiMessageBuilder.useCodeRegistrationForDevice(
      Buffer.from(setupData.my_device_encryption_sk, 'hex'),
      Buffer.from(setupData.my_device_identity_sk, 'hex'),
      Buffer.from(setupData.profile_encryption_sk, 'hex'),
      Buffer.from(setupData.profile_identity_sk, 'hex'),
      Buffer.from(setupData.node_encryption_pk, 'hex'),
      setupData.registration_code,
      setupData.identity_type,
      setupData.permission_type,
      setupData.registration_name,
      setupData.profile || '', // sender_profile_name: it doesn't exist yet in the Node
      setupData.shinkai_identity,
      setupData.shinkai_identity,
    );
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
    ApiConfig.getInstance().setEndpoint(setupData.node_address);
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
    const { status, node_name } = await health({
      node_address: payload.node_address,
    });
    if (status !== 'ok') {
      throw new Error(
        `Node status error, can't fetch shinkai identity from health ${status} ${node_name}`,
      );
    }
    const message =
      await ShinkaiMessageBuilder.initialRegistrationWithNoCodeForDevice(
        Buffer.from(payload.my_device_encryption_sk, 'hex'),
        Buffer.from(payload.my_device_identity_sk, 'hex'),
        Buffer.from(payload.profile_encryption_sk, 'hex'),
        Buffer.from(payload.profile_identity_sk, 'hex'),
        payload.registration_name,
        payload.registration_name,
        payload.profile || '', // sender_profile_name: it doesn't exist yet in the Node
        node_name,
      );
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
    ApiConfig.getInstance().setEndpoint(payload.node_address);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error in initial registration:', error);
    return { success: false };
  }
};

export const pingAllNodes = async (): Promise<string> => {
  const apiEndpoint = ApiConfig.getInstance().getEndpoint();
  try {
    const response = await fetch(`${apiEndpoint}/ping_all`, { method: 'POST' });
    await handleHttpError(response);
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error pinging all nodes:', error);
    throw error;
  }
};

export const createJob = async (
  scope: any,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: JobCredentialsPayload,
): Promise<string> => {
  try {
    const message = await ShinkaiMessageBuilder.jobCreation(
      scope,
      Buffer.from(setupDetailsState.profile_encryption_sk, 'hex'),
      Buffer.from(setupDetailsState.profile_identity_sk, 'hex'),
      Buffer.from(setupDetailsState.node_encryption_pk, 'hex'),
      sender,
      sender_subidentity,
      receiver,
      receiver_subidentity,
    );
    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(urlJoin(apiEndpoint, '/v1/create_job'), {
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
  jobId: string,
  content: string,
  files_inbox: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: JobCredentialsPayload,
): Promise<string> => {
  try {
    const message = await ShinkaiMessageBuilder.jobMessage(
      jobId,
      content,
      files_inbox,
      Buffer.from(setupDetailsState.profile_encryption_sk, 'hex'),
      Buffer.from(setupDetailsState.profile_identity_sk, 'hex'),
      Buffer.from(setupDetailsState.node_encryption_pk, 'hex'),
      sender,
      sender_subidentity,
      receiver,
      receiver_subidentity,
    );

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(urlJoin(apiEndpoint, '/v1/job_message'), {
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
  sender: string,
  sender_subidentity: string,
  receiver: string,
  setupDetailsState: CredentialsPayload,
): Promise<SerializedAgent[]> => {
  try {
    const message =
      await ShinkaiMessageBuilder.createCustomShinkaiMessageToNode(
        Buffer.from(setupDetailsState.profile_encryption_sk, 'hex'),
        Buffer.from(setupDetailsState.profile_identity_sk, 'hex'),
        Buffer.from(setupDetailsState.node_encryption_pk, 'hex'),
        '',
        sender,
        sender_subidentity,
        receiver,
        MessageSchemaType.Empty,
      );

    console.log('Get Profile Agents Message:', message);
    const messageHash = calculateMessageHash(message);
    console.log('Get Profile Agents Message Hash:', messageHash);

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(urlJoin(apiEndpoint, '/v1/available_agents'), {
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
  sender_subidentity: string,
  node_name: string,
  agent: SerializedAgent,
  setupDetailsState: AgentCredentialsPayload,
) => {
  try {
    const message = await ShinkaiMessageBuilder.requestAddAgent(
      Buffer.from(setupDetailsState.profile_encryption_sk, 'hex'),
      Buffer.from(setupDetailsState.profile_identity_sk, 'hex'),
      Buffer.from(setupDetailsState.node_encryption_pk, 'hex'),
      agent,
      sender_subidentity,
      node_name,
      node_name,
    );

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(urlJoin(apiEndpoint, '/v1/add_agent'), {
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
    const builder = new ShinkaiMessageBuilder(
      Buffer.from(setupDetailsState.profile_encryption_sk, 'hex'),
      Buffer.from(setupDetailsState.profile_identity_sk, 'hex'),
      Buffer.from(setupDetailsState.node_encryption_pk, 'hex'),
    );
    await builder.init();

    builder.set_message_raw_content(fileInbox);
    builder.set_message_schema_type(MessageSchemaType.TextContent);
    builder.set_internal_metadata_with_inbox(
      sender_subidentity,
      receiver,
      inboxId,
      TSEncryptionMethod.None,
    );
    builder.set_external_metadata_with_intra_sender(
      receiver,
      sender,
      sender_subidentity,
    );
    builder.set_body_encryption(TSEncryptionMethod.DiffieHellmanChaChaPoly1305);

    const message = await builder.build();

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(
      urlJoin(apiEndpoint, '/v1/get_filenames_for_file_inbox'),
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
