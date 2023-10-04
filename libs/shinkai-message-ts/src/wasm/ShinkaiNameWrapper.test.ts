import { test } from "vitest";

import { ShinkaiNameWrapper } from "./ShinkaiNameWrapper";

test("ShinkaiNameWrapper", () => {
  const validNames = [
    "@@alice.shinkai",
    "@@alice.shinkai/profileName",
    "@@alice.shinkai/profileName/agent/myChatGPTAgent",
    "@@alice.shinkai/profileName/device/myPhone",
  ];

  const invalidNames = [
    "@@alice.shinkai/profileName/myPhone",
    "@@al!ce.shinkai",
    "@@alice.shinkai//",
    "@@node1.shinkai/profile_1.shinkai",
  ];

  for (const name of validNames) {
    const wrapper = new ShinkaiNameWrapper(name);
    expect(wrapper.get_full_name).toBe(name.toLowerCase());
  }

  for (const name of invalidNames) {
    expect(() => new ShinkaiNameWrapper(name)).toThrow();
  }
});

test("ShinkaiNameWrapper get_profile_name", () => {
  const namesWithProfiles = [
    {
      name: "@@alice.shinkai/profileName",
      profile: "@@alice.shinkai/profileName",
    },
    {
      name: "@@alice.shinkai/profileName/agent/myChatGPTAgent",
      profile: "@@alice.shinkai/profileName",
    },
    {
      name: "@@alice.shinkai/profileName/device/myPhone",
      profile: "@@alice.shinkai/profileName",
    },
  ];

  for (const { name, profile } of namesWithProfiles) {
    const wrapper = new ShinkaiNameWrapper(name);
    expect(wrapper.extract_profile().get_full_name).toBe(profile.toLowerCase());
  }
});

test("ShinkaiNameWrapper from_shinkai_message_sender", () => {
  it('should fail when message is encrypted', () => {
    const encryptedMessage = `{
      "body": {
        "encrypted": {
          "message_data": {
            "unencrypted": {
              "message_raw_content": "hey!",
              "message_content_schema": "TextContent"
            }
          },
          "internal_metadata": {
            "sender_subidentity": "main/device/main_device",
            "recipient_subidentity": "",
            "inbox": "inbox::@@node1.shinkai/main/device/main_device::@@node2.shinkai::false",
            "signature": "",
            "encryption": "None"
          }
        }
      },
      "external_metadata": {
        "sender": "@@node1.shinkai",
        "recipient": "@@node2.shinkai",
        "scheduled_time": "2023-08-25T22:44:01.132Z",
        "signature": "c6d0115c0878fbf2279f98aab67c0e9cb1af63825f49dca48d6e4420eba0ceb973e00488ba0905c9afd09254f0dac48c468fdcb1d6c5ab5ca4c5dd70a440b903",
        "other": ""
      },
      "encryption": "DiffieHellmanChaChaPoly1305",
      "version": "V1_0"
    }`;
    const message = JSON.parse(encryptedMessage);
    expect(ShinkaiNameWrapper.from_shinkai_message_sender(message)).toThrowError();
  });

  it('should fail when message is encrypted', () => {
    const encryptedMessage = `{
      "body": {
        "unencrypted": {
          "message_data": {
            "unencrypted": {
              "message_raw_content": "hey!",
              "message_content_schema": "TextContent"
            }
          },
          "internal_metadata": {
            "sender_subidentity": "main/device/main_device",
            "recipient_subidentity": "",
            "inbox": "inbox::@@node1.shinkai/main/device/main_device::@@node2.shinkai::false",
            "signature": "",
            "encryption": "None"
          }
        }
      },
      "external_metadata": {
        "sender": "@@node1.shinkai",
        "recipient": "@@node2.shinkai",
        "scheduled_time": "2023-08-25T22:44:01.132Z",
        "signature": "c6d0115c0878fbf2279f98aab67c0e9cb1af63825f49dca48d6e4420eba0ceb973e00488ba0905c9afd09254f0dac48c468fdcb1d6c5ab5ca4c5dd70a440b903",
        "other": ""
      },
      "encryption": "DiffieHellmanChaChaPoly1305",
      "version": "V1_0"
    }`;
    const message = JSON.parse(encryptedMessage);
    const messageNameWrapper = ShinkaiNameWrapper.from_shinkai_message_sender(message);
    expect(messageNameWrapper.get_node_name).toBe('@@node1.shinkai');
    expect(messageNameWrapper.get_full_name).toBe('@@node1.shinkai/main/device/main_device');
    expect(messageNameWrapper.get_subidentity_name).toBe('main/device/main_device');
    expect(messageNameWrapper.get_subidentity_type).toBe('device');
  });
});
