import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
} from '@shinkai_network/shinkai-ui';
import { CreateAIIcon, FilesIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, PlusIcon, Sparkles, XIcon } from 'lucide-react';
import React, { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { showAnimation } from '../../pages/layout/main-layout';
import { useSettings } from '../../store/settings';
import { useOnboardingSteps } from './use-onboarding-stepper';

export enum GetStartedSteps {
  SetupShinkaiNode = 'SetupShinkaiNode',
  CreateAI = 'CreateAI',
  CreateAIChat = 'CreateAIChat',
  UploadAFile = 'UploadAFile',
  AskQuestionToFiles = 'AskQuestionToFiles',
  SubscribeToKnowledge = 'SubscribeToKnowledge',
  ShareFolder = 'ShareFolder',
}

export enum GetStartedStatus {
  Done = 'done',
  NotStarted = 'not-started',
}

export default function OnboardingStepper() {
  const currentStepsMap = useOnboardingSteps();
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Stepper
      steps={[
        {
          label: GetStartedSteps.SetupShinkaiNode,
          status:
            currentStepsMap.get(GetStartedSteps.SetupShinkaiNode) ??
            GetStartedStatus.NotStarted,
          title: t('onboardingChecklist.setupShinkaiDesktop'),
          body: t('onboardingChecklist.setupShinkaiDesktopDescription'),
        },
        {
          label: GetStartedSteps.CreateAI,
          status:
            currentStepsMap.get(GetStartedSteps.CreateAI) ??
            GetStartedStatus.NotStarted,
          title: t('onboardingChecklist.addAI'),
          body: (
            <div className="flex flex-col items-start gap-2">
              <span>{t('onboardingChecklist.addAIDescription')}</span>
              <Button
                className="h-auto gap-1 px-3 py-2"
                onClick={() => {
                  navigate('/agents-locally');
                }}
                size="sm"
                variant="outline"
              >
                <PlusIcon className="h-4 w-4" />
                {t('onboardingChecklist.addAI')}
              </Button>
            </div>
          ),
        },
        {
          label: GetStartedSteps.CreateAIChat,
          status:
            currentStepsMap.get(GetStartedSteps.CreateAIChat) ??
            GetStartedStatus.NotStarted,
          title: t('onboardingChecklist.createAIChat'),
          body: (
            <div className="flex flex-col items-start gap-2">
              <span>{t('onboardingChecklist.createAIChatDescription')}</span>
              <Button
                className="h-auto gap-1 px-3 py-2"
                onClick={() => {
                  navigate('/create-job');
                }}
                size="sm"
                variant="outline"
              >
                <PlusIcon className="h-4 w-4" />
                {t('onboardingChecklist.createAIChat')}
              </Button>
            </div>
          ),
        },
        {
          label: GetStartedSteps.UploadAFile,
          status:
            currentStepsMap.get(GetStartedSteps.UploadAFile) ??
            GetStartedStatus.NotStarted,
          title: t('onboardingChecklist.uploadAFile'),
          body: (
            <div className="flex flex-col items-start gap-2">
              <span>{t('onboardingChecklist.uploadAFileDescription')}</span>
              <Button
                className="h-auto gap-1 px-3 py-2"
                onClick={() => {
                  navigate('/vector-fs');
                }}
                size="sm"
                variant="outline"
              >
                <PlusIcon className="h-4 w-4" />
                {t('onboardingChecklist.uploadAFile')}
              </Button>
            </div>
          ),
        },
        {
          label: GetStartedSteps.AskQuestionToFiles,
          status:
            currentStepsMap.get(GetStartedSteps.AskQuestionToFiles) ??
            GetStartedStatus.NotStarted,
          title: t('onboardingChecklist.askFiles'),
          body: (
            <div className="flex flex-col items-start gap-2">
              <span>{t('onboardingChecklist.askFilesDescription')}</span>
              <Button
                className="h-auto gap-1 px-3 py-2"
                onClick={() => {
                  navigate('/vector-fs');
                }}
                size="sm"
                variant="outline"
              >
                <CreateAIIcon className="h-4 w-4" />
                {t('onboardingChecklist.askFilesButton')}
              </Button>
            </div>
          ),
        },
        {
          label: GetStartedSteps.SubscribeToKnowledge,
          status:
            currentStepsMap.get(GetStartedSteps.SubscribeToKnowledge) ??
            GetStartedStatus.NotStarted,
          title: 'Subscribe to knowledge',
          body: (
            <div className="flex flex-col items-start gap-2">
              <span>Subscribe to knowledge to get up-to-date information</span>
              <Button
                className="h-auto gap-1 px-3 py-2"
                onClick={() => {
                  navigate('/public-subscriptions');
                }}
                size="sm"
                variant="outline"
              >
                <FilesIcon className="h-4 w-4" />
                Subscribe to Knowledge
              </Button>
            </div>
          ),
        },
        // {
        //   label: GetStartedSteps.ShareFolder,
        //   status:
        //     currentStepsMap.get(GetStartedSteps.ShareFolder) ??
        //     GetStartedStatus.NotStarted,
        //   title: 'Share Knowledge',
        //   body: (
        //     <div className="flex flex-col items-start gap-2">
        //       <span>You can share knowledge from your AI Files explorer.</span>
        //       <span>Go to folder options, and select `Share`</span>
        //
        //       <Button
        //         className="h-auto gap-1 px-3 py-2"
        //         onClick={() => {
        //           navigate('/vector-fs');
        //         }}
        //         size="sm"
        //         variant="outline"
        //       >
        //         <FilesIcon className="h-4 w-4" />
        //         Share Knowledge
        //       </Button>
        //     </div>
        //   ),
        // },
      ]}
    />
  );
}

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="currentColor"
    height="1em"
    stroke="currentColor"
    strokeWidth="0"
    viewBox="0 0 20 20"
    width="1em"
  >
    <path
      clipRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      fillRule="evenodd"
    />
  </svg>
);

const stepIconColorMap: {
  [key in GetStartedStatus]?: { icon?: ReactNode; iconClassName?: string };
} = {
  [GetStartedStatus.NotStarted]: {
    iconClassName: 'bg-cyan-100/20',
    icon: <CheckIcon className="w-full text-gray-400" />,
  },
  // [StepStatus.Loading]: {
  //   icon: <Loader className="text-brand animate-spin" />,
  //   iconClassName: 'bg-gray-200',
  // },
  [GetStartedStatus.Done]: {
    icon: <CheckIcon className="w-full text-white" />,
    iconClassName: 'bg-cyan-700',
  },
  // [StepStatus.Error]: {
  //   icon: <XCircle />,
  //   iconClassName: 'bg-red-500 text-white',
  // },
};

export type Step = {
  label: GetStartedSteps;
  status: GetStartedStatus;
  title: ReactNode;
  body: ReactNode;
};

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: Step[];
}

export const Stepper = ({ steps }: StepperProps) => {
  const { t } = useTranslation();
  const setGetStartedChecklistHidden = useSettings(
    (state) => state.setGetStartedChecklistHidden,
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const allStepsDone = steps.filter(
    (step) => step.status === GetStartedStatus.Done,
  );

  const currentPercents = Math.floor(
    (allStepsDone.length / steps.length) * 100,
  );
  const sidebarExpanded = useSettings((state) => state.sidebarExpanded);

  const hasCompletedAllSteps = steps.every(
    (step) => step.status === GetStartedStatus.Done,
  );
  return (
    <Popover onOpenChange={setIsPopoverOpen} open={isPopoverOpen}>
      <AnimatePresence mode="popLayout">
        {sidebarExpanded && (
          <motion.div
            animate="show"
            className="flex flex-col gap-2 whitespace-nowrap rounded-lg bg-cyan-900/20 p-3.5 py-3 text-xs"
            exit="hidden"
            initial="hidden"
            transition={showAnimation}
          >
            <PopoverTrigger className="flex gap-3 rounded-lg p-1 font-medium text-white hover:bg-cyan-800/20 [&[data-state=open]>svg]:rotate-180">
              {t('onboardingChecklist.getStartedText')}{' '}
              <ChevronDown className="h-4 w-4" />
            </PopoverTrigger>
            <Progress
              className="h-2 w-full rounded-lg bg-cyan-900 [&>div]:bg-cyan-400"
              value={currentPercents}
            />
            {hasCompletedAllSteps ? (
              <span className="text-gray-80">
                {currentPercents}% -
                <Button
                  className="h-auto py-0 text-xs"
                  onClick={() => {
                    setGetStartedChecklistHidden(true);
                    setIsPopoverOpen(false);
                  }}
                  size="sm"
                  variant="link"
                >
                  {t('onboardingChecklist.dismiss')}
                </Button>
              </span>
            ) : (
              <span className="text-gray-80 truncate capitalize">
                {currentPercents}% - {t('common.next')},{' '}
                {
                  steps.find(
                    (step) => step.status === GetStartedStatus.NotStarted,
                  )?.title
                }
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!sidebarExpanded && (
        <PopoverTrigger className="relative mt-4 flex h-10 w-10 items-center justify-center gap-2 self-center rounded-full bg-cyan-700 text-xs text-white ring-4 ring-cyan-900 transition-colors hover:bg-cyan-900">
          <Sparkles className="h-4 w-4" />
          <span className="sr-only">
            {t('onboardingChecklist.getStartedText')}
          </span>
          <Badge className="bg-brand absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-0">
            {steps.length -
              steps.filter((step) => step.status === GetStartedStatus.Done)
                .length}
          </Badge>
        </PopoverTrigger>
      )}
      <PopoverContent
        align="start"
        alignOffset={sidebarExpanded ? -13 : -4}
        className="bg-gray-300 p-0 text-xs"
        side="right"
        sideOffset={sidebarExpanded ? 20 : 12}
      >
        <div className="space-y-2 bg-cyan-900/20 p-3.5">
          <div className="flex justify-between gap-3 rounded-lg p-1 font-medium text-white">
            <p>{t('onboardingChecklist.getStartedChecklist')}</p>
            <button
              className="text-gray-80 hover:text-white"
              onClick={() => setIsPopoverOpen(false)}
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
          <Progress
            className="h-2 w-full rounded-lg bg-cyan-900 [&>div]:bg-cyan-400"
            value={currentPercents}
          />
        </div>
        {hasCompletedAllSteps && (
          <div>
            <div className="flex justify-center gap-2 bg-gray-300 p-3">
              <span className="text-gray-80">
                {t('onboardingChecklist.completedSteps')}
              </span>
              <CheckIcon className="w-4 text-cyan-700" />
            </div>
            <div className="flex justify-center gap-2 p-3">
              <Button
                className="h-auto gap-1 px-3 py-2"
                onClick={() => {
                  setGetStartedChecklistHidden(true);
                  setIsPopoverOpen(false);
                }}
                size="sm"
                variant="outline"
              >
                {t('onboardingChecklist.dismiss')}{' '}
              </Button>
            </div>
          </div>
        )}
        {!hasCompletedAllSteps && (
          <div className="">
            <Accordion
              className="divide-y divide-gray-200 [&>div:first-of-type]:rounded-t-lg [&>div:last-of-type]:rounded-b-lg"
              collapsible
              type="single"
            >
              {steps.map((step, index) => {
                const stepStatus = step.status ?? GetStartedStatus.NotStarted;
                return (
                  <AccordionItem
                    className="gap-4 bg-gray-300"
                    key={index}
                    value={step.label}
                  >
                    <AccordionTrigger
                      className={cn(
                        'px-3 py-2 text-gray-50 [&>svg]:mt-0 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:stroke-white',
                        'hover:bg-gray-500 hover:no-underline',
                      )}
                    >
                      <div className="flex flex-row items-center gap-2 font-normal capitalize text-white">
                        <div
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 p-1',
                            stepIconColorMap[stepStatus]?.iconClassName,
                          )}
                        >
                          {stepIconColorMap[stepStatus]?.icon}
                        </div>
                        {step.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-gray-300 px-0 py-1 pb-3 pl-[43px] pr-8 text-xs text-neutral-200">
                      <div className="flex-1 font-light">{step.body}</div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
