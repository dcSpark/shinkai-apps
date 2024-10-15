import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  NetworkIdentifier,
  WalletRole,
} from '@shinkai_network/shinkai-message-ts/api/wallets';
import { useRestoreCoinbaseMpcWallet } from '@shinkai_network/shinkai-node-state/v2/mutations/restoreCoinbaseMpcWallet/useRestoreCoinbaseMpcWallet';
import {
  Button,
  buttonVariants,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  Input,
  Label,
  Switch,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { CryptoWalletIcon } from '@shinkai_network/shinkai-ui/assets';
import { useMeasure } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, PlusIcon } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useAuth } from '../store/auth';
import { SimpleLayout } from './layout/simple-layout';

const CryptoWalletPage = () => {
  const { t } = useTranslation();
  const [elementRef, bounds] = useMeasure();
  const previousHeightRef = useRef<number | null>();

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<
    | 'main'
    | 'mpc'
    | 'mpc-restore'
    | 'regular'
    | 'regular-create'
    | 'regular-mnemonic'
    | 'regular-private-key'
  >('main');

  const handleBack = () => {
    if (view === 'mpc-restore') {
      setView('mpc');
      return;
    }
    if (view === 'regular-mnemonic' || view === 'regular-private-key') {
      setView('regular');
      return;
    }

    setView('main');
  };

  const opacityDuration = useMemo(() => {
    const currentHeight = bounds.height ?? 0;
    const previousHeight = previousHeightRef.current ?? 0;

    const MIN_DURATION = 0.15;
    const MAX_DURATION = 0.27;

    if (!previousHeightRef.current) {
      previousHeightRef.current = currentHeight;
      return MIN_DURATION;
    }

    const heightDifference = Math.abs(currentHeight - previousHeight);
    previousHeightRef.current = currentHeight;

    const duration = Math.min(
      Math.max(heightDifference / 500, MIN_DURATION),
      MAX_DURATION,
    );

    return duration;
  }, [bounds.height]);

  const renderContent = () => {
    switch (view) {
      case 'main':
        return (
          <div>
            <DialogHeader>
              <DialogTitle className="text-center">
                Create / Connect Wallet
              </DialogTitle>
            </DialogHeader>
            <div className="mt-8 space-y-3">
              <Button
                className="flex h-[auto] w-full items-center justify-start gap-4 rounded-md px-5 py-2.5 text-left"
                onClick={() => setView('mpc')}
                variant="outline"
              >
                <CryptoWalletIcon className="size-5" />
                <div>
                  <div className="text-sm font-semibold">
                    Multi-Party Computation Wallet{' '}
                  </div>
                  <div className="text-gray-80 text-sm">
                    MPC Wallets provides better recovery and stronger security
                    in crypto wallets.
                  </div>
                </div>
              </Button>
              <Button
                className="flex h-[auto] w-full items-center justify-start gap-4 rounded-md px-5 py-2.5 text-left"
                onClick={() => setView('regular')}
                variant="outline"
              >
                <CryptoWalletIcon className="size-5" />
                <div>
                  <div className="text-sm font-semibold">
                    {' '}
                    Traditional Wallet
                  </div>
                  <div className="text-gray-80 text-sm">
                    Use a traditional wallet to store your cryptocurrency
                    assets.
                  </div>
                </div>
              </Button>
            </div>
          </div>
        );
      case 'mpc':
        return (
          <div>
            <DialogHeader>
              <DialogTitle className="text-center">MPC Wallet</DialogTitle>
            </DialogHeader>
            <div className="mt-8 space-y-3">
              <a
                className={cn(
                  buttonVariants({
                    variant: 'outline',
                    className:
                      'flex h-[auto] w-full items-center justify-start gap-4 rounded-md px-5 py-2.5 text-left',
                  }),
                )}
                href="https://docs.cdp.coinbase.com/mpc-wallet/docs/welcome"
                rel="noreferrer"
                target="_blank"
              >
                <PlusIcon className="size-4 shrink-0" />
                <div>
                  <div className="text-sm font-semibold">Create New</div>
                  <div className="text-gray-80 text-sm">
                    Create a new MPC wallet to store your assets.
                  </div>
                </div>
              </a>
              <Button
                className="flex h-[auto] w-full items-center justify-start gap-4 rounded-md px-5 py-2.5 text-left"
                onClick={() => setView('mpc-restore')}
                variant="outline"
              >
                <Download className="size-4 shrink-0" />
                <div>
                  <div className="text-sm font-semibold">
                    {' '}
                    Import Private Key
                  </div>
                  <div className="text-gray-80 text-sm">
                    Restore to regain access to your cryptocurrency assets.
                  </div>
                </div>
              </Button>
            </div>
          </div>
        );
      case 'regular':
        return (
          <div>
            <DialogHeader>
              <DialogTitle className="text-center">Regular Wallet</DialogTitle>
            </DialogHeader>
            <div className="mt-8 space-y-3">
              <Button
                className="flex h-[auto] w-full items-center justify-start gap-4 rounded-md px-5 py-2.5 text-left"
                onClick={() => setView('mpc-restore')}
                variant="outline"
              >
                <PlusIcon className="size-4 shrink-0" />
                <div>
                  <div className="text-sm font-semibold">Create New</div>
                  <div className="text-gray-80 text-sm">
                    Create a new wallet to store your assets.
                  </div>
                </div>
              </Button>
              <Button
                className="flex h-[auto] w-full items-center justify-start gap-4 rounded-md px-5 py-2.5 text-left"
                onClick={() => setView('regular-mnemonic')}
                variant="outline"
              >
                <FileText className="size-4 shrink-0" />
                <div>
                  <div className="text-sm font-semibold">
                    {' '}
                    Import Secret Recovery Phrase
                  </div>
                  <div className="text-gray-80 text-sm">
                    Restore to regain access to your cryptocurrency assets.
                  </div>
                </div>
              </Button>
              <Button
                className="flex h-[auto] w-full items-center justify-start gap-4 rounded-md px-5 py-2.5 text-left"
                onClick={() => setView('regular-private-key')}
                variant="outline"
              >
                <Download className="size-4 shrink-0" />
                <div>
                  <div className="text-sm font-semibold">
                    {' '}
                    Import Private Key
                  </div>
                  <div className="text-gray-80 text-sm">
                    Restore to regain access to your cryptocurrency assets.
                  </div>
                </div>
              </Button>
            </div>
          </div>
        );
      case 'mpc-restore':
        return <MpcRestoreWallet />;
      case 'regular-mnemonic':
        return (
          <div>
            <DialogHeader>
              <DialogTitle className="text-center">
                Import Secret Phrase
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recoveryPhrase">Recovery Phrase</Label>
                <Input
                  id="recoveryPhrase"
                  placeholder="Enter your recovery phrase"
                />
              </div>
              <Button className="w-full">Restore Wallet</Button>
            </div>
          </div>
        );
      case 'regular-private-key':
        return (
          <div>
            <DialogHeader>
              <DialogTitle className="text-center">
                Import Private Key
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recoveryPhrase">Recovery Phrase</Label>
                <Input
                  id="recoveryPhrase"
                  placeholder="Enter your recovery phrase"
                />
              </div>
              <Button className="w-full">Restore Wallet</Button>
            </div>
          </div>
        );

      default:
        throw new Error('Invalid view');
    }
  };

  return (
    <SimpleLayout classname="max-w-lg" title={t('settings.cryptoWallet.title')}>
      <div className="flex h-full flex-col items-center justify-center">
        <div className="col-span-4 flex flex-col items-center justify-center gap-3 rounded-md p-6">
          <CryptoWalletIcon />
          <div className="flex flex-col items-center text-center">
            <h2 className="text-lg font-medium">
              {t('settings.cryptoWallet.emptyState.title')}
            </h2>
            <p className="text-gray-80 text-sm">
              {t('settings.cryptoWallet.emptyState.description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog onOpenChange={setIsOpen} open={isOpen}>
              <DialogTrigger asChild>
                <Button className="min-w-[150px] gap-2 px-3" size="sm">
                  <PlusIcon className="size-4" />
                  Setup Wallet{' '}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <motion.div
                  animate={{
                    height: bounds.height ?? 0,
                    transition: {
                      duration: 0.27,
                      ease: [0.25, 1, 0.5, 1],
                    },
                  }}
                >
                  {view !== 'main' && (
                    <Button
                      className="absolute left-4 top-4"
                      onClick={handleBack}
                      size="icon"
                      variant="ghost"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <div
                    className="px-2 pb-6 pt-2.5 antialiased"
                    ref={elementRef}
                  >
                    <AnimatePresence
                      custom={view}
                      initial={false}
                      mode="popLayout"
                    >
                      <motion.div
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        initial={{ opacity: 0, scale: 0.96 }}
                        key={view}
                        transition={{
                          duration: opacityDuration,
                          ease: [0.26, 0.08, 0.25, 1],
                        }}
                      >
                        {renderContent()}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
};

export const mpcRestoreWalletFormSchema = z.object({
  name: z.string().min(1),
  privateKey: z.string().min(1),
  walletId: z.string(),
  serverSigner: z.boolean(),
});

export type MpcRestoreWalletFormSchema = z.infer<
  typeof mpcRestoreWalletFormSchema
>;

const MpcRestoreWallet = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);

  const form = useForm<MpcRestoreWalletFormSchema>({
    resolver: zodResolver(mpcRestoreWalletFormSchema),
  });

  const { mutateAsync: restoreCoinbaseMPCWallet } = useRestoreCoinbaseMpcWallet(
    {
      onSuccess: (response) => {
        console.log('Wallet restored successfully:', response);
        toast.success(t('settings.cryptoWallet.successTitle'), {
          description: t('settings.cryptoWallet.successDescription'),
        });
      },
      onError: (error) => {
        console.error('Error restoring wallet:', error);
        toast.error(t('settings.cryptoWallet.errorTitle'), {
          description: t('settings.cryptoWallet.errorDescription'),
        });
      },
    },
  );

  const handleSubmit = async (data: MpcRestoreWalletFormSchema) => {
    await restoreCoinbaseMPCWallet({
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      network: NetworkIdentifier.BaseSepolia, // You might want to make this configurable
      name: data.name,
      privateKey: data.privateKey,
      walletId: data.walletId,
      useServerSigner: data.serverSigner.toString(),
      role: WalletRole.Both, // You might want to make this configurable
    });
  };
  return (
    <div>
      <DialogHeader>
        <DialogTitle className="text-center">Restore MPC Wallet</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => <TextField field={field} label="Name" />}
          />
          <FormField
            control={form.control}
            name="privateKey"
            render={({ field }) => (
              <TextField field={field} label="Private Key" />
            )}
          />
          <FormField
            control={form.control}
            name="walletId"
            render={({ field }) => (
              <TextField field={field} label="Wallet ID (optional)" />
            )}
          />
          <p className="mt-1 text-sm text-gray-400">
            {t('settings.cryptoWallet.walletIdOptional')}
          </p>
          <FormField
            control={form.control}
            name="serverSigner"
            render={({ field }) => (
              <FormItem className="mt-4 flex flex-row items-center justify-center space-x-3 py-1">
                <FormControl>
                  <Switch
                    checked={field.value}
                    id={'custom-model'}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div
                  className={cn(
                    'text-gray-80 space-y-1 text-sm leading-none',
                    field.value && 'text-white',
                  )}
                >
                  <label htmlFor="custom-model">Server Signer</label>
                </div>
              </FormItem>
            )}
          />
          {/*<div className="flex items-center space-x-2">*/}
          {/*  <Switch*/}
          {/*      checked={formData.serverSigner}*/}
          {/*      id="serverSigner"*/}
          {/*      onCheckedChange={handleSwitchChange}*/}
          {/*  />*/}
          {/*  <Label htmlFor="serverSigner">Server Signer</Label>*/}
          {/*</div>*/}
          <Button type="submit">{t('common.send')}</Button>
        </form>
      </Form>
    </div>
  );
};

export default CryptoWalletPage;
