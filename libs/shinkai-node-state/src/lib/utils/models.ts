export enum Models {
  OpenAI = 'open-ai',
  TogetherComputer = 'togethercomputer',
  Ollama = 'ollama',
  Gemini = 'gemini',
  Exo = 'exo',
  Groq = 'groq',
  OpenRouter = 'openrouter',
}

export const modelsConfig = {
  [Models.OpenAI]: {
    apiUrl: 'https://api.openai.com',
    modelTypes: [
      {
        name: 'GPT 4o Mini',
        value: 'gpt-4o-mini',
      },
      {
        name: 'GPT 4o',
        value: 'gpt-4o',
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
  [Models.Exo]: {
    apiUrl: 'http://localhost:8000',
    modelTypes: [
      {
        name: 'Llama3.1-8b',
        value: 'llama3.1-8b',
      },
    ],
  },
  [Models.Groq]: {
    apiUrl: 'https://api.groq.com/openai/v1',
    modelTypes: [
      {
        name: 'Llama3 Groq 70B (Tool Use Preview)',
        value: 'llama3-groq-70b-8192-tool-use-preview',
      },
      {
        name: 'Llama3 Groq 8B (Tool Use Preview)',
        value: 'llama3-groq-8b-8192-tool-use-preview',
      },
      {
        name: 'Llama 3.1 70B Versatile',
        value: 'llama-3.1-70b-versatile',
      },
      {
        name: 'Llama 3.1 8B Instant',
        value: 'llama-3.1-8b-instant',
      },
    ],
  },
  [Models.OpenRouter]: {
    apiUrl: 'https://openrouter.ai',
    modelTypes: [],
  },
};
