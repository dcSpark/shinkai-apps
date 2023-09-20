import { test } from "vitest";
import { ShinkaiMessageBuilderWrapper } from "./ShinkaiMessageBuilderWrapper";
import { sha512 } from "@noble/hashes/sha512";
import { generateKeyPair } from "curve25519-js";
import * as ed from "@noble/ed25519";
import {
  EncryptionMethod,
  MessageSchemaType,
} from "../models/SchemaTypes";
import { toHexString } from "../utils/wasm_helpers";

// Enable synchronous methods
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

const { Crypto } = require("@peculiar/webcrypto");
const crypto = new Crypto();
globalThis.crypto = crypto;

const generateKeys = async () => {
  const seed = new Uint8Array(32);
  let encryptionKeys = generateKeyPair(seed);
  let my_encryption_sk_string = toHexString(
    new Uint8Array(encryptionKeys.private)
  );
  let my_encryption_pk_string = toHexString(
    new Uint8Array(encryptionKeys.public)
  );

  const privKey = ed.utils.randomPrivateKey(); // Secure random private key
  const pubKey = await ed.getPublicKeyAsync(privKey);

  let my_identity_sk_string = toHexString(new Uint8Array(privKey));
  let my_identity_pk_string = toHexString(new Uint8Array(pubKey));

  let receiver_public_key_string = my_encryption_pk_string;

  return {
    my_encryption_sk_string,
    my_encryption_pk_string,
    my_identity_sk_string,
    my_identity_pk_string,
    receiver_public_key_string,
  };
};

test("ShinkaiMessageBuilderWrapper should construct correctly and create a new ack message", async () => {
  const keys = await generateKeys();

  const messageBuilder = new ShinkaiMessageBuilderWrapper(
    keys.my_encryption_sk_string,
    keys.my_identity_sk_string,
    keys.receiver_public_key_string
  );

  expect(messageBuilder).toBeTruthy();
  expect(messageBuilder).toBeInstanceOf(ShinkaiMessageBuilderWrapper);

  const sender = "@@sender_node.shinkai";
  const receiver = "@@receiver_node.shinkai";

  const ackMessage = ShinkaiMessageBuilderWrapper.ack_message(
    keys.my_encryption_sk_string,
    keys.my_identity_sk_string,
    keys.receiver_public_key_string,
    sender,
    receiver
  );

  expect(ackMessage).toBeTruthy();
  expect(typeof ackMessage).toBe("string");
});

test("ShinkaiMessageBuilderWrapper should set body content correctly", async () => {
  const keys = await generateKeys();

  const messageBuilder = new ShinkaiMessageBuilderWrapper(
    keys.my_encryption_sk_string,
    keys.my_identity_sk_string,
    keys.receiver_public_key_string
  );

  // Pass the enum value directly
  await messageBuilder.message_raw_content("Hello world!");
  await messageBuilder.body_encryption(EncryptionMethod.None);
  await messageBuilder.message_schema_type(MessageSchemaType.TextContent);
  await messageBuilder.internal_metadata(
    "sender_user2",
    "recipient_user1",
    "",
    "None"
  );
  await messageBuilder.external_metadata_with_schedule(
    "@@other_node.shinkai",
    "@@my_node.shinkai",
    "2023-07-02T20:53:34Z"
  );

  const message = messageBuilder.build_to_string();

  expect(message).toContain("Hello world!");
});

test("ShinkaiMessageBuilderWrapper should create a use code registration message", async () => {
  const device_keys = await generateKeys();
  const profile_keys = await generateKeys();

  const registrationCode = "sample_registration_code";
  const identityType = "profile";
  const permissionType = "admin";
  const registrationName = "sample_registration_name";
  const shinkaiIdentity = "@@my_node.shinkai";

  const codeRegistrationMessage =
    ShinkaiMessageBuilderWrapper.use_code_registration_for_device(
      device_keys.my_encryption_sk_string,
      device_keys.my_identity_sk_string,
      profile_keys.my_encryption_sk_string,
      profile_keys.my_identity_sk_string,
      device_keys.receiver_public_key_string,
      registrationCode,
      identityType,
      permissionType,
      registrationName,
      "", // sender_profile_name: it doesn't exist yet in the Node
      shinkaiIdentity
    );

  expect(codeRegistrationMessage).toBeTruthy();
  expect(typeof codeRegistrationMessage).toBe("string");
});

test("ShinkaiMessageBuilderWrapper should create an initial registration with no code for device", async () => {
  const device_keys = await generateKeys();
  const profile_keys = await generateKeys();

  const registrationName = "sample_registration_name";
  const senderSubidentity = "sample_sender_subidentity";
  const sender = "@@sender_node.shinkai";
  const receiver = "@@receiver_node.shinkai";

  const initialRegistrationMessage =
    ShinkaiMessageBuilderWrapper.initial_registration_with_no_code_for_device(
      device_keys.my_encryption_sk_string,
      device_keys.my_identity_sk_string,
      profile_keys.my_encryption_sk_string,
      profile_keys.my_identity_sk_string,
      registrationName,
      senderSubidentity,
      sender,
      receiver
    );

  expect(initialRegistrationMessage).toBeTruthy();
  expect(typeof initialRegistrationMessage).toBe("string");
});

test("ShinkaiMessageBuilderWrapper should create a new request code registration message", async () => {
  const keys = await generateKeys();

  const messageBuilder = new ShinkaiMessageBuilderWrapper(
    keys.my_encryption_sk_string,
    keys.my_identity_sk_string,
    keys.receiver_public_key_string
  );

  const permissionType = "admin";
  const codeType = "profile";
  const senderProfileName = "sample_sender_profile_name";
  const shinkaiIdentity = "@@my_node.shinkai";

  const requestCodeRegistrationMessage =
    ShinkaiMessageBuilderWrapper.request_code_registration(
      keys.my_encryption_sk_string,
      keys.my_identity_sk_string,
      keys.receiver_public_key_string,
      permissionType,
      codeType,
      senderProfileName,
      shinkaiIdentity
    );

  expect(requestCodeRegistrationMessage).toBeTruthy();
  expect(typeof requestCodeRegistrationMessage).toBe("string");
});

test("ShinkaiMessageBuilderWrapper should get last messages from inbox", async () => {
  const keys = await generateKeys();

  const inbox = "inbox::@@node.shinkai::true";
  const count = 10;
  const offset = "offset_string";
  const senderProfileName = "sample_sender_profile_name";
  const shinkaiIdentity = "@@my_node.shinkai";

  const lastMessages =
    ShinkaiMessageBuilderWrapper.get_last_messages_from_inbox(
      keys.my_encryption_sk_string,
      keys.my_identity_sk_string,
      keys.receiver_public_key_string,
      inbox,
      count,
      offset,
      shinkaiIdentity,
      senderProfileName,
      shinkaiIdentity
    );

  expect(lastMessages).toBeTruthy();
  expect(typeof lastMessages).toBe("string");
});
