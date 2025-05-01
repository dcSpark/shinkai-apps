import { platform } from '@tauri-apps/plugin-os';

import { ModelProvider } from '../../components/ais/constants';
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
          model: 'gemma3',
          tag: '27b-it-q4_K_M',
          name: 'Google Gemma 3',
          description:
            'Gemma is a lightweight, family of models from Google built on Gemini technology. The Gemma 3 models are multimodal—processing text and images—and feature a 128K context window with support for over 140 languages.',
          contextLength: 128000,
          quality: OllamaModelQuality.Good,
          speed: OllamaModelSpeed.Average,
          capabilities: [OllamaModelCapability.TextGeneration, OllamaModelCapability.ImageToText],
          size: 15.8,
          fullName: '',
          provider: ModelProvider.Google,
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
          provider: ModelProvider.Meta,
        },
      ]
    : []),
  ...(currentPlatform === 'macos'
    ? [
        {
          model: 'gemma3',
          tag: '27b-it-q4_K_M',
          name: 'Google Gemma 3',
          description:
            'Gemma is a lightweight, family of models from Google built on Gemini technology. The Gemma 3 models are multimodal—processing text and images—and feature a 128K context window with support for over 140 languages.',
          contextLength: 128000,
          quality: OllamaModelQuality.Good,
          speed: OllamaModelSpeed.Average,
          capabilities: [OllamaModelCapability.TextGeneration, OllamaModelCapability.ImageToText],
          size: 15.8,
          fullName: '',
          provider: ModelProvider.Google,
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
          provider: ModelProvider.Mistral,
          platforms: ['macos'],
        },
      ]
    : []),
  {
    model: 'deepseek-r1',
    tag: '70b',
    name: 'DeepSeek R1 70B',
    description:
      'DeepSeek R1 70B is a powerful reasoning model achieving performance comparable to OpenAI-o1 across math, code, and reasoning tasks. It is derived from Llama3.3-70B-Instruct and optimized through distillation from larger models.',
    contextLength: 128000,
    quality: OllamaModelQuality.Good,
    speed: OllamaModelSpeed.Average,
    capabilities: [OllamaModelCapability.TextGeneration],
    size: 40.2,
    fullName: '',
    provider: ModelProvider.DeepSeek,
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
    provider: ModelProvider.Meta,
    platforms: ['windows', 'linux', 'macos'],
  },
].map((model) => {
  model.fullName = `${model.model}:${model.tag}` as const;
  return model;
});
