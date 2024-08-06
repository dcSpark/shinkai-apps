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

export const OLLAMA_MODELS: OllamaModel[] = [
  {
    model: 'qwen2',
    tag: '1.5b-instruct-q4_K_M',
    name: 'Qwen2 1.5B',
    description:
      "Qwen 1.5 is a series of large language models by Alibaba Cloud spanning from 0.5B to 110B parameters",
    contextLength: 32000,
    quality: OllamaModelQuality.Low,
    speed: OllamaModelSpeed.VeryFast,
    capabilities: [OllamaModelCapability.TextGeneration],
    size: 0.986,
    fullName: '',
  },
  {
    model: 'phi3',
    tag: '3.8b',
    name: 'Phi-3 Mini',
    description:
      'Phi-3 is a family of lightweight 3B (Mini) and 14B (Medium) state-of-the-art open models by Microsoft.',
    contextLength: 4000,
    quality: OllamaModelQuality.Medium,
    speed: OllamaModelSpeed.Fast,
    capabilities: [OllamaModelCapability.TextGeneration],
    size: 2.3,
    fullName: '',
  },
  {
    model: 'llama3.1',
    tag: '8b-instruct-q4_1',
    name: 'Llama 3.1 8b',
    description: 'Llama 3.1 is a new state-of-the-art model from Meta available in 8B, 70B and 405B parameter sizes.',
    contextLength: 8000,
    quality: OllamaModelQuality.Good,
    speed: OllamaModelSpeed.Average,
    capabilities: [OllamaModelCapability.TextGeneration],
    size: 4.7,
    fullName: '',
  },
  {
    model: 'llava-phi3',
    tag: '3.8b-mini-q4_0',
    name: 'LLaVA Phi 3',
    description:
      "A new small LLaVA model fine-tuned from Phi 3 Mini.",
    contextLength: 4000,
    quality: OllamaModelQuality.Medium,
    speed: OllamaModelSpeed.Average,
    capabilities: [OllamaModelCapability.TextGeneration, OllamaModelCapability.ImageToText],
    size: 2.9,
    fullName: '',
  },
].map((model) => {
  model.fullName = `${model.model}:${model.tag}` as const;
  return model;
});
