// import { zodResolver } from '@hookform/resolvers/zod';
// import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  NetworkShinkaiTool,
  ShinkaiTool,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useExportTool } from '@shinkai_network/shinkai-node-state/v2/mutations/exportTool/useExportTool';
import { useUpdateTool } from '@shinkai_network/shinkai-node-state/v2/mutations/updateTool/useUpdateTool';
import {
  Button,
  // Button,
  // buttonVariants,
  // Form,
  // FormField,
  Switch,
  // TextField,
} from '@shinkai_network/shinkai-ui';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { save } from '@tauri-apps/plugin-dialog';
import * as fs from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
import { DownloadIcon } from 'lucide-react';
// import { cn } from '@shinkai_network/shinkai-ui/utils';
// import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

// import { z } from 'zod';
import { SubpageLayout } from '../../pages/layout/simple-layout';
import { useAuth } from '../../store/auth';

// const jsToolSchema = z.object({
//   config: z.array(
//     z.object({
//       key_name: z.string(),
//       key_value: z.string().optional(),
//       required: z.boolean(),
//     }),
//   ),
// });
// type JsToolFormSchema = z.infer<typeof jsToolSchema>;

export default function NetworkTool({
  tool,
  isEnabled,
}: {
  tool: NetworkShinkaiTool;
  isEnabled: boolean;
}) {
  const auth = useAuth((state) => state.auth);
  const { toolKey } = useParams();

  const { mutateAsync: updateTool } = useUpdateTool({
    onSuccess: (_, variables) => {
      if (
        'config' in variables.toolPayload &&
        variables.toolPayload.config?.length > 0
      ) {
        toast.success('Tool configuration updated successfully');
      }
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
          filters: [
            {
              name: 'Zip File',
              extensions: ['zip'],
            },
          ],
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

  // const form = useForm<JsToolFormSchema>({
  //   resolver: zodResolver(jsToolSchema),
  //   defaultValues: {
  //     // config: tool.config.map((conf) => ({
  //     //   key_name: conf.BasicConfig.key_name,
  //     //   key_value: conf.BasicConfig.key_value ?? '',
  //     //   required: conf.BasicConfig.required,
  //     // })),
  //   },
  // });

  // const onSubmit = async (data: JsToolFormSchema) => {
  //   let enabled = isEnabled;
  //
  //   if (
  //     data.config.every(
  //       (conf) => !conf.required || (conf.required && conf.key_value !== ''),
  //     )
  //   ) {
  //     enabled = true;
  //   }
  //
  //   await updateTool({
  //     toolKey: toolKey ?? '',
  //     toolType: 'Network',
  //     toolPayload: {
  //       config: data.config.map((conf) => ({
  //         BasicConfig: {
  //           key_name: conf.key_name,
  //           key_value: conf.key_value,
  //         },
  //       })),
  //     } as ShinkaiTool,
  //     isToolEnabled: enabled,
  //     nodeAddress: auth?.node_address ?? '',
  //     token: auth?.api_v2_key ?? '',
  //   });
  // };

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
        size="sm"
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
                toolType: 'Network',
                toolPayload: {} as ShinkaiTool,
                isToolEnabled: !isEnabled,
                nodeAddress: auth?.node_address ?? '',
                token: auth?.api_v2_key ?? '',
              });
            }}
          />
        </div>
        {/*{[*/}
        {/*  {*/}
        {/*    label: 'Description',*/}
        {/*    value: tool.description,*/}
        {/*  },*/}
        {/*  tool.author && {*/}
        {/*    label: 'Author',*/}
        {/*    value: tool.author,*/}
        {/*  },*/}
        {/*  tool.keywords.length > 0 && {*/}
        {/*    label: 'Keyword',*/}
        {/*    value: tool.keywords,*/}
        {/*  },*/}
        {/*]*/}
        {/*  .filter((item) => !!item)*/}
        {/*  .map(({ label, value }) => (*/}
        {/*    <div className="flex flex-col gap-1 py-4" key={label}>*/}
        {/*      <span className="text-gray-80 text-xs">{label}</span>*/}
        {/*      <span className="text-sm text-white">{value}</span>*/}
        {/*    </div>*/}
        {/*  ))}*/}

        {/*{tool.config.length > 0 && (*/}
        {/*  <div className="mx-auto mt-6 w-full space-y-6 rounded-md border p-8">*/}
        {/*    <div className="text-lg font-medium">Tool Configuration</div>*/}

        {/*    <Form {...form}>*/}
        {/*      <form*/}
        {/*        className="flex flex-col justify-between space-y-8"*/}
        {/*        onSubmit={form.handleSubmit(onSubmit)}*/}
        {/*      >*/}
        {/*        <div className="flex grow flex-col space-y-5">*/}
        {/*          {tool.config.map((conf, index) => (*/}
        {/*            <FormField*/}
        {/*              control={form.control}*/}
        {/*              key={conf.BasicConfig.key_name}*/}
        {/*              name={`config.${index}.key_value`}*/}
        {/*              render={({ field }) => (*/}
        {/*                <TextField*/}
        {/*                  field={field}*/}
        {/*                  label={formatText(conf.BasicConfig.key_name)}*/}
        {/*                  type="password"*/}
        {/*                />*/}
        {/*              )}*/}
        {/*            />*/}
        {/*          ))}*/}
        {/*        </div>*/}
        {/*        <Button*/}
        {/*          className="w-full rounded-lg text-sm"*/}
        {/*          disabled={isPending}*/}
        {/*          isLoading={isPending}*/}
        {/*          type="submit"*/}
        {/*        >*/}
        {/*          {t('common.save')}*/}
        {/*        </Button>*/}
        {/*      </form>*/}
        {/*    </Form>*/}
        {/*  </div>*/}
        {/*)}*/}
        {/*{isPlaygroundTool && (*/}
        {/*  <Link*/}
        {/*    className={cn(*/}
        {/*      buttonVariants({*/}
        {/*        size: 'sm',*/}
        {/*        variant: 'outline',*/}
        {/*      }),*/}
        {/*    )}*/}
        {/*    to={`/tools/edit/${toolKey}`}*/}
        {/*  >*/}
        {/*    Go Playground*/}
        {/*  </Link>*/}
        {/*)}*/}
      </div>
    </SubpageLayout>
  );
}
