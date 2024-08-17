/* tslint:disable */
/* eslint-disable */
/**
* @param {string} encryption_sk
* @returns {string}
*/
export function convert_encryption_sk_string_to_encryption_pk_string(encryption_sk: string): string;
/**
* @param {string} input
* @returns {string}
*/
export function calculate_blake3_hash(input: string): string;
/**
*/
export class InboxNameWrapper {
  free(): void;
/**
* @param {any} inbox_name_js
*/
  constructor(inbox_name_js: any);
/**
* @returns {any}
*/
  to_jsvalue(): any;
/**
* @returns {string}
*/
  to_json_str(): string;
/**
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} recipient
* @param {string} recipient_subidentity
* @param {boolean} is_e2e
* @returns {InboxNameWrapper}
*/
  static get_regular_inbox_name_from_params(sender: string, sender_subidentity: string, recipient: string, recipient_subidentity: string, is_e2e: boolean): InboxNameWrapper;
/**
* @param {string} unique_id
* @returns {InboxNameWrapper}
*/
  static get_job_inbox_name_from_params(unique_id: string): InboxNameWrapper;
/**
* @returns {any}
*/
  get_inner(): any;
/**
*/
  readonly get_identities: any;
/**
*/
  readonly get_is_e2e: boolean;
/**
*/
  readonly get_unique_id: any;
/**
*/
  readonly get_value: any;
/**
*/
  readonly to_string: any;
}
/**
*/
export class JobCreationWrapper {
  free(): void;
/**
* @param {any} scope_js
* @param {boolean} is_hidden
* @param {any} associated_ui_js
*/
  constructor(scope_js: any, is_hidden: boolean, associated_ui_js: any);
/**
* @returns {any}
*/
  to_jsvalue(): any;
/**
* @returns {string}
*/
  to_json_str(): string;
/**
* @param {string} s
* @returns {JobCreationWrapper}
*/
  static from_json_str(s: string): JobCreationWrapper;
/**
* @param {any} js_value
* @returns {JobCreationWrapper}
*/
  static from_jsvalue(js_value: any): JobCreationWrapper;
/**
* @returns {JobCreationWrapper}
*/
  static empty(): JobCreationWrapper;
/**
*/
  readonly get_scope: any;
}
/**
*/
export class JobMessageWrapper {
  free(): void;
/**
* @param {any} job_id_js
* @param {any} content_js
* @param {any} files_inbox
* @param {any} parent
* @param {any} workflow_code
* @param {any} workflow_name
*/
  constructor(job_id_js: any, content_js: any, files_inbox: any, parent: any, workflow_code: any, workflow_name: any);
/**
* @returns {any}
*/
  to_jsvalue(): any;
/**
* @returns {string}
*/
  to_json_str(): string;
/**
* @param {string} s
* @returns {JobMessageWrapper}
*/
  static from_json_str(s: string): JobMessageWrapper;
/**
* @param {any} js_value
* @returns {JobMessageWrapper}
*/
  static from_jsvalue(js_value: any): JobMessageWrapper;
/**
* @param {string} job_id
* @param {string} content
* @param {string} files_inbox
* @param {string} parent
* @param {string | undefined} [workflow_code]
* @param {string | undefined} [workflow_name]
* @returns {JobMessageWrapper}
*/
  static fromStrings(job_id: string, content: string, files_inbox: string, parent: string, workflow_code?: string, workflow_name?: string): JobMessageWrapper;
}
/**
*/
export class JobScopeWrapper {
  free(): void;
/**
* @param {any} buckets_js
* @param {any} documents_js
*/
  constructor(buckets_js: any, documents_js: any);
/**
* @returns {any}
*/
  to_jsvalue(): any;
/**
* @returns {string}
*/
  to_json_str(): string;
}
/**
*/
export class SerializedLLMProviderWrapper {
  free(): void;
/**
* @param {any} serialized_agent_js
*/
  constructor(serialized_agent_js: any);
/**
* @param {string} id
* @param {string} full_identity_name
* @param {string} perform_locally
* @param {string} external_url
* @param {string} api_key
* @param {string} model
* @param {string} toolkit_permissions
* @param {string} storage_bucket_permissions
* @param {string} allowed_message_senders
* @returns {SerializedLLMProviderWrapper}
*/
  static fromStrings(id: string, full_identity_name: string, perform_locally: string, external_url: string, api_key: string, model: string, toolkit_permissions: string, storage_bucket_permissions: string, allowed_message_senders: string): SerializedLLMProviderWrapper;
/**
* @returns {any}
*/
  to_jsvalue(): any;
/**
* @param {any} j
* @returns {SerializedLLMProviderWrapper}
*/
  static fromJsValue(j: any): SerializedLLMProviderWrapper;
/**
* @returns {string}
*/
  to_json_str(): string;
/**
* @param {string} s
* @returns {SerializedLLMProviderWrapper}
*/
  static from_json_str(s: string): SerializedLLMProviderWrapper;
/**
*/
  readonly inner: any;
}
/**
*/
export class ShinkaiMessageBuilderWrapper {
  free(): void;
/**
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
*/
  constructor(my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string);
/**
* @param {any} encryption
*/
  body_encryption(encryption: any): void;
/**
*/
  no_body_encryption(): void;
/**
* @param {string} message_raw_content
*/
  message_raw_content(message_raw_content: string): void;
/**
* @param {any} content
*/
  message_schema_type(content: any): void;
/**
* @param {string} sender_subidentity
* @param {string} recipient_subidentity
* @param {any} encryption
*/
  internal_metadata(sender_subidentity: string, recipient_subidentity: string, encryption: any): void;
/**
* @param {string} sender_subidentity
* @param {string} recipient_subidentity
* @param {string} inbox
* @param {any} encryption
*/
  internal_metadata_with_inbox(sender_subidentity: string, recipient_subidentity: string, inbox: string, encryption: any): void;
/**
* @param {string} sender_subidentity
* @param {string} recipient_subidentity
* @param {string} inbox
* @param {any} message_schema
* @param {any} encryption
*/
  internal_metadata_with_schema(sender_subidentity: string, recipient_subidentity: string, inbox: string, message_schema: any, encryption: any): void;
/**
*/
  empty_encrypted_internal_metadata(): void;
/**
*/
  empty_non_encrypted_internal_metadata(): void;
/**
* @param {string} recipient
* @param {string} sender
*/
  external_metadata(recipient: string, sender: string): void;
/**
* @param {string} recipient
* @param {string} sender
* @param {string} intra_sender
*/
  external_metadata_with_intra(recipient: string, sender: string, intra_sender: string): void;
/**
* @param {string} recipient
* @param {string} sender
* @param {string} other
*/
  external_metadata_with_other(recipient: string, sender: string, other: string): void;
/**
* @param {string} recipient
* @param {string} sender
* @param {string} other
* @param {string} intra_sender
*/
  external_metadata_with_other_and_intra_sender(recipient: string, sender: string, other: string, intra_sender: string): void;
/**
* @param {string} recipient
* @param {string} sender
* @param {string} scheduled_time
*/
  external_metadata_with_schedule(recipient: string, sender: string, scheduled_time: string): void;
/**
* @returns {ShinkaiMessageWrapper}
*/
  build(): ShinkaiMessageWrapper;
/**
* @returns {any}
*/
  build_to_jsvalue(): any;
/**
* @returns {string}
*/
  build_to_string(): string;
/**
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} receiver
* @returns {string}
*/
  static ack_message(my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, sender: string, sender_subidentity: string, receiver: string): string;
/**
* @param {string} my_subidentity_encryption_sk
* @param {string} my_subidentity_signature_sk
* @param {string} receiver_public_key
* @param {string} permissions
* @param {string} code_type
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} recipient
* @param {string} recipient_subidentity
* @returns {string}
*/
  static request_code_registration(my_subidentity_encryption_sk: string, my_subidentity_signature_sk: string, receiver_public_key: string, permissions: string, code_type: string, sender: string, sender_subidentity: string, recipient: string, recipient_subidentity: string): string;
/**
* @param {string} profile_encryption_sk
* @param {string} profile_signature_sk
* @param {string} receiver_public_key
* @param {string} code
* @param {string} identity_type
* @param {string} permission_type
* @param {string} registration_name
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} recipient
* @param {string} recipient_subidentity
* @returns {string}
*/
  static use_code_registration_for_profile(profile_encryption_sk: string, profile_signature_sk: string, receiver_public_key: string, code: string, identity_type: string, permission_type: string, registration_name: string, sender: string, sender_subidentity: string, recipient: string, recipient_subidentity: string): string;
/**
* @param {string} my_device_encryption_sk
* @param {string} my_device_signature_sk
* @param {string} profile_encryption_sk
* @param {string} profile_signature_sk
* @param {string} receiver_public_key
* @param {string} code
* @param {string} identity_type
* @param {string} permission_type
* @param {string} registration_name
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} recipient
* @param {string} recipient_subidentity
* @returns {string}
*/
  static use_code_registration_for_device(my_device_encryption_sk: string, my_device_signature_sk: string, profile_encryption_sk: string, profile_signature_sk: string, receiver_public_key: string, code: string, identity_type: string, permission_type: string, registration_name: string, sender: string, sender_subidentity: string, recipient: string, recipient_subidentity: string): string;
/**
* @param {string} my_device_encryption_sk
* @param {string} my_device_signature_sk
* @param {string} profile_encryption_sk
* @param {string} profile_signature_sk
* @param {string} registration_name
* @param {string} sender_subidentity
* @param {string} sender
* @param {string} receiver
* @returns {string}
*/
  static initial_registration_with_no_code_for_device(my_device_encryption_sk: string, my_device_signature_sk: string, profile_encryption_sk: string, profile_signature_sk: string, registration_name: string, sender_subidentity: string, sender: string, receiver: string): string;
/**
* @param {string} my_subidentity_encryption_sk
* @param {string} my_subidentity_signature_sk
* @param {string} receiver_public_key
* @param {string} inbox
* @param {number} count
* @param {string | undefined} offset
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} recipient
* @param {string} recipient_subidentity
* @returns {string}
*/
  static get_last_messages_from_inbox(my_subidentity_encryption_sk: string, my_subidentity_signature_sk: string, receiver_public_key: string, inbox: string, count: number, offset: string | undefined, sender: string, sender_subidentity: string, recipient: string, recipient_subidentity: string): string;
/**
* @param {string} my_subidentity_encryption_sk
* @param {string} my_subidentity_signature_sk
* @param {string} receiver_public_key
* @param {string} inbox
* @param {number} count
* @param {string | undefined} offset
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} recipient
* @param {string} recipient_subidentity
* @returns {string}
*/
  static get_last_unread_messages_from_inbox(my_subidentity_encryption_sk: string, my_subidentity_signature_sk: string, receiver_public_key: string, inbox: string, count: number, offset: string | undefined, sender: string, sender_subidentity: string, recipient: string, recipient_subidentity: string): string;
/**
* @param {string} my_subidentity_encryption_sk
* @param {string} my_subidentity_signature_sk
* @param {string} receiver_public_key
* @param {string} agent_json
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} recipient
* @param {string} recipient_subidentity
* @returns {string}
*/
  static request_add_agent(my_subidentity_encryption_sk: string, my_subidentity_signature_sk: string, receiver_public_key: string, agent_json: string, sender: string, sender_subidentity: string, recipient: string, recipient_subidentity: string): string;
/**
* @param {string} my_subidentity_encryption_sk
* @param {string} my_subidentity_signature_sk
* @param {string} receiver_public_key
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} recipient
* @param {string} recipient_subidentity
* @returns {string}
*/
  static get_all_availability_agent(my_subidentity_encryption_sk: string, my_subidentity_signature_sk: string, receiver_public_key: string, sender: string, sender_subidentity: string, recipient: string, recipient_subidentity: string): string;
/**
* @param {string} my_subidentity_encryption_sk
* @param {string} my_subidentity_signature_sk
* @param {string} receiver_public_key
* @param {string} inbox
* @param {string} up_to_time
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} recipient
* @param {string} recipient_subidentity
* @returns {string}
*/
  static read_up_to_time(my_subidentity_encryption_sk: string, my_subidentity_signature_sk: string, receiver_public_key: string, inbox: string, up_to_time: string, sender: string, sender_subidentity: string, recipient: string, recipient_subidentity: string): string;
/**
* @param {string} my_subidentity_encryption_sk
* @param {string} my_subidentity_signature_sk
* @param {string} receiver_public_key
* @param {string} data
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} recipient
* @param {string} recipient_subidentity
* @param {string} other
* @param {string} schema
* @returns {string}
*/
  static create_custom_shinkai_message_to_node(my_subidentity_encryption_sk: string, my_subidentity_signature_sk: string, receiver_public_key: string, data: string, sender: string, sender_subidentity: string, recipient: string, recipient_subidentity: string, other: string, schema: string): string;
/**
* @param {string} message
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} sender
* @param {string} receiver
* @returns {string}
*/
  static ping_pong_message(message: string, my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, sender: string, receiver: string): string;
/**
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {any} scope
* @param {boolean} is_hidden
* @param {any} associated_ui
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} receiver
* @param {string} receiver_subidentity
* @returns {string}
*/
  static job_creation(my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, scope: any, is_hidden: boolean, associated_ui: any, sender: string, sender_subidentity: string, receiver: string, receiver_subidentity: string): string;
/**
* @param {string} job_id
* @param {string} content
* @param {string} files_inbox
* @param {string} parent
* @param {string | undefined} workflow_code
* @param {string | undefined} workflow_name
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} receiver
* @param {string} receiver_subidentity
* @returns {string}
*/
  static job_message(job_id: string, content: string, files_inbox: string, parent: string, workflow_code: string | undefined, workflow_name: string | undefined, my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, sender: string, sender_subidentity: string, receiver: string, receiver_subidentity: string): string;
/**
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} receiver
* @returns {string}
*/
  static terminate_message(my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, sender: string, sender_subidentity: string, receiver: string): string;
/**
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} receiver
* @param {string} error_msg
* @returns {string}
*/
  static error_message(my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, sender: string, sender_subidentity: string, receiver: string, error_msg: string): string;
/**
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} folder_name
* @param {string} path
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} receiver
* @param {string} receiver_subidentity
* @returns {string}
*/
  static vecfs_create_folder(my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, folder_name: string, path: string, sender: string, sender_subidentity: string, receiver: string, receiver_subidentity: string): string;
/**
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} origin_path
* @param {string} destination_path
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} receiver
* @param {string} receiver_subidentity
* @returns {string}
*/
  static vecfs_move_folder(my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, origin_path: string, destination_path: string, sender: string, sender_subidentity: string, receiver: string, receiver_subidentity: string): string;
/**
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} origin_path
* @param {string} destination_path
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} receiver
* @param {string} receiver_subidentity
* @returns {string}
*/
  static vecfs_copy_folder(my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, origin_path: string, destination_path: string, sender: string, sender_subidentity: string, receiver: string, receiver_subidentity: string): string;
/**
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} origin_path
* @param {string} destination_path
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} receiver
* @param {string} receiver_subidentity
* @returns {string}
*/
  static vecfs_move_item(my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, origin_path: string, destination_path: string, sender: string, sender_subidentity: string, receiver: string, receiver_subidentity: string): string;
/**
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} origin_path
* @param {string} destination_path
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} receiver
* @param {string} receiver_subidentity
* @returns {string}
*/
  static vecfs_copy_item(my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, origin_path: string, destination_path: string, sender: string, sender_subidentity: string, receiver: string, receiver_subidentity: string): string;
/**
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} destination_path
* @param {string} file_inbox
* @param {string | undefined} file_datetime_iso8601
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} receiver
* @param {string} receiver_subidentity
* @returns {string}
*/
  static vecfs_create_items(my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, destination_path: string, file_inbox: string, file_datetime_iso8601: string | undefined, sender: string, sender_subidentity: string, receiver: string, receiver_subidentity: string): string;
/**
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} path
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} receiver
* @param {string} receiver_subidentity
* @returns {string}
*/
  static vecfs_retrieve_resource(my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, path: string, sender: string, sender_subidentity: string, receiver: string, receiver_subidentity: string): string;
/**
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} path
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} receiver
* @param {string} receiver_subidentity
* @returns {string}
*/
  static vecfs_retrieve_path_simplified(my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, path: string, sender: string, sender_subidentity: string, receiver: string, receiver_subidentity: string): string;
/**
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} search
* @param {string | undefined} path
* @param {number | undefined} max_results
* @param {number | undefined} max_files_to_scan
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} receiver
* @param {string} receiver_subidentity
* @returns {string}
*/
  static vecfs_retrieve_vector_search_simplified(my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, search: string, path: string | undefined, max_results: number | undefined, max_files_to_scan: number | undefined, sender: string, sender_subidentity: string, receiver: string, receiver_subidentity: string): string;
/**
* @param {any} payload_create_shareable_folder
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} node_receiver
* @param {string} node_receiver_subidentity
* @returns {string}
*/
  static subscriptions_create_share_folder(payload_create_shareable_folder: any, my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, sender: string, sender_subidentity: string, node_receiver: string, node_receiver_subidentity: string): string;
/**
* @param {string} shared_folder
* @param {any} requirements
* @param {boolean | undefined} http_preferred
* @param {string | undefined} base_folder
* @param {string} streamer_node
* @param {string} streamer_profile
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} node_receiver
* @param {string} node_receiver_subidentity
* @returns {string}
*/
  static vecfs_subscribe_to_shared_folder(shared_folder: string, requirements: any, http_preferred: boolean | undefined, base_folder: string | undefined, streamer_node: string, streamer_profile: string, my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, sender: string, sender_subidentity: string, node_receiver: string, node_receiver_subidentity: string): string;
/**
* @param {string} shared_folder
* @param {string} streamer_node
* @param {string} streamer_profile
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} node_receiver
* @param {string} node_receiver_subidentity
* @returns {string}
*/
  static subscription_unsubscribe_to_shared_folder(shared_folder: string, streamer_node: string, streamer_profile: string, my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, sender: string, sender_subidentity: string, node_receiver: string, node_receiver_subidentity: string): string;
/**
* @param {string} results
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} node_receiver
* @param {string} node_receiver_subidentity
* @returns {string}
*/
  static subscription_available_shared_items_response(results: string, my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, sender: string, sender_subidentity: string, node_receiver: string, node_receiver_subidentity: string): string;
/**
* @param {string | undefined} path
* @param {string} streamer_node_name
* @param {string} streamer_profile_name
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} node_receiver
* @param {string} node_receiver_subidentity
* @returns {string}
*/
  static subscription_available_shared_items(path: string | undefined, streamer_node_name: string, streamer_profile_name: string, my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, sender: string, sender_subidentity: string, node_receiver: string, node_receiver_subidentity: string): string;
/**
* @param {string} shared_folder_path
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} node_receiver
* @param {string} node_receiver_subidentity
* @returns {string}
*/
  static subscription_request_share_current_shared_folder_state(shared_folder_path: string, my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, sender: string, sender_subidentity: string, node_receiver: string, node_receiver_subidentity: string): string;
/**
* @param {any} tree_item_response
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} sender
* @param {string} sender_profile
* @param {string} node_receiver
* @param {string} node_receiver_profile
* @returns {string}
*/
  static subscription_share_current_shared_folder_state(tree_item_response: any, my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, sender: string, sender_profile: string, node_receiver: string, node_receiver_profile: string): string;
/**
* @param {string} my_encryption_secret_key
* @param {string} my_signature_secret_key
* @param {string} receiver_public_key
* @param {string} sender
* @param {string} sender_subidentity
* @param {string} node_receiver
* @param {string} node_receiver_subidentity
* @returns {string}
*/
  static subscription_my_subscriptions(my_encryption_secret_key: string, my_signature_secret_key: string, receiver_public_key: string, sender: string, sender_subidentity: string, node_receiver: string, node_receiver_subidentity: string): string;
}
/**
*/
export class ShinkaiMessageWrapper {
  free(): void;
/**
* @param {any} shinkai_message_js
*/
  constructor(shinkai_message_js: any);
/**
* @returns {any}
*/
  to_jsvalue(): any;
/**
* @param {any} j
* @returns {ShinkaiMessageWrapper}
*/
  static fromJsValue(j: any): ShinkaiMessageWrapper;
/**
* @returns {string}
*/
  to_json_str(): string;
/**
* @param {string} s
* @returns {ShinkaiMessageWrapper}
*/
  static from_json_str(s: string): ShinkaiMessageWrapper;
/**
* @returns {string}
*/
  calculate_blake3_hash(): string;
/**
* @returns {ShinkaiMessageWrapper}
*/
  new_with_empty_outer_signature(): ShinkaiMessageWrapper;
/**
* @returns {ShinkaiMessageWrapper}
*/
  new_with_empty_inner_signature(): ShinkaiMessageWrapper;
/**
* @returns {string}
*/
  inner_content_for_hashing(): string;
/**
* @returns {string}
*/
  calculate_blake3_hash_with_empty_outer_signature(): string;
/**
* @returns {string}
*/
  calculate_blake3_hash_with_empty_inner_signature(): string;
/**
* @returns {string}
*/
  static generate_time_now(): string;
/**
*/
  encryption: string;
/**
*/
  external_metadata: any;
/**
*/
  message_body: any;
}
/**
*/
export class ShinkaiNameWrapper {
  free(): void;
/**
* @param {any} shinkai_name_js
*/
  constructor(shinkai_name_js: any);
/**
* @returns {any}
*/
  to_jsvalue(): any;
/**
* @returns {string}
*/
  to_json_str(): string;
/**
* @returns {ShinkaiNameWrapper}
*/
  extract_profile(): ShinkaiNameWrapper;
/**
* @returns {ShinkaiNameWrapper}
*/
  extract_node(): ShinkaiNameWrapper;
/**
*/
  readonly get_full_name: any;
/**
*/
  readonly get_node_name_string: any;
/**
*/
  readonly get_profile_name_string: any;
/**
*/
  readonly get_subidentity_name: any;
/**
*/
  readonly get_subidentity_type: any;
}
/**
*/
export class ShinkaiStringTime {
  free(): void;
/**
* @returns {string}
*/
  static generateTimeNow(): string;
/**
* @param {bigint} secs
* @returns {string}
*/
  static generateTimeInFutureWithSecs(secs: bigint): string;
/**
* @param {number} year
* @param {number} month
* @param {number} day
* @param {number} hr
* @param {number} min
* @param {number} sec
* @returns {string}
*/
  static generateSpecificTime(year: number, month: number, day: number, hr: number, min: number, sec: number): string;
}
/**
*/
export class WasmEncryptionMethod {
  free(): void;
/**
* @param {string} method
*/
  constructor(method: string);
/**
* @returns {string}
*/
  as_str(): string;
/**
* @returns {string}
*/
  static DiffieHellmanChaChaPoly1305(): string;
/**
* @returns {string}
*/
  static None(): string;
}
