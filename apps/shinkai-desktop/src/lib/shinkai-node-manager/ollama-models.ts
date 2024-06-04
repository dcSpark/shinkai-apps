export enum OllamaModelQuality {
  Bad = 'bad',
  Low = 'low',
  Medium = 'medium',
  Good = 'good',
  Great = 'great',
}

export enum OllamaModelSpeed {
  VerySlow = 'very-slow',
  Slow = 'slow',
  Average = 'average',
  Fast = 'fast',
  VeryFast = 'very-fast',
}

export interface OllamaModel {
  model: string;
  tag: string;
  name: string;
  description: string;
  contextLength: number;
  quality: OllamaModelQuality;
  speed: OllamaModelSpeed;
  size: number; // Size in GB
  requiredRAM: number;
  fullName: string;
}

export const OLLAMA_MODELS: OllamaModel[] = [
  {
    model: 'llama3',
    tag: '8b-instruct-q4_1',
    name: 'Llama-3 8b',
    description: 'Meta Llama 3: The most capable openly available LLM to date',
    contextLength: 8000,
    quality: OllamaModelQuality.Medium,
    speed: OllamaModelSpeed.Fast,
    size: 4.7, // Size in Gb
    requiredRAM: 16, //  Size in Gb
    fullName: '',
  },
  {
    model: 'qwen2',
    tag: '7b-instruct-q4_K_M',
    name: 'Qwen2 7B',
    description:
      "Qwen2 is trained on data in 29 languages, including English and Chinese. It is available in 4 parameter sizes: 0.5B, 1.5B, 7B, 72B. Last Update June 7th.",
    contextLength: 128000,
    quality: OllamaModelQuality.Good,
    speed: OllamaModelSpeed.Average,
    size: 4.7, // Size in GB
    requiredRAM: 16, // Size in GB
    fullName: '',
  },
  {
    model: 'llava-phi3',
    tag: '3.8b-mini-q4_0',
    name: 'LLaVA Phi 3',
    description:
      "(Image-to-Text Model) lLlava-phi3 is a LLaVA model fine-tuned from Phi 3 Mini 4k, with strong performance benchmarks on par with the original LLaVA model.",
    contextLength: 4000,
    quality: OllamaModelQuality.Low,
    speed: OllamaModelSpeed.VeryFast,
    size: 2.9,
    requiredRAM: 8,
    fullName: '',
  },
  {
    model: 'qwen2',
    tag: '1.5b-instruct-q4_K_M',
    name: 'Qwen2 1.5B',
    description:
      "Qwen2 is trained on data in 29 languages, including English and Chinese. It is available in 4 parameter sizes: 0.5B, 1.5B, 7B, 72B. Last Update June 7th.",
    contextLength: 32000,
    quality: OllamaModelQuality.Low,
    speed: OllamaModelSpeed.Fast,
    size: 0.986, // Size in GB
    requiredRAM: 8, // Size in GB
    fullName: '',
  },
  {
    model: 'qwen2',
    tag: '0.5b-instruct-q4_K_M',
    name: 'Qwen2 0.5B',
    description:
      "Qwen2 is trained on data in 29 languages, including English and Chinese. It is available in 4 parameter sizes: 0.5B, 1.5B, 7B, 72B. Last Update June 7th.",
    contextLength: 32000,
    quality: OllamaModelQuality.Bad,
    speed: OllamaModelSpeed.VeryFast,
    size: 0.397, // Size in GB
    requiredRAM: 8, // Size in GB
    fullName: '',
  },
  {
    model: 'dolphin-llama3',
    tag: '8b-v2.9-q4_1',
    name: 'Dolphin 2.9 Llama 3',
    description:
      "Dolphin-2.9 (uncensored) has a variety of instruction, conversational, and coding skills. It also has initial agentic abilities and supports function calling.",
    contextLength: 8000,
    quality: OllamaModelQuality.Medium,
    speed: OllamaModelSpeed.Fast,
    size: 5.1,
    requiredRAM: 16,
    fullName: '',
  },
  {
    model: 'aya',
    tag: 'aya:8b-23-q4_K_M',
    name: 'Aya 23 8b',
    description:
      "Aya 23, released by Cohere, is a new family of state-of-the-art, multilingual models that support 23 languages.",
    contextLength: 8000,
    quality: OllamaModelQuality.Medium,
    speed: OllamaModelSpeed.Fast,
    size: 4.8, // Size in Gb
    requiredRAM: 16, //  Size in Gb
    fullName: '',
  },
  {
    model: 'phi3',
    tag: '3.8b',
    name: 'Phi-3 Mini',
    description:
      'Phi-3 Mini is a 3.8B parameters, lightweight, state-of-the-art open model trained with the Phi-3 datasets that includes both synthetic data and the filtered publicly available websites data with a focus on high-quality and reasoning dense properties.',
    contextLength: 4000,
    quality: OllamaModelQuality.Low,
    speed: OllamaModelSpeed.VeryFast,
    size: 2.3,
    requiredRAM: 8,
    fullName: '',
  },
  {
    model: 'falcon2',
    tag: '11b-q4_1',
    name: 'Falcon 2',
    description:
      'Falcon2 is an 11B parameters causal decoder-only model built by TII and trained over 5T tokens.',
    contextLength: 8192,
    quality: OllamaModelQuality.Good,
    speed: OllamaModelSpeed.Average,
    size: 7.1,
    requiredRAM: 16,
    fullName: '',
  },
  {
    model: 'llama3-chatqa',
    tag: '8b-v1.5-q4_K_M',
    name: 'Llama3 ChatQA-1.5',
    description:
      'ChatQA-1.5 is built on top of the Llama-3 base model, and incorporates conversational QA data to enhance its tabular and arithmetic calculation capability.',
    contextLength: 8000,
    quality: OllamaModelQuality.Medium,
    speed: OllamaModelSpeed.Fast,
    size: 4.9,
    requiredRAM: 16,
    fullName: '',
  },
  {
    model: 'command-r-plus',
    tag: '104b-q4_0',
    name: 'Command R+',
    description:
      'Command R+ is a powerful, scalable large language model purpose-built to excel at real-world enterprise use cases.',
    contextLength: 128000,
    quality: OllamaModelQuality.Good,
    speed: OllamaModelSpeed.Slow,
    size: 59,
    requiredRAM: 32,
    fullName: '',
  },
  {
    model: 'wizardlm2',
    tag: '8x22b-q4_0',
    name: 'WizardLM-2',
    description:
      'WizardLM-2 is a next generation state-of-the-art large language model with improved performance on complex chat, multilingual, reasoning and agent use cases.',
    contextLength: 8000,
    quality: OllamaModelQuality.Good,
    speed: OllamaModelSpeed.Slow,
    size: 80,
    requiredRAM: 16,
    fullName: '',
  },
  {
    model: 'adrienbrault/nous-hermes2theta-llama3-8b',
    tag: 'f16',
    name: 'Hermes 2 Tetha',
    description:
      'Hermes-2 Θ (Theta) is the first experimental merged model released by Nous Research, in collaboration with Charles Goddard at Arcee, the team behind MergeKit.',
    contextLength: 8000,
    quality: OllamaModelQuality.Medium,
    speed: OllamaModelSpeed.VeryFast,
    size: 16,
    requiredRAM: 16,
    fullName: '',
  },
  {
    model: 'llama3',
    tag: '70b-instruct-q4_K_M',
    name: 'Llama-3 70B',
    description: 'Meta Llama 3: The most capable openly available LLM to date',
    contextLength: 8000,
    quality: OllamaModelQuality.Good,
    speed: OllamaModelSpeed.Slow,
    size: 4.7, // Size in Gb
    requiredRAM: 32, //  Size in Gb
    fullName: '',
  },
  {
    model: 'qwen2',
    tag: '72b-instruct-q4_K_M',
    name: 'Qwen2 72B',
    description:
      "Qwen2 is trained on data in 29 languages, including English and Chinese. It is available in 4 parameter sizes: 0.5B, 1.5B, 7B, 72B. Last Update June 7th.",
    contextLength: 128000,
    quality: OllamaModelQuality.Good,
    speed: OllamaModelSpeed.Slow,
    size: 59, // Size in GB
    requiredRAM: 32, // Size in GB
    fullName: '',
  },
].map((model) => {
  model.fullName = `${model.model}:${model.tag}` as const;
  return model;
});
