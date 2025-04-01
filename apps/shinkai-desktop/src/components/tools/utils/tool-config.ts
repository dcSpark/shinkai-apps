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
