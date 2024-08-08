import { ColumnType } from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
import { z } from 'zod';

export const setColumnFormSchema = z
  .object({
    columnName: z.string().min(1),
    columnType: z.nativeEnum(ColumnType),
    agentId: z.string().optional(),
    workflow: z
      .object({
        description: z.string().optional(),
        name: z.string(),
        raw: z.string(),
        version: z.string(),
        steps: z.array(z.any()),
        author: z.string(),
        sticky: z.boolean(),
      })
      .optional(),
    formula: z.string().optional(),
    promptInput: z.string().optional(),
  })
  .superRefine(({ columnType, agentId, formula }, ctx) => {
    if (columnType === ColumnType.Formula && !formula) {
      ctx.addIssue({
        code: 'custom',
        message: 'Formula is required',
        path: ['formula'],
      });
    }

    if (columnType === ColumnType.LLMCall && !agentId) {
      ctx.addIssue({
        code: 'custom',
        message: 'AI is required',
        path: ['agentId'],
      });
    }
  });

export type SetColumnFormSchema = z.infer<typeof setColumnFormSchema>;
