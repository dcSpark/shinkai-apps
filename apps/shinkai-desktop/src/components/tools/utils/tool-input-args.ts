import { RJSFSchema } from '@rjsf/utils';
import { ToolArgument } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { JSONSchema7TypeName } from 'json-schema';

export function parseInputArgsToJsonSchema(inputArgs: ToolArgument[]): RJSFSchema {
  const schema: RJSFSchema = {
    type: 'object',
    required: [],
    properties: {},
  };

  inputArgs.forEach((arg) => {
    const { name, description, is_required, arg_type } = arg;

    if (is_required) {
      schema.required?.push(name);
    }

    if (schema.properties) {
      schema.properties[name] = {
        type: mapArgTypeToJsonSchemaType(arg_type),
        description,
      };
    }
  });

  return schema;
}

/**
 * Creates a sorted schema with required properties first, followed by optional properties.
 * This function does not modify the original data structure but only changes the display order.
 */
export function createSortedInputArgsSchema(schema: RJSFSchema): RJSFSchema {
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

function mapArgTypeToJsonSchemaType(argType: string): JSONSchema7TypeName {
  switch (argType.toLowerCase()) {
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return 'array';
    case 'object':
      return 'object';
    case 'null':
      return 'null';
    case 'string':
    default:
      return 'string';
  }
}
