export enum OnboardingStep {
  TERMS_CONDITIONS = 'terms-conditions',
  ANALYTICS = 'analytics',
  AI_PROVIDER_SELECTION = 'ai-provider-selection',
  COMPLETE = 'complete',
}
export type OnboardingStepConfig = {
  id: OnboardingStep;
  path: string;
  required: boolean;
};

export const COMPLETION_DESTINATION = '/inboxes';

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: OnboardingStep.TERMS_CONDITIONS,
    path: '/terms-conditions',
    required: true,
  },
  {
    id: OnboardingStep.ANALYTICS,
    path: '/analytics',
    required: true,
  },
  {
    id: OnboardingStep.AI_PROVIDER_SELECTION,
    path: '/ai-provider-selection',
    required: true,
  },
];

export enum ProviderSelectionUser {
  CLOUD = 'cloud',
  LOCAL = 'local',
  FREE = 'free',
}

type TermsChoice = boolean;
type AnalyticsChoice = boolean;
type AIProviderChoice = ProviderSelectionUser;

export type StepChoiceMap = {
  [OnboardingStep.TERMS_CONDITIONS]: TermsChoice | null;
  [OnboardingStep.ANALYTICS]: AnalyticsChoice | null;
  [OnboardingStep.AI_PROVIDER_SELECTION]: AIProviderChoice | null;
  [OnboardingStep.COMPLETE]: null;
};

export type OnboardingState = {
  steps: {
    [K in OnboardingStep]?: {
      completed: boolean;
      choice: StepChoiceMap[K];
    };
  };
};

export function validateChoice<T extends OnboardingStep>(
  stepId: T,
  choice: any,
): StepChoiceMap[T] {
  switch (stepId) {
    case OnboardingStep.TERMS_CONDITIONS:
      return (typeof choice === 'boolean' ? choice : null) as StepChoiceMap[T];
    case OnboardingStep.ANALYTICS:
      return (typeof choice === 'boolean' ? choice : null) as StepChoiceMap[T];
    case OnboardingStep.AI_PROVIDER_SELECTION:
      return (
        Object.values(ProviderSelectionUser).includes(choice) ? choice : null
      ) as StepChoiceMap[T];
    default:
      return null as StepChoiceMap[T];
  }
}
