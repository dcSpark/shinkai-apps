// Custom error type for configuration failures needing manual steps
export class ConfigError extends Error {
  helpText: string;
  constructor(message: string, helpText: string) {
    super(message);
    this.name = 'ConfigError';
    this.helpText = helpText;
  }
} 