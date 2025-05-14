import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import { ShinkaiMessageBuilderWrapper } from '../../wasm/ShinkaiMessageBuilderWrapper';
import {
  CheckHealthResponse,
  GetNodeStorageLocationResponse,
  GetPreferencesResponse,
  GetShinkaiFreeModelQuotaResponse,
  InitialRegistrationRequest,
  InitialRegistrationResponse,
  SetPreferencesRequest,
  SetPreferencesResponse,
  SubmitRegistrationCodeRequest,
  SubmitRegistrationCodeResponse,
} from './types';

export const checkHealth = async (nodeAddress: string) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/health_check'),
    { responseType: 'json' },
  );
  return response.data as CheckHealthResponse;
};

export const getNodeStorageLocation = async (
  nodeAddress: string,
  token: string,
): Promise<GetNodeStorageLocationResponse> => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/storage_location'),
    { responseType: 'json', headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

export const submitRegistrationCode = async (
  nodeAddress: string,
  setupData: SubmitRegistrationCodeRequest,
): Promise<SubmitRegistrationCodeResponse> => {
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

    const response = await httpClient.post(
      urlJoin(nodeAddress, '/v1/use_registration_code'),
      message,
      { responseType: 'json' },
    );

    return response.data;
  } catch (error) {
    console.error('Error using registration code:', error);
    throw error;
  }
};

export const updateNodeName = async (
  nodeAddress: string,
  token: string,
  newNodeName: string,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/change_node_name'),
    { new_name: newNodeName },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
};

export const initialRegistration = async (
  nodeAddress: string,
  payload: InitialRegistrationRequest,
): Promise<InitialRegistrationResponse> => {
  const healthResponse = await checkHealth(nodeAddress);
  const { status, is_pristine } = healthResponse;
  if (status !== 'ok') {
    return { status: 'error' };
  }
  if (!is_pristine) {
    return { status: 'non-pristine' };
  }

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/initial_registration'),
    payload,
    { responseType: 'json' },
  );
  const data = response.data;
  return { status: 'success', data };
};

export const getShinkaiFreeModelQuota = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/shinkai_backend_quota'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      params: {
        model: 'FREE_TEXT_INFERENCE',
      },
      responseType: 'json',
    },
  );
  return response.data as GetShinkaiFreeModelQuotaResponse;
};

export const setPreferences = async (
  nodeAddress: string,
  bearerToken: string,
  payload: SetPreferencesRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/set_preferences'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as SetPreferencesResponse;
};

export const getPreferences = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/get_preferences'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetPreferencesResponse;
};
