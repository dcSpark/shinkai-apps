import { useGetRecurringTask } from '@shinkai_network/shinkai-node-state/v2/queries/getRecurringTask/useGetRecurringTask';
import { useParams } from 'react-router';

import CronTask from '../components/cron-task/component/cron-task';
import { useAuth } from '../store/auth';

export default function EditTaskPage() {
  const auth = useAuth((state) => state.auth);
  const { taskId } = useParams();
  const { data: task, isSuccess: isGetRecurringTaskSuccess } =
    useGetRecurringTask({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      recurringTaskId: taskId ?? '',
    });

  return (
    <CronTask
      initialValues={
        isGetRecurringTaskSuccess
          ? {
              action: task.action,
              cron: task.cron,
              task_id: task.task_id,
              created_at: task.created_at,
              last_modified: task.last_modified,
              description: task.description,
              paused: task.paused,
              name: task.name,
            }
          : undefined
      }
      mode="edit"
    />
  );
}
