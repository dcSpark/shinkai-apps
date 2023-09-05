import { ShinkaiMessage } from '../../models/ShinkaiMessage';
import { ShinkaiMessageWrapper } from './ShinkaiMessageWrapper';

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
    "encryption": "DiffieHellmanChaChaPoly1305",
    "version": "V1_0"
  }`;


describe('ShinkaiMessageWrapper', () => {
  it('should correctly convert from and to JSON string', () => {
    const wrapper = ShinkaiMessageWrapper.from_json_str(messageJson);
    const jsonString = wrapper.to_json_str();

    expect(JSON.parse(jsonString)).toEqual(JSON.parse(messageJson));
  });

  it('should correctly convert from and to JsValue string', () => {
    let message = JSON.parse(messageJson);
    const wrapper = ShinkaiMessageWrapper.fromJsValue(message);
    const jsonString = wrapper.to_json_str();

    expect(JSON.parse(jsonString)).toEqual(JSON.parse(messageJson));
  });

  it('should correctly instatiate it from a ShinkaiMessage Typescript object', () => {
    let message: ShinkaiMessage = JSON.parse(messageJson);
    const wrapper = ShinkaiMessageWrapper.fromJsValue(message);
    const jsonString = wrapper.to_json_str();

    expect(JSON.parse(jsonString)).toEqual(JSON.parse(messageJson));
  });
});