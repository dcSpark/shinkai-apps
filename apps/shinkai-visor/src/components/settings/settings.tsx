import { zodResolver } from '@hookform/resolvers/zod';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/lib/queries/getHealth/useGetHealth';
import {
  Button,
  Checkbox,
  ExportIcon,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  QrIcon,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  TextField,
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
  displayActionButton: z.boolean(),
  nodeAddress: z.string(),
  shinkaiIdentity: z.string(),
  nodeVersion: z.string(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export const Settings = () => {
  const history = useHistory();
  const auth = useAuth((authStore) => authStore.auth);
  const settings = useSettings((settingsStore) => settingsStore.settings);
  const setSettings = useSettings((settingsStore) => settingsStore.setSettings);
  const { nodeInfo, isSuccess: isNodeInfoSuccess } = useGetHealth({
    node_address: auth?.node_address ?? '',
  });

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultAgentId: settings?.defaultAgentId,
      displayActionButton: settings?.displayActionButton,
      nodeAddress: auth?.node_address,
    },
  });
  const currentFormValue = useWatch<FormSchemaType>({ control: form.control });
  const { agents } = useAgents({
    nodeAddress: auth?.node_address ?? '',
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
    if (isNodeInfoSuccess) {
      form.reset({
        nodeVersion: nodeInfo?.version ?? '',
        shinkaiIdentity: nodeInfo?.node_name ?? '',
      });
    }
  }, [form, isNodeInfoSuccess, nodeInfo?.node_name, nodeInfo?.version]);

  useEffect(() => {
    if (JSON.stringify(currentFormValue) !== JSON.stringify(settings)) {
      setSettings({ ...currentFormValue });
    }
  }, [currentFormValue, settings, setSettings]);

  return (
    <div className="flex flex-col space-y-8 pr-2.5">
      <Header title={<FormattedMessage id="setting.other" />} />
      <div className="flex flex-col space-y-8">
        <Form {...form}>
          <form className="flex grow flex-col justify-between space-y-6 overflow-hidden">
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
                          {agent.id}
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
              disabled
              name="nodeAddress"
              render={({ field }) => (
                <TextField
                  field={field}
                  label={<FormattedMessage id="node-address" />}
                />
              )}
            />
            <FormField
              control={form.control}
              disabled
              name="shinkaiIdentity"
              render={({ field }) => (
                <TextField
                  field={field}
                  label={<FormattedMessage id="shinkai-identity" />}
                />
              )}
            />
            <FormField
              control={form.control}
              disabled
              name="nodeVersion"
              render={({ field }) => (
                <TextField
                  field={field}
                  label={<FormattedMessage id="node-version" />}
                />
              )}
            />
            <FormField
              control={form.control}
              name="displayActionButton"
              render={({ field }) => (
                <FormItem className="flex gap-2.5">
                  <FormControl id={'hide-action'}>
                    <Switch
                      aria-readonly
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="static space-y-1.5 text-sm text-white">
                      <FormattedMessage id="display-action-button-label" />
                    </FormLabel>
                    <FormDescription>
                      <FormattedMessage id="show-action-button-description" />
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
