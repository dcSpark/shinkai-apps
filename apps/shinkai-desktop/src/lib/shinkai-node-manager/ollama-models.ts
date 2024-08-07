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
      'Google Gemma 2 is a high-performing and efficient model by now available in three sizes: 2B, 9B, and 27B.',
    contextLength: 8000,
    quality: OllamaModelQuality.Low,
    speed: OllamaModelSpeed.VeryFast,
    capabilities: [OllamaModelCapability.TextGeneration],
    size: 1.8,
    fullName: '',
  },
  {
    model: 'llama3.1',
    tag: '8b-instruct-q4_1',
    name: 'Llama 3.1 8b',
    description:
      'Llama 3.1 is a new state-of-the-art model from Meta available in 8B, 70B and 405B parameter sizes.',
    contextLength: 8000,
    quality: OllamaModelQuality.Medium,
    speed: OllamaModelSpeed.Fast,
    capabilities: [OllamaModelCapability.TextGeneration],
    size: 4.7,
    fullName: '',
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
  },
  {
    model: 'llava-phi3',
    tag: '3.8b-mini-q4_0',
    name: 'LLaVA Phi 3',
    description: 'A new small LLaVA model fine-tuned from Phi 3 Mini. It offers vision capabilities to do image to text.',
    contextLength: 4000,
    quality: OllamaModelQuality.Medium,
    speed: OllamaModelSpeed.Average,
    capabilities: [
      OllamaModelCapability.TextGeneration,
      OllamaModelCapability.ImageToText,
    ],
    size: 2.9,
    fullName: '',
  },
].map((model) => {
  model.fullName = `${model.model}:${model.tag}` as const;
  return model;
});
