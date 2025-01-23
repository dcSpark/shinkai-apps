import { JSONExtractor } from "./JSONExtractor";

describe("JSONExtractor", () => {
  describe("extractFirstJsonBlock", () => {
    it("extracts JSON block with lowercase json tag", async () => {
      const input = 'Some text\n```json\n{"key": "value"}\n```\nMore text';
      const expected = '\n{"key": "value"}\n';
      expect(JSONExtractor.extractFirstJsonBlock(input)).toEqual(expected);
    });

    it("extracts JSON block with uppercase JSON tag", async () => {
      const input = 'Some text\n```JSON\n{"key": "value"}\n```\nMore text';
      const expected = '\n{"key": "value"}\n';
      expect(JSONExtractor.extractFirstJsonBlock(input)).toEqual(expected);
    });

    it("returns null when no JSON block is found", async () => {
      const input = 'Some text\n```typescript\nconst x = 1;\n```\nMore text';
      expect(JSONExtractor.extractFirstJsonBlock(input)).toBeNull();
    });

    it("returns only the first JSON block when multiple exist", async () => {
      const input = '```json\n{"first": true}\n```\n```json\n{"second": true}\n```';
      const expected = '\n{"first": true}\n';
      expect(JSONExtractor.extractFirstJsonBlock(input)).toEqual(expected);
    });
  });

  describe("removeTrailingCommas", () => {
    it("removes trailing comma in object", async () => {
      const input = '{"a": 1,"b": 2,}';
      const expected = '{"a": 1,"b": 2}';
      expect(JSONExtractor.removeTrailingCommas(input)).toEqual(expected);
    });

    it("removes trailing comma in array", async () => {
      const input = '[1,2,]';
      const expected = '[1,2]';
      expect(JSONExtractor.removeTrailingCommas(input)).toEqual(expected);
    });

    it("handles nested structures", async () => {
      const input = '{"a": [1,2,], "b": 3}';
      const expected = '{"a": [1,2], "b": 3}';
      expect(JSONExtractor.removeTrailingCommas(input)).toEqual(expected);
    });
  });

  describe("extractAndParseFirstJson", () => {
    it("successfully parses valid JSON", async () => {
      const input = '```json\n{"key": "value"}\n```';
      const expected = { key: "value" };
      expect(JSONExtractor.extractAndParseFirstJson(input)).toEqual(expected);
    });

    it("successfully parses JSON with trailing commas", async () => {
      const input = '```json\n{\n  "a": 1,\n  "b": 2,\n}\n```';
      const expected = { a: 1, b: 2 };
      expect(JSONExtractor.extractAndParseFirstJson(input)).toEqual(expected);
    });

    it("returns null when no JSON block is found", async () => {
      const input = 'Just some regular text';
      expect(JSONExtractor.extractAndParseFirstJson(input)).toBeNull();
    });

    it("handles complex nested structures", async () => {
      const input = `\`\`\`json
{
  "array": [1, 2, 3],
  "object": {
    "nested": true,
    "value": "test",
  },
  "nullValue": null,
}
\`\`\``;
      const expected = {
        array: [1, 2, 3],
        object: {
          nested: true,
          value: "test",
        },
        nullValue: null,
      };
      expect(JSONExtractor.extractAndParseFirstJson(input)).toEqual(expected);
    });
  });
});
