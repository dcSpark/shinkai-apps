export enum OllamaModelQuality {
  Bad = 'bad',
  Medium = 'medium',
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
  model: string,
  tag: string,
  name: string,
  description: string,
  dataLimit: number, // In number of book
  quality: OllamaModelQuality,
  speed: OllamaModelSpeed,
  size: number, // Size in GB
  requiredRAM: number,
}

export const OLLAMA_MODELS: OllamaModel[] = [
  {
    model: 'llama3-gradient',
    tag: '8b-instruct-1048k-q3_K_M',
    name: 'Llama-3 Gradient',
    description: 'This model extends LLama-3 8B\'s context length from 8k to over 1m tokens.',
    dataLimit: 1, // In number of book
    quality: OllamaModelQuality.Medium,
    speed: OllamaModelSpeed.Fast,
    size: 4.7, // Size in Gb
    requiredRAM: 16, //  Size in Gb
  }
];
