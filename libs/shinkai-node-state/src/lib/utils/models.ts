export enum Models {
  OpenAI = 'open-ai',
  TogetherComputer = 'togethercomputer',
  Ollama = 'ollama',
  Gemini = 'gemini',
}

export const modelsConfig = {
  [Models.OpenAI]: {
    apiUrl: 'https://api.openai.com',
    modelTypes: [
      {
        name: 'GPT 3.5 Turbo (1106)',
        value: 'gpt-3.5-turbo-1106',
      },
      {
        name: 'GPT 4 Turbo',
        value: 'gpt-4-1106-preview',
      },
      {
        name: 'GPT 4 Vision',
        value: 'gpt-4-vision-preview',
      },
    ],
  },
  [Models.TogetherComputer]: {
    apiUrl: 'https://api.together.xyz',
    modelTypes: [
      {
        name: 'Meta - LLaMA-2 Chat (70B)',
        value: 'togethercomputer/llama-2-70b-chat',
      },
      {
        name: 'mistralai - Mistral (7B) Instruct',
        value: 'mistralai/Mistral-7B-Instruct-v0.1',
      },
      {
        name: 'teknium - OpenHermes-2-Mistral (7B)',
        value: 'teknium/OpenHermes-2-Mistral-7B',
      },
      {
        name: 'OpenOrca - OpenOrca Mistral (7B) 8K',
        value: 'Open-Orca/Mistral-7B-OpenOrca',
      },
    ],
  },
  [Models.Ollama]: {
    apiUrl: 'http://localhost:11434',
    modelTypes: [
      {
        name: 'Llama 2',
        value: 'llama2',
      },
      {
        name: 'Mistral',
        value: 'mistral',
      },
      {
        name: 'Mixtral',
        value: 'mixtral',
      },
    ],
  },
  [Models.Gemini]: {
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    modelTypes: [
      {
        name: 'Gemini 1.5 Flash',
        value: 'gemini-1.5-flash',
      },
      {
        name: 'Gemini 1.5 Pro',
        value: 'gemini-1.5-pro',
      },
    ],
  },
};
