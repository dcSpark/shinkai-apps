import { ToolMetadataSchema } from '../schemas';

export function validateMetadata(json: unknown) {
  const result = ToolMetadataSchema.safeParse(json);
  if (!result.success) {
    console.error('Validation Error:', result.error.format());
    throw new Error('Invalid JSON: ' + result.error.message);
  }
  return result.data;
}
