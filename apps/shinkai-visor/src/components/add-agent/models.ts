export enum Models {
  OpenAI = 'open-ai',
  TogetherComputer = 'togethercomputer',
}

export const modelsConfig = {
  [Models.OpenAI]: {
    apiUrl: 'https://api.openai.com',
    modelTypes: [
      {
        name: 'GPT 3.5 Turbo',
        value: 'gpt-3.5-turbo',
      },
    ],
  },
  [Models.TogetherComputer]: {
    apiUrl: 'https://api.together.xyz',
    modelTypes: [
      {
        name: 'Stanford - Alpaca (7B)',
        value: 'togethercomputer/alpaca-7b',
      },
      {
        name: 'Austism - Chronos Hermes (13B)',
        value: 'Austism/chronos-hermes-13b',
      },
      {
        name: 'Meta - Code Llama Instruct (13B)	',
        value: 'togethercomputer/CodeLlama-13b-Instruct	',
      },
      {
        name: 'Meta - Code Llama Instruct (34B)	',
        value: 'togethercomputer/CodeLlama-34b-Instruct	',
      },
      {
        name: 'Meta - Code Llama Instruct (7B)	',
        value: 'togethercomputer/CodeLlama-7b-Instruct	',
      },
      {
        name: 'Databricks - Dolly v2 (12B)',
        value: 'databricks/dolly-v2-12b',
      },
      {
        name: 'Databricks - Dolly v2 (3B)',
        value: 'databricks/dolly-v2-3b',
      },
      {
        name: 'Databricks - Dolly v2 (7B)',
        value: 'databricks/dolly-v2-7b',
      },
      {
        name: 'TII UAE - Falcon Instruct (40B)',
        value: 'togethercomputer/falcon-40b-instruct',
      },
      {
        name: 'TII UAE - Falcon Instruct (7B)',
        value: 'togethercomputer/falcon-7b-instruct',
      },
      {
        name: 'Together - GPT-NeoXT-Chat-Base (20B)',
        value: 'togethercomputer/GPT-NeoXT-Chat-Base-20B',
      },
      {
        name: 'Tim Dettmers - Guanaco (13B)',
        value: 'togethercomputer/guanaco-13b',
      },
      {
        name: 'Tim Dettmers - Guanaco (33B)',
        value: 'togethercomputer/guanaco-33b',
      },
      {
        name: 'Tim Dettmers - Guanaco (65B)',
        value: 'togethercomputer/guanaco-65b',
      },
      {
        name: 'Tim Dettmers - Guanaco (7B)',
        value: 'togethercomputer/guanaco-7b',
      },
      {
        name: 'Salesforce - InstructCodeT5 (16B)',
        value: 'Salesforce/instructcodet5p-16b',
      },
      {
        name: 'LM Sys - Koala (13B)',
        value: 'togethercomputer/Koala-13B',
      },
      {
        name: '2048 - Koala (7B)',
        value: 'togethercomputer/Koala-7B',
      },
      {
        name: 'OpenAssistant - LLaMA 2 SFT v10 (70B)',
        value: 'OpenAssistant/llama2-70b-oasst-sft-v10',
      },
      {
        name: 'Meta - LLaMA-2 Chat (13B)',
        value: 'togethercomputer/llama-2-13b-chat',
      },
      {
        name: 'Meta - LLaMA-2 Chat (70B)',
        value: 'togethercomputer/llama-2-70b-chat',
      },
      {
        name: 'Meta - LLaMA-2 Chat (7B)',
        value: 'togethercomputer/llama-2-7b-chat',
      },
      {
        name: 'Together - LLaMA-2-7B-32K-Instruct (7B)',
        value: 'togethercomputer/Llama-2-7B-32K-Instruct',
      },
      {
        name: 'Mosaic ML - MPT-Chat (30B)',
        value: 'togethercomputer/mpt-30b-chat',
      },
      {
        name: 'Mosaic ML - MPT-Chat (7B)',
        value: 'togethercomputer/mpt-7b-chat',
      },
      {
        name: 'mistralai - Mistral (7B) Instruct',
        value: 'mistralai/Mistral-7B-Instruct-v0.1',
      },
      {
        name: 'Gryphe - MythoMax-L2 (13B)',
        value: 'Gryphe/MythoMax-L2-13b',
      },
      {
        name: 'NousResearch - Nous Hermes LLaMA-2 (70B)',
        value: 'NousResearch/Nous-Hermes-Llama2-70b	',
      },
      {
        name: 'NousResearch - Nous Hermes LLaMA-2 (7B)',
        value: 'NousResearch/Nous-Hermes-Llama2-7b',
      },
      {
        name: 'NousResearch - Nous Hermes Llama-2 (13B)',
        value: 'NousResearch/Nous-Hermes-Llama2-13b',
      },
      {
        name: 'LAION - Open-Assistant LLaMA SFT-6 (30B)',
        value: 'OpenAssistant/oasst-sft-6-llama-30b-xor',
      },
      {
        name: 'LAION - Open-Assistant Pythia SFT-4 (12B)',
        value: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
      },
      {
        name: 'LAION - Open-Assistant StableLM SFT-7 (7B)',
        value: 'OpenAssistant/stablelm-7b-sft-v7-epoch-3',
      },
      {
        name: 'teknium - OpenHermes-2-Mistral (7B)',
        value: 'teknium/OpenHermes-2-Mistral-7B',
      },
      {
        name: 'OpenOrca - OpenOrca Mistral (7B) 8K',
        value: 'Open-Orca/Mistral-7B-OpenOrca',
      },
      {
        name: 'garage-bAInd - Platypus2 Instruct (70B)',
        value: 'garage-bAInd/Platypus2-70B-instruct',
      },
      {
        name: 'Together - Pythia-Chat-Base (7B)',
        value: 'togethercomputer/Pythia-Chat-Base-7B-v0.16',
      },
      {
        name: 'Qwen - Qwen-Chat (7B)',
        value: 'togethercomputer/Qwen-7B-Chat',
      },
      {
        name: 'Together - RedPajama-INCITE Chat (3B)',
        value: 'togethercomputer/RedPajama-INCITE-Chat-3B-v1',
      },
      {
        name: 'Together - RedPajama-INCITE Chat (7B)',
        value: 'togethercomputer/RedPajama-INCITE-7B-Chat',
      },
      {
        name: 'Upstage - SOLAR v0 (70B)',
        value: 'upstage/SOLAR-0-70b-16bit',
      },
      {
        name: 'HuggingFaceH4 - StarCoderChat Alpha (16B)',
        value: 'HuggingFaceH4/starchat-alpha',
      },
      {
        name: 'LM Sys - Vicuna v1.3 (13B)',
        value: 'lmsys/vicuna-13b-v1.3',
      },
      {
        name: 'LM Sys - Vicuna v1.3 (7B)',
        value: 'lmsys/vicuna-7b-v1.3',
      },
      {
        name: 'LM Sys - Vicuna v1.5 (13B)',
        value: 'lmsys/vicuna-13b-v1.5',
      },
      {
        name: 'LM Sys - Vicuna v1.5 (7B)',
        value: 'lmsys/vicuna-7b-v1.5',
      },
      {
        name: 'LM Sys - Vicuna-FastChat-T5 (3B)',
        value: 'lmsys/fastchat-t5-3b-v1.0',
      },
    ],
  },
};
