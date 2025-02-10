import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { QuestNames } from '@shinkai_network/shinkai-message-ts/api/quests/types';
import { useUpdateQuestsStatus } from '@shinkai_network/shinkai-node-state/v2/mutations/updateQuestsStatus/useUpdateQuestsStatus';
import { useGetQuestsStatus } from '@shinkai_network/shinkai-node-state/v2/queries/getQuestsStatus/useGetQuestsStatus';
import { Button, Skeleton } from '@shinkai_network/shinkai-ui';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shinkai_network/shinkai-ui';
import { Check, CircleIcon, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';

import { useAuth } from '../store/auth';
import { SimpleLayout } from './layout/simple-layout';

const questStatusInfoMap: Record<
  QuestNames,
  { name: string; description: string }
> = {
  [QuestNames.InstalledApp]: {
    name: 'App Installation',
    description: 'Install Shinkai Desktop App.',
  },
  [QuestNames.CreateIdentity]: {
    name: 'Create Your Shinkai Identity',
    description:
      'Get started by creating your unique identity on Shinkai. This is your first step to becoming part of the community.',
  },
  [QuestNames.DownloadFromStore]: {
    name: 'First Store Download',
    description:
      'Download your first file from the Shinkai store. Explore the available resources and tools.',
  },
  [QuestNames.ComeBack2Days]: {
    name: 'Daily Explorer 2 Days',
    description:
      'Show your commitment by returning to Shinkai for 2 consecutive days. Build a habit of regular engagement.',
  },
  [QuestNames.ComeBack4Days]: {
    name: 'Daily Explorer 4 Days',
    description:
      'Show your commitment by returning to Shinkai for 4 consecutive days. Build a habit of regular engagement.',
  },
  [QuestNames.ComeBack7Days]: {
    name: 'Daily Explorer 7 Days',
    description:
      'Show your commitment by returning to Shinkai for 7 consecutive days. Build a habit of regular engagement.',
  },
  [QuestNames.CreateTool]: {
    name: 'Tool Creator',
    description:
      'Create and publish your first tool on Shinkai. Share your creativity with the community.',
  },
  [QuestNames.SubmitAndGetApprovalForTool]: {
    name: 'Submit and Get Approval for Tool',
    description:
      'Submit your tool for review and get it approved by the Shinkai team. Ensure your creation meets our quality standards.',
  },
  [QuestNames.SubmitAndGetApprovalFor2Tool]: {
    name: 'Submit and Get Approval for 2 Tools',
    description:
      'Submit your tool for review and get it approved by the Shinkai team. Ensure your creation meets our quality standards.',
  },
  [QuestNames.SubmitAndGetApprovalFor3Tool]: {
    name: 'Submit and Get Approval for 3 Tools',
    description:
      'Submit your tool for review and get it approved by the Shinkai team. Ensure your creation meets our quality standards.',
  },
  [QuestNames.FeaturedInRanking]: {
    name: 'Featured in Ranking',
    description: 'Get featured in the Shinkai ranking.',
  },
  [QuestNames.WriteHonestReview]: {
    name: 'Honest Reviewer',
    description:
      'Write a detailed and honest review about your experience with Shinkai. Help others make informed decisions.',
  },
  [QuestNames.Write5HonestReview]: {
    name: 'Community Contributor',
    description:
      'Help improve Shinkai by providing constructive feedback. Your input shapes the future of the platform.',
  },
  [QuestNames.Write10HonestReview]: {
    name: 'Community Contributor',
    description:
      'Help improve Shinkai by providing constructive feedback. Your input shapes the future of the platform.',
  },
  [QuestNames.UseRAG3Days]: {
    name: 'RAG Explorer',
    description:
      'Experience the power of Retrieval-Augmented Generation (RAG) by using it for 3 days. Discover how it enhances your workflow.',
  },
};
export const GalxeValidation = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);

  const { data, isPending, isSuccess } = useGetQuestsStatus({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { mutate: updateQuestsStatus, isPending: isQuestsStatusUpdating } =
    useUpdateQuestsStatus();

  const quests = useMemo(() => {
    return data?.data?.quests.map((quest) => ({
      key: quest.name,
      name: questStatusInfoMap[quest.name].name,
      description: questStatusInfoMap[quest.name].description,
      progress: quest.status ? 100 : 0,
    }));
  }, [data]);

  return (
    <SimpleLayout
      classname="max-w-4xl"
      headerRightElement={
        <Button
          disabled={isQuestsStatusUpdating}
          isLoading={isQuestsStatusUpdating}
          onClick={() =>
            updateQuestsStatus({
              nodeAddress: auth?.node_address ?? '',
              token: auth?.api_v2_key ?? '',
            })
          }
          size="xs"
        >
          {isQuestsStatusUpdating ? null : <RefreshCw className="h-4 w-4" />}
          {isQuestsStatusUpdating ? 'Syncing...' : 'Sync Quests'}
        </Button>
      }
      title={t('galxe.label')}
    >
      <div className="space-y-4 py-2 pb-10">
        {isPending &&
          Array.from({ length: 10 }).map((_, index) => (
            <Skeleton className="h-20 w-full" key={index} />
          ))}
        {isSuccess &&
          quests?.map((quest, index) => (
            <Card className="m-0 p-3 px-4" key={index}>
              <CardHeader className="flex flex-row items-start gap-2.5 space-y-0 p-0">
                <span className="pt-1">
                  {quest.progress === 100 ? (
                    <div className="flex size-5 items-center justify-center rounded-full bg-green-600 p-0.5">
                      <Check className="text-white" />
                    </div>
                  ) : (
                    <CircleIcon className="size-5 text-green-400" />
                  )}
                </span>
                <div className="m-0 flex flex-1 flex-col gap-1">
                  <CardTitle className="flex items-center gap-2 p-0 text-base font-semibold">
                    {quest.name}
                  </CardTitle>
                  <CardDescription className="text-gray-80 p-0 text-sm">
                    {quest.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
      </div>
    </SimpleLayout>
  );
};
