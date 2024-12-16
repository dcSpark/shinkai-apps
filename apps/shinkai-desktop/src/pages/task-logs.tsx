import { DialogClose } from '@radix-ui/react-dialog';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useRemoveRecurringTask } from '@shinkai_network/shinkai-node-state/v2/mutations/removeRecurringTask/useRemoveRecurringTask';
import { useGetRecurringTask } from '@shinkai_network/shinkai-node-state/v2/queries/getRecurringTask/useGetRecurringTask';
import { useGetRecurringTaskLogs } from '@shinkai_network/shinkai-node-state/v2/queries/getRecurringTaskLogs/useGetRecurringTaskLogs';
import {
  Badge,
  Button,
  buttonVariants,
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
import { formatDate } from 'date-fns';
import { Edit, TrashIcon } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    isSuccess,
  } = useGetRecurringTaskLogs({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    recurringTaskId: taskId ?? '',
  });

  return (
    <SubpageLayout alignLeft className="px-4" title="Cron Logs">
      {isGetRecurringTaskPending && (
        <div className="p-4 text-center text-sm">
          <p className="text-white">Loading cron task details</p>
        </div>
      )}
      {isGetRecurringTaskSuccess && (
        <TaskCard
          cronExpression={task.cron}
          description={task.description}
          key={task.task_id}
          name={task.name}
          prompt={
            'CreateJobWithConfigAndMessage' in task.action
              ? task.action.CreateJobWithConfigAndMessage.message.content
              : ''
          }
          taskId={task.task_id}
        />
      )}
      <div className="mx-2 mt-6 border-b py-2">
        <h1 className="text-sm font-bold">Logs</h1>
      </div>
      <div className="divide-y divide-gray-300">
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
        {isSuccess && logs.length === 0 && (
          <div className="p-10 text-center text-sm">
            <p className="text-white">No runs for this cron task yet</p>
            <p className="text-gray-80 text-xs">
              check the schedule for your cron tasks to see when it runs
            </p>
          </div>
        )}
        {isSuccess &&
          logs.length > 0 &&
          logs.map((log) => (
            <div className="flex items-center gap-10" key={log.execution_time}>
              <span className="text-gray-80">
                {formatDate(
                  new Date(log.execution_time),
                  'yyyy-MM-dd HH:mm:ss',
                )}
              </span>
              <Badge
                className={cn(
                  'text-sm',
                  log.success
                    ? 'bg-green-900 text-green-400'
                    : 'bg-red-900 text-red-400',
                )}
              >
                {log.success ? 'Success' : 'Failed'}
              </Badge>
            </div>
          ))}
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
}: {
  taskId: number;
  name: string;
  description?: string;
  cronExpression: string;
  prompt: string;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isDeleteTaskDrawerOpen, setIsDeleteTaskDrawerOpen] =
    React.useState(false);

  const readableCron = cronstrue.toString(cronExpression, {
    throwExceptionOnParseError: false,
  });

  return (
    <div
      className={cn(
        'grid grid-cols-[1fr_40px] items-start gap-5 rounded-sm bg-gray-500 px-2 text-left text-sm',
      )}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium capitalize text-white">
            {name}
          </span>
        </div>
        <p className="text-gray-80 line-clamp-2 text-sm">
          {description ?? '-'}
        </p>
        <p className="line-clamp-2 text-sm text-gray-50">
          <span className="text-gray-80 mr-2">Prompt</span>
          {prompt}
        </p>
        <p className="line-clamp-2 text-sm text-gray-50">
          <span className="text-gray-80 mr-2">Schedule</span>
          {readableCron}
        </p>
      </div>
      {/*<div className="flex items-center gap-3 pt-1">*/}
      {/*  <Switch*/}
      {/*    checked={true}*/}
      {/*    // TODO: need backend changes*/}
      {/*  />*/}
      {/*  <label className="text-sm text-gray-50" htmlFor="all">*/}
      {/*    Active*/}
      {/*  </label>*/}
      {/*</div>*/}
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
  const { mutateAsync: removeTask, isPending } = useRemoveRecurringTask({
    onSuccess: () => {
      onOpenChange(false);
      toast.success('Delete task successfully');
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
