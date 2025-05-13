/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  MessageSchemaType,
  TSEncryptionMethod,
} from '../models/SchemaTypes.js';
import {
  ShinkaiMessageBuilderWrapper as ShinkaiMessageBuilderWrapperWASM,
  ShinkaiMessageWrapper,
} from '../pkg/shinkai_message_wasm.js';

export class ShinkaiMessageBuilderWrapper {
  private wasmBuilder: ShinkaiMessageBuilderWrapperWASM;

  constructor(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
  ) {
    this.wasmBuilder = new ShinkaiMessageBuilderWrapperWASM(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );
  }

  body_encryption(encryption: keyof typeof TSEncryptionMethod): void {
    this.wasmBuilder.body_encryption(TSEncryptionMethod[encryption]);
  }

  no_body_encryption(): void {
    this.wasmBuilder.no_body_encryption();
  }

  message_raw_content(content: string): void {
    this.wasmBuilder.message_raw_content(content);
  }

  message_schema_type(content: string): void {
    this.wasmBuilder.message_schema_type(content);
  }

  internal_metadata(
    sender_subidentity: string,
    recipient_subidentity: string,
    inbox: string,
    encryption: keyof typeof TSEncryptionMethod,
  ): void {
    this.wasmBuilder.internal_metadata_with_inbox(
      sender_subidentity,
      recipient_subidentity,
      inbox,
      TSEncryptionMethod[encryption],
    );
  }

  internal_metadata_with_schema(
    sender_subidentity: string,
    recipient_subidentity: string,
    inbox: string,
    message_schema: any,
    encryption: keyof typeof TSEncryptionMethod,
  ): void {
    this.wasmBuilder.internal_metadata_with_schema(
      sender_subidentity,
      recipient_subidentity,
      inbox,
      message_schema,
      TSEncryptionMethod[encryption],
    );
  }

  empty_encrypted_internal_metadata(): void {
    this.wasmBuilder.empty_encrypted_internal_metadata();
  }

  empty_non_encrypted_internal_metadata(): void {
    this.wasmBuilder.empty_non_encrypted_internal_metadata();
  }

  external_metadata(recipient: string, sender: string): void {
    this.wasmBuilder.external_metadata(recipient, sender);
  }

  external_metadata_with_intra(
    recipient: string,
    sender: string,
    intra_sender: string,
  ): void {
    this.wasmBuilder.external_metadata_with_intra(
      recipient,
      sender,
      intra_sender,
    );
  }

  external_metadata_with_other(
    recipient: string,
    sender: string,
    other: string,
  ): void {
    this.wasmBuilder.external_metadata_with_other(recipient, sender, other);
  }

  external_metadata_with_schedule(
    recipient: string,
    sender: string,
    scheduled_time: string,
  ): void {
    this.wasmBuilder.external_metadata_with_schedule(
      recipient,
      sender,
      scheduled_time,
    );
  }

  build(): ShinkaiMessageWrapper {
    const wasmWrapper = this.wasmBuilder.build();
    return ShinkaiMessageWrapper.fromJsValue(wasmWrapper.to_jsvalue());
  }

  build_to_jsvalue(): any {
    return this.wasmBuilder.build_to_jsvalue();
  }

  build_to_string(): string {
    return this.wasmBuilder.build_to_string();
  }

  static use_code_registration_for_device(
    my_device_encryption_sk: string,
    my_device_signature_sk: string,
    profile_encryption_sk: string,
    profile_signature_sk: string,
    receiver_public_key: string,
    code: string,
    identity_type: string,
    permission_type: string,
    registration_name: string,
    sender_profile_name: string,
    node_name: string,
  ): string {
    return ShinkaiMessageBuilderWrapperWASM.use_code_registration_for_device(
      my_device_encryption_sk,
      my_device_signature_sk,
      profile_encryption_sk,
      profile_signature_sk,
      receiver_public_key,
      code,
      identity_type,
      permission_type,
      registration_name,
      node_name,
      sender_profile_name,
      node_name,
      '',
    );
  }

  static initial_registration_with_no_code_for_device(
    my_device_encryption_sk: string,
    my_device_signature_sk: string,
    profile_encryption_sk: string,
    profile_signature_sk: string,
    registration_name: string,
    sender_subidentity: string,
    sender: string,
    receiver: string,
  ): string {
    return ShinkaiMessageBuilderWrapperWASM.initial_registration_with_no_code_for_device(
      my_device_encryption_sk,
      my_device_signature_sk,
      profile_encryption_sk,
      profile_signature_sk,
      registration_name,
      sender_subidentity,
      sender,
      receiver,
    );
  }

  static ws_connection(
    ws_content: string,
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(ws_content);
    builder.message_schema_type(MessageSchemaType.WSMessage.toString());
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);

    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static createFolder(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    folder_name: string,
    path: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const folderCreationInfo = { folder_name, path };
    const body = JSON.stringify(folderCreationInfo);

    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(body);
    builder.message_schema_type(MessageSchemaType.VecFsCreateFolder.toString());
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static moveFolder(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    origin_path: string,
    destination_path: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const folderMoveInfo = { origin_path, destination_path };
    const body = JSON.stringify(folderMoveInfo);

    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(body);
    builder.message_schema_type(MessageSchemaType.VecFsMoveFolder.toString());
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static deleteFolder(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    path: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const payload = { path };
    const body = JSON.stringify(payload);

    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(body);
    builder.message_schema_type(MessageSchemaType.VecFsDeleteFolder.toString());
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static copyFolder(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    origin_path: string,
    destination_path: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const payload = { origin_path, destination_path };
    const body = JSON.stringify(payload);

    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(body);
    builder.message_schema_type(MessageSchemaType.VecFsCopyFolder.toString());
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static moveItem(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    origin_path: string,
    destination_path: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const payload = { origin_path, destination_path };
    const body = JSON.stringify(payload);

    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(body);
    builder.message_schema_type(MessageSchemaType.VecFsMoveItem.toString());
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static copyItem(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    origin_path: string,
    destination_path: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const payload = { origin_path, destination_path };
    const body = JSON.stringify(payload);

    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(body);
    builder.message_schema_type(MessageSchemaType.VecFsCopyItem.toString());
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static deleteItem(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    path: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const payload = { path };
    const body = JSON.stringify(payload);

    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(body);
    builder.message_schema_type(MessageSchemaType.VecFsDeleteItem.toString());
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static createItems(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    destination_path: string,
    file_inbox: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
  ): string {
    const payload = { path: destination_path, file_inbox };
    const body = JSON.stringify(payload);

    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(body);
    builder.message_schema_type(
      MessageSchemaType.ConvertFilesAndSaveToFolder.toString(),
    );
    builder.internal_metadata(sender_subidentity, '', '', 'None');
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static retrieveResource(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    path: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const payload = { path };
    const body = JSON.stringify(payload);

    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(body);
    builder.message_schema_type(
      MessageSchemaType.VecFsRetrieveVectorResource.toString(),
    );
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static retrievePathSimplified(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    path: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const payload = { path };
    const body = JSON.stringify(payload);

    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(body);
    builder.message_schema_type(
      MessageSchemaType.VecFsRetrievePathSimplifiedJson.toString(),
    );
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static retrieveVectorSearchSimplified(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    search: string,
    path: string | null,
    max_results: number | null,
    max_files_to_scan: number | null,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const payload = { search, path, max_results, max_files_to_scan };
    const body = JSON.stringify(payload);

    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(body);
    builder.message_schema_type(
      MessageSchemaType.VecFsRetrieveVectorSearchSimplifiedJson.toString(),
    );
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static searchItems(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    search: string,
    path: string | null,
    max_results: number | null,
    max_files_to_scan: number | null,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const payload = { search, path, max_results, max_files_to_scan };
    const body = JSON.stringify(payload);

    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(body);
    builder.message_schema_type(MessageSchemaType.VecFsSearchItems.toString());
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static updateNodeName(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    newNodeName: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(newNodeName);
    builder.message_schema_type(MessageSchemaType.ChangeNodesName.toString());
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static updateAgentInJob(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    jobId: string,
    newAgentId: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const payload = {
      job_id: jobId,
      new_agent_id: newAgentId,
    };

    const body = JSON.stringify(payload);

    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(body);
    builder.message_schema_type(
      MessageSchemaType.ChangeJobAgentRequest.toString(),
    );
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static downloadVectorResource(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    path: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const payload = {
      path,
    };
    const body = JSON.stringify(payload);
    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(body);
    builder.message_schema_type(
      MessageSchemaType.VecFsRetrieveVRPack.toString(),
    );
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static deleteLLMProvider(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    agentId: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(agentId);
    builder.message_schema_type(
      MessageSchemaType.APIRemoveAgentRequest.toString(),
    );
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static scanOllamaModels(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
  ): string {
    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content('');
    builder.message_schema_type(
      MessageSchemaType.APIScanOllamaModels.toString(),
    );
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }

  static addOllamaModels(
    my_encryption_secret_key: string,
    my_signature_secret_key: string,
    receiver_public_key: string,
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
    payload: { models: string[] },
  ): string {
    const builder = new ShinkaiMessageBuilderWrapper(
      my_encryption_secret_key,
      my_signature_secret_key,
      receiver_public_key,
    );

    builder.message_raw_content(JSON.stringify(payload));
    builder.message_schema_type(
      MessageSchemaType.APIAddOllamaModels.toString(),
    );
    builder.internal_metadata(
      sender_subidentity,
      receiver_subidentity,
      '',
      'None',
    );
    builder.external_metadata_with_intra(receiver, sender, sender_subidentity);
    builder.body_encryption('DiffieHellmanChaChaPoly1305');

    const message = builder.build_to_string();
    return message;
  }
}
