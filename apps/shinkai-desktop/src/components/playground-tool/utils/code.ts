import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';

export function extractCodeLanguage(input: string): CodeLanguage | null {
  const match = input.match(/```(\w+)/);
  if (!match) {
    return null;
  }
  const [_, language] = match;
  if (language === 'typescript') {
    return CodeLanguage.Typescript;
  }
  if (language === 'python') {
    return CodeLanguage.Python;
  }
  return null;
}

export function extractCodeByLanguage(message: string, language: CodeLanguage) {
  const tsCodeMatch = message.match(
    new RegExp(`\`\`\`${language.toLowerCase()}\n([\\s\\S]*?)\n\`\`\``),
  );
  return tsCodeMatch ? tsCodeMatch[1].trim() : null;
}

export function detectLanguage(code: string): string {
  const typeScriptRegex =
    /(interface\s+\w+\s*{)|(type\s+\w+\s*=)|(function\s+\w+\s*<\w+>)/;
  const pythonRegex = /^\s*def\s+\w+\s*\(.*\):|^\s*class\s+\w+\s*\(?.*?\)?:/m;

  if (typeScriptRegex.test(code)) {
    return 'TypeScript';
  } else if (pythonRegex.test(code)) {
    return 'Python';
  } else {
    return 'Unknown';
  }
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

export function parseJsonFromCodeBlock(
  text: string,
): Record<string, unknown> | null {
  const regex = /```json([\s\S]*?)```/i;
  const match = text.match(regex);
  if (!match) return null;
  const jsonString = match[1];
  const sanitized = jsonString.replace(/,\s*([\]}])/g, '$1');
  try {
    return JSON.parse(sanitized);
  } catch (error) {
    console.error('Error parseJsonFromCodeBlock:', error);
    return null;
  }
}
