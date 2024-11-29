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
    model: 'llama3.2',
    tag: 'latest',
    name: 'Llama 3.2 3b',
    description:
      'Meta\'s Llama 3.2 is a multilingual large language model optimized for multilingual dialogue use cases, including agentic retrieval and summarization tasks.',
    contextLength: 128000,
    quality: OllamaModelQuality.Low,
    speed: OllamaModelSpeed.VeryFast,
    capabilities: [OllamaModelCapability.TextGeneration],
    size: 1.8,
    fullName: '',
    provider: 'Meta',
  },
  {
    model: 'llama3.1',
    tag: '8b-instruct-q4_1',
    name: 'Llama 3.1 8b',
    description:
      'A powerful AI model for understanding and generating text, optimized for tasks like writing and processing language',
    contextLength: 128000,
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
    model: 'llama3.2-vision',
    tag: 'latest',
    name: 'Llama 3.2 Vision 11b',
    description: 'Llama 3.2 Vision is an instruction-tuned image reasoning generative model optimized for visual recognition, image reasoning, captioning, and answering general questions about images.',
    contextLength: 128000,
    quality: OllamaModelQuality.Good,
    speed: OllamaModelSpeed.Average,
    capabilities: [
      OllamaModelCapability.TextGeneration,
      OllamaModelCapability.ImageToText,
    ],
    size: 7.9,
    fullName: '',
    provider: 'Meta',
  },
].map((model) => {
  model.fullName = `${model.model}:${model.tag}` as const;
  return model;
});
