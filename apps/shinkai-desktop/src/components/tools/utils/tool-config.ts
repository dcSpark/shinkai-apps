import { RJSFSchema } from '@rjsf/utils';
import { ToolConfig } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { JSONSchema7TypeName } from 'json-schema';

type ToolConfigSchema = {
  type: 'object';
  required: string[];
  properties: {
    [key: string]: {
      type: JSONSchema7TypeName;
      description: string;
    };
  };
};

export function parseConfigToJsonSchema(config: ToolConfig[]): RJSFSchema {
  const schema: ToolConfigSchema = {
    type: 'object',
    required: [],
    properties: {},
  };

  config.forEach((item) => {
    const { BasicConfig } = item;
    const { key_name, description, required, type } = BasicConfig;

    if (required) {
      schema.required.push(key_name);
    }

    schema.properties[key_name] = {
      type: (type || 'string') as JSONSchema7TypeName,
      description: `${description}${required ? ' (Required)' : ' (Optional)'}`,
    };
  });

  return schema;
}

/**
 * Creates a sorted schema with required properties first, followed by optional properties.
 * This function does not modify the original data structure but only changes the display order.
 */
export function createSortedConfigSchema(schema: RJSFSchema): RJSFSchema {
  if (!schema.properties || !schema.required) {
    return schema;
  }

  const sortedSchema: RJSFSchema = {
    ...schema,
    properties: {},
  };

  schema.required.forEach((key) => {
    if (schema.properties && schema.properties[key]) {
      if (!sortedSchema.properties) {
        sortedSchema.properties = {};
      }
      sortedSchema.properties[key] = schema.properties[key];
    }
  });

  if (schema.properties) {
    Object.keys(schema.properties).forEach((key) => {
      if (!schema.required?.includes(key)) {
        if (!sortedSchema.properties) {
          sortedSchema.properties = {};
        }
        if (schema.properties && schema.properties[key]) {
          sortedSchema.properties[key] = schema.properties[key];
        }
      }
    });
  }

  return sortedSchema;
}
