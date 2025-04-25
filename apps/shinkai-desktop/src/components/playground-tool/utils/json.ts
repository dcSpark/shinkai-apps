/**
 * Stringify a JSON object while preserving the original property order
 * @param obj The object to stringify
 * @param space Number of spaces to use for indentation
 * @returns The stringified object with preserved property order
 */
export function stringifyWithPreservedOrder(
  obj: unknown,
  space: number = 0
): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  const indent = ' '.repeat(space);
  const result = Array.isArray(obj)
    ? `[\n${indent}${Array.from(obj)
        .map((item) => `${indent}${stringifyWithPreservedOrder(item, space + 2)}`)
        .join(`,\n${indent}`)}\n${indent}]`
    : `{\n${Object.entries(obj)
        .map(([key, value]) => `${indent}  "${key}": ${stringifyWithPreservedOrder(value, space + 2)}`)
        .join(`,\n${indent}`)}\n${indent}}`;
  
  return result;
}
