import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export function extractTypeScriptCode(message: string, language: CodeLanguage) {
  const tsCodeMatch = message.match(
    new RegExp(`\`\`\`${language.toLowerCase()}\n([\\s\\S]*?)\n\`\`\``),
  );
  return tsCodeMatch ? tsCodeMatch[1].trim() : null;
}

export function detectLanguage(code: string): string {
  const pythonPatterns = [
    /\bdef\b/,
    /\bclass\b/,
    /\bimport\b/,
    /\basync\s+def\b/,
    /from\s+\w+\s+import\b/,
    /#.*$/,
  ];

  const typescriptPatterns = [
    /\bfunction\b/,
    /\binterface\b/,
    /\btype\b\s+\w+\s*=/,
    /\bexport\s+(default\s+)?/,
    /\/\/.*$/,
    /:\s*\w+(\[\])?/,
  ];

  const isPython = pythonPatterns.some((pattern) => pattern.test(code));

  const isTypeScript = typescriptPatterns.some((pattern) => pattern.test(code));

  if (isPython) return 'Python';
  if (isTypeScript) return 'TypeScript';
  return 'Unknown';
}

export function getLanguage(language: string): CodeLanguage {
  switch (language) {
    case 'python':
      return CodeLanguage.Python;
    case 'typeScript':
      return CodeLanguage.Typescript;
    default:
      return CodeLanguage.Typescript;
  }
}
