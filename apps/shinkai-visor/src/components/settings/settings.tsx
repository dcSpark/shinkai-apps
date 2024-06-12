import { zodResolver } from '@hookform/resolvers/zod';
import { isShinkaiIdentityLocalhost } from '@shinkai_network/shinkai-message-ts/utils';
import { useUpdateNodeName } from '@shinkai_network/shinkai-node-state/lib/mutations/updateNodeName/useUpdateNodeName';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/lib/queries/getHealth/useGetHealth';
import {
  Button,
  buttonVariants,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { ExportIcon, QrIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { motion } from 'framer-motion';
import { ExternalLinkIcon, TrashIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  areShortcutKeysEqual,
  formatShortcutKey,
  getKeyInfo,
  isValidKeyCombination,
} from '../../hooks/use-keyboard-shortcut';
import { SetupData, useAuth } from '../../store/auth/auth';
import { useSettings } from '../../store/settings/settings';

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
const MotionButton = motion(Button);
export const Settings = () => {
  const intl = useIntl();
  const history = useHistory();
  const auth = useAuth((authStore) => authStore.auth);
  const setAuth = useAuth((authStore) => authStore.setAuth);
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
      shinkaiIdentity: auth?.shinkai_identity,
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
  const currentShinkaiIdentity = useWatch({
    control: form.control,
    name: 'shinkaiIdentity',
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
  const { mutateAsync: updateNodeName, isPending: isUpdateNodeNamePending } =
    useUpdateNodeName({
      onSuccess: () => {
        toast.success(
          intl.formatMessage({ id: 'shinkai-identity-updated-successfully' }),
        );
        if (!auth) return;
        const isHostingShinkaiNode = auth?.node_address.includes(
          'hosting.shinkai.com',
        );
        if (!isHostingShinkaiNode) {
          toast.info(intl.formatMessage({ id: 'restart-your-shinkai-node' }));
        }
        const newAuth: SetupData = { ...auth };
        setAuth({
          ...newAuth,
          shinkai_identity: currentShinkaiIdentity,
        });
      },
      onError: (error) => {
        toast.error('Failed to update node name', {
          description: error?.response?.data?.error ?? error.message,
        });
      },
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
  }, [currentDisplayActionButton, setDisplayActionButton]);
  useEffect(() => {
    setDefaultAgentId(currentDefaultAgentId);
  }, [currentDefaultAgentId, setDefaultAgentId]);
  useEffect(() => {
    setDisplaySummaryActionButton(currentDisplaySummaryAction);
  }, [currentDisplaySummaryAction, setDisplaySummaryActionButton]);
  useEffect(() => {
    setDisplayImageCaptureActionButton(currentDisplayImageCaptureActionButton);
  }, [
    currentDisplayImageCaptureActionButton,
    setDisplayImageCaptureActionButton,
  ]);

  const handleUpdateNodeName = async () => {
    if (!auth) return;
    await updateNodeName({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile,
      newNodeName: form.getValues().shinkaiIdentity,
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };

  const isIdentityLocalhost = isShinkaiIdentityLocalhost(
    auth?.shinkai_identity ?? '',
  );
  return (
    <div className="flex flex-col space-y-8 pr-2.5">
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
              name="shinkaiIdentity"
              render={({ field }) => (
                <TextField
                  field={{
                    ...field,
                    onKeyDown: (event) => {
                      if (currentShinkaiIdentity === auth?.shinkai_identity)
                        return;
                      if (event.key === 'Enter') {
                        handleUpdateNodeName();
                      }
                    },
                  }}
                  helperMessage={
                    <span className="text-gray-80 inline-flex items-center gap-1 px-1 py-2.5 hover:text-white">
                      {isIdentityLocalhost ? (
                        <a
                          className={cn(
                            buttonVariants({
                              size: 'auto',
                              variant: 'link',
                            }),
                            'rounded-lg p-0 text-xs text-inherit underline',
                          )}
                          href={`https://shinkai-contracts.pages.dev?encryption_pk=${auth?.node_encryption_pk}&signature_pk=${auth?.node_signature_pk}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Register your Shinkai Identity
                        </a>
                      ) : (
                        <a
                          className={cn(
                            buttonVariants({
                              size: 'auto',
                              variant: 'link',
                            }),
                            'rounded-lg p-0 text-xs text-inherit underline',
                          )}
                          href={`https://shinkai-contracts.pages.dev/identity/${auth?.shinkai_identity?.replace(
                            '@@',
                            '',
                          )}`}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Go to My Shinkai Identity
                        </a>
                      )}
                      <ExternalLinkIcon className="h-4 w-4" />
                    </span>
                  }
                  label={<FormattedMessage id="shinkai-identity" />}
                />
              )}
            />
            {currentShinkaiIdentity !== auth?.shinkai_identity && (
              <div className="flex items-center gap-3">
                <MotionButton
                  className="h-10 min-w-[100px] rounded-lg text-sm"
                  isLoading={isUpdateNodeNamePending}
                  layout
                  onClick={handleUpdateNodeName}
                  size="auto"
                  type="button"
                >
                  <FormattedMessage id="save" />
                </MotionButton>
                <Button
                  className="min-w-10 h-10 rounded-lg text-sm"
                  onClick={() => {
                    form.setValue(
                      'shinkaiIdentity',
                      auth?.shinkai_identity ?? '',
                    );
                  }}
                  type="button"
                  variant="outline"
                >
                  <FormattedMessage id="cancel" />
                </Button>
              </div>
            )}
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
                                type="button"
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
        <div className="align-center grid grid-cols-2 justify-center gap-4">
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
          <Button
            className="flex flex-1 cursor-pointer flex-col items-start gap-2 rounded-lg p-4 pr-8 text-left"
            onClick={() => history.push('settings/public-keys')}
            size="auto"
            variant="ghost"
          >
            <div className="text-gray-100">
              <svg
                className="h-6 w-6"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="0"
                viewBox="0 0 512 512"
              >
                <path d="M261.1 24.8c-6.3 0-12.7.43-19.2 1.18-34.6 4.01-64.8 17.59-86.1 37.06-21.4 19.48-34.2 45.56-31 73.16 2.8 24.6 17.8 45.2 39.1 59.4 2.6-6.2 5.9-11.9 9.2-16.5-17.6-11.6-28.4-27.3-30.4-45-2.3-19.7 6.7-39.58 24.8-56.14 18.2-16.57 45.3-29.06 76.6-32.68 31.3-3.63 60.6 2.33 82.1 14.3 21.4 11.98 34.7 29.31 37 48.92 2.2 19.3-6.2 38.8-23.4 55a69.91 69.91 0 0 0-35.4-10.6h-2.2c-5.1.1-10.1.7-15.3 1.8-37.5 8.7-60.8 45.5-52.2 82.7 5.3 23 21.6 40.6 42.2 48.5l39.7 172.2 47 29.1 29.5-46.7-23.5-14.5 14.8-23.4-23.5-14.6 14.7-23.3-23.5-14.6 14.8-23.4-13.5-58.4c15.1-16.1 22-39.1 16.7-62.2-2.7-11.7-8.2-22-15.8-30.4 18.9-19 29.8-43.5 26.8-69.2-3.2-27.55-21.6-50.04-46.9-64.11-20.5-11.45-45.8-17.77-73.1-17.59zm-20.2 135.5c-25.9 1.1-49.9 16.8-60.4 42.2-9.1 21.9-6 45.7 6.2 64.2l-67.8 163 21.3 51 51.2-20.9-10.7-25.5 25.6-10.4-10.6-25.5 25.6-10.4-10.7-25.5 25.6-10.5 22.8-54.8c-20.5-11.5-36.2-31.2-41.9-55.8-6.9-30.3 3.1-60.6 23.8-81.1zm58 7.2c8.9-.1 17.3 3.5 23.4 9.4-5.5 3.5-11.6 6.6-18 9.4-1.6-.6-3.3-.8-5.1-.8-.6 0-1.1 0-1.6.1-7 .8-12.2 6.1-13.1 12.7-.2 1-.2 2-.2 2.9.1.3.1.7.1 1 1 8.4 8.3 14.2 16.7 13.2 6.8-.8 12-5.9 13-12.3 6.2-2.8 12-5.9 17.5-9.4.2 1 .4 2 .5 3 2.1 18-11 34.5-29 36.6-17.9 2.1-34.5-11-36.5-29-2.1-18 11-34.5 29-36.6 1.1-.1 2.2-.2 3.3-.2z" />
              </svg>
            </div>
            <p className="text-smm text-white">Show Public Keys</p>
          </Button>
        </div>
      </div>
    </div>
  );
};
