import { FormProps } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  OAuth,
  ShinkaiTool,
  ShinkaiToolType,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useExportTool } from '@shinkai_network/shinkai-node-state/v2/mutations/exportTool/useExportTool';
import { usePublishTool } from '@shinkai_network/shinkai-node-state/v2/mutations/publishTool/usePublishTool';
import { useUpdateTool } from '@shinkai_network/shinkai-node-state/v2/mutations/updateTool/useUpdateTool';
import {
  Avatar,
  AvatarFallback,
  Button,
  buttonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  JsonForm,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shinkai_network/shinkai-ui';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { save } from '@tauri-apps/plugin-dialog';
import * as fs from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-shell';
import { DownloadIcon, MoreVertical, PlayCircle } from 'lucide-react';
import { InfoCircleIcon } from 'primereact/icons/infocircle';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import config from '../../../../src/config';
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

const SHINKAI_STORE_URL = config.isDev
  ? 'http://localhost:3000'
  : 'https://store.shinkai.com';

export default function ToolCard({
  tool,
  isEnabled,
  isPlaygroundTool,
  toolType,
}: ToolDetailsProps) {
  const auth = useAuth((state) => state.auth);
  const { toolKey } = useParams();
  const [formData, setFormData] = useState<Record<string, any> | null>(null);
  const [oauthFormData, setOAuthFormData] = useState<{ oauth: OAuth[] } | null>(
    null,
  );
  const { t } = useTranslation();

  const {
    mutateAsync: publishTool,
    isPending: isPublishingTool,
    data: publishToolData,
    isSuccess: isPublishToolSuccess,
  } = usePublishTool({
    onSuccess: (response) => {
      open(
        `${SHINKAI_STORE_URL}/store/revisions/complete?id=${response.response.revisionId}`,
      );
    },
    onError: (error) => {
      toast.error('Failed to publish tool', {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  const { mutateAsync: updateTool, isPending } = useUpdateTool({
    onSuccess: (_, variables) => {
      if (
        'config' in variables.toolPayload &&
        variables.toolPayload.config?.length > 0
      ) {
        toast.success('Tool configuration updated successfully');
      }
      if ('oauth' in variables.toolPayload && variables.toolPayload.oauth) {
        toast.success('OAuth settings updated successfully');
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
  }, [tool]);

  useEffect(() => {
    if ('oauth' in tool && tool.oauth) {
      setOAuthFormData({ oauth: tool.oauth });
    }
  }, [tool]);

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

  const handleSaveOAuthConfig: FormProps['onSubmit'] = async (data) => {
    const oauth = data.formData.oauth;
    await updateTool({
      toolKey: toolKey ?? '',
      toolType: toolType,
      toolPayload: {
        oauth,
      } as ShinkaiTool,
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      isToolEnabled: true,
    });
  };

  const toolConfigSchema =
    'config' in tool && tool.config?.length > 0
      ? parseConfigToJsonSchema(tool?.config ?? [])
      : {};

  const boxContainerClass = cn(
    'flex flex-col gap-4 rounded-lg bg-gray-300/20 p-8',
  );
  return (
    <SubpageLayout className="max-w-4xl" title="">
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <ToolIcon />
        <div className="flex-1">
          <h1 className="mb-2 text-lg font-bold">
            {formatText(tool.name ?? '')}
          </h1>
          <p className="text-gray-80 mb-4 line-clamp-2 text-sm">
            {tool.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label
                className={cn(
                  'text-sm',
                  isEnabled ? 'text-gray-50' : 'text-gray-80',
                )}
                htmlFor="tool-switch"
              >
                {isEnabled ? 'Enabled' : 'Disabled'}
              </label>
              <Switch
                checked={isEnabled}
                disabled={isPending}
                id="tool-switch"
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
                <PlayCircle className="h-4 w-4" />
                Open in Playground
              </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button rounded="lg" size="sm" variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-300 p-2.5">
                <DropdownMenuItem
                  className="text-xs"
                  disabled={isExportingTool}
                  onClick={() => {
                    exportTool({
                      toolKey: toolKey ?? '',
                      nodeAddress: auth?.node_address ?? '',
                      token: auth?.api_v2_key ?? '',
                    });
                  }}
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Tabs className="w-full py-8" defaultValue="description">
        <TabsList className="mb-4 flex w-full justify-start gap-6 rounded-none border-b border-gray-200 bg-transparent pb-0">
          <TabsTrigger
            className="data-[state=active]:border-b-gray-80 rounded-none px-0.5 data-[state=active]:border-b-2 data-[state=active]:bg-transparent"
            value="description"
          >
            About
          </TabsTrigger>
          {'config' in tool && tool.config && tool.config.length > 0 && (
            <TabsTrigger
              className="data-[state=active]:border-b-gray-80 rounded-none px-0.5 data-[state=active]:border-b-2 data-[state=active]:bg-transparent"
              value="configuration"
            >
              Configuration
            </TabsTrigger>
          )}
          {'oauth' in tool && tool.oauth && tool.oauth.length > 0 && (
            <TabsTrigger
              className="data-[state=active]:border-b-gray-80 rounded-none px-0.5 data-[state=active]:border-b-2 data-[state=active]:bg-transparent"
              value="oauth"
            >
              OAuth & Permissions
            </TabsTrigger>
          )}

          {isPlaygroundTool &&
            'author' in tool &&
            tool.author === auth?.shinkai_identity && (
              <TabsTrigger
                className="data-[state=active]:border-b-gray-80 rounded-none px-0.5 data-[state=active]:border-b-2 data-[state=active]:bg-transparent"
                value="publish"
              >
                Publish
              </TabsTrigger>
            )}
        </TabsList>

        <TabsContent className="space-y-4" value="description">
          <div className={cn(boxContainerClass, 'gap-7')}>
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
              {
                label: 'Language',
                value: toolType,
              },
              'version' in tool && {
                label: 'Version',
                value: tool.version,
              },
            ]
              .filter((item) => !!item)
              .map(({ label, value }) => (
                <div className="flex flex-col gap-1" key={label}>
                  <span className="text-gray-80 text-xs">{label}</span>
                  <span className="whitespace-pre-wrap text-sm text-white">
                    {value}
                  </span>
                </div>
              ))}
          </div>
          <div className={boxContainerClass}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-base font-medium text-white">
                  Remove Tool
                </h2>
                <p className="text-gray-80 text-xs">
                  Remove the &quot;{tool.name}&quot; tool from the entire app
                  and all of your workflows
                </p>
              </div>
              <RemoveToolButton
                isPlaygroundTool={!!isPlaygroundTool}
                toolKey={toolKey as string}
              />
            </div>
          </div>
        </TabsContent>

        {'config' in tool && tool.config.length > 0 && (
          <TabsContent value="configuration">
            <div className={boxContainerClass}>
              <div className="mb-4">
                <h2 className="text-base font-medium text-white">
                  Configuration
                </h2>
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
                  className="min-w-[100px]"
                  disabled={isPending}
                  form="parameters-form"
                  isLoading={isPending}
                  rounded="lg"
                  size="sm"
                  variant="outline"
                >
                  {t('common.saveChanges')}
                </Button>
              </div>
            </div>
          </TabsContent>
        )}

        {'oauth' in tool && tool.oauth && tool.oauth.length > 0 && (
          <TabsContent value="oauth">
            <div className={boxContainerClass}>
              <div className="mb-4">
                <h2 className="text-base font-medium text-white">OAuth</h2>
                <p className="text-gray-80 text-xs">
                  Configure OAuth settings for this tool
                </p>
              </div>
              <JsonForm
                className="py-1"
                formData={oauthFormData}
                id="oauth-form"
                noHtml5Validate={true}
                onChange={(e) => setOAuthFormData(e.formData)}
                onSubmit={handleSaveOAuthConfig}
                schema={{
                  type: 'object',
                  properties: {
                    oauth: {
                      type: 'array',
                      maxItems: tool.oauth.length,
                      minItems: tool.oauth.length,
                      items: {
                        type: 'object',
                        title: '',
                        properties: {
                          name: { type: 'string' },
                          authorizationUrl: { type: 'string' },
                          redirectUrl: { type: 'string' },
                          tokenUrl: { type: 'string' },
                          clientId: { type: 'string' },
                          clientSecret: { type: 'string' },
                          scopes: {
                            type: 'array',
                            items: { type: 'string' },
                          },
                          responseType: { type: 'string' },
                          pkceType: { type: 'string' },
                          refreshToken: { type: 'string' },
                          version: { type: 'string' },
                        },
                      },
                    },
                  },
                }}
                uiSchema={{
                  'ui:submitButtonOptions': { norender: true },
                  oauth: {
                    'ui:options': {
                      label: false,
                      removable: false,
                      addable: false,
                    },
                  },
                }}
                validator={validator}
              />
              <div className="flex w-full justify-end">
                <Button
                  className="min-w-[100px]"
                  disabled={isPending}
                  form="oauth-form"
                  isLoading={isPending}
                  rounded="lg"
                  size="sm"
                  variant="outline"
                >
                  {t('common.saveChanges')}
                </Button>
              </div>
            </div>
          </TabsContent>
        )}

        {isPlaygroundTool &&
          'author' in tool &&
          tool.author === auth?.shinkai_identity && (
            <TabsContent value="publish">
              <div
                className={cn(
                  boxContainerClass,
                  'flex-row items-center justify-between gap-7',
                )}
              >
                <div className="space-y-2">
                  <h2 className="text-base font-medium text-white">Publish</h2>
                  <p className="text-gray-80 text-sm">
                    Publish your tool to the{' '}
                    <a
                      className="text-white underline"
                      href={SHINKAI_STORE_URL}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Shinkai App Store
                    </a>{' '}
                    to make it available to all Shinkai users.
                  </p>
                  {isPublishToolSuccess && (
                    <div className="flex items-center gap-2 rounded-md py-2 text-xs text-cyan-400">
                      <InfoCircleIcon className="h-4 w-4 text-inherit" />
                      <p className="">
                        Your tool will be validated in the Shinkai App Store.
                        Click{' '}
                        <a
                          className="font-medium text-inherit underline"
                          href={`${SHINKAI_STORE_URL}/store/revisions/complete?id=${publishToolData?.response.revisionId}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          here
                        </a>{' '}
                        to continue the process if you are not redirected.
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  className="min-w-[100px]"
                  disabled={isPublishingTool}
                  isLoading={isPublishingTool}
                  onClick={() => {
                    publishTool({
                      toolKey: toolKey ?? '',
                      nodeAddress: auth?.node_address ?? '',
                      token: auth?.api_v2_key ?? '',
                    });
                  }}
                  rounded="lg"
                  size="sm"
                  variant="outline"
                >
                  Publish
                </Button>
              </div>
            </TabsContent>
          )}
      </Tabs>
    </SubpageLayout>
  );
}

const SHINKAI_DAPP_URL = 'https://shinkai-contracts.pages.dev';

export function AuthorAvatarLink({ author }: { author: string }) {
  const formattedAuthor = author.replace('@@', '');

  return (
    <a
      className="text-gray-80 isolate flex items-center gap-2 text-xs hover:[&>span]:underline"
      href={`${SHINKAI_DAPP_URL}/identity/${formattedAuthor}`}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Avatar className={cn('h-5 w-5')}>
        {/*{author === 'Shinkai' ? (*/}
        {/*  <img alt="Shinkai AI" src="/app-icon.png" />*/}
        {/*) : (*/}
        <AvatarFallback className="bg-[#313336] uppercase text-[#b0b0b0]">
          {formattedAuthor.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{formattedAuthor}</span>
    </a>
  );
}

export function ToolIcon() {
  return (
    <div className="from-brand-500 to-brand-600 flex size-10 items-center justify-center rounded-lg border border-gray-300 bg-gray-500 bg-gradient-to-tr text-gray-50">
      <svg
        color="currentColor"
        fill="none"
        height={24}
        viewBox="0 0 24 24"
        width={24}
      >
        <path
          d="M10 4C10 2.89543 10.8954 2 12 2H13C14.1046 2 15 2.89543 15 4V6.55337C15 7.86603 15.8534 9.02626 17.1065 9.41722L17.8935 9.66278C19.1466 10.0537 20 11.214 20 12.5266V14C20 14.5523 19.5523 15 19 15H6C5.44772 15 5 14.5523 5 14V12.5266C5 11.214 5.85339 10.0537 7.10648 9.66278L7.89352 9.41722C9.14661 9.02626 10 7.86603 10 6.55337V4Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M6.00217 15C6.15797 16.3082 5.4957 19.5132 4 21.8679C4 21.8679 14.2924 23.0594 15.6851 17.9434V19.8712C15.6851 20.8125 15.6851 21.2831 15.9783 21.5755C16.5421 22.1377 19.1891 22.1531 19.7538 21.5521C20.0504 21.2363 20.0207 20.7819 19.9611 19.8731C19.8629 18.3746 19.5932 16.4558 18.8523 15"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
