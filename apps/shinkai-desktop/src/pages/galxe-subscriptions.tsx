import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useGetInboxes } from '@shinkai_network/shinkai-node-state/lib/queries/getInboxes/useGetInboxes';
import { useGetMySubscriptions } from '@shinkai_network/shinkai-node-state/lib/queries/getMySubscriptions/useGetMySubscriptions';
import { useGetVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/useGetVRPathSimplified';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  buttonVariants,
  CopyToClipboardIcon,
  Form,
  FormField,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AlertTriangle, ExternalLinkIcon } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  useGalxeGenerateProofQuery,
  useGalxeRegisterShinkaiDesktopInstallationMutation,
} from '../lib/galxe/galxe-client';
import { useAuth } from '../store/auth';

export const RegisterShinkaiDesktopInstallationFormSchema = z.object({
  address: z.string().min(42),
  signature: z.string().min(8),
  combined: z.string().min(8),
});
export type RegisterShinkaiDesktopInstallationForm = z.infer<
  typeof RegisterShinkaiDesktopInstallationFormSchema
>;

const SUBSCRIPTION_PATH = '/My Subscriptions';

export const GalxeSusbcriptions = () => {
  const { t } = useTranslation();
  const auth = useAuth((store) => store.auth);

  const { data: subscriptions } = useGetMySubscriptions({
    nodeAddress: auth?.node_address ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const { inboxes } = useGetInboxes({
    nodeAddress: auth?.node_address ?? '',
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: auth?.profile ?? '',
    receiver: auth?.shinkai_identity ?? '',
    targetShinkaiNameProfile: `${auth?.shinkai_identity}/${auth?.profile}`,
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const { data: subscriptionFolder } = useGetVRPathSimplified({
    nodeAddress: auth?.node_address ?? '',
    profile: auth?.profile ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    path: SUBSCRIPTION_PATH,
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const isUserSubscribeToKnowledge =
    (subscriptions ?? [])?.length > 0 &&
    ((subscriptionFolder?.child_folders ?? [])?.length > 0 ||
      (subscriptionFolder?.child_items ?? [])?.length > 0);

  const isUserAskQuestions = inboxes.some(
    (inbox) =>
      (inbox?.job_scope?.vector_fs_folders ?? []).some((folder) =>
        folder?.includes(SUBSCRIPTION_PATH),
      ) ||
      (inbox?.job_scope?.vector_fs_items ?? []).some((item) =>
        item?.includes(SUBSCRIPTION_PATH),
      ),
  );

  const { data: subscriptionsProof } = useGalxeGenerateProofQuery(
    auth?.node_signature_pk || '',
    JSON.stringify({
      number_of_qa_subscriptions: inboxes.filter(
        (inbox) =>
          (inbox?.job_scope?.vector_fs_folders ?? []).some((folder) =>
            folder.includes(SUBSCRIPTION_PATH),
          ) ||
          (inbox?.job_scope?.vector_fs_items ?? []).some((item) =>
            item.includes(SUBSCRIPTION_PATH),
          ),
      ),
      number_of_subscriptions: subscriptions?.length,
    }),
    {
      enabled: !!auth && isUserSubscribeToKnowledge && isUserAskQuestions,
    },
  );
  const form = useForm<RegisterShinkaiDesktopInstallationForm>({
    resolver: zodResolver(RegisterShinkaiDesktopInstallationFormSchema),
    defaultValues: {
      address: '',
      signature: subscriptionsProof?.[0],
      combined: subscriptionsProof?.[1],
    },
  });

  const { mutateAsync: registerShinkaiDesktopInstallation, isPending } =
    useGalxeRegisterShinkaiDesktopInstallationMutation({
      onSuccess: () => {
        toast.success(t('galxe.success.registerDesktopInstallation'));
      },
      onError: (error) => {
        toast.error(t('galxe.errors.registerDesktopInstallation'), {
          description: error?.response?.data?.message ?? error.message,
        });
      },
    });

  const register = (values: RegisterShinkaiDesktopInstallationForm) => {
    registerShinkaiDesktopInstallation({ ...values });
  };

  useEffect(() => {
    form.setValue('signature', subscriptionsProof?.[0] ?? '');
    form.setValue('combined', subscriptionsProof?.[1] ?? '');
  }, [subscriptionsProof, form]);

  const isValidSubscriptions = isUserSubscribeToKnowledge && isUserAskQuestions;

  return (
    <div className="flex grow flex-col space-y-4">
      <span className="text-gray-80 inline-flex items-center gap-1 px-1 py-2.5 hover:text-white">
        <a
          className={cn(
            buttonVariants({
              size: 'auto',
              variant: 'link',
            }),
            'rounded-lg p-0 text-xs text-inherit underline',
          )}
          href={`#`}
          rel="noreferrer"
          target="_blank"
        >
          {t('galxe.goToGalxeQuest')}
        </a>
        <ExternalLinkIcon className="h-4 w-4" />
      </span>
      {isValidSubscriptions ? (
        <Form {...form}>
          <form
            className="flex flex-col justify-between space-y-8"
            onSubmit={form.handleSubmit(register)}
          >
            <div className="flex grow flex-col space-y-5">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <TextField
                    classes={{
                      input: 'font-mono',
                    }}
                    endAdornment={
                      <div className="w-8">
                        <CopyToClipboardIcon
                          className="peer/adornment adornment absolute right-1 top-4 rounded-md border border-gray-200 bg-gray-300 px-2"
                          string={field.value}
                        />
                      </div>
                    }
                    field={{ ...field }}
                    helperMessage={t('galxe.form.evmAddressHelper')}
                    label={t('galxe.form.evmAddress')}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="signature"
                render={({ field }) => (
                  <TextField
                    classes={{
                      input: 'font-mono',
                    }}
                    endAdornment={
                      <div className="w-8">
                        <CopyToClipboardIcon
                          className="peer/adornment adornment absolute right-1 top-4 rounded-md border border-gray-200 bg-gray-300 px-2"
                          string={field.value}
                        />
                      </div>
                    }
                    field={{ ...field, readOnly: true }}
                    label={t('galxe.form.signature')}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="combined"
                render={({ field }) => (
                  <TextField
                    classes={{
                      input: 'font-mono',
                    }}
                    endAdornment={
                      <div className="w-8">
                        <CopyToClipboardIcon
                          className="peer/adornment adornment absolute right-1 top-4 rounded-md border border-gray-200 bg-gray-300 px-2"
                          string={field.value}
                        />
                      </div>
                    }
                    field={{ ...field, readOnly: true }}
                    label={t('galxe.form.proof')}
                  />
                )}
              />

              <Button
                className="w-full"
                disabled={isPending}
                isLoading={isPending}
                type="submit"
              >
                Validate
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <Alert className="shadow-lg" variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm font-medium">
            Subscription Quest
          </AlertTitle>
          <AlertDescription className="text-xs">
            <p>
              Please make sure you have subscribed to Knowledge Sources and Ask
              Questions. You can do this by exploring the{' '}
              <Link className="underline" to="/public-subscriptions">
                Subscription Knowledge
              </Link>
              .
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
