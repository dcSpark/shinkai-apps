import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { httpClient } from '@shinkai_network/shinkai-message-ts/http-client';
import { urlJoin } from '@shinkai_network/shinkai-message-ts/utils/url-join';
import { InternetAccessFormSchema, internetAccessSchema } from '@shinkai_network/shinkai-node-state/forms/settings/internet-access';
import { Button, Card, CardContent, CardHeader, Form, FormField, TextField } from '@shinkai_network/shinkai-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '../store/auth';
import { SimpleLayout } from './layout/simple-layout';

const InternetAccessPage = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const [isRunning, setIsRunning] = useState(false);
  const [tunnelUrl, setTunnelUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InternetAccessFormSchema>({
    resolver: zodResolver(internetAccessSchema),
    defaultValues: {
      authtoken: '',
    },
  });

  const authToken = form.watch('authtoken');

  useEffect(() => {
    const checkStatus = async () => {
      if (!auth) return;
      
      try {
        const response = await httpClient.get(
          urlJoin(auth.node_address, '/v2/get_ngrok_status'),
          {
            headers: { Authorization: `Bearer ${auth.api_v2_key}` },
            responseType: 'json',
          },
        );
        // Debug: log the response to see the structure
        console.log('Ngrok status response:', response.data);
        // API returns { authtoken: string, enabled: boolean, tunnel?: string }
        setIsRunning(response.data.enabled);
        setTunnelUrl(response.data.tunnel);
        // Populate auth token if it exists in the response
        if (response.data.authtoken) {
          form.setValue('authtoken', response.data.authtoken);
        }
        setError(undefined);
      } catch (err) {
        console.error('Failed to get tunnel status:', err);
        // setError(err instanceof Error ? err.message : 'Failed to get tunnel status');
        // Keep previous status if fetch fails, to avoid flickering, or set to a known "error" state
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [auth, form]);

  const handleStartTunnel = async () => {
    if (!auth || isLoading) return;
    
    try {
      setIsLoading(true);
      setError(undefined);
      // 1. Set Auth Token
      await httpClient.post(
        urlJoin(auth.node_address, '/v2/set_ngrok_auth_token'),
        { auth_token: authToken },
        {
          headers: { Authorization: `Bearer ${auth.api_v2_key}` },
          responseType: 'json',
        },
      );

      // 2. Enable Tunnel
      const enableResponse = await httpClient.post(
        urlJoin(auth.node_address, '/v2/set_ngrok_enabled'),
        { enabled: true },
        {
          headers: { Authorization: `Bearer ${auth.api_v2_key}` },
          responseType: 'json',
        },
      );

      // API returns { tunnel: string } when enabled
      setIsRunning(true);
      setTunnelUrl(enableResponse.data.tunnel);
    } catch (err: any) {
      console.error('Failed to start tunnel:', err);
      const errorMessage = err?.response?.data?.detail || err?.message || t('settings.internetAccess.errors.failedToStart');
      setError(errorMessage);
      setIsRunning(false);
      setTunnelUrl(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopTunnel = async () => {
    if (!auth || isLoading) return;
    
    try {
      setIsLoading(true);
      setError(undefined);
      await httpClient.post(
        urlJoin(auth.node_address, '/v2/set_ngrok_enabled'),
        { enabled: false },
        {
          headers: { Authorization: `Bearer ${auth.api_v2_key}` },
          responseType: 'json',
        },
      );
      setIsRunning(false);
      setTunnelUrl(undefined);
    } catch (err: any) {
      console.error('Failed to stop tunnel:', err);
      const errorMessage = err?.response?.data?.detail || err?.message || t('settings.internetAccess.errors.failedToStop');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SimpleLayout classname="max-w-xl" title={t('settings.internetAccess.title')}>
      <div className="mb-6 flex items-center justify-between">
        <p>{t('settings.internetAccess.description')}</p>
      </div>
      <div className="flex flex-col space-y-8 pr-2.5">
        <div className="flex flex-col space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-white">{t('settings.internetAccess.overview.title')}</h2>
            <p className="text-official-gray-400 text-sm">
              {t('settings.internetAccess.overview.description')}&nbsp;
              <a className="text-official-gray-400 text-sm underline" href="https://dashboard.ngrok.com/login" rel="noopener noreferrer" target="_blank">{t('settings.internetAccess.overview.signUpLink')}</a>.
            </p>
          </div>

          <Form {...form}>
            <form className="flex grow flex-col justify-between space-y-6 overflow-hidden">
              <FormField
                control={form.control}
                name="authtoken"
                render={({ field }) => (
                  <TextField
                    field={{
                      ...field,
                      placeholder: t('settings.internetAccess.form.authTokenPlaceholder')
                    }}
                    label={t('settings.internetAccess.form.authToken')}
                    type="password"
                  />
                )}
              />

              {error && (
                <div className="rounded-lg bg-red-100 p-4 text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                {!isRunning ? (
                  <Button 
                    className="w-full" 
                    disabled={isLoading}
                    isLoading={isLoading}
                    onClick={handleStartTunnel} 
                    size="sm" 
                    type="button"
                  >
                    {t('settings.internetAccess.form.startInternetAccess')}
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    disabled={isLoading}
                    isLoading={isLoading}
                    onClick={handleStopTunnel} 
                    size="sm" 
                    type="button" 
                    variant="destructive"
                  >
                    {t('settings.internetAccess.form.stopInternetAccess')}
                  </Button>
                )}
              </div>
            </form>
          </Form>

          <Card className="bg-official-gray-950 w-full">
            <CardHeader className="space-y-1">
              <h3 className="text-base font-semibold">
                {t('settings.internetAccess.status.title')}
              </h3>
            </CardHeader>

            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('settings.internetAccess.status.statusLabel')}</span>
                <span className={`font-medium ${isRunning ? 'text-green-400' : 'text-official-gray-500'}`}>
                  {isRunning ? t('settings.internetAccess.status.enabled') : t('settings.internetAccess.status.notEnabled')}
                </span>
              </div>
              { isRunning && (
                <div className="flex justify-between text-sm">
                  <span>{t('settings.internetAccess.status.tunnelUrlLabel')}</span>
                  <span className={`font-medium ${isRunning ? 'text-green-400' : 'text-official-gray-500'}`}>{tunnelUrl}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default InternetAccessPage; 