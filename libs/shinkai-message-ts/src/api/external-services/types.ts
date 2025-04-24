export interface SubmitFeedbackRequest {
  feedback: string;
  contact: string;
  source?: string;
}

export interface SubmitFeedbackResponse {
  status: string;
}
