import { zodResolver } from '@hookform/resolvers/zod';
import { DialogClose } from '@radix-ui/react-dialog';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  NetworkIdentifier,
  WalletRole,
} from '@shinkai_network/shinkai-message-ts/api/wallets';
import { useCreateLocalWallet } from '@shinkai_network/shinkai-node-state/v2/mutations/createLocalWallet/useCreateLocalWallet';
import { useRestoreCoinbaseMpcWallet } from '@shinkai_network/shinkai-node-state/v2/mutations/restoreCoinbaseMpcWallet/useRestoreCoinbaseMpcWallet';
import { useRestoreLocalWallet } from '@shinkai_network/shinkai-node-state/v2/mutations/restoreLocalWallet/useRestoreLocalWallet';
import { useGetWalletList } from '@shinkai_network/shinkai-node-state/v2/queries/getWalletList/useGetWalletList';
import {
  Badge,
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
  FormLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  TextField,
} from '@shinkai_network/shinkai-ui';
import {
  AddCryptoWalletIcon,
  CryptoWalletIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { useMeasure } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, PlusIcon, XIcon } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  useWalletsStore,
  WalletCreateConnectView,
} from '../components/crypto-wallet/context/wallets-context';
import { useAuth } from '../store/auth';
import { SimpleLayout } from './layout/simple-layout';

const CryptoWalletPage = () => {
  const { t } = useTranslation();

  const auth = useAuth((state) => state.auth);

  const { data: walletInfo } = useGetWalletList({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const walletExist =
    walletInfo?.payment_wallet || walletInfo?.receiving_wallet;

  return (
    <SimpleLayout
      classname="max-w-4xl "
      headerRightElement={
        walletExist ? <CreateWalletDialog buttonLabel="Update Wallet" /> : null
      }
      title={t('settings.cryptoWallet.title')}
    >
      {walletExist ? (
        <div className="mt-6 flex w-full items-center justify-between gap-4 rounded-md border border-gray-200 px-6 py-3">
          <span className="rounded-md bg-gray-300 p-2">
            <CryptoWalletIcon className="size-4" />
          </span>
          <div className="flex-1 space-y-1">
            <h2 className="text-sm font-medium">
              {walletInfo?.payment_wallet.data.network.display_name}
              {walletInfo?.payment_wallet.data.network.is_testnet && (
                <Badge className="ml-2" variant="tags">
                  Testnet
                </Badge>
              )}
            </h2>
            <p className="text-gray-80 text-sm">
              {walletInfo?.payment_wallet?.data?.address?.address_id}
            </p>
          </div>
          <span className="text-gray-80 text-xs">
            -{' '}
            {walletInfo?.payment_wallet?.data?.network?.native_asset?.asset_id}
          </span>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center">
          <div className="col-span-4 flex flex-col items-center justify-center gap-3 rounded-md p-6">
            <AddCryptoWalletIcon />
            <div className="flex flex-col items-center text-center">
              <h2 className="text-lg font-medium">
                {t('settings.cryptoWallet.emptyState.title')}
              </h2>
              <p className="text-gray-80 text-sm">
                {t('settings.cryptoWallet.emptyState.description')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CreateWalletDialog buttonLabel="Setup Wallet" />
            </div>
          </div>
        </div>
      )}
    </SimpleLayout>
  );
};

const CreateWalletDialog = ({ buttonLabel }: { buttonLabel: string }) => {
  const [elementRef, bounds] = useMeasure();
  const previousHeightRef = useRef<number | null>();

  const openWalletCreationModal = useWalletsStore(
    (state) => state.openWalletCreationModal,
  );
  const setOpenWalletCreationModal = useWalletsStore(
    (state) => state.setOpenWalletCreationModal,
  );
  const resetWalletCreation = useWalletsStore(
    (state) => state.resetWalletCreation,
  );
  const walletCreationView = useWalletsStore(
    (state) => state.walletCreationView,
  );
  const setWalletCreationView = useWalletsStore(
    (state) => state.setWalletCreationView,
  );

  const handleBack = () => {
    if (walletCreationView === WalletCreateConnectView.MpcRestore) {
      setWalletCreationView(WalletCreateConnectView.Mpc);
      return;
    }
    if (
      walletCreationView === WalletCreateConnectView.RegularMnemonic ||
      walletCreationView === WalletCreateConnectView.RegularPrivateKey ||
      walletCreationView === WalletCreateConnectView.RegularCreate
    ) {
      setWalletCreationView(WalletCreateConnectView.Regular);
      return;
    }
    setWalletCreationView(WalletCreateConnectView.Main);
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
    switch (walletCreationView) {
      case WalletCreateConnectView.Main:
        return (
          <div>
            <DialogHeader>
              <DialogTitle className="text-center">
                Create / Connect Wallet
              </DialogTitle>
            </DialogHeader>
            <div className="mt-8 space-y-3">
              <Button
                className="flex h-[auto] w-full items-center justify-start gap-4 rounded-md bg-gray-500/20 px-5 py-2.5 text-left hover:bg-gray-200"
                onClick={() =>
                  setWalletCreationView(WalletCreateConnectView.Mpc)
                }
                variant="outline"
              >
                <AddCryptoWalletIcon className="size-5" />
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
                className="flex h-[auto] w-full items-center justify-start gap-4 rounded-md bg-gray-500/20 px-5 py-2.5 text-left hover:bg-gray-200"
                onClick={() =>
                  setWalletCreationView(WalletCreateConnectView.Regular)
                }
                variant="outline"
              >
                <AddCryptoWalletIcon className="size-5" />
                <div>
                  <div className="text-sm font-semibold">Hot Wallet</div>
                  <div className="text-gray-80 text-sm">
                    Use a hot wallet to store your cryptocurrency assets.
                  </div>
                </div>
              </Button>
            </div>
          </div>
        );
      case WalletCreateConnectView.Mpc:
        return (
          <div>
            <DialogHeader>
              <DialogTitle className="text-center">MPC Wallet</DialogTitle>
            </DialogHeader>
            <div className="mt-8 space-y-3">
              <a
                className={cn(
                  buttonVariants({
                    variant: 'tertiary',
                    className:
                      'flex h-[auto] w-full items-center justify-start gap-4 rounded-md bg-gray-500/20 px-5 py-2.5 text-left hover:bg-gray-200',
                  }),
                )}
                href="https://portal.cdp.coinbase.com/access/api"
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
                className="flex h-[auto] w-full items-center justify-start gap-4 rounded-md bg-gray-500/20 px-5 py-2.5 text-left hover:bg-gray-200"
                onClick={() =>
                  setWalletCreationView(WalletCreateConnectView.MpcRestore)
                }
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
      case WalletCreateConnectView.Regular:
        return (
          <div>
            <DialogHeader>
              <DialogTitle className="text-center">Regular Wallet</DialogTitle>
            </DialogHeader>
            <div className="mt-8 space-y-3">
              <Button
                className="flex h-[auto] w-full items-center justify-start gap-4 rounded-md bg-gray-500/20 px-5 py-2.5 text-left hover:bg-gray-200"
                onClick={() =>
                  setWalletCreationView(WalletCreateConnectView.RegularCreate)
                }
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
                className="flex h-[auto] w-full items-center justify-start gap-4 rounded-md bg-gray-500/20 px-5 py-2.5 text-left hover:bg-gray-200"
                onClick={() =>
                  setWalletCreationView(WalletCreateConnectView.RegularMnemonic)
                }
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
                className="flex h-[auto] w-full items-center justify-start gap-4 rounded-md bg-gray-500/20 px-5 py-2.5 text-left hover:bg-gray-200"
                onClick={() =>
                  setWalletCreationView(
                    WalletCreateConnectView.RegularPrivateKey,
                  )
                }
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
      case WalletCreateConnectView.MpcRestore:
        return <MpcRestoreWallet />;
      case WalletCreateConnectView.RegularCreate:
        return <RegularCreateWallet />;
      case WalletCreateConnectView.RegularMnemonic:
        return <RegularRestoreWalletMnemonic />;
      case WalletCreateConnectView.RegularPrivateKey:
        return <RegularRestoreWalletPrivateKey />;
      default:
        throw new Error('Invalid view');
    }
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          resetWalletCreation();
          return;
        }
        setOpenWalletCreationModal(open);
      }}
      open={openWalletCreationModal}
    >
      <DialogTrigger asChild>
        <Button className="min-w-[150px] gap-2 px-3" size="sm">
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <motion.div
          animate={{
            height: bounds.height ?? 0,
            transition: {
              duration: 0.27,
              ease: [0.25, 1, 0.5, 1],
            },
          }}
        >
          {walletCreationView !== WalletCreateConnectView.Main && (
            <Button
              className="absolute left-4 top-6"
              onClick={handleBack}
              size="icon"
              variant="tertiary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <DialogClose asChild>
            <Button
              className="absolute right-4 top-6"
              size="icon"
              variant="tertiary"
            >
              <XIcon className="text-gray-80 h-5 w-5" />
            </Button>
          </DialogClose>
          <div className="px-2 pt-2.5 antialiased" ref={elementRef}>
            <AnimatePresence
              custom={walletCreationView}
              initial={false}
              mode="popLayout"
            >
              <motion.div
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                initial={{ opacity: 0, scale: 0.96 }}
                key={walletCreationView}
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
    defaultValues: {
      serverSigner: false,
    },
  });
  const resetWalletCreation = useWalletsStore(
    (state) => state.resetWalletCreation,
  );

  const { mutateAsync: restoreCoinbaseMPCWallet } = useRestoreCoinbaseMpcWallet(
    {
      onSuccess: () => {
        toast.success('MPC Wallet restored successfully');
        resetWalletCreation();
      },
      onError: (error) => {
        toast.error('Error restoring MPC wallet', {
          description: error?.response?.data?.message ?? error.message,
        });
      },
    },
  );
  console.log(form.formState);
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
        <form
          className="flex flex-col gap-6 pt-8"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => <TextField field={field} label="Name" />}
          />
          <FormField
            control={form.control}
            name="privateKey"
            render={({ field }) => (
              <TextField field={field} label="Private Key" type="password" />
            )}
          />
          <FormField
            control={form.control}
            name="walletId"
            render={({ field }) => (
              <TextField field={field} label="Wallet ID" />
            )}
          />

          <FormField
            control={form.control}
            name="serverSigner"
            render={({ field }) => (
              <FormItem className="mt-4 flex flex-row items-center justify-start space-x-3 py-1">
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
                  <label htmlFor="custom-model">Enable Server Signer</label>
                </div>
              </FormItem>
            )}
          />
          <div className="flex justify-end pt-6">
            <div className="flex justify-end gap-2">
              <Button className="min-w-[100px] flex-1" size="sm" type="submit">
                {t('common.restore')}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export const regularRestoreWalletMnemonicFormSchema = z.object({
  role: z.string().min(1),
  network: z.string().min(1),
  mnemonic: z.string().min(1),
});

export type RegularRestoreWalletMnemonicFormSchema = z.infer<
  typeof regularRestoreWalletMnemonicFormSchema
>;

const RegularRestoreWalletMnemonic = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const resetWalletCreation = useWalletsStore(
    (state) => state.resetWalletCreation,
  );
  const form = useForm<RegularRestoreWalletMnemonicFormSchema>({
    resolver: zodResolver(regularRestoreWalletMnemonicFormSchema),
    defaultValues: {
      network: NetworkIdentifier.BaseSepolia,
      role: WalletRole.Both,
    },
  });

  const { mutateAsync: restoreLocalWallet } = useRestoreLocalWallet({
    onSuccess: () => {
      toast.success('Wallet restored successfully');
      resetWalletCreation();
    },
    onError: (error) => {
      toast.error('Error restoring wallet', {
        description: error?.response?.data?.message ?? error.message,
      });
    },
  });

  const handleSubmit = async (data: RegularRestoreWalletMnemonicFormSchema) => {
    await restoreLocalWallet({
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      network: data.network as NetworkIdentifier,
      role: data.role as WalletRole,
      mnemonic: data.mnemonic,
    });
  };
  return (
    <div>
      <DialogHeader>
        <DialogTitle className="text-center">Import Secret Phrase</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form
          className="flex flex-col gap-6 pt-8"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FormField
            control={form.control}
            name="mnemonic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secret Recovery Phrase</FormLabel>
                <FormControl>
                  <Textarea
                    className="!min-h-[130px] resize-none text-sm"
                    spellCheck={false}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-6">
            <div className="flex justify-end gap-2">
              <Button className="min-w-[100px] flex-1" size="sm" type="submit">
                {t('common.restore')}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export const regularRestoreWalletPrivateKeyFormSchema = z.object({
  role: z.string().min(1),
  network: z.string().min(1),
  privateKey: z.string().min(1),
});

export type RegularRestoreWalletPrivateKeyFormSchema = z.infer<
  typeof regularRestoreWalletPrivateKeyFormSchema
>;

const RegularRestoreWalletPrivateKey = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const resetWalletCreation = useWalletsStore(
    (state) => state.resetWalletCreation,
  );

  const form = useForm<RegularRestoreWalletPrivateKeyFormSchema>({
    resolver: zodResolver(regularRestoreWalletPrivateKeyFormSchema),
    defaultValues: {
      network: NetworkIdentifier.BaseSepolia,
      role: WalletRole.Both,
    },
  });

  const { mutateAsync: restoreLocalWallet } = useRestoreLocalWallet({
    onSuccess: () => {
      toast.success('Wallet restored successfully');
      resetWalletCreation();
    },
    onError: (error) => {
      toast.error('Error restoring wallet', {
        description: error?.response?.data?.message ?? error.message,
      });
    },
  });

  const handleSubmit = async (
    data: RegularRestoreWalletPrivateKeyFormSchema,
  ) => {
    await restoreLocalWallet({
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      network: data.network as NetworkIdentifier,
      role: data.role as WalletRole,
      privateKey: data.privateKey,
    });
  };
  return (
    <div>
      <DialogHeader>
        <DialogTitle className="text-center">Import Private Key</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form
          className="flex flex-col gap-6 pt-8"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FormField
            control={form.control}
            name="network"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select a network</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value="BaseSepolia">Base Sepolia</SelectItem>
                    <SelectItem disabled value="disabled">
                      Other networks coming up soon
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          {/*<FormField*/}
          {/*  control={form.control}*/}
          {/*  name="role"*/}
          {/*  render={({ field }) => (*/}
          {/*    <div className="space-y-1.5">*/}
          {/*      <Label className="text-gray-80 pb-2 pl-2 text-xs">*/}
          {/*        Select account type*/}
          {/*      </Label>*/}
          {/*      <FormItem>*/}
          {/*        <FormControl>*/}
          {/*          <RadioGroup*/}
          {/*            className="grid grid-cols-3 gap-4"*/}
          {/*            id="account-type"*/}
          {/*            onValueChange={(value) => field.onChange(value)}*/}
          {/*            value={field.value || ''}*/}
          {/*          >*/}
          {/*            {[*/}
          {/*              {*/}
          {/*                label: 'Payment',*/}
          {/*                value: WalletRole.Payment,*/}
          {/*                Icon: ArrowUpFromLine,*/}
          {/*              },*/}
          {/*              {*/}
          {/*                label: 'Receive',*/}
          {/*                value: WalletRole.Receiving,*/}
          {/*                Icon: ArrowDownToLine,*/}
          {/*              },*/}
          {/*              {*/}
          {/*                label: 'Both',*/}
          {/*                value: WalletRole.Both,*/}
          {/*                Icon: ArrowLeftRight,*/}
          {/*              },*/}
          {/*            ].map(({ label, value, Icon }) => (*/}
          {/*              <div key={label}>*/}
          {/*                <RadioGroupItem*/}
          {/*                  className="peer sr-only"*/}
          {/*                  id={value}*/}
          {/*                  value={value}*/}
          {/*                />*/}
          {/*                <Label*/}
          {/*                  className="peer-data-[state=checked]:border-brand [&:has([data-state=checked])]:border-brand hover:bg-gray-450 flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-gray-200 bg-gray-400 p-4 transition-colors hover:text-white"*/}
          {/*                  htmlFor={value}*/}
          {/*                >*/}
          {/*                  <Icon className="mb-3 h-6 w-6" />*/}
          {/*                  {label}*/}
          {/*                </Label>*/}
          {/*              </div>*/}
          {/*            ))}*/}
          {/*          </RadioGroup>*/}
          {/*        </FormControl>*/}
          {/*      </FormItem>*/}
          {/*    </div>*/}
          {/*  )}*/}
          {/*/>*/}
          <FormField
            control={form.control}
            name="privateKey"
            render={({ field }) => (
              <TextField field={field} label="Private Key" type="password" />
            )}
          />

          <div className="flex justify-end pt-6">
            <div className="flex justify-end gap-2">
              <Button className="min-w-[100px] flex-1" size="sm" type="submit">
                {t('common.restore')}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export const regularCreateWalletFormSchema = z.object({
  role: z.string().min(1),
  network: z.string().min(1),
});

export type RegularCreateWalletFormSchema = z.infer<
  typeof regularCreateWalletFormSchema
>;

const RegularCreateWallet = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const resetWalletCreation = useWalletsStore(
    (state) => state.resetWalletCreation,
  );

  const form = useForm<RegularCreateWalletFormSchema>({
    resolver: zodResolver(regularCreateWalletFormSchema),
    defaultValues: {
      network: NetworkIdentifier.BaseSepolia,
      role: WalletRole.Both,
    },
  });

  const { mutateAsync: createLocalWallet } = useCreateLocalWallet({
    onSuccess: () => {
      toast.success('Wallet created successfully');
      resetWalletCreation();
    },
    onError: (error) => {
      toast.error('Error creating wallet', {
        description: error?.response?.data?.message ?? error.message,
      });
    },
  });

  const handleSubmit = async (data: RegularCreateWalletFormSchema) => {
    await createLocalWallet({
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      network: data.network as NetworkIdentifier,
      role: data.role as WalletRole,
    });
  };
  return (
    <div>
      <DialogHeader>
        <DialogTitle className="text-center">Create Wallet</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form
          className="flex flex-col gap-6 pt-8"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FormField
            control={form.control}
            name="network"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select a network</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value="BaseSepolia">Base Sepolia</SelectItem>
                    <SelectItem disabled value="disabled">
                      Other networks coming up soon
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <div className="flex justify-end pt-6">
            <div className="flex justify-end gap-2">
              <Button className="min-w-[100px] flex-1" size="sm" type="submit">
                {t('common.create')}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CryptoWalletPage;
