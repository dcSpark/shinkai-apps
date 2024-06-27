import { test } from 'vitest';

import { SerializedLLMProvider } from '../models/SchemaTypes';
import { SerializedLLMProviderWrapper } from './SerializedLLMProviderWrapper';
import { ShinkaiNameWrapper } from './ShinkaiNameWrapper';

test('serializedLLMProviderWrapper conversion', async () => {
  // Create a SerializedAgentWrapper using fromStrings
  const serializedLLMProviderWrapper = SerializedLLMProviderWrapper.fromStrings(
    'test_agent',
    '@@node.shinkai/main/agent/test_agent',
    'false',
    'http://example.com',
    '123456',
    'openai:chatgpt3-turbo',
    'permission1,permission2',
    'bucket1,bucket2',
    'sender1,sender2',
  );

  // Get the inner SerializedAgent
  const agent = serializedLLMProviderWrapper.inner;

  // Create a ShinkaiNameWrapper from the full_identity_name
  const fullIdentityNameWrapper = new ShinkaiNameWrapper(
    agent.full_identity_name,
  );

  // Check that the fields are correctly converted
  expect(agent.id).toBe('test_agent');
  expect(fullIdentityNameWrapper.get_full_name).toBe(
    '@@node.shinkai/main/agent/test_agent',
  );
  expect(agent.perform_locally).toBe(false);
  expect(agent.external_url).toBe('http://example.com');
  expect(agent.api_key).toBe('123456');
  expect(agent.model).toBe('openai:chatgpt3-turbo');
  expect(agent.toolkit_permissions).toEqual(['permission1', 'permission2']);
  expect(agent.storage_bucket_permissions).toEqual(['bucket1', 'bucket2']);
  expect(agent.allowed_message_senders).toEqual(['sender1', 'sender2']);
});

test('SerializedAgent to SerializedAgentWrapper conversion', async () => {
  // Create a SerializedAgent
  const serializedAgent: SerializedLLMProvider = {
    id: 'test_agent',
    full_identity_name: '@@node.shinkai/main/agent/test_agent',
    perform_locally: false,
    external_url: 'http://example.com',
    api_key: '123456',
    model: { OpenAI: { model_type: 'chatgpt3-turbo' } },
    toolkit_permissions: ['permission1', 'permission2'],
    storage_bucket_permissions: ['bucket1', 'bucket2'],
    allowed_message_senders: ['sender1', 'sender2'],
  };

  // Convert the SerializedAgent to a SerializedAgentWrapper
  const serializedAgentWrapper =
    SerializedLLMProviderWrapper.fromSerializedAgent(serializedAgent);

  // Get the inner SerializedAgent
  const agent = serializedAgentWrapper.inner;

  // Create a ShinkaiNameWrapper from the full_identity_name
  const fullIdentityNameWrapper = new ShinkaiNameWrapper(
    agent.full_identity_name,
  );

  // Check that the fields are correctly converted
  expect(agent.id).toBe('test_agent');
  expect(fullIdentityNameWrapper.get_full_name).toBe(
    '@@node.shinkai/main/agent/test_agent',
  );
  expect(agent.perform_locally).toBe(false);
  expect(agent.external_url).toBe('http://example.com');
  expect(agent.api_key).toBe('123456');
  if (serializedAgent.model && serializedAgent.model.OpenAI) {
    expect(agent.model).toBe(
      `openai:${serializedAgent.model.OpenAI.model_type}`,
    );
  }
  expect(agent.toolkit_permissions).toEqual(['permission1', 'permission2']);
  expect(agent.storage_bucket_permissions).toEqual(['bucket1', 'bucket2']);
  expect(agent.allowed_message_senders).toEqual(['sender1', 'sender2']);
});

test('SerializedAgentWrapper serialization to string', async () => {
  // Create a SerializedAgent
  const serializedAgent: SerializedLLMProvider = {
    id: 'test_agent',
    full_identity_name: '@@node.shinkai/main/agent/test_agent',
    perform_locally: false,
    external_url: 'http://example.com',
    api_key: '123456',
    model: { OpenAI: { model_type: 'chatgpt3-turbo' } },
    toolkit_permissions: ['permission1', 'permission2'],
    storage_bucket_permissions: ['bucket1', 'bucket2'],
    allowed_message_senders: ['sender1', 'sender2'],
  };

  // Convert the SerializedAgent to a SerializedAgentWrapper
  const serializedAgentWrapper =
    SerializedLLMProviderWrapper.fromSerializedAgent(serializedAgent);

  // Serialize the SerializedAgentWrapper to a string
  const serializedString = serializedAgentWrapper.to_json_str();

  // Parse the serialized string back to an object
  const parsedObject = JSON.parse(serializedString);

  // Check that the common fields are correctly serialized
  expect(parsedObject.id).toBe(serializedAgent.id);
  expect(parsedObject.full_identity_name).toBe(
    serializedAgent.full_identity_name,
  );
  expect(parsedObject.perform_locally).toBe(serializedAgent.perform_locally);
  expect(parsedObject.external_url).toBe(serializedAgent.external_url);
  expect(parsedObject.api_key).toBe(serializedAgent.api_key);
  if (serializedAgent.model && serializedAgent.model.OpenAI) {
    expect(parsedObject.model).toBe(
      `openai:${serializedAgent.model.OpenAI.model_type}`,
    );
  }
  expect(parsedObject.toolkit_permissions).toEqual(
    serializedAgent.toolkit_permissions,
  );
  expect(parsedObject.storage_bucket_permissions).toEqual(
    serializedAgent.storage_bucket_permissions,
  );
  expect(parsedObject.allowed_message_senders).toEqual(
    serializedAgent.allowed_message_senders,
  );
});

// Additional tests for a new model type not defined in the context
test('SerializedAgentWrapper with Groq model type', async () => {
  // Create a SerializedAgent with a Groq model type
  const serializedAgent: SerializedLLMProvider = {
    id: 'groq_model_agent',
    full_identity_name: '@@node.shinkai/main/agent/groq_model_agent',
    perform_locally: true,
    external_url: 'http://groqmodel.com',
    api_key: 'abcdefg',
    model: { groq: { model_type: 'groq-v1' } },
    toolkit_permissions: ['groq_permission1', 'groq_permission2'],
    storage_bucket_permissions: ['groq_bucket1', 'groq_bucket2'],
    allowed_message_senders: ['groq_sender1', 'groq_sender2'],
  };

  // Convert the SerializedAgent to a SerializedAgentWrapper
  const serializedAgentWrapper =
    SerializedLLMProviderWrapper.fromSerializedAgent(serializedAgent);

  // Get the inner SerializedAgent
  const agent = serializedAgentWrapper.inner;

  // Check that the fields are correctly converted
  expect(agent.id).toBe('groq_model_agent');
  expect(agent.perform_locally).toBe(true);
  expect(agent.external_url).toBe('http://groqmodel.com');
  expect(agent.api_key).toBe('abcdefg');
  if (serializedAgent.model && serializedAgent.model['groq']) {
    expect(agent.model).toBe(
      `groq:${serializedAgent.model['groq'].model_type}`,
    );
  }
  expect(agent.toolkit_permissions).toEqual([
    'groq_permission1',
    'groq_permission2',
  ]);
  expect(agent.storage_bucket_permissions).toEqual([
    'groq_bucket1',
    'groq_bucket2',
  ]);
  expect(agent.allowed_message_senders).toEqual([
    'groq_sender1',
    'groq_sender2',
  ]);
});

test('SerializedAgentWrapper serialization to string for Groq model', async () => {
  // Create a SerializedAgent with a Groq model type
  const serializedAgent: SerializedLLMProvider = {
    id: 'groq_model_agent',
    full_identity_name: '@@node.shinkai/main/agent/groq_model_agent',
    perform_locally: true,
    external_url: 'http://groqmodel.com',
    api_key: 'abcdefg',
    model: { groq: { model_type: 'groq-v1' } },
    toolkit_permissions: ['groq_permission1', 'groq_permission2'],
    storage_bucket_permissions: ['groq_bucket1', 'groq_bucket2'],
    allowed_message_senders: ['groq_sender1', 'groq_sender2'],
  };

  // Convert the SerializedAgent to a SerializedAgentWrapper
  const serializedAgentWrapper =
    SerializedLLMProviderWrapper.fromSerializedAgent(serializedAgent);

  // Serialize the SerializedAgentWrapper to a string
  const serializedString = serializedAgentWrapper.to_json_str();

  // Parse the serialized string back to an object
  const parsedObject = JSON.parse(serializedString);

  // Check that the common fields are correctly serialized
  expect(parsedObject.id).toBe(serializedAgent.id);
  expect(parsedObject.full_identity_name).toBe(
    serializedAgent.full_identity_name,
  );
  expect(parsedObject.perform_locally).toBe(serializedAgent.perform_locally);
  expect(parsedObject.external_url).toBe(serializedAgent.external_url);
  expect(parsedObject.api_key).toBe(serializedAgent.api_key);
  if (serializedAgent.model && serializedAgent.model['groq']) {
    expect(parsedObject.model).toBe(
      `groq:${serializedAgent.model['groq'].model_type}`,
    );
  }
  expect(parsedObject.toolkit_permissions).toEqual(
    serializedAgent.toolkit_permissions,
  );
  expect(parsedObject.storage_bucket_permissions).toEqual(
    serializedAgent.storage_bucket_permissions,
  );
  expect(parsedObject.allowed_message_senders).toEqual(
    serializedAgent.allowed_message_senders,
  );
});
