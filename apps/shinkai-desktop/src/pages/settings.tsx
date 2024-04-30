import { zodResolver } from '@hookform/resolvers/zod';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/lib/queries/getHealth/useGetHealth';
import {
  Button,
  ExportIcon,
  Form,
  FormControl,
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
  TextField,
} from '@shinkai_network/shinkai-ui';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { GENERATE_CODE_PATH } from '../routes/name';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { SimpleLayout } from './layout/simple-layout';

const formSchema = z.object({
  defaultAgentId: z.string(),
  displayActionButton: z.boolean(),
  nodeAddress: z.string(),
  shinkaiIdentity: z.string(),
  nodeVersion: z.string(),
});

type FormSchemaType = z.infer<typeof formSchema>;

const SettingsPage = () => {
  const navigate = useNavigate();
  const auth = useAuth((authStore) => authStore.auth);

  const defaultAgentId = useSettings(
    (settingsStore) => settingsStore.defaultAgentId,
  );
  const setDefaultAgentId = useSettings(
    (settingsStore) => settingsStore.setDefaultAgentId,
  );
  const { nodeInfo, isSuccess: isNodeInfoSuccess } = useGetHealth({
    node_address: auth?.node_address ?? '',
  });

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultAgentId: defaultAgentId,
      nodeAddress: auth?.node_address,
    },
  });

  const currentDefaultAgentId = useWatch({
    control: form.control,
    name: 'defaultAgentId',
  });

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

  useEffect(() => {
    if (isNodeInfoSuccess) {
      form.reset({
        ...form.getValues(),
        nodeVersion: nodeInfo?.version ?? '',
        shinkaiIdentity: nodeInfo?.node_name ?? '',
      });
    }
  }, [form, isNodeInfoSuccess, nodeInfo?.node_name, nodeInfo?.version]);

  useEffect(() => {
    setDefaultAgentId(currentDefaultAgentId);
  }, [currentDefaultAgentId]);

  return (
    <SimpleLayout classname="max-w-lg" title="Settings">
      <p className="mb-3">Manage your account settings preferences.</p>

      <div className="flex flex-col space-y-8 pr-2.5">
        <div className="flex flex-col space-y-8">
          <Form {...form}>
            <form className="flex grow flex-col justify-between space-y-6 overflow-hidden">
              <FormItem>
                <Select
                  defaultValue={defaultAgentId}
                  name="defaultAgentId"
                  onValueChange={(value) => {
                    form.setValue('defaultAgentId', value);
                  }}
                  value={
                    agents?.find((agent) => agent.id === defaultAgentId)?.id
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <FormLabel>Default Agent</FormLabel>
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

              <FormField
                control={form.control}
                disabled
                name="nodeAddress"
                render={({ field }) => (
                  <TextField field={field} label="Node Address" />
                )}
              />
              <FormField
                control={form.control}
                disabled
                name="shinkaiIdentity"
                render={({ field }) => (
                  <TextField field={field} label="Shinkai Identity" />
                )}
              />
              <FormField
                control={form.control}
                disabled
                name="nodeVersion"
                render={({ field }) => (
                  <TextField field={field} label="Node Version" />
                )}
              />
            </form>
          </Form>
        </div>
        <div className="flex gap-4">
          <Button
            className="flex flex-1 cursor-pointer flex-col items-start gap-2 rounded-lg p-4 pr-8 text-left"
            onClick={() => navigate('/export-connection')}
            size="auto"
            variant="ghost"
          >
            <ExportIcon />
            <p className="text-smm text-white">Export Connection</p>
          </Button>
          <Button
            className="flex flex-1 cursor-pointer flex-col items-start gap-2 rounded-lg p-4 pr-8 text-left"
            onClick={() => navigate(GENERATE_CODE_PATH)}
            size="auto"
            variant="ghost"
          >
            <div className="">
              <QrIcon />
            </div>
            <p className="text-smm text-white">Create Registration Code</p>
          </Button>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default SettingsPage;
