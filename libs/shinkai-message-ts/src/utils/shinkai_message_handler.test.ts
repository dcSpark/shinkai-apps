import { isLocalMessage } from './shinkai_message_handler';

describe('shinkai_messag_handler isLocalMessage', () => {
  const messageSentByNode1MainDevice = `{
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

  const messageSentByNode1SecondaryDevice = `{
    "body": {
      "unencrypted": {
        "message_data": {
          "unencrypted": {
            "message_raw_content": "hey!",
            "message_content_schema": "TextContent"
          }
        },
        "internal_metadata": {
          "sender_subidentity": "main/device/secondary_device",
          "recipient_subidentity": "",
          "inbox": "inbox::@@node1.shinkai/main/device/secondary_device::@@node2.shinkai::false",
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

  const messageSentByNode1AgentGpt = `{
      "body": {
        "unencrypted": {
          "message_data": {
            "unencrypted": {
              "message_raw_content": "hey!",
              "message_content_schema": "TextContent"
          }
          },
          "internal_metadata": {
            "sender_subidentity": "main/agent/gpt",
            "recipient_subidentity": "",
            "inbox": "job_inbox::@@node1.shinkai/main/agent/gpt::@@node2.shinkai::false",
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

  const messageSentByNode2MainDevice = `{
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
          "inbox": "inbox::@@node2.shinkai/main/device/main_device::@@node1.shinkai::false",
          "signature": "",
          "encryption": "None"
        }
      }
    },
    "external_metadata": {
      "sender": "@@node2.shinkai",
      "recipient": "@@node1.shinkai",
      "scheduled_time": "2023-08-25T22:44:01.132Z",
      "signature": "c6d0115c0878fbf2279f98aab67c0e9cb1af63825f49dca48d6e4420eba0ceb973e00488ba0905c9afd09254f0dac48c468fdcb1d6c5ab5ca4c5dd70a440b903",
      "other": ""
    },
    "encryption": "None",
    "version": "V1_0"
  }`;

  const myNodeSetup = {
    myNodeIdentity: '@@node1.shinkai',
    myProfile: 'main',
  };
  it('false when message was sent by agent', () => {
    const message = JSON.parse(messageSentByNode1AgentGpt);
    const isLocal = isLocalMessage(
      message,
      myNodeSetup.myNodeIdentity,
      myNodeSetup.myProfile,
    );
    expect(isLocal).toBe(false);
  });

  it('false when message was sent by a different node', () => {
    const message = JSON.parse(messageSentByNode2MainDevice);
    const isLocal = isLocalMessage(
      message,
      myNodeSetup.myNodeIdentity,
      myNodeSetup.myProfile,
    );
    expect(isLocal).toBe(false);
  });

  it('true when message was sent by same node', () => {
    const message = JSON.parse(messageSentByNode1MainDevice);
    const isLocal = isLocalMessage(
      message,
      myNodeSetup.myNodeIdentity,
      myNodeSetup.myProfile,
    );
    expect(isLocal).toBe(true);
  });

  it('true when message was sent by same node but different device', () => {
    const message = JSON.parse(messageSentByNode1SecondaryDevice);
    const isLocal = isLocalMessage(
      message,
      myNodeSetup.myNodeIdentity,
      myNodeSetup.myProfile,
    );
    expect(isLocal).toBe(true);
  });
});
