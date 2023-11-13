import { zodResolver } from '@hookform/resolvers/zod';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { FileKey, QrCode, SettingsIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';
import { z } from 'zod';

import { useAuth } from '../../store/auth/auth';
import { useSettings } from '../../store/settings/settings';
import { Header } from '../header/header';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const formSchema = z.object({
  defaultAgentId: z.string().optional(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export const Settings = () => {
  const history = useHistory();
  const auth = useAuth((authStore) => authStore.auth);
  const { settings, setSettings } = useSettings(
    (settingsStore) => settingsStore
  );
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultAgentId: '',
    },
  });
  const defaultAgentId = useWatch<FormSchemaType>({ name: 'defaultAgentId', control: form.control });
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
    if (defaultAgentId) {
      setSettings({ defaultAgentId })
    }
  }, [defaultAgentId, setSettings]);
  useEffect(() => {
    form.setValue('defaultAgentId', settings?.defaultAgentId);
  }, [settings, form]);
  return (
    <div className="flex flex-col space-y-3">
      <Header
        icon={<SettingsIcon />}
        title={<FormattedMessage id="setting.other"></FormattedMessage>}
      />
      <div className="flex flex-col space-y-2">
        <Form {...form}>
          <form
            className="grow flex flex-col space-y-2 justify-between overflow-hidden"
          >
            <FormField
              control={form.control}
              name="defaultAgentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <FormattedMessage id="default-agent" />
                  </FormLabel>
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
                    <SelectPortal>
                      <SelectContent>
                        {agents?.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (agent.full_identity_name as any)
                                ?.subidentity_name
                            }
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <Button className="w-full" onClick={() => exportConnection()}>
          <FileKey className="mr-2 h-4 w-4" />
          <FormattedMessage id="export-connection" />
        </Button>
        <Button className="w-full" onClick={() => createRegistrationCode()}>
          <QrCode className="mr-2 h-4 w-4" />
          <FormattedMessage id="create-registration-code" />
        </Button>
      </div>
    </div>
  );
};
