import { z } from 'zod';

import { Models, modelsConfig } from '../../lib/utils/models';

const modelsWithoutApiKey = [Models.Ollama, Models.Exo];

export const addAiModelSchema = z
  .object({
    name: z.string(),
    externalUrl: z.string().url(),
    apikey: z.string(),
    model: z.nativeEnum(Models),
    modelType: z.string(),
    isCustomModel: z.boolean().default(false).optional(),
    modelCustom: z.string().optional(),
    modelTypeCustom: z.string().optional(),
    description: z.string().optional(),
  })
  .superRefine(
    (
      { isCustomModel, model, modelType, modelCustom, modelTypeCustom, apikey },
      ctx,
    ) => {
      if (isCustomModel) {
        if (!modelCustom) {
          ctx.addIssue({
            path: ['modelCustom'],
            code: z.ZodIssueCode.custom,
            message: 'Model Name is required',
          });
        }
        if (!modelTypeCustom) {
          ctx.addIssue({
            path: ['modelTypeCustom'],
            code: z.ZodIssueCode.custom,
            message: 'Model ID is required',
          });
        }
      } else {
        if (!model) {
          ctx.addIssue({
            path: ['model'],
            code: z.ZodIssueCode.custom,
            message: 'Model is required',
          });
        }
        if (!modelType) {
          ctx.addIssue({
            path: ['modelType'],
            code: z.ZodIssueCode.custom,
            message: 'Model Type is required',
          });
        }
        if (!apikey && !modelsWithoutApiKey.includes(model)) {
          ctx.addIssue({
            path: ['apikey'],
            code: z.ZodIssueCode.custom,
            message: 'Api Key is required',
          });
        }
      }
    },
  );

export type AddAiModelFormSchema = z.infer<typeof addAiModelSchema>;

export const addAiModelFormDefault: AddAiModelFormSchema = {
  name: '',
  externalUrl: modelsConfig[Models.OpenAI].apiUrl,
  apikey: '',
  model: Models.OpenAI,
  modelType: '',
  isCustomModel: false,
  description: '',
};
