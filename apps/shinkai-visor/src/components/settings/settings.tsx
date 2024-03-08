import { zodResolver } from '@hookform/resolvers/zod';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/lib/queries/getHealth/useGetHealth';
import {
  Button,
  buttonVariants,
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
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { TrashIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';
import { z } from 'zod';

import {
  areShortcutKeysEqual,
  formatShortcutKey,
  getKeyInfo,
  isValidKeyCombination,
} from '../../hooks/use-keyboard-shortcut';
import { useAuth } from '../../store/auth/auth';
import { useSettings } from '../../store/settings/settings';
import { Header } from '../header/header';

const formSchema = z.object({
  defaultAgentId: z.string(),
  displayActionButton: z.boolean(),
  displaySummaryActionButton: z.boolean(),
  displayImageCaptureActionButton: z.boolean(),
  nodeAddress: z.string(),
  shinkaiIdentity: z.string(),
  nodeVersion: z.string(),
  shortcutSidebar: z.object({
    key: z.string(),
    altKey: z.boolean(),
    ctrlKey: z.boolean(),
    metaKey: z.boolean(),
    shiftKey: z.boolean(),
    keyCode: z.number(),
  }),
});

type FormSchemaType = z.infer<typeof formSchema>;

export const Settings = () => {
  const history = useHistory();
  const auth = useAuth((authStore) => authStore.auth);
  const displayActionButton = useSettings(
    (settingsStore) => settingsStore.displayActionButton,
  );
  const displaySummaryActionButton = useSettings(
    (settingsStore) => settingsStore.displaySummaryActionButton,
  );
  const displayImageCaptureActionButton = useSettings(
    (settingsStore) => settingsStore.displayImageCaptureActionButton,
  );
  const setDisplayActionButton = useSettings(
    (settingsStore) => settingsStore.setDisplayActionButton,
  );

  const setDisplaySummaryActionButton = useSettings(
    (settingsStore) => settingsStore.setDisplaySummaryActionButton,
  );

  const setDisplayImageCaptureActionButton = useSettings(
    (settingsStore) => settingsStore.setDisplayImageCaptureActionButton,
  );

  const defaultAgentId = useSettings(
    (settingsStore) => settingsStore.defaultAgentId,
  );
  const setDefaultAgentId = useSettings(
    (settingsStore) => settingsStore.setDefaultAgentId,
  );
  const sidebarShortcut = useSettings(
    (settingsStore) => settingsStore.sidebarShortcut,
  );
  const setSidebarShortcut = useSettings(
    (settingsStore) => settingsStore.setSidebarShortcut,
  );

  const { nodeInfo, isSuccess: isNodeInfoSuccess } = useGetHealth({
    node_address: auth?.node_address ?? '',
  });
  const disabledHosts = useSettings(
    (settingsStore) => settingsStore.disabledHosts,
  );
  const setDisabledHosts = useSettings(
    (settingsStore) => settingsStore.setDisabledHosts,
  );

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultAgentId: defaultAgentId,
      displayActionButton: displayActionButton,
      nodeAddress: auth?.node_address,
      shortcutSidebar: sidebarShortcut,
      displaySummaryActionButton: displaySummaryActionButton,
      displayImageCaptureActionButton: displayImageCaptureActionButton,
    },
  });

  const currentDisplayActionButton = useWatch({
    control: form.control,
    name: 'displayActionButton',
  });
  const currentDisplaySummaryAction = useWatch({
    control: form.control,
    name: 'displaySummaryActionButton',
  });
  const currentDisplayImageCaptureActionButton = useWatch({
    control: form.control,
    name: 'displayImageCaptureActionButton',
  });
  const currentDefaultAgentId = useWatch({
    control: form.control,
    name: 'defaultAgentId',
  });
  const currentSidebarShorcut = useWatch({
    control: form.control,
    name: 'shortcutSidebar',
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
  const exportConnection = () => {
    history.push('settings/export-connection');
  };
  const createRegistrationCode = () => {
    history.push('settings/create-registration-code');
  };
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
    setDisplayActionButton(currentDisplayActionButton);
  }, [currentDisplayActionButton]);
  useEffect(() => {
    setDefaultAgentId(currentDefaultAgentId);
  }, [currentDefaultAgentId]);
  useEffect(() => {
    setDisplaySummaryActionButton(currentDisplaySummaryAction);
  }, [currentDisplaySummaryAction]);
  useEffect(() => {
    setDisplayImageCaptureActionButton(currentDisplayImageCaptureActionButton);
  }, [currentDisplayImageCaptureActionButton]);

  return (
    <div className="flex flex-col space-y-8 pr-2.5">
      <Header title={<FormattedMessage id="setting.other" />} />
      <div className="flex flex-col space-y-8">
        <Form {...form}>
          <form className="flex grow flex-col justify-between space-y-6 overflow-hidden">
            <h2 className="text-lg font-medium">General</h2>
            <FormItem>
              <Select
                defaultValue={defaultAgentId}
                name="defaultAgentId"
                onValueChange={(value) => {
                  form.setValue('defaultAgentId', value);
                }}
                value={agents?.find((agent) => agent.id === defaultAgentId)?.id}
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
            <h2 className="pt-4 text-lg font-medium">Sidebar</h2>
            <div>
              <FormField
                control={form.control}
                name="displayActionButton"
                render={({ field }) => (
                  <>
                    <FormItem className="flex gap-2.5">
                      <FormControl>
                        <Switch
                          aria-readonly
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel
                          className="static space-y-1.5 text-sm text-white"
                          htmlFor="displayActionButton"
                        >
                          <FormattedMessage id="show-action-button-label" />
                        </FormLabel>
                        <FormDescription>
                          <FormattedMessage id="show-action-button-description" />
                        </FormDescription>
                      </div>
                    </FormItem>
                    {Object.keys(disabledHosts).length > 0 && (
                      <div>
                        <h3 className="mb-2 pt-4 text-xs font-medium text-red-400">
                          Blacklisted Websites
                        </h3>
                        <div className="space-y-2">
                          {Object.keys(disabledHosts).map((host) => (
                            <div
                              className="flex w-full items-center justify-between rounded-md bg-gray-300 px-2 py-1"
                              key={host}
                            >
                              <div className="flex flex-1 items-center gap-2.5">
                                <img
                                  alt=""
                                  className="object-fit h-4 w-4 overflow-hidden rounded-full"
                                  src={`https://s2.googleusercontent.com/s2/favicons?domain=${host}`}
                                />
                                <span className="text-gray-80 truncate">
                                  {host}
                                </span>
                              </div>
                              <button
                                className={cn(
                                  buttonVariants({
                                    size: 'auto',
                                    variant: 'ghost',
                                  }),
                                  'bg-transparent p-2 text-gray-50',
                                )}
                                onClick={() => {
                                  const currentDisableHosts = {
                                    ...disabledHosts,
                                  };
                                  delete currentDisableHosts[host];
                                  setDisabledHosts(currentDisableHosts);
                                }}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="displaySummaryActionButton"
              render={({ field }) => (
                <FormItem className="flex gap-2.5">
                  <FormControl>
                    <Switch
                      aria-readonly
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="static space-y-1.5 text-sm text-white">
                      Include 1-Click Summary Option
                    </FormLabel>
                    <FormDescription>
                      Adds a Summary Button to the Quick Access hover menu.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayImageCaptureActionButton"
              render={({ field }) => (
                <FormItem className="flex gap-2.5">
                  <FormControl>
                    <Switch
                      aria-readonly
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="static space-y-1.5 text-sm text-white">
                      Include 1-Click Image Capture Option
                    </FormLabel>
                    <FormDescription>
                      Adds an Image Capture Button to the Quick Access hover
                      menu.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayActionButton"
              render={() => (
                <TextField
                  classes={{
                    input:
                      'text-gray-80 text-base font-semibold tracking-widest caret-transparent',
                  }}
                  field={{
                    value: formatShortcutKey(currentSidebarShorcut),
                    name: 'shortcutSidebar',
                    onKeyDown: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const keyInfo = getKeyInfo(event);
                      form.setValue('shortcutSidebar', keyInfo);
                    },
                  }}
                  helperMessage={
                    <FormattedMessage id="shortcut-key-description" />
                  }
                  label={<FormattedMessage id="shortcut-key" />}
                />
              )}
            />
            {!areShortcutKeysEqual(currentSidebarShorcut, sidebarShortcut) ? (
              <div className="flex items-center gap-3">
                <Button
                  className="h-10 w-10 rounded-lg text-sm"
                  disabled={!isValidKeyCombination(currentSidebarShorcut)}
                  onClick={() => {
                    setSidebarShortcut(currentSidebarShorcut);
                  }}
                  type="button"
                >
                  <FormattedMessage id="save" />
                </Button>
                <Button
                  className="h-10 w-10 rounded-lg text-sm"
                  onClick={() => {
                    form.setValue('shortcutSidebar', sidebarShortcut);
                  }}
                  type="button"
                  variant="outline"
                >
                  <FormattedMessage id="cancel" />
                </Button>
              </div>
            ) : null}
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
