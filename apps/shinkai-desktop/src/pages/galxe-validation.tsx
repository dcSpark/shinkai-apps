import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Button, Progress } from '@shinkai_network/shinkai-ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@shinkai_network/shinkai-ui';
import { Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { SimpleLayout } from './layout/simple-layout';
interface Quest {
  name: string;
  description: string;
  progress: number;
}

const initialQuests: Quest[] = [
  {
    name: 'The Coding Initiate',
    description: 'Complete your first programming challenge',
    progress: 100,
  },
  {
    name: 'Bug Hunter',
    description: 'Find and fix 5 bugs in the codebase',
    progress: 60,
  },
  {
    name: 'Feature Fanatic',
    description: 'Implement a new feature from start to finish',
    progress: 30,
  },
  {
    name: 'Test Master',
    description: 'Achieve 90% test coverage on a module',
    progress: 0,
  },
  {
    name: 'Documentation Dynamo',
    description: 'Update and improve project documentation',
    progress: 75,
  },
  {
    name: 'Code Reviewer',
    description: 'Review and provide feedback on 10 pull requests',
    progress: 50,
  },
];

export const GalxeValidation = () => {
  const { t } = useTranslation();
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const updatedQuests = quests.map((quest) => ({
      ...quest,
      progress: Math.min(100, quest.progress + Math.floor(Math.random() * 30)),
    }));

    setQuests(updatedQuests);
    setIsSyncing(false);

    toast.success('Sync Completed', {
      description: 'Your quest progress has been updated.',
    });
  };
  return (
    <SimpleLayout
      classname="max-w-3xl"
      headerRightElement={
        <Button disabled={isSyncing} onClick={handleSync} size="xs">
          {isSyncing ? (
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
        {quests.map((quest, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {quest.name}
              </CardTitle>
              <CardDescription className="text-gray-80 text-sm">
                {quest.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress
                className="h-2 w-full rounded-md"
                value={quest.progress}
              />
              <p className="text-gray-80 mt-2 text-xs">
                Progress: {quest.progress}%
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </SimpleLayout>
  );
};
