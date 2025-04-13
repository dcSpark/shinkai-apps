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

  const requiredConfigs: ToolConfig[] = [];
  const optionalConfigs: ToolConfig[] = [];

  const sanitizedConfig = config.map(item => {
    const { BasicConfig } = item;
    const sanitizedBasicConfig = { ...BasicConfig };
    
    if (sanitizedBasicConfig.key_value === null) {
      sanitizedBasicConfig.key_value = '';
    }
    
    return { BasicConfig: sanitizedBasicConfig };
  });

  sanitizedConfig.forEach((item) => {
    const { BasicConfig } = item;
    const { required } = BasicConfig;

    if (required) {
      requiredConfigs.push(item);
    } else {
      optionalConfigs.push(item);
    }
  });

  [...requiredConfigs, ...optionalConfigs].forEach((item) => {
    const { BasicConfig } = item;
    const { key_name, description, required, type } = BasicConfig;

    if (required) {
      schema.required.push(key_name);
    }

    const fieldType = (type || 'string') as JSONSchema7TypeName;
    


    schema.properties[key_name] = {
      type: fieldType,
      description: `${description}${required ? ' (Required)' : ' (Optional)'}`,
      ...(fieldType === 'string' ? { default: '' } : {})
    };
  });


  return schema;
}
