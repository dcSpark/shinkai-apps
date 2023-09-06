import { test } from "vitest";
import { SerializedAgentWrapper } from "./SerializedAgentWrapper";
import { ShinkaiNameWrapper } from "./ShinkaiNameWrapper";
import { SerializedAgent } from "../models/SchemaTypes";

test("SerializedAgentWrapper conversion", async () => {
  // Create a SerializedAgentWrapper using fromStrings
  const serializedAgentWrapper = SerializedAgentWrapper.fromStrings(
    "test_agent",
    "@@node.shinkai/main/agent/test_agent",
    "false",
    "http://example.com",
    "123456",
    "openai:chatgpt3-turbo",
    "permission1,permission2",
    "bucket1,bucket2",
    "sender1,sender2"
  );

  // Get the inner SerializedAgent
  const agent = serializedAgentWrapper.inner;

  // Create a ShinkaiNameWrapper from the full_identity_name
  const fullIdentityNameWrapper = new ShinkaiNameWrapper(
    agent.full_identity_name.full_name
  );

  // Check that the fields are correctly converted
  expect(agent.id).toBe("test_agent");
  expect(fullIdentityNameWrapper.get_full_name).toBe("@@node.shinkai/main/agent/test_agent")
  expect(agent.perform_locally).toBe(false);
  expect(agent.external_url).toBe("http://example.com");
  expect(agent.api_key).toBe("123456");
  expect(agent.model.openai.model_type).toBe("chatgpt3-turbo");
  expect(agent.toolkit_permissions).toEqual(["permission1", "permission2"]);
  expect(agent.storage_bucket_permissions).toEqual(["bucket1", "bucket2"]);
  expect(agent.allowed_message_senders).toEqual(["sender1", "sender2"]);
});

test("SerializedAgent to SerializedAgentWrapper conversion", async () => {
  // Create a SerializedAgent
  const serializedAgent: SerializedAgent = {
    id: "test_agent",
    full_identity_name: "@@node.shinkai/main/agent/test_agent",
    perform_locally: false,
    external_url: "http://example.com",
    api_key: "123456",
    model: { OpenAI: { model_type: "chatgpt3-turbo" } },
    toolkit_permissions: ["permission1", "permission2"],
    storage_bucket_permissions: ["bucket1", "bucket2"],
    allowed_message_senders: ["sender1", "sender2"]
  };

  // Convert the SerializedAgent to a SerializedAgentWrapper
  const serializedAgentWrapper = SerializedAgentWrapper.fromSerializedAgent(serializedAgent);

  // Get the inner SerializedAgent
  const agent = serializedAgentWrapper.inner;

  // Create a ShinkaiNameWrapper from the full_identity_name
  const fullIdentityNameWrapper = new ShinkaiNameWrapper(
    agent.full_identity_name.full_name
  );

  // Check that the fields are correctly converted
  expect(agent.id).toBe("test_agent");
  expect(fullIdentityNameWrapper.get_full_name).toBe("@@node.shinkai/main/agent/test_agent")
  expect(agent.perform_locally).toBe(false);
  expect(agent.external_url).toBe("http://example.com");
  expect(agent.api_key).toBe("123456");
  expect(agent.model.openai.model_type).toBe("chatgpt3-turbo");
  expect(agent.toolkit_permissions).toEqual(["permission1", "permission2"]);
  expect(agent.storage_bucket_permissions).toEqual(["bucket1", "bucket2"]);
  expect(agent.allowed_message_senders).toEqual(["sender1", "sender2"]);
});