import { CheckCircledIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { QuestNames } from '@shinkai_network/shinkai-message-ts/api/quests/types';
import { useGetQuestsStatus } from '@shinkai_network/shinkai-node-state/v2/queries/getQuestsStatus/useGetQuestsStatus';
import { Button, Progress, Skeleton } from '@shinkai_network/shinkai-ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shinkai_network/shinkai-ui';
import { CircleIcon, Loader2, RefreshCw } from 'lucide-react';
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

  const { data, isPending, refetch, isSuccess } = useGetQuestsStatus({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

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
      classname="max-w-3xl"
      headerRightElement={
        <Button disabled={isPending} onClick={() => refetch()} size="xs">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Progress
            </>
          )}
        </Button>
      }
      title={t('galxe.label')}
    >
      <div className="space-y-6 py-2 pb-10">
        {isPending &&
          Array.from({ length: 10 }).map((_, index) => (
            <Skeleton className="h-20 w-full" key={index} />
          ))}
        {isSuccess &&
          quests?.map((quest, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  {quest.progress === 100 ? (
                    <CheckCircledIcon className="size-5 text-green-400" />
                  ) : (
                    <CircleIcon className="size-5 text-green-400" />
                  )}

                  {quest.name}
                </CardTitle>
                <CardDescription className="text-gray-80 text-sm">
                  {quest.description}
                </CardDescription>
              </CardHeader>
              {quest.progress !== 100 && (
                <CardContent>
                  <Progress
                    className="h-2 w-full rounded-md"
                    value={quest.progress}
                  />
                  <p className="text-gray-80 mt-2 text-xs">
                    Progress: {quest.progress}%
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
      </div>
    </SimpleLayout>
  );
};
