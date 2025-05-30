import { httpClient } from '../../http-client';
import { type SubmitFeedbackRequest } from './types';

export const submitFeedback = async (payload: SubmitFeedbackRequest) => {
  const response = await httpClient.post('https://formspree.io/f/mgvawbkv', {
    feedback: payload.feedback,
    contact: payload.contact,
    source: payload.source || 'shinkai-desktop-app',
  });

  return response.data;
};
