/**
 * A single class that extracts and parses the first JSON code block
 * enclosed by ```json ... ```, removing trailing commas, and then
 * parsing with standard JSON.parse.
 */
export class JSONExtractor {
  /* 1) Look for the first ```json ... ``` block (case-insensitive)
    and return its contents without the triple backticks.
    If none is found, return null. */
  public static extractFirstJsonBlock(text: string): string | null {
    const regex = /```json([\s\S]*?)```/i; // Use a lazy capture group and case-insensitive match
    const match = text.match(regex);
    return match ? match[1] : null;
  }

  /* 2) Remove any trailing commas before closing brackets/braces.
    This helps clean up JSON that might contain extra commas. */
  public static removeTrailingCommas(jsonString: string): string {
    return jsonString.replace(/,\s*([\]}])/g, '$1');
  }

  /* 3) Extract, sanitize, and parse the first JSON block found.
    Returns the parsed JSON object (or array) if successful,
    otherwise returns null if no block was found. */
  public static extractAndParseFirstJson(text: string): any {
    const rawBlock = JSONExtractor.extractFirstJsonBlock(text);
    if (!rawBlock) return null;
    const sanitized = JSONExtractor.removeTrailingCommas(rawBlock);
    return JSON.parse(sanitized);
  }
}
