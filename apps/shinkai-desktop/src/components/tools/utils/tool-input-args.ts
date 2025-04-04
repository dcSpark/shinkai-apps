import { RJSFSchema } from '@rjsf/utils';
import { ToolArgument } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { JSONSchema7TypeName } from 'json-schema';

export function parseInputArgsToJsonSchema(inputArgs: ToolArgument[]): RJSFSchema {
  const schema: RJSFSchema = {
    type: 'object',
    required: [],
    properties: {},
  };

  const requiredArgs = inputArgs.filter(arg => arg.is_required);
  const optionalArgs = inputArgs.filter(arg => !arg.is_required);
  
  [...requiredArgs, ...optionalArgs].forEach((arg) => {
    const { name, description, is_required, arg_type } = arg;

    if (is_required) {
      schema.required?.push(name);
    }

    schema.properties![name] = {
      type: mapArgTypeToJsonSchemaType(arg_type),
      description,
    };
  });

  return schema;
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
