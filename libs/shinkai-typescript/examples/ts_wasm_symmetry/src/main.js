import { generateKeyPair } from 'curve25519-js';
import * as ed25519 from '@noble/ed25519';
import { calculate_blake3_hash, ShinkaiMessageWrapper } from './pkg/shinkai_message_wasm';

import { sha256 } from '@noble/hashes/sha256';
import { blake3 } from '@noble/hashes/blake3';

const messageJson = `{
    "body": {
        "unencrypted": {
            "internal_metadata": {
                "encryption": "None",
                "inbox": "inbox::@@node1.shinkai/main/device/main_device::@@node2.shinkai::false",
                "recipient_subidentity": "",
                "sender_subidentity": "main/device/main_device",
                "signature": "c6d0115c0878fbf2279f98aab67c0e9cb1af63825f49dca48d6e4420eba0ceb973e00488ba0905c9afd09254f0dac48c468fdcb1d6c5ab5ca4c5dd70a440b903"
            },
            "message_data": {
                "unencrypted": {
                    "message_content_schema": "TextContent",
                    "message_raw_content": "hey!"
                }
            }
            
        }
    },
    "encryption": "DiffieHellmanChaChaPoly1305",
    "external_metadata": {
        "intra_sender": "intra_sender",
        "other": "",
        "recipient": "@@node2.shinkai",
        "scheduled_time": "2023-08-25T22:44:01.132Z",
        "sender": "@@node1.shinkai",
        "signature": "d7d0115c0878fbf2279f98aab67c0e9cb1af63825f49dca48d6e4420eba0ceb973e00488ba0905c9afd09254f0dac48c468fdcb1d6c5ab5ca4c5dd70a389f123"
    },
    "version": "V1_0"
  }`;


const unsorted_messageJson = `{
    "body": {
        "unencrypted": {
            "message_data": {
                "unencrypted": {
                    "message_content_schema": "TextContent",
                    "message_raw_content": "hey!"
                }
            },
            "internal_metadata": {
                "inbox": "inbox::@@node1.shinkai/main/device/main_device::@@node2.shinkai::false",
                "sender_subidentity": "main/device/main_device",
                "encryption": "None",
                "recipient_subidentity": "",
                "signature": "c6d0115c0878fbf2279f98aab67c0e9cb1af63825f49dca48d6e4420eba0ceb973e00488ba0905c9afd09254f0dac48c468fdcb1d6c5ab5ca4c5dd70a440b903"
            }
            
        }
    },
    "external_metadata": {
        "recipient": "@@node2.shinkai",
        "other": "",
        "sender": "@@node1.shinkai",
        "scheduled_time": "2023-08-25T22:44:01.132Z",
        "intra_sender": "intra_sender",
        "signature": "d7d0115c0878fbf2279f98aab67c0e9cb1af63825f49dca48d6e4420eba0ceb973e00488ba0905c9afd09254f0dac48c468fdcb1d6c5ab5ca4c5dd70a389f123"
    },
    "encryption": "DiffieHellmanChaChaPoly1305",
    "version": "V1_0"
  }`;

function blake3FromObj(obj) {
    let hashAlt = blake3(JSON.stringify(obj));
    let hashAltHex = Array.from(new Uint8Array(hashAlt)).map(b => b.toString(16).padStart(2, '0')).join('');
    return hashAltHex;
}

function sortObjectKeys(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(sortObjectKeys);
    }

    return Object.keys(obj)
        .sort()
        .reduce((result, key) => {
            result[key] = sortObjectKeys(obj[key]);
            return result;
        }, {});
}

async function processMessageInWASM(jsonMessage, title) {
    console.log(`### ${title} ###`);

    const wrapper = ShinkaiMessageWrapper.from_json_str(jsonMessage);
    const jsonString = wrapper.to_json_str();
    console.log(`Wrapped ${title} (including outer and inner signatures) json string: `, jsonString);

    const jsonValue = wrapper.to_jsvalue();
    console.log(`Wrapped ${title} (including outer and inner signatures) object: `, jsonValue);

    const blake3Hash = wrapper.calculate_blake3_hash();
    console.log(`Wrapped ${title} (including outer and inner signatures) blake3: `, blake3Hash);

    const wrapper_outer_empty = wrapper.new_with_empty_outer_signature();
    const blake3Hash_outer_empty = wrapper_outer_empty.calculate_blake3_hash();
    console.log(`Wrapped ${title} (not including outer) object: `, wrapper_outer_empty.to_jsvalue());
    console.log(`Wrapped ${title} (not including outer - manual) blake3: `, blake3Hash_outer_empty);
    console.log(`Wrapped ${title} (not including outer - automatic) blake3: `, wrapper.calculate_blake3_hash_with_empty_outer_signature());
    console.log(`Wrapped ${title} (not including inner) string: `, wrapper_outer_empty.inner_content_for_hashing());
    console.log(`Wrapped ${title} (not including inner) blake3: `, wrapper.calculate_blake3_hash_with_empty_inner_signature());

    return {
        jsonString,
        jsonValue,
        blake3Hash,
        wrapper_outer_empty: wrapper_outer_empty.to_jsvalue(),
        blake3Hash_outer_empty,
        blake3Hash_outer_empty_auto: wrapper.calculate_blake3_hash_with_empty_outer_signature(),
        blake3Hash_inner_empty: wrapper.calculate_blake3_hash_with_empty_inner_signature()
    };
}


async function run() {
    console.log("Starting comparison...");
    console.log("Important Note: the hashing of objects takes into consideration the order of its elements. JSON.parse() does not guarantee the order of elements in the object.");

    const wrappedMessageValues = await processMessageInWASM(messageJson, "Wrapped Message Values");
    const unsortedValues = await processMessageInWASM(unsorted_messageJson, "Unsorted");

    // Compare the values
    console.log("Comparing the values...");
    for (const key in wrappedMessageValues) {
        if (JSON.stringify(wrappedMessageValues[key]) !== JSON.stringify(unsortedValues[key])) {
            console.log(`Mismatch found in ${key}`);
        }
    }

    console.log("### Pure JS Message Values ###");
    let messageJsonObject = sortObjectKeys(JSON.parse(messageJson));

    console.log(`Pure JS (including outer and inner signatures) json string: `, JSON.stringify(messageJsonObject));
    console.log("Pure JS (including outer and inner signatures) object:", messageJsonObject);
    console.log("Pure JS (including outer and inner signatures) blake3:", blake3FromObj(messageJsonObject));

    let messageJsonObjectNoOuter = JSON.parse(JSON.stringify(messageJsonObject));
    messageJsonObjectNoOuter.external_metadata.signature = "";
    console.log(`Pure JS (not including outer) object: `, messageJsonObjectNoOuter);
    console.log(`Pure JS (not including outer - manual) blake3: `, blake3FromObj(messageJsonObjectNoOuter));

    let messageJsonObjectNoInner = JSON.parse(JSON.stringify(messageJsonObjectNoOuter));
    messageJsonObjectNoInner.body.unencrypted.internal_metadata.signature = "";
    console.log(`Pure JS (not including inner) string: `, JSON.stringify(messageJsonObjectNoInner.body.unencrypted));
    console.log(`Pure JS (not including inner) blake3: `, blake3FromObj(messageJsonObjectNoInner.body.unencrypted));

    const pureJSValues = {
        jsonString: JSON.stringify(messageJsonObject),
        blake3Hash: blake3FromObj(messageJsonObject),
        blake3Hash_outer_empty: blake3FromObj(messageJsonObjectNoOuter),
        blake3Hash_inner_empty: blake3FromObj(messageJsonObjectNoInner.body.unencrypted)
    };

    // Compare the Pure JS values with the wrappedMessageValues
    console.log("Comparing the Pure JS values...");
    let mismatchFound = false;
    for (const key in pureJSValues) {
        if (JSON.stringify(pureJSValues[key]) !== JSON.stringify(wrappedMessageValues[key])) {
            console.log(`Mismatch found in ${key}`);
            mismatchFound = true;
        }
    }

    if (!mismatchFound) {
        console.log("All values match for Wrapped Message Values and Pure JS Message Values");
    }
}

run();

