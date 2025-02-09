export enum Models {
  OpenAI = 'open-ai',
  TogetherComputer = 'togethercomputer',
  Ollama = 'ollama',
  Gemini = 'gemini',
  Exo = 'exo',
  Groq = 'groq',
  OpenRouter = 'openrouter',
  Claude = 'claude',
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
      {
        name: 'o1',
        value: 'o1',
      },
      {
        name: 'o1 Mini',
        value: 'o1-mini',
      },
      {
        name: 'o3 Mini',
        value: 'o3-mini',
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
        name: 'Gemini 2.0 Flash',
        value: 'gemini-2.0-flash',
      },
      {
        name: 'Gemini 2.0 Flash Lite',
        value: 'gemini-2.0-flash-lite-preview-02-05',
      },
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
        name: 'Llama 3.2 90B Vision (Preview)',
        value: 'llama-3.2-90b-vision-preview',
      },
      {
        name: 'Llama 3.2 11B Vision (Preview)',
        value: 'llama-3.2-11b-vision-preview',
      },
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
  [Models.Claude]: {
    apiUrl: 'https://api.anthropic.com',
    modelTypes: [
      {
        name: 'Claude 3.5 Sonnet',
        value: 'claude-3-5-sonnet-latest',
      },
      {
        name: 'Claude 3 Opus',
        value: 'claude-3-opus-latest',
      },
      {
        name: 'Claude 3 Sonnet',
        value: 'claude-3-sonnet-20240229',
      },
      {
        name: 'Claude 3 Haiku',
        value: 'claude-3-haiku-20240307',
      },
    ],
  },
};
