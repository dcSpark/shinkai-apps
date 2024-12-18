import { DialogClose } from '@radix-ui/react-dialog';
import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useRemoveRecurringTask } from '@shinkai_network/shinkai-node-state/v2/mutations/removeRecurringTask/useRemoveRecurringTask';
import { useGetRecurringTasks } from '@shinkai_network/shinkai-node-state/v2/queries/getRecurringTasks/useGetRecurringTasks';
import {
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
  Switch,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import cronstrue from 'cronstrue';
import { Edit, PlusIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../store/auth';
import { SimpleLayout } from './layout/simple-layout';

export const Tasks = () => {
  const auth = useAuth((state) => state.auth);

  const {
    data: tasks,
    isPending,
    isSuccess,
  } = useGetRecurringTasks({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  return (
    <SimpleLayout
      classname="max-w-4xl"
      headerRightElement={
        <div className="flex items-center gap-2">
          <Link
            className={cn(
              buttonVariants({
                variant: 'default',
                size: 'auto',
              }),
              'h-[30px] gap-2 rounded-lg px-3 text-xs',
            )}
            to="/tasks/create"
          >
            <PlusIcon className="size-4" />
            Create New
          </Link>
        </div>
      }
      title="Cron Tasks"
    >
      <div className="divide-y divide-gray-300 pt-4">
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
        {isSuccess &&
          tasks.length > 0 &&
          tasks?.map((task) => (
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
          ))}
        {isSuccess && tasks?.length === 0 && (
          <div className="flex h-20 items-center justify-center">
            <p className="text-gray-80 text-sm">No cron tasks found</p>
          </div>
        )}
      </div>
    </SimpleLayout>
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
        'grid grid-cols-[1fr_100px_120px_40px] items-start gap-5 rounded-sm bg-gray-500 px-2 py-4 text-left text-sm',
      )}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium capitalize text-white">
            {name}
          </span>
        </div>
        <p className="text-gray-80 line-clamp-2 text-xs">
          {description ?? '-'}
        </p>
        <p className="line-clamp-2 text-xs text-gray-50">
          <span className="text-gray-80 mr-2">Prompt</span>
          {prompt}
        </p>
        <p className="line-clamp-2 text-xs text-gray-50">
          <span className="text-gray-80 mr-2">Schedule</span>
          {readableCron}
        </p>
      </div>
      <div className="flex items-center gap-3 pt-1">
        <Switch
          checked={true}
          // TODO: need backend changes
        />
        <label className="text-xs text-gray-50" htmlFor="all">
          Active
        </label>
      </div>
      <Link
        className={cn(
          buttonVariants({
            variant: 'outline',
            size: 'auto',
          }),
          'h-[30px] gap-2 rounded-lg px-3 text-xs',
        )}
        to={`/tasks/${taskId}`}
      >
        <svg
          className="size-4"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M13 12h8" />
          <path d="M13 18h8" />
          <path d="M13 6h8" />
          <path d="M3 12h1" />
          <path d="M3 18h1" />
          <path d="M3 6h1" />
          <path d="M8 12h1" />
          <path d="M8 18h1" />
          <path d="M8 6h1" />
        </svg>
        View Logs
      </Link>
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
