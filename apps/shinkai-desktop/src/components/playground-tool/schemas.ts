import { z } from 'zod';

export const ToolMetadataSchema = z.object({
  name: z
    .string({ message: 'Tool name is required' })
    .min(1, 'Tool name is required')
    .max(100, 'Tool name must be less than 100 characters'),

  description: z
    .string({ message: 'Tool description is required' })
    .min(1, 'Tool description is required')
    .max(500, 'Tool description must be less than 500 characters'),

  author: z.string(),

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

  sqlTables: z.array(z.string()).default([]),
  sqlQueries: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
});

export type ToolMetadataSchemaType = z.infer<typeof ToolMetadataSchema>;
