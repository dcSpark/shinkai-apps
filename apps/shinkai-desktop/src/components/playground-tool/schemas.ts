import { z } from 'zod';

export const ToolMetadataSchema = z.object({
  name: z
    .string({ message: 'Tool name is required' })
    .min(1, 'Tool name is required')
    .max(100, 'Tool name must be less than 100 characters'),
  homePage: z.string().optional().default(''),
  description: z
    .string({ message: 'Tool description is required' })
    .min(1, 'Tool description is required')
    .max(500, 'Tool description must be less than 500 characters'),

  author: z.string(),

  version: z.string().default('1.0.0'),

  keywords: z.array(z.string()).default([]),

  configurations: z
    .object(
      {
        type: z.literal('object'),
        properties: z.record(z.any()),
        required: z.array(z.string()),
      },
      { message: 'Configurations are required' },
    )
    .passthrough(),
  parameters: z
    .object(
      {
        type: z.literal('object'),
        properties: z.record(z.any()),
        required: z.array(z.string()),
      },
      { message: 'Parameters are required' },
    )
    .passthrough(),
  result: z
    .object(
      {
        type: z.literal('object'),
        properties: z.record(z.any()),
        required: z.array(z.string()),
      },
      { message: 'Result are required' },
    )
    .passthrough(),

  sqlTables: z.array(z.object({
    name: z.string(),
    definition: z.string(),
  })).default([]),
  sqlQueries: z.array(z.object({
    name: z.string(),
    query: z.string(),
  })).default([]),
  tools: z.array(z.string()).default([]),
  oauth: z.array(
    z.object({
      name: z.string().default(''),
      version: z.string().default('2.0'),
      authorizationUrl: z.string().default(''),
      redirectUrl: z.string().default('https://secrets.shinkai.com/redirect'),
      tokenUrl: z.string().default(''),
      clientId: z.string().default('YOUR_PROVIDER_CLIENT_ID'),
      clientSecret: z.string().default('YOUR_PROVIDER_CLIENT_SECRET'),
      scopes: z.array(z.string()).default([]),
      responseType: z.string().default('code'),
      pkceType: z.string().default(''),
      refreshToken: z.string().default(''),
    }),
  ).default([]),
  runner: z.string().default('any'),
  operating_system: z.array(z.string()).default(['linux', 'macos', 'windows']),
  tool_set: z.string().default(''),
});

export type ToolMetadataSchemaType = z.infer<typeof ToolMetadataSchema>;
