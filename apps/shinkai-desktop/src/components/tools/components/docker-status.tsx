import { useGetDockerStatus } from '@shinkai_network/shinkai-node-state/v2/queries/getDockerStatus/useGetDockerStatus';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useAuth } from '../../../store/auth';

export function DockerStatus() {
  const auth = useAuth((state) => state.auth);

  const { data, refetch } = useGetDockerStatus({
    nodeAddress: auth?.node_address ?? '',
  });

  const statusConfig = {
    'not-installed': {
      title: 'Docker Not Installed',
      description:
        'Docker is not installed on your system. Installing it will unlock better performance, faster processing, and an improved AI tool experience.',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
    },
    'not-running': {
      title: 'Docker Installed but Not Running',
      description:
        'Docker is installed but not running. Start it now to improve tool execution speed, stability, and overall performance.',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
    },
    running: {
      title: 'Docker Running & Active',
      description:
        'Your tools are now running at full efficiency with Docker. Enjoy a smoother experience!',
      color: 'bg-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
  };

  const config = statusConfig[data?.docker_status ?? 'not-installed'];

  return (
    <Tooltip>
      <TooltipTrigger
        className="flex items-center gap-2 px-1"
        onClick={async () => {
          await refetch();
        }}
      >
        <span
          className={`h-2 w-2 rounded-full ${config.color} ${config.borderColor}`}
        />
        <span className="text-official-gray-400 text-xs">{config.title}</span>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          align="end"
          alignOffset={-10}
          className="m-0 max-w-[350px] p-0"
          side="bottom"
          sideOffset={10}
        >
          <Alert
            className={cn(
              'border',
              config.borderColor,
              'bg-official-gray-850',
              config.bgColor,
            )}
          >
            <svg
              className="size-5"
              fill="currentColor"
              height="1em"
              role="img"
              stroke="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              width="1em"
            >
              <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z" />
            </svg>
            <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
              {config.title}
            </AlertTitle>
            <AlertDescription className="mt-1 text-xs">
              {config.description}
            </AlertDescription>
          </Alert>
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  );
}
