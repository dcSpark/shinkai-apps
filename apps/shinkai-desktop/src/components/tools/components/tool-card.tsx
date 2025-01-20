import { FormProps } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  ShinkaiTool,
  ShinkaiToolType,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useExportTool } from '@shinkai_network/shinkai-node-state/v2/mutations/exportTool/useExportTool';
import { useUpdateTool } from '@shinkai_network/shinkai-node-state/v2/mutations/updateTool/useUpdateTool';
import {
  Button,
  buttonVariants,
  JsonForm,
  Switch,
} from '@shinkai_network/shinkai-ui';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { save } from '@tauri-apps/plugin-dialog';
import * as fs from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
import { DownloadIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { SubpageLayout } from '../../../pages/layout/simple-layout';
import { useAuth } from '../../../store/auth';
import RemoveToolButton from '../../playground-tool/components/remove-tool-button';
import { parseConfigToJsonSchema } from '../utils/tool-config';

interface ToolDetailsProps {
  tool: ShinkaiTool;
  isEnabled: boolean;
  isPlaygroundTool?: boolean;
  toolType: ShinkaiToolType;
}

export default function ToolCard({
  tool,
  isEnabled,
  isPlaygroundTool,
  toolType,
}: ToolDetailsProps) {
  const auth = useAuth((state) => state.auth);
  const { toolKey } = useParams();
  const [formData, setFormData] = useState<Record<string, any> | null>(null);
  const { t } = useTranslation();

  const { mutateAsync: updateTool, isPending } = useUpdateTool({
    onSuccess: (_, variables) => {
      if (
        'config' in variables.toolPayload &&
        variables.toolPayload.config?.length > 0
      ) {
        toast.success('Tool configuration updated successfully');
      }
    },
    onError: (error) => {
      toast.error('Failed to update tool', {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  const { mutateAsync: exportTool, isPending: isExportingTool } = useExportTool(
    {
      onSuccess: async (response, variables) => {
        const toolName = variables.toolKey.split(':::')?.[1] ?? 'untitled_tool';
        const file = new Blob([response ?? ''], {
          type: 'application/octet-stream',
        });

        const arrayBuffer = await file.arrayBuffer();
        const content = new Uint8Array(arrayBuffer);

        const savePath = await save({
          defaultPath: `${toolName}.zip`,
          filters: [{ name: 'Zip File', extensions: ['zip'] }],
        });

        if (!savePath) {
          toast.info('File saving cancelled');
          return;
        }

        await fs.writeFile(savePath, content, {
          baseDir: BaseDirectory.Download,
        });

        toast.success('Tool exported successfully');
      },
      onError: (error) => {
        toast.error('Failed to export tool', {
          description: error.response?.data?.message ?? error.message,
        });
      },
    },
  );

  useEffect(() => {
    if (tool && 'config' in tool && tool?.config?.length > 0) {
      setFormData(
        tool.config.reduce(
          (acc, item) => {
            acc[item.BasicConfig.key_name] = item.BasicConfig.key_value;
            return acc;
          },
          {} as Record<string, any>,
        ),
      );
    }
  }, ['config' in tool && tool.config]);

  const handleSaveToolConfig: FormProps['onSubmit'] = async (data) => {
    const formData = data.formData;
    await updateTool({
      toolKey: toolKey ?? '',
      toolType: toolType,
      toolPayload: {
        config: Object.entries(formData).map(([key_name, key_value]) => ({
          BasicConfig: {
            key_name,
            key_value,
          },
        })),
      } as ShinkaiTool,
      isToolEnabled: true,
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
    });
  };

  const toolConfigSchema =
    'config' in tool && tool.config?.length > 0
      ? parseConfigToJsonSchema(tool?.config ?? [])
      : {};

  return (
    <SubpageLayout alignLeft title={formatText(tool.name)}>
      <Button
        className="absolute right-0 top-9 flex h-[30px] items-center gap-2 rounded-lg bg-gray-500 text-xs"
        disabled={isExportingTool}
        isLoading={isExportingTool}
        onClick={() => {
          exportTool({
            toolKey: toolKey ?? '',
            nodeAddress: auth?.node_address ?? '',
            token: auth?.api_v2_key ?? '',
          });
        }}
        size="auto"
        variant="outline"
      >
        <DownloadIcon className="h-4 w-4" />
        Export
      </Button>
      <div className="flex flex-col">
        <div className="mb-4 flex items-center justify-between gap-1">
          <p className="text-sm text-white">Enabled</p>
          <Switch
            checked={isEnabled}
            onCheckedChange={async () => {
              await updateTool({
                toolKey: toolKey ?? '',
                toolType: toolType,
                toolPayload: {} as ShinkaiTool,
                isToolEnabled: !isEnabled,
                nodeAddress: auth?.node_address ?? '',
                token: auth?.api_v2_key ?? '',
              });
            }}
          />
        </div>
        {[
          {
            label: 'Description',
            value: tool.description,
          },
          'author' in tool &&
            tool.author && {
              label: 'Author',
              value: tool.author,
            },
          'keywords' in tool &&
            tool.keywords.length > 0 && {
              label: 'Keyword',
              value: tool.keywords.join(', '),
            },
        ]
          .filter((item) => !!item)
          .map(({ label, value }) => (
            <div className="flex flex-col gap-1 py-4" key={label}>
              <span className="text-gray-80 text-xs">{label}</span>
              <span className="text-sm text-white">{value}</span>
            </div>
          ))}

        {'config' in tool && tool.config.length > 0 && (
          <div className="mx-auto mt-6 w-full border-b border-t border-gray-300 py-6">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-white">Configuration</h2>
              <p className="text-gray-80 text-xs">
                Configure the settings for this tool
              </p>
            </div>

            <JsonForm
              className="py-1"
              formData={formData}
              id="parameters-form"
              noHtml5Validate={true}
              onChange={(e) => setFormData(e.formData)}
              onSubmit={handleSaveToolConfig}
              schema={toolConfigSchema}
              uiSchema={{ 'ui:submitButtonOptions': { norender: true } }}
              validator={validator}
            />
            <div className="flex w-full justify-end">
              <Button
                className="w-full min-w-[100px] rounded-lg border-gray-200 text-white"
                disabled={isPending}
                form="parameters-form"
                isLoading={isPending}
                size="sm"
                variant="default"
              >
                {t('common.saveChanges')}
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 py-6">
          {isPlaygroundTool && (
            <Link
              className={cn(
                buttonVariants({
                  size: 'sm',
                  variant: 'outline',
                }),
                'rounded-lg',
              )}
              to={`/tools/edit/${toolKey}`}
            >
              Go Playground
            </Link>
          )}
          <RemoveToolButton
            isPlaygroundTool={isPlaygroundTool}
            toolKey={toolKey as string}
          />
        </div>
      </div>
    </SubpageLayout>
  );
}
