import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  QuickConnectFormSchema,
  quickConnectFormSchema,
} from '@shinkai_network/shinkai-node-state/forms/auth/quick-connection';
import { useSubmitRegistrationNoCode } from '@shinkai_network/shinkai-node-state/lib/mutations/submitRegistation/useSubmitRegistrationNoCode';
import { useGetEncryptionKeys } from '@shinkai_network/shinkai-node-state/lib/queries/getEncryptionKeys/useGetEncryptionKeys';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  ErrorMessage,
  Form,
  FormField,
  TextField,
} from '@shinkai_network/shinkai-ui';
import {
  submitRegistrationNoCodeError,
  submitRegistrationNoCodeNonPristineError,
} from '@shinkai_network/shinkai-ui/helpers';
// import { QrCode } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { SetupData, useAuth } from '../../store/auth/auth';
import { ConnectionMethodOption } from '../connection-method-option/connection-method-option';
import { Header } from '../header/header';

export const ConnectMethodQuickStart = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation() as {
    state: { nodeAddress: string };
  };
  const setAuth = useAuth((state) => state.setAuth);
  const DEFAULT_NODE_ADDRESS =
    location.state?.nodeAddress ?? 'http://127.0.0.1:9550';
  const { encryptionKeys, isLoading: isLoadingEncryptionKeys } =
    useGetEncryptionKeys();
  const form = useForm<QuickConnectFormSchema>({
    resolver: zodResolver(quickConnectFormSchema),
    defaultValues: {
      registration_name: 'main_device',
      node_address: DEFAULT_NODE_ADDRESS,
    },
  });
  const {
    isPending,
    mutateAsync: submitRegistrationNoCode,
    isError: isSubmitError,
    error: submitError,
  } = useSubmitRegistrationNoCode({
    onSuccess: (response, setupPayload) => {
      if (response.status === 'success' && encryptionKeys) {
        const authData: SetupData = {
          ...encryptionKeys,
          ...setupPayload,
          permission_type: '',
          shinkai_identity:
            form.getValues().shinkai_identity ||
            (response.data?.node_name ?? ''),
          node_signature_pk: response.data?.identity_public_key ?? '',
          node_encryption_pk: response.data?.encryption_public_key ?? '',
        };
        setAuth(authData);
        navigate('/inboxes');
      } else if (response.status === 'non-pristine') {
        submitRegistrationNoCodeNonPristineError();
      } else {
        submitRegistrationNoCodeError();
      }
    },
  });

  useEffect(() => {
    form.setValue('node_address', DEFAULT_NODE_ADDRESS);
  }, [DEFAULT_NODE_ADDRESS, form]);

  const connect = async (values: QuickConnectFormSchema) => {
    if (!encryptionKeys) {
      return;
    }
    await submitRegistrationNoCode({
      profile: 'main',
      node_address: values.node_address,
      registration_name: values.registration_name,
      ...encryptionKeys,
    });
  };

  // const selectQRCodeMethod = () => {
  //   history.push('/nodes/connect/method/qr-code');
  // };
  const selectRestoreMethod = () => {
    navigate('/nodes/connect/method/restore-connection');
  };

  return (
    <div className="flex h-full flex-col justify-between gap-6 overflow-auto pr-2">
      <div>
        <Header
          description={'Use address to connect for first time'}
          title={
            <>
              {t('quickConnection.label')} <span aria-hidden>⚡</span>
            </>
          }
        />
        <Form {...form}>
          <form
            className="mt-8 space-y-5"
            onSubmit={form.handleSubmit(connect)}
          >
            <div className="flex flex-col justify-between gap-2">
              <FormField
                control={form.control}
                name="node_address"
                render={({ field }) => (
                  <TextField
                    field={field}
                    label={t('shinkaiNode.nodeAddress')}
                  />
                )}
              />

              <Accordion collapsible type="single">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="pl-2">
                    Advanced options
                  </AccordionTrigger>

                  <AccordionContent className="flex flex-col justify-between space-y-2 pb-0">
                    <FormField
                      control={form.control}
                      name="registration_name"
                      render={({ field }) => (
                        <TextField field={field} label="Device Nickname" />
                      )}
                    />
                    {/*<FormField*/}
                    {/*  control={form.control}*/}
                    {/*  name="shinkai_identity"*/}
                    {/*  render={({ field }) => (*/}
                    {/*    <TextField*/}
                    {/*      field={field}*/}
                    {/*      label={<FormattedMessage id="shinkai-identity" />}*/}
                    {/*    />*/}
                    {/*  )}*/}
                    {/*/>*/}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {isSubmitError && (
                <ErrorMessage
                  data-testid="quick-connect-error-message"
                  message={submitError?.message}
                />
              )}
            </div>
            <Button
              className="w-full"
              data-testid="quick-connect-button"
              disabled={isPending || isLoadingEncryptionKeys}
              isLoading={isPending}
              type="submit"
            >
              {t('common.connect')}
            </Button>
          </form>
        </Form>
        <div className="text-gray-80 space-y-4 py-8 pt-12 text-center text-sm">
          {/*<p>*/}
          {/*  Don’t have an account?{' '}*/}
          {/*  <a*/}
          {/*    className="font-semibold text-white underline"*/}
          {/*    href="https://www.shinkai.com/sign-up"*/}
          {/*    rel="noreferrer"*/}
          {/*    target={'_blank'}*/}
          {/*  >*/}
          {/*    Sign up*/}
          {/*  </a>*/}
          {/*</p>*/}
          <p>
            Already have an account?{' '}
            <a
              className="font-semibold text-white underline"
              href="https://www.shinkai.com/user"
              rel="noreferrer"
              target={'_blank'}
            >
              Click here to connect
            </a>
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        {/*<ConnectionMethodOption*/}
        {/*  description={*/}
        {/*    <FormattedMessage id="qr-code-connection-connection-method-description" />*/}
        {/*  }*/}
        {/*  icon={<QrCode className="text-gray-100" />}*/}
        {/*  onClick={() => selectQRCodeMethod()}*/}
        {/*  title={*/}
        {/*    <FormattedMessage id="qr-code-connection-connection-method-title" />*/}
        {/*  }*/}
        {/*/>*/}

        <ConnectionMethodOption
          description={t('restoreConnection.description')}
          icon={
            <span aria-hidden className="text-base">
              🔑
            </span>
          }
          onClick={() => selectRestoreMethod()}
          title={t('restoreConnection.restore')}
        />
      </div>
    </div>
  );
};
