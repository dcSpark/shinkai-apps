import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import { ShinkaiMessageBuilderWrapper } from '../../wasm/ShinkaiMessageBuilderWrapper';
import {
  CheckHealthResponse,
  SubmitRegistrationCodeRequest,
  SubmitRegistrationCodeResponse,
  SubmitRegistrationNoCodeRequest,
  SubmitRegistrationNoCodeResponse,
} from './types';

export const checkHealth = async (nodeAddress: string) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/health_check'),
    { responseType: 'json' },
  );
  return response.data as CheckHealthResponse;
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

export const submitRegistrationNoCode = async (
  nodeAddress: string,
  payload: SubmitRegistrationNoCodeRequest,
): Promise<SubmitRegistrationNoCodeResponse> => {
  try {
    const healthResponse = await checkHealth(nodeAddress);
    const { status, node_name, is_pristine } = healthResponse;
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
      urlJoin(nodeAddress, '/v1/use_registration_code'),
      message,
      { responseType: 'json' },
    );
    const data = response.data.data;
    return { status: 'success', data };
  } catch (error) {
    console.error('Error in initial registration:', error);
    return { status: 'error' };
  }
};
