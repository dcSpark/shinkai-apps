import OLLAMA_MODELS_REPOSITORY from './ollama-models-repository.json';

export enum OllamaModelQuality {
  Low = 'low',
  Medium = 'medium',
  Good = 'good',
}

export enum OllamaModelSpeed {
  Average = 'average',
  Fast = 'fast',
  VeryFast = 'very-fast',
}

export enum OllamaModelCapability {
  TextGeneration = 'text-generation',
  ImageToText = 'image-to-text',
}

export interface OllamaModel {
  model: string;
  tag: string;
  name: string;
  description: string;
  contextLength: number;
  quality: OllamaModelQuality;
  speed: OllamaModelSpeed;
  capabilities: OllamaModelCapability[];
  size: number; // Size in GB
  fullName: string;
  provider?: string;
}
export type OllamaModelDefinition =
  (typeof FILTERED_OLLAMA_MODELS_REPOSITORY)[0];

export const FILTERED_OLLAMA_MODELS_REPOSITORY =
  OLLAMA_MODELS_REPOSITORY.filter((model) => !model.embedding);
export const ALLOWED_OLLAMA_MODELS = FILTERED_OLLAMA_MODELS_REPOSITORY.flatMap(
  (model) => model.tags.map((tag) => `${model.name}:${tag.name}`),
);
export const OLLAMA_MODELS: OllamaModel[] = [
  {
    model: 'gemma2',
    tag: '2b-instruct-q4_1',
    name: 'Gemma2 2b',
    description:
      'Google Gemma 2 is a high-performing and efficient model for generating text',
    contextLength: 8000,
    quality: OllamaModelQuality.Low,
    speed: OllamaModelSpeed.VeryFast,
    capabilities: [OllamaModelCapability.TextGeneration],
    size: 1.8,
    fullName: '',
    provider: 'Google',
  },
  {
    model: 'llama3.1',
    tag: '8b-instruct-q4_1',
    name: 'Llama 3.1 8b',
    description:
      'A powerful AI model for understanding and generating text, optimized for tasks like writing and processing language',
    contextLength: 8000,
    quality: OllamaModelQuality.Medium,
    speed: OllamaModelSpeed.Fast,
    capabilities: [OllamaModelCapability.TextGeneration],
    size: 4.7,
    fullName: '',
    provider: 'Meta',
  },
  {
    model: 'mistral-nemo',
    tag: '12b-instruct-2407-q4_0',
    name: 'Mistral Nemo 12b',
    description:
      'Mistral NeMo is a 12B model built in collaboration with NVIDIA. It offers a large context window.',
    contextLength: 128000,
    quality: OllamaModelQuality.Good,
    speed: OllamaModelSpeed.Average,
    capabilities: [OllamaModelCapability.TextGeneration],
    size: 7.1,
    fullName: '',
    provider: 'Mistral',
  },
  {
    model: 'minicpm-v',
    tag: '8b-2.6-fp16',
    name: 'MiniCPM-V 2.6',
    description:
      'With only 8B parameters, it surpasses widely used proprietary models like GPT-4o mini, GPT-4V, Gemini 1.5 Pro, and Claude 3.5 Sonnet for single image understanding (OpenCompass).',
    contextLength: 4000,
    quality: OllamaModelQuality.Good,
    speed: OllamaModelSpeed.Average,
    capabilities: [
      OllamaModelCapability.TextGeneration,
      OllamaModelCapability.ImageToText,
    ],
    size: 2.9,
    fullName: '',
    provider: 'OpenBMB',
  },
].map((model) => {
  model.fullName = `${model.model}:${model.tag}` as const;
  return model;
});
