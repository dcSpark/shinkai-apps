export const getAgent = () => {
  return {
    agentName: `test_gpt4_turbo_${Date.now()}`,
    externalUrl: 'https://api.openai.com',
    apiKey: process.env.OPEN_AI_API_KEY,
    model: 'open-ai',
    models: 'gpt-4-1106-preview',
  }
};
