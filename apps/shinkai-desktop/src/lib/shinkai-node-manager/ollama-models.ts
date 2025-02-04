import { platform } from '@tauri-apps/plugin-os';

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

const currentPlatform = platform();

export const OLLAMA_MODELS: OllamaModel[] = [
  ...(currentPlatform === 'windows' || currentPlatform === 'linux'
    ? [
        {
          model: 'gemma2',
          tag: '2b-instruct-q4_1',
          name: 'Google Gemma 2',
          description:
            'Google Gemma 2 is a high-performing and efficient model available in three sizes: 2B, 9B, and 27B.',
          contextLength: 8192,
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
          contextLength: 128000,
          quality: OllamaModelQuality.Medium,
          speed: OllamaModelSpeed.Fast,
          capabilities: [OllamaModelCapability.TextGeneration],
          size: 4.7,
          fullName: '',
          provider: 'Meta',
        },
      ]
    : []),
  ...(currentPlatform === 'macos'
    ? [
        {
          model: 'command-r7b',
          tag: '7b-12-2024-q4_K_M',
          name: 'Command R 7B',
          description:
            "The smallest model in Cohere's R series delivers top-tier speed, efficiency, and quality to build powerful AI applications on commodity GPUs and edge devices.",
          contextLength: 4096,
          quality: OllamaModelQuality.Low,
          speed: OllamaModelSpeed.VeryFast,
          capabilities: [OllamaModelCapability.TextGeneration],
          size: 5.1,
          fullName: '',
          provider: 'C4AI',
          platforms: ['macos'],
        },
        {
          model: 'mistral-small',
          tag: '24b-instruct-2501-q4_K_M',
          name: 'Mistral Small 3',
          description:
            'Mistral Small 3 sets a new benchmark in the “small” Large Language Models category below 70B.',
          contextLength: 32000,
          quality: OllamaModelQuality.Medium,
          speed: OllamaModelSpeed.Fast,
          capabilities: [OllamaModelCapability.TextGeneration],
          size: 13,
          fullName: '',
          provider: 'Mistral',
          platforms: ['macos'],
        },
      ]
    : []),
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
    platforms: ['windows', 'linux', 'macos'],
  },
  {
    model: 'llama3.2-vision',
    tag: 'latest',
    name: 'Llama 3.2 Vision 11b',
    description:
      'Llama 3.2 Vision is an instruction-tuned image reasoning generative model optimized for visual recognition, image reasoning, captioning, and answering general questions about images.',
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
    platforms: ['windows', 'linux', 'macos'],
  },
].map((model) => {
  model.fullName = `${model.model}:${model.tag}` as const;
  return model;
});
