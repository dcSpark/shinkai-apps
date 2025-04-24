import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { ShinkaiToolHeader } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { FunctionKeyV2 } from '@shinkai_network/shinkai-node-state/v2/constants';
import { useToggleEnableTool } from '@shinkai_network/shinkai-node-state/v2/mutations/toggleEnableTool/useToggleEnableTool';
import {
  Badge,
  buttonVariants,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  formatText,
  getVersionFromTool,
} from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useQueryClient } from '@tanstack/react-query';
import { BoltIcon, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../../store/auth';
import RemoveToolButton from '../../playground-tool/components/remove-tool-button';

export default function ToolCard({ tool }: { tool: ShinkaiToolHeader }) {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const queryClient = useQueryClient();

  const { mutateAsync: toggleEnableTool, isPending } = useToggleEnableTool();

  return (
    <div
      className={cn(
        'grid grid-cols-[1fr_40px_40px_115px_36px] items-center gap-5 rounded-sm px-2 py-4 pr-4 text-left text-sm',
      )}
      key={tool.tool_router_key}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">
            {formatText(tool.name)}{' '}
          </span>
          <Badge className="text-gray-80 bg-official-gray-750 text-xs font-normal">
            {getVersionFromTool(tool)}
          </Badge>
          {tool.author !== '@@official.shinkai' && (
            <Badge className="text-gray-80 bg-official-gray-750 text-xs font-normal">
              {tool.author}
            </Badge>
          )}
        </div>
        <p className="text-gray-80 whitespace-pre-wrap line-clamp-2 text-xs">{tool.description}</p>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            className={cn(
              buttonVariants({
                variant: 'outline',
                size: 'sm',
              }),
              'min-h-auto h-auto w-10 rounded-md py-2 flex justify-center',
            )}
            to={`/tools/${tool.tool_router_key}#try-it-out`}
          >
            <PlayCircle className="h-4 w-4" />
          </Link>
        </TooltipTrigger>
        <TooltipContent align="center" side="top">
          {t('common.tryItOut', 'Try it out')}
        </TooltipContent>
      </Tooltip>
      
      <div className="flex justify-center">
        <RemoveToolButton
          toolKey={tool.tool_router_key}
        />
      </div>
      
      <Link
        className={cn(
          buttonVariants({
            variant: 'outline',
            size: 'sm',
          }),
          'min-h-auto h-auto rounded-md py-2',
        )}
        to={`/tools/${tool.tool_router_key}`}
      >
        <BoltIcon className="mr-1.5 h-4 w-4" />
        {t('common.configure')}
      </Link>

      <Tooltip>
        <TooltipTrigger asChild className="flex items-center gap-1">
          <div>
            <Switch
              checked={tool.enabled}
              disabled={isPending}
              onCheckedChange={async () => {
                const newEnabledState = !tool.enabled;
                
                const updatedTool = {
                  ...tool,
                  enabled: newEnabledState,
                };
                
                queryClient.setQueryData(
                  [FunctionKeyV2.GET_LIST_TOOLS],
                  (oldData: unknown) => {
                    if (!oldData || !Array.isArray(oldData)) return oldData;
                    return oldData.map((t) =>
                      t.tool_router_key === tool.tool_router_key ? updatedTool : t
                    );
                  }
                );
                
                queryClient.invalidateQueries({
                  queryKey: [FunctionKeyV2.GET_LIST_TOOLS],
                  refetchType: 'none',
                });
                
                await toggleEnableTool({
                  toolKey: tool.tool_router_key,
                  isToolEnabled: newEnabledState,
                  nodeAddress: auth?.node_address ?? '',
                  token: auth?.api_v2_key ?? '',
                });
              }}
            />
          </div>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent align="center" side="top">
            {t('common.enabled')}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </div>
  );
}
