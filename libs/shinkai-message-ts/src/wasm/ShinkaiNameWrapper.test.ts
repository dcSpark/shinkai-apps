import { describe, test } from 'vitest';

import { ShinkaiNameWrapper } from './ShinkaiNameWrapper';

test('ShinkaiNameWrapper', () => {
  const validNames = [
    '@@alice.shinkai',
    '@@alice.shinkai/profileName',
    '@@alice.shinkai/profileName/agent/myChatGPTAgent',
    '@@alice.shinkai/profileName/device/myPhone',
    '@@alice.sepolia-shinkai',
    '@@alice.sepolia-shinkai/profileName',
    '@@alice.sepolia-shinkai/profileName/agent/myChatGPTAgent',
    '@@alice.sepolia-shinkai/profileName/device/myPhone',
  ];

  const invalidNames = [
    '@@alice.shinkai/profileName/myPhone',
    '@@al!ce.shinkai',
    '@@alice.shinkai//',
    '@@node1.shinkai/profile_1.shinkai',
    '@@alice.sepolia--shinkai',
  ];

  for (const name of validNames) {
    const wrapper = new ShinkaiNameWrapper(name);
    expect(wrapper.get_full_name).toBe(name.toLowerCase());
  }

  for (const name of invalidNames) {
    expect(() => new ShinkaiNameWrapper(name)).toThrow();
  }
});

test('ShinkaiNameWrapper get_profile_name', () => {
  const namesWithProfiles = [
    {
      name: '@@alice.shinkai/profileName',
      profile: '@@alice.shinkai/profileName',
    },
    {
      name: '@@alice.shinkai/profileName/agent/myChatGPTAgent',
      profile: '@@alice.shinkai/profileName',
    },
    {
      name: '@@alice.shinkai/profileName/device/myPhone',
      profile: '@@alice.shinkai/profileName',
    },
  ];

  for (const { name, profile } of namesWithProfiles) {
    const wrapper = new ShinkaiNameWrapper(name);
    expect(wrapper.extract_profile().get_full_name).toBe(profile.toLowerCase());
  }
});

describe('ShinkaiNameWrapper from_shinkai_message_sender', () => {
  test('should fail when message is first level encrypted', () => {
    const encryptedMessage = `{
      "body": {
        "encrypted": {
          "content": "encrypted:de9a22018a78cb1977d72936145576a4e040a590c5da6ac9f60f334c5fddd773b53ca11c5a97110e4352a694fa55632e9e07346e60a579171aea11fcf17a8e9666fe8f3bfddadafe5b2ecef5b8d7759979536e8ae848c1976a5057892836d0a5806fdaf4a30220217da2f4930914aea7b1f0f4ae65175ca9d24db4408294ca4b7347048a295ef5eeac1f3a60112953edf3f78bd02103fc9ae866cbb223385781218f0c021e41c79f529b7fd8748d8339db1cc0e03ae7d3b27b6147639cc01f44e594401bea76743ddefff47e737df61710c30fc7e5f38da306336cf668c198dfa2f90506"
        }
      },
      "external_metadata": {
        "sender": "@@node1.shinkai/main",
        "recipient": "@@node1.shinkai",
        "scheduled_time": "2023-10-04T19:38:50.271Z",
        "signature": "028810426c653e993deea94aa08b8fec14e82040ba73b09e533726eb769ea5de87ba095cc83cfe35035ca2db1ce996c963b7e7b12b1a28240706e4e0cbef6904",
        "other": ""
      },
      "encryption": "DiffieHellmanChaChaPoly1305",
      "version": "V1_0"
    }`;
    const message = JSON.parse(encryptedMessage);
    expect(() =>
      ShinkaiNameWrapper.from_shinkai_message_sender(message),
    ).toThrowError();
  });

  test('should parse node_name, full_name, subidentity_name and subidentity_type when message is unepcrypted', () => {
    const messageJson = `{
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
      "encryption": "None",
      "version": "V1_0"
    }`;
    const message = JSON.parse(messageJson);
    const messageNameWrapper =
      ShinkaiNameWrapper.from_shinkai_message_sender(message);
    expect(messageNameWrapper.get_node_name).toBe('@@node1.shinkai');
    expect(messageNameWrapper.get_full_name).toBe(
      '@@node1.shinkai/main/device/main_device',
    );
    expect(messageNameWrapper.get_subidentity_name).toBe('main_device');
    expect(messageNameWrapper.get_subidentity_type).toBe('device');
  });
});
