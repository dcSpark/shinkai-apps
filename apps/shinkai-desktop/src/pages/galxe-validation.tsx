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
    name: 'Install Shinkai Desktop App',
    description: 'Install Shinkai Desktop App',
  },
  [QuestNames.CreateIdentity]: {
    name: 'Create Your Shinkai Identity',
    description: 'Get started by creating your unique identity on Shinkai.',
  },
  [QuestNames.DownloadFromStore]: {
    name: 'Download Your First Tool',
    description: 'Download your first tool from the Shinkai App store.',
  },
  [QuestNames.ComeBack2Days]: {
    name: 'Return to Shinkai 2 Days',
    description: 'Return to Shinkai in 2 days.',
  },
  [QuestNames.ComeBack4Days]: {
    name: 'Return to Shinkai 4 Days',
    description: 'Return to Shinkai in 4 days.',
  },
  [QuestNames.ComeBack7Days]: {
    name: 'Return to Shinkai 7 Days',
    description: 'Return to Shinkai in 7 days.',
  },
  [QuestNames.CreateTool]: {
    name: 'Create Your First Tool',
    description:
      'Create and publish your first tool on Shinkai. Share your creativity with the community.',
  },
  [QuestNames.SubmitAndGetApprovalForTool]: {
    name: 'Submit and Get Approval for 1 Tool',
    description:
      'Submit your tool for review and get it approved by the Shinkai team.',
  },
  [QuestNames.SubmitAndGetApprovalFor2Tool]: {
    name: 'Submit and Get Approval for 2 Tools',
    description:
      'Submit your tool for review and get it approved by the Shinkai team.',
  },
  [QuestNames.SubmitAndGetApprovalFor3Tool]: {
    name: 'Submit and Get Approval for 3 Tools',
    description:
      'Submit your tool for review and get it approved by the Shinkai team.',
  },
  [QuestNames.FeaturedInRanking]: {
    name: 'Featured in Ranking',
    description: 'Get featured in the Shinkai App Store',
  },
  [QuestNames.WriteHonestReview]: {
    name: 'Write a Review',
    description:
      'Write a detailed and honest review about your experience with Shinkai.',
  },
  [QuestNames.Write5HonestReview]: {
    name: 'Write 5 Reviews',
    description: 'Help improve Shinkai by providing constructive feedback.',
  },
  [QuestNames.Write10HonestReview]: {
    name: 'Write 10 Reviews',
    description: 'Help improve Shinkai by providing constructive feedback.',
  },
  [QuestNames.UseRAG3Days]: {
    name: 'Use RAG 3 Days',
    description:
      'Experience the power of Retrieval-Augmented Generation (RAG) by using it for 3 days.',
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
