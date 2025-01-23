import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';

import {
  detectLanguage,
  extractCodeByLanguage,
  extractCodeLanguage,
  getLanguage,
  parseJsonFromCodeBlock,
} from './code';

describe('code utils', () => {
  describe('extractCodeLanguage', () => {
    it('should extract typescript language', () => {
      expect(extractCodeLanguage('```typescript\nconst x = 1;\n```')).toBe(
        CodeLanguage.Typescript,
      );
    });

    it('should extract python language', () => {
      expect(extractCodeLanguage('```python\nx = 1\n```')).toBe(
        CodeLanguage.Python,
      );
    });

    it('should return null for unsupported language', () => {
      expect(extractCodeLanguage('```java\nString x = "";\n```')).toBeNull();
    });

    it('should return null for invalid code block', () => {
      expect(extractCodeLanguage('plain text')).toBeNull();
    });
  });

  describe('extractCodeByLanguage', () => {
    it('should extract typescript code', () => {
      const message = '```typescript\nconst x = 1;\n```';
      expect(extractCodeByLanguage(message, CodeLanguage.Typescript)).toBe(
        'const x = 1;',
      );
    });

    it('should extract python code', () => {
      const message = '```python\nx = 1\n```';
      expect(extractCodeByLanguage(message, CodeLanguage.Python)).toBe('x = 1');
    });

    it('should return null if no code block found', () => {
      const message = 'plain text';
      expect(extractCodeByLanguage(message, CodeLanguage.Python)).toBeNull();
    });
  });

  describe('detectLanguage', () => {
    it('should detect TypeScript interface', () => {
      expect(detectLanguage('interface User { name: string; }')).toBe(
        'TypeScript',
      );
    });

    it('should detect TypeScript type', () => {
      expect(detectLanguage('type User = { name: string; }')).toBe(
        'TypeScript',
      );
    });

    it('should detect TypeScript generic function', () => {
      expect(detectLanguage('function getValue<T>(input: T): T')).toBe(
        'TypeScript',
      );
    });

    it('should detect Python function', () => {
      expect(detectLanguage('def hello_world():')).toBe('Python');
    });

    it('should detect Python class', () => {
      expect(detectLanguage('class MyClass:')).toBe('Python');
    });

    it('should return Unknown for ambiguous code', () => {
      expect(detectLanguage('console.log("hello")')).toBe('Unknown');
    });
  });

  describe('getLanguage', () => {
    it('should return Python language', () => {
      expect(getLanguage('python')).toBe(CodeLanguage.Python);
    });

    it('should return TypeScript language', () => {
      expect(getLanguage('typeScript')).toBe(CodeLanguage.Typescript);
    });

    it('should return TypeScript as default', () => {
      expect(getLanguage('unknown')).toBe(CodeLanguage.Typescript);
    });
  });

  describe('parseJsonFromCodeBlock', () => {
    it('should parse valid JSON from code block', () => {
      const text = '```json\n{"name": "test", "value": 123}\n```';
      expect(parseJsonFromCodeBlock(text)).toEqual({
        name: 'test',
        value: 123,
      });
    });

    it('should handle JSON with trailing commas', () => {
      const text = '```json\n{"name": "test", "value": 123,}\n```';
      expect(parseJsonFromCodeBlock(text)).toEqual({
        name: 'test',
        value: 123,
      });
    });

    it('should return null for invalid JSON', () => {
      const text = '```json\n{"invalid": json}\n```';
      expect(parseJsonFromCodeBlock(text)).toBeNull();
    });

    it('should return null when no JSON code block found', () => {
      const text = 'plain text';
      expect(parseJsonFromCodeBlock(text)).toBeNull();
    });
  });
});
