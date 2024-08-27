import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  JSShinkaiTool,
  ShinkaiTool,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useUpdateTool } from '@shinkai_network/shinkai-node-state/v2/mutations/updateTool/useUpdateTool';
import {
  Button,
  Form,
  FormField,
  Switch,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { formatText } from '../../pages/create-job';
import { SubpageLayout } from '../../pages/layout/simple-layout';
import { useAuth } from '../../store/auth';

const jsToolSchema = z.object({
  config: z.array(
    z.object({
      key_name: z.string(),
      key_value: z.string().optional(),
      required: z.boolean(),
    }),
  ),
});
type JsToolFormSchema = z.infer<typeof jsToolSchema>;

export default function JsTool({
  tool,
  isEnabled,
}: {
  tool: JSShinkaiTool;
  isEnabled: boolean;
}) {
  const auth = useAuth((state) => state.auth);
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
  });
  const { toolKey } = useParams();

  const form = useForm<JsToolFormSchema>({
    resolver: zodResolver(jsToolSchema),
    defaultValues: {
      config: tool.config.map((conf) => ({
        key_name: conf.BasicConfig.key_name,
        key_value: conf.BasicConfig.key_value ?? '',
        required: conf.BasicConfig.required,
      })),
    },
  });

  const onSubmit = async (data: JsToolFormSchema) => {
    let enabled = isEnabled;

    if (
      data.config.every(
        (conf) => !conf.required || (conf.required && conf.key_value !== ''),
      )
    ) {
      enabled = true;
    }

    await updateTool({
      toolKey: toolKey ?? '',
      toolType: 'JS',
      toolPayload: {
        config: data.config.map((conf) => ({
          BasicConfig: {
            key_name: conf.key_name,
            key_value: conf.key_value,
          },
        })),
      } as ShinkaiTool,
      isToolEnabled: enabled,
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
    });
  };

  return (
    <SubpageLayout alignLeft title={formatText(tool.name)}>
      <div className="flex flex-col">
        <div className="mb-4 flex items-center justify-between gap-1">
          <p className="text-sm text-white">Enabled</p>
          <Switch
            checked={isEnabled}
            onCheckedChange={async () => {
              await updateTool({
                toolKey: toolKey ?? '',
                toolType: 'JS',
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
          tool.author && {
            label: 'Author',
            value: tool.author,
          },
          tool.keywords.length > 0 && {
            label: 'Keyword',
            value: tool.keywords,
          },
        ]
          .filter((item) => !!item)
          .map(({ label, value }) => (
            <div className="flex flex-col gap-1 py-4" key={label}>
              <span className="text-gray-80 text-xs">{label}</span>
              <span className="text-sm text-white">{value}</span>
            </div>
          ))}

        {tool.config.length > 0 && (
          <div className="mx-auto mt-6 w-full space-y-6 rounded-md border p-8">
            <div className="text-lg font-medium">Tool Configuration</div>

            <Form {...form}>
              <form
                className="flex flex-col justify-between space-y-8"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="flex grow flex-col space-y-5">
                  {tool.config.map((conf, index) => (
                    <FormField
                      control={form.control}
                      key={conf.BasicConfig.key_name}
                      name={`config.${index}.key_value`}
                      render={({ field }) => (
                        <TextField
                          field={field}
                          label={formatText(conf.BasicConfig.key_name)}
                          type="password"
                        />
                      )}
                    />
                  ))}
                </div>
                <Button
                  className="w-full rounded-lg text-sm"
                  disabled={isPending}
                  isLoading={isPending}
                  type="submit"
                >
                  {t('common.save')}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </div>
    </SubpageLayout>
  );
}
