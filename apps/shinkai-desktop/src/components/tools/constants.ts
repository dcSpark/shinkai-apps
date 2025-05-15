import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export const TOOL_HOMEPAGE_SUGGESTIONS = [
  {
    text: 'Solana Token Swap with Jupiter',
    prompt:
      'Create a TypeScript tool that performs token swaps on Solana using Jupiter Exchange. The tool should accept input parameters for the source token, destination token, amount to swap, slippage tolerance, and wallet configuration. Implement connection to Solana network, Jupiter SDK integration, route finding with best price discovery, and transaction execution. Include proper error handling for insufficient funds, route not found, and failed transactions. The tool should return the transaction signature and swap details including input/output amounts and effective price. Add TypeScript types for all interfaces and implement proper input validation.',
    language: CodeLanguage.Typescript,
  },
  {
    text: 'Generate video transcripts from audio',
    prompt:
      'Create a Python tool that converts video files to SRT subtitles using the Faster Whisper speech-to-text model. The tool should accept a video filename and Whisper model configuration (size, device, compute type) as inputs, transcribe the audio using faster-whisper, format the results as SRT subtitles, and save them alongside the original video. Return the path to the generated SRT file. Add default values to CONFIG if possible.',
    language: CodeLanguage.Python,
  },
  {
    text: 'Download pdf from url',
    prompt: 'Create a tool that downloads and saves a pdf from a URL.',
    language: CodeLanguage.Python,
  },
  {
    text: 'Download YouTube Video Transcript',
    prompt:
      'Create a TypeScript tool that downloads transcripts from YouTube videos without using an API key. The tool should accept a YouTube video URL as input and return the transcript in a structured format. Include error handling for videos without captions, invalid URLs, and network issues. The tool should support multiple languages if available and allow saving the transcript to a file.',
    language: CodeLanguage.Typescript,
  },
  {
    text: 'Export text to .odt file',
    prompt:
      'Create a tool that allows to export text to an .odt file (OpenDocument). The text is given as input.',
    language: CodeLanguage.Typescript,
  },
  {
    text: 'Fetch Crypto Prices from Coingeckos API',
    prompt:
      'Create a Python tool that interacts with the CoinGecko API to fetch cryptocurrency market data, implementing both free and pro API endpoints. The tool should accept configuration parameters including an optional API key, and input parameters for pagination (page, page_size), sorting options (by market cap, volume, or ID in ascending or descending order), filtering by volume and market cap ranges, and currency denomination. Implement robust error handling with retry logic using the tenacity library, handle rate limiting appropriately, and include fallback mock data for testing purposes. The tool should return a structured output containing formatted coin data (including ID, symbol, name, current price, market cap, volume, and 24-hour price change) along with pagination details. Ensure the implementation follows type hints, includes proper API status checking, and formats the response data consistently.',
    language: CodeLanguage.Typescript,
  },
  {
    text: 'Get Hacker News stories',
    prompt:
      'Generate a tool for getting top tech-related stories from Hacker News, include the title, author, and URL of the story',
    language: CodeLanguage.Typescript,
  },
];

export const CODE_GENERATOR_MODEL_ID = 'shinkai-backend:CODE_GENERATOR';
export const SHINKAI_FREE_TRIAL_MODEL_ID =
  'shinkai-backend:FREE_TEXT_INFERENCE';
