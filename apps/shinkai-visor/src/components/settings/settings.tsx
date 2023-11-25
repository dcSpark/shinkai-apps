import { zodResolver } from '@hookform/resolvers/zod';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import {
  Button,
  Checkbox,
  ExportIcon,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  QrIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shinkai_network/shinkai-ui';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
import { useSettings } from '../../store/settings/settings';
import { Header } from '../header/header';

const formSchema = z.object({
  defaultAgentId: z.string(),
  hideActionButton: z.boolean(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export const Settings = () => {
  const history = useHistory();
  const auth = useAuth((authStore) => authStore.auth);
  const settings = useSettings((settingsStore) => settingsStore.settings);
  const setSettings = useSettings((settingsStore) => settingsStore.setSettings);
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultAgentId: settings?.defaultAgentId,
      hideActionButton: settings?.hideActionButton,
    },
  });
  const currentFormValue = useWatch<FormSchemaType>({ control: form.control });
  const { agents } = useAgents({
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}`,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });
  const exportConnection = () => {
    history.push('settings/export-connection');
  };
  const createRegistrationCode = () => {
    history.push('settings/create-registration-code');
  };
  useEffect(() => {
    if (JSON.stringify(currentFormValue) !== JSON.stringify(settings)) {
      setSettings({ ...currentFormValue });
    }
  }, [currentFormValue, settings, setSettings]);
  return (
    <div className="flex flex-col space-y-3">
      <Header
        title={<FormattedMessage id="setting.other"></FormattedMessage>}
      />
      <div className="flex flex-col space-y-8">
        <Form {...form}>
          <form className="flex grow flex-col justify-between space-y-2 overflow-hidden">
            <FormField
              control={form.control}
              name="defaultAgentId"
              render={({ field }) => (
                <FormItem>
                  <Select
                    defaultValue={field.value}
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <FormLabel>
                      <FormattedMessage id="default-agent" />
                    </FormLabel>
                    <SelectContent>
                      {agents?.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (agent.full_identity_name as any)?.subidentity_name
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hideActionButton"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-sm border p-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      <FormattedMessage id="hide-action-button-label"></FormattedMessage>
                    </FormLabel>
                    <FormDescription>
                      <FormattedMessage id="hide-action-button-description"></FormattedMessage>
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <div className="flex gap-4">
          <Button
            className="flex flex-1 cursor-pointer flex-col items-start gap-2 rounded-lg p-4 pr-8 text-left"
            onClick={() => exportConnection()}
            size="auto"
            variant="ghost"
          >
            <ExportIcon />
            <p className="text-smm text-white">
              <FormattedMessage id="export-connection" />
            </p>
          </Button>
          <Button
            className="flex flex-1 cursor-pointer flex-col items-start gap-2 rounded-lg p-4 pr-8 text-left"
            onClick={() => createRegistrationCode()}
            size="auto"
            variant="ghost"
          >
            <div className="">
              <QrIcon />
            </div>
            <p className="text-smm text-white">
              <FormattedMessage id="create-registration-code" />
            </p>
          </Button>
        </div>
      </div>
    </div>
  );
};
