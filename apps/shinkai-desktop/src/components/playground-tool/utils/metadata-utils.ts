import { ToolMetadata } from '@shinkai_network/shinkai-message-ts/api/tools/types';

/**
 * Sorts a metadata object's fields to prioritize required properties before optional ones
 * This is used only for display purposes and doesn't affect the saved metadata structure
 */
export function sortMetadataPropertiesForDisplay(metadata: object, requiredFields: string[]): object {
  if (!metadata || typeof metadata !== 'object' || !requiredFields) {
    return metadata;
  }

  const requiredProps: Record<string, any> = {};
  const optionalProps: Record<string, any> = {};

  Object.entries(metadata).forEach(([key, value]) => {
    if (requiredFields.includes(key)) {
      requiredProps[key] = value;
    } else {
      optionalProps[key] = value;
    }
  });

  return { ...requiredProps, ...optionalProps };
}

/**
 * Sorts metadata content for display purposes without affecting the saved structure
 * Focuses on sorting properties within configurations and parameters sections
 */
export function sortToolMetadataForDisplay(metadata: ToolMetadata): ToolMetadata {
  if (!metadata) return metadata;

  const sortedMetadata = JSON.parse(JSON.stringify(metadata));

  if (
    sortedMetadata.configurations &&
    sortedMetadata.configurations.properties &&
    sortedMetadata.configurations.required
  ) {
    sortedMetadata.configurations.properties = sortMetadataPropertiesForDisplay(
      sortedMetadata.configurations.properties,
      sortedMetadata.configurations.required
    );
  }

  if (
    sortedMetadata.parameters &&
    sortedMetadata.parameters.properties &&
    sortedMetadata.parameters.required
  ) {
    sortedMetadata.parameters.properties = sortMetadataPropertiesForDisplay(
      sortedMetadata.parameters.properties,
      sortedMetadata.parameters.required
    );
  }

  return sortedMetadata;
}
