import { DialogClose } from '@radix-ui/react-dialog';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useRemoveRecurringTask } from '@shinkai_network/shinkai-node-state/v2/mutations/removeRecurringTask/useRemoveRecurringTask';
import { useGetRecurringTask } from '@shinkai_network/shinkai-node-state/v2/queries/getRecurringTask/useGetRecurringTask';
import { useGetRecurringTaskLogs } from '@shinkai_network/shinkai-node-state/v2/queries/getRecurringTaskLogs/useGetRecurringTaskLogs';
import {
  Badge,
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import cronstrue from 'cronstrue';
import { format } from 'date-fns';
import {
  Bot,
  CheckCircle2,
  Clock,
  Edit,
  RefreshCwIcon,
  Sparkles,
  TrashIcon,
  XCircle,
} from 'lucide-react';
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../store/auth';
import { SubpageLayout } from './layout/simple-layout';

export const TaskLogs = () => {
  const auth = useAuth((state) => state.auth);
  const { taskId } = useParams();
  const {
    data: task,
    isPending: isGetRecurringTaskPending,
    isSuccess: isGetRecurringTaskSuccess,
  } = useGetRecurringTask({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    recurringTaskId: taskId ?? '',
  });

  const {
    data: logs,
    isPending,
    isRefetching,
    isSuccess,
    refetch,
  } = useGetRecurringTaskLogs({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    recurringTaskId: taskId ?? '',
  });

  return (
    <SubpageLayout
      alignLeft
      className="max-w-4xl px-4"
      title="Scheduled Task Logs"
    >
      {isGetRecurringTaskPending && (
        <div className="p-4 text-center text-sm">
          <p className="text-white">...</p>
        </div>
      )}
      {isGetRecurringTaskSuccess && (
        <TaskCard
          cronExpression={task.cron}
          description={task.description}
          isRunning={!task.paused}
          key={task.task_id}
          llmProvider={
            'CreateJobWithConfigAndMessage' in task.action
              ? task.action.CreateJobWithConfigAndMessage.llm_provider
              : ''
          }
          name={task.name}
          prompt={
            'CreateJobWithConfigAndMessage' in task.action
              ? task.action.CreateJobWithConfigAndMessage.message.content
              : ''
          }
          taskId={task.task_id}
        />
      )}

      <div className="">
        {isPending &&
          Array.from({ length: 8 }).map((_, idx) => (
            <div
              className={cn(
                'grid animate-pulse grid-cols-[1fr_115px_36px] items-center gap-5 rounded-sm bg-gray-500 px-2 py-4 text-left text-sm',
              )}
              key={idx}
            >
              <div className="flex w-full flex-1 flex-col gap-3">
                <span className="h-4 w-36 rounded-sm bg-gray-300" />
                <div className="flex flex-col gap-1">
                  <span className="h-3 w-full rounded-sm bg-gray-300" />
                  <span className="h-3 w-2/4 rounded-sm bg-gray-300" />
                </div>
              </div>
              <span className="h-7 w-full rounded-md bg-gray-300" />
              <span className="h-5 w-[36px] rounded-full bg-gray-300" />
            </div>
          ))}

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Logs</h2>
          <Button
            className="h-8 w-auto gap-2 rounded-lg p-1 px-2 text-xs"
            disabled={isRefetching}
            isLoading={isRefetching}
            onClick={() => refetch()}
            size="auto"
            variant="outline"
          >
            <RefreshCwIcon className="h-4 w-4" />
            Refresh logs
          </Button>
        </div>

        <Card className="border-0 p-0">
          {isSuccess && logs.length === 0 && (
            <div className="p-10 text-center text-sm">
              <p className="text-white">No runs for this task yet</p>
              <p className="text-gray-80 text-xs">
                check the schedule for your tasks to see when it runs
              </p>
            </div>
          )}
          {isSuccess && logs.length > 0 && (
            <div className="divide-gray-375 divide-y py-2">
              <div className="grid grid-cols-[360px_100px_100px_1fr] items-center gap-6 py-1.5 font-mono text-xs text-gray-50">
                <span>Execution Time</span>
                <span>Status</span>
                <span>Chat</span>
                <span>Message</span>
              </div>
              {logs.map((log) => (
                <div
                  className="grid grid-cols-[360px_100px_100px_1fr] items-center gap-6 py-3 text-xs"
                  key={log.execution_time}
                >
                  <div className="text-muted-foreground shrink-0 font-mono">
                    {format(log.execution_time, 'PPPppp')}
                  </div>

                  <div className="flex items-center gap-2">
                    {log.success ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                    ) : (
                      <XCircle className="text-destructive h-4 w-4 shrink-0" />
                    )}
                    <div className="font-mono">
                      {log.success ? 'Success' : 'Failed'}
                    </div>
                  </div>

                  <Link
                    className="text-gray-80 font-mono underline"
                    to={`/inboxes/${encodeURIComponent(buildInboxIdFromJobId(log.job_id))}`}
                  >
                    Go to chat
                  </Link>
                  <div className="text-gray-80 font-mono">
                    {log.error_message || '-'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </SubpageLayout>
  );
};

const TaskCard = ({
  taskId,
  name,
  description,
  cronExpression,
  prompt,
  llmProvider,
  isRunning,
}: {
  taskId: number;
  name: string;
  description?: string;
  cronExpression: string;
  prompt: string;
  llmProvider: string;
  isRunning: boolean;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isDeleteTaskDrawerOpen, setIsDeleteTaskDrawerOpen] =
    React.useState(false);

  const readableCron = cronstrue.toString(cronExpression, {
    throwExceptionOnParseError: false,
  });

  return (
    <Card className="mb-4 border-none p-0 py-2 shadow-none">
      <CardHeader className="px-0 py-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 capitalize">
              {name}
              <Badge
                className={cn(
                  'rounded-md border border-gray-300',
                  isRunning &&
                    'border-cyan-600 bg-cyan-900/20 font-normal text-cyan-400',
                )}
                variant={isRunning ? 'default' : 'secondary'}
              >
                {isRunning ? 'Active' : 'Inactive'}
              </Badge>
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <div
                className={cn(
                  buttonVariants({
                    variant: 'outline',
                    size: 'auto',
                  }),
                  'size-[34px] rounded-md border p-1',
                )}
                onClick={(event) => {
                  event.stopPropagation();
                }}
                role="button"
                tabIndex={0}
              >
                <span className="sr-only">{t('common.moreOptions')}</span>
                <DotsVerticalIcon className="text-gray-100" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[160px] border bg-gray-500 px-2.5 py-2"
            >
              {[
                {
                  name: t('common.edit'),
                  icon: <Edit className="mr-3 h-4 w-4" />,
                  onClick: () => {
                    navigate(`/tasks/edit/${taskId}`);
                  },
                },
                {
                  name: t('common.delete'),
                  icon: <TrashIcon className="mr-3 h-4 w-4" />,
                  onClick: () => {
                    setIsDeleteTaskDrawerOpen(true);
                  },
                },
              ].map((option) => (
                <React.Fragment key={option.name}>
                  {option.name === 'Delete' && (
                    <DropdownMenuSeparator className="bg-gray-300" />
                  )}
                  <DropdownMenuItem
                    key={option.name}
                    onClick={(event) => {
                      event.stopPropagation();
                      option.onClick();
                    }}
                  >
                    {option.icon}
                    {option.name}
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <RemoveTaskDrawer
            onOpenChange={setIsDeleteTaskDrawerOpen}
            open={isDeleteTaskDrawerOpen}
            taskId={taskId}
            taskName={name}
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-0 py-6">
        <div className="flex items-center gap-4">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Prompt:
          </div>
          <div className="rounded-md text-sm">{prompt}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Schedule:
          </div>
          <div className="text-sm">
            {readableCron}
            <span className="text-gray-80 ml-2 rounded-lg bg-gray-300 px-2 py-1 font-mono">
              {cronExpression}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <Bot className="h-4 w-4" />
            Agent/AI Model:
          </div>
          <div className="text-sm">{llmProvider}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const RemoveTaskDrawer = ({
  open,
  onOpenChange,
  taskId,
  taskName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number;
  taskName: string;
}) => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const navigate = useNavigate();
  const { mutateAsync: removeTask, isPending } = useRemoveRecurringTask({
    onSuccess: () => {
      onOpenChange(false);
      toast.success('Delete task successfully');
      navigate('/tasks');
    },
    onError: (error) => {
      toast.error('Failed remove task', {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle className="pb-0">
          Delete Task <span className="font-mono text-base"> {taskName}</span> ?
        </DialogTitle>
        <DialogDescription>
          The task will be permanently deleted. This action cannot be undone.
        </DialogDescription>

        <DialogFooter>
          <div className="flex gap-2 pt-4">
            <DialogClose asChild className="flex-1">
              <Button
                className="min-w-[100px] flex-1"
                size="sm"
                type="button"
                variant="ghost"
              >
                {t('common.cancel')}
              </Button>
            </DialogClose>
            <Button
              className="min-w-[100px] flex-1"
              disabled={isPending}
              isLoading={isPending}
              onClick={async () => {
                await removeTask({
                  nodeAddress: auth?.node_address ?? '',
                  token: auth?.api_v2_key ?? '',
                  recurringTaskId: taskId.toString(),
                });
              }}
              size="sm"
              variant="destructive"
            >
              {t('common.delete')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
