import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useGetRecurringTaskLogs } from '@shinkai_network/shinkai-node-state/v2/queries/getRecurringTaskLogs/useGetRecurringTaskLogs';
import { useGetRecurringTasks } from '@shinkai_network/shinkai-node-state/v2/queries/getRecurringTasks/useGetRecurringTasks';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Skeleton,
} from '@shinkai_network/shinkai-ui';
import { ScheduledTasksIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { CheckCircle2, Clock, Link2, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../../store/auth';

export const ScheduledTasksFolder = () => {
  const auth = useAuth((state) => state.auth);

  const {
    data: tasks,
    isPending: isTasksPending,
    isSuccess: isTasksSuccess,
  } = useGetRecurringTasks({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  return (
    <div className="mb-2">
      <Accordion className="border-none" collapsible type="single">
        <AccordionItem className="border-none" value="scheduledTasks">
          <AccordionTrigger
            className={cn(
              'text-gray-80 group flex h-[46px] w-full items-center gap-2 rounded-lg px-2 py-2 hover:bg-white/10',
              'bg-transparent',
              'text-xs font-medium py-3 px-4'
            )}
          >
            <ScheduledTasksIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Scheduled Tasks</span>
          </AccordionTrigger>
          <AccordionContent className="pb-0 pt-1">
            {isTasksPending && (
              <div className="space-y-1 px-4 py-1">
                {[...Array(3)].map((_, idx) => (
                  <Skeleton
                    className="h-8 w-full rounded-md bg-gray-300"
                    key={idx}
                  />
                ))}
              </div>
            )}
            
            {isTasksSuccess && tasks.length === 0 && (
              <div className="px-4 py-2 text-xs text-gray-80">
                No scheduled tasks found
              </div>
            )}
            
            {isTasksSuccess &&
              tasks?.map((task) => (
                <TaskExecutions
                  key={task.task_id}
                  taskId={task.task_id}
                  taskName={task.name}
                />
              ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

const TaskExecutions = ({
  taskId,
  taskName,
}: {
  taskId: number;
  taskName: string;
}) => {
  const auth = useAuth((state) => state.auth);
  
  const {
    data: logs,
    isPending,
    isSuccess,
  } = useGetRecurringTaskLogs({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    recurringTaskId: taskId.toString(),
  });
  
  const lastExecutions = useMemo(() => {
    if (!logs) return [];
    return logs.slice(0, 5);
  }, [logs]);
  
  if (isPending) {
    return (
      <div className="space-y-1 px-4 py-1">
        {[...Array(3)].map((_, idx) => (
          <Skeleton
            className="h-8 w-full rounded-md bg-gray-300"
            key={idx}
          />
        ))}
      </div>
    );
  }
  
  if (isSuccess && lastExecutions.length === 0) {
    return (
      <div className="px-4 py-1 text-xs text-gray-80">
        <div className="mb-1 font-medium">{taskName}</div>
        <div>No executions yet</div>
      </div>
    );
  }
  
  return (
    <div className="mb-2">
      <div className="mb-1 px-4 text-xs font-medium">{taskName}</div>
      <div className="space-y-1">
        {lastExecutions.map((log) => (
          <Link
            className="flex h-8 items-center justify-between gap-2 px-6 py-1 text-xs text-gray-80 hover:bg-white/5"
            key={log.execution_time}
            to={`/inboxes/${encodeURIComponent(buildInboxIdFromJobId(log.job_id))}`}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span className="line-clamp-1">
                {new Date(log.execution_time).toLocaleString(undefined, {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            {log.success ? (
              <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 shrink-0 text-red-500" />
            )}
          </Link>
        ))}
        
        {/* Add link to task detail page as the 6th item */}
        <Link
          className="flex h-8 items-center gap-2 px-6 py-1 text-xs text-blue-400 hover:bg-white/5"
          to={`/tasks/${taskId}`}
        >
          <Link2 className="h-3 w-3" />
          <span>View all executions</span>
        </Link>
      </div>
    </div>
  );
};
