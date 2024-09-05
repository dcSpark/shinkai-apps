import { ToolUsageType } from '../tools/types';

export type CheckHealthResponse = {
  status: 'ok';
  node_name: string;
  is_pristine: boolean;
  version: string;
};

export type Token = { token: string };

export type PaymentRequest = {
  description: string;
  invoice: {
    address: {
      address_id: string;
      network_id: string;
    };
    expiration_time: string;
    invoice_date_time: string;
    invoice_id: string;
    payment: any;
    provider_name: string;
    request_date_time: string;
    requester_name: string;
    response_date_time: string | null;
    result_str: string | null;
    shinkai_offering: {
      meta_description: string | null;
      tool_key: string;
      usage_type: ToolUsageType;
    };
    status: string;
    tool_data: any;
    usage_type_inquiry: any;
  };
};

export type Widget = {
  PaymentRequest?: PaymentRequest;
};
export type WidgetToolType = keyof Widget;
export type WidgetToolData = Widget[WidgetToolType];

export type WsMessage = {
  message_type: 'Stream' | 'ShinkaiMessage' | 'Sheet' | 'Widget';
  inbox: string;
  message: string;
  error_message: string;
  metadata?: {
    id: string;
    is_done: boolean;
    done_reason: string;
    total_duration: number;
    eval_count: number;
  };
  widget?: Widget;
};

export type SubmitRegistrationCodeRequest = {
  my_device_encryption_sk: string;
  my_device_identity_sk: string;
  profile_encryption_sk: string;
  profile_identity_sk: string;
  node_encryption_pk: string;
  registration_code: string;
  identity_type: string;
  permission_type: string;
  registration_name: string;
  profile: string; // sender_profile_name: it doesn't exist yet in the Node
  shinkai_identity: string;
  node_address: string;
};
export type SubmitRegistrationCodeResponse = {
  encryption_public_key: string;
  identity_public_key: string;
};

export type SubmitRegistrationNoCodeRequest = {
  node_address: string;
  my_device_encryption_sk: string;
  my_device_identity_sk: string;
  profile_encryption_sk: string;
  profile_identity_sk: string;
  registration_name: string;
  profile: string;
};
export type UseRegistrationNoCodeResponse = {
  message: string;
  encryption_public_key: string;
  identity_public_key: string;
  node_name: string;
  api_v2_key: string;
};
export type SubmitRegistrationNoCodeStatus =
  | 'success'
  | 'error'
  | 'non-pristine';

export type SubmitRegistrationNoCodeResponse = {
  status: SubmitRegistrationNoCodeStatus;
  data?: UseRegistrationNoCodeResponse;
};
