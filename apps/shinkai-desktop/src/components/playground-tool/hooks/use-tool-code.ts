import { zodResolver } from '@hookform/resolvers/zod';
import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useCreateToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/createToolCode/useCreateToolCode';
import { useExecuteToolCode } from '@shinkai_network/shinkai-node-state/v2/mutations/executeToolCode/useExecuteToolCode';
import { useUpdateToolCodeImplementation } from '@shinkai_network/shinkai-node-state/v2/mutations/updateToolCodeImplementation/useUpdateToolCodeImplementation';
import { PrismEditor } from 'prism-react-editor';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useChatConversationWithOptimisticUpdates } from '../../../pages/chat/chat-conversation';
import { useAuth } from '../../../store/auth';
import { useSettings } from '../../../store/settings';
import { usePlaygroundStore } from '../context/playground-context';
import { extractCodeByLanguage, extractCodeLanguage } from '../utils/code';

export const createToolCodeFormSchema = z.object({
  message: z.string().min(1),
  llmProviderId: z.string().min(1),
  tools: z.array(z.string()),
  language: z.nativeEnum(CodeLanguage),
});

export type CreateToolCodeFormSchema = z.infer<typeof createToolCodeFormSchema>;

export const useToolForm = (
  initialValues?: Partial<CreateToolCodeFormSchema>,
) => {
  const defaultAgentId = useSettings(
    (settingsStore) => settingsStore.defaultAgentId,
  );

  const form = useForm<CreateToolCodeFormSchema>({
    resolver: zodResolver(createToolCodeFormSchema),
    defaultValues: {
      message: '',
      tools: [],
      language: CodeLanguage.Typescript,
      ...initialValues,
    },
  });

  useEffect(() => {
    if (defaultAgentId) {
      form.setValue('llmProviderId', defaultAgentId);
    }
  }, [form, defaultAgentId]);

  return form;
};
