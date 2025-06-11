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
import { useGetWalletBalance } from '@shinkai_network/shinkai-node-state/v2/queries/getWalletBalance/useGetWalletBalance';
import { useGetWalletList } from '@shinkai_network/shinkai-node-state/v2/queries/getWalletList/useGetWalletList';
import {
  Badge,
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CopyToClipboardIcon,
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
  Separator,
  Switch,
  Textarea,
  TextField,
} from '@shinkai_network/shinkai-ui';
import {
  AddCryptoWalletIcon,
  CryptoWalletIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { useMeasure } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowLeft,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  PlusIcon,
  RefreshCw,
  Wallet,
  XIcon,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  useWalletsStore,
  WalletCreateConnectView,
} from '../components/crypto-wallet/context/wallets-context';
import { useAuth } from '../store/auth';
import { SimpleLayout } from './layout/simple-layout';

function formatBalance(amount: string, decimals: number): string {
  const balance = Number.parseFloat(amount) / Math.pow(10, decimals);
  return balance.toFixed(decimals === 18 ? 6 : 2);
}

const CryptoWalletPage = () => {
  const { t } = useTranslation();

  const auth = useAuth((state) => state.auth);

  const { data: walletInfo } = useGetWalletList({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const walletExist =
    walletInfo?.payment_wallet || walletInfo?.receiving_wallet;

  const { data: walletBalance } = useGetWalletBalance(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
    },
    { enabled: !!walletExist },
  );

  return (
    <SimpleLayout
      classname="container"
      headerRightElement={
        walletExist ? (
          <div className="flex items-center gap-3">
            <Link
              to="/network-ai-agents"
              className={cn(
                buttonVariants({
                  variant: 'outline',
                  size: 'sm',
                }),
              )}
            >
              Explore Network Agents
            </Link>
            <CreateWalletDialog buttonLabel="Update Wallet" />
          </div>
        ) : null
      }
      title={walletExist ? 'My Wallet' : t('settings.cryptoWallet.title')}
    >
      {walletExist ? (
        <>
          <div className="min-h-screen py-5">
            <div className="mx-auto space-y-6">
              <Card>
                <CardContent className="space-y-4 pt-5">
                  <div className="space-y-2">
                    <div className="text-official-gray-400 text-sm font-medium">
                      Wallet Address
                    </div>
                    <div className="flex items-center gap-3">
                      <code className="font-mono text-base">
                        {walletInfo?.payment_wallet?.data?.address?.address_id}
                      </code>
                      <CopyToClipboardIcon
                        string={
                          walletInfo?.payment_wallet?.data?.address?.address_id
                        }
                        className="size-4"
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-official-gray-400 text-sm font-medium">
                      Network
                    </div>
                    <p className="text-base text-white">
                      {formatText(walletInfo?.payment_wallet?.data?.network)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-6 pt-5">
                  <div className="text-base font-medium">Assets</div>
                  <div className="space-y-4">
                    {/* ETH */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full border bg-black">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="#fff"
                              d="M12 3v6.65l5.625 2.516zm0 0-5.625 9.166L12 9.651zm0 13.477v4.522l5.625-7.784zM12 21v-4.523l-5.625-3.262z"
                            />
                            <path
                              fill="#fff"
                              d="m12 15.43 5.625-3.263L12 9.65zm-5.625-3.263L12 15.429V9.651z"
                            />
                            <path
                              fill="#fff"
                              fill-rule="evenodd"
                              d="m12 15.429-5.625-3.263L12 3l5.625 9.166zM6.749 11.9l5.161-8.41v6.115zm-.077.23 5.238-2.327v5.364zm5.418-2.327v5.364l5.233-3.038zm0-.198 5.16 2.295-5.16-8.41z"
                              clip-rule="evenodd"
                            />
                            <path
                              fill="#fff"
                              fill-rule="evenodd"
                              d="M12 16.406 6.375 13.21 12 21l5.625-7.79zm-4.995-2.633 4.905 2.79v4.005zm5.085 2.79v4.005l4.905-6.795z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Ethereum</div>
                          <div className="text-muted-foreground text-sm">
                            ETH
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatBalance(
                            walletBalance?.ETH.amount ?? '0',
                            walletBalance?.ETH.decimals ?? 0,
                          )}{' '}
                          ETH
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full border bg-black">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="#fff"
                              fill-rule="evenodd"
                              d="M12 21c4.99 0 9-4.01 9-9s-4.01-9-9-9-9 4.01-9 9 4.01 9 9 9m2.475-7.578c0-1.31-.787-1.76-2.362-1.946-1.125-.152-1.35-.45-1.35-.978 0-.523.377-.86 1.125-.86.675 0 1.052.224 1.237.787.04.112.152.185.265.185h.596a.256.256 0 0 0 .264-.259v-.039c-.152-.827-.827-1.614-1.687-1.687v-.827c0-.152-.113-.265-.298-.298h-.495c-.152 0-.293.112-.332.298v.827c-1.125.151-1.873 1.012-1.873 1.951 0 1.238.748 1.722 2.323 1.913 1.052.185 1.39.41 1.39 1.012 0 .597-.53 1.013-1.238 1.013-.98 0-1.316-.416-1.429-.979-.034-.146-.146-.225-.259-.225h-.641a.256.256 0 0 0-.259.264v.04c.146.934.748 1.575 1.986 1.76v.833c0 .152.112.253.298.293h.54c.146 0 .248-.102.287-.293v-.833c1.125-.185 1.912-.939 1.912-1.952m-6.262 2.803a5.6 5.6 0 0 0 1.875 1.135c.112.079.225.225.225.338v.528c0 .073 0 .113-.04.146-.033.152-.185.225-.337.152a6.751 6.751 0 0 1 0-12.864c.04-.034.112-.034.152-.034.152.034.225.147.225.298v.524c0 .19-.073.303-.225.376a5.55 5.55 0 0 0-3.336 3.336 5.59 5.59 0 0 0 1.46 6.065m5.514-10.413c.034-.152.186-.225.338-.152a6.8 6.8 0 0 1 4.387 4.427c1.125 3.56-.827 7.352-4.387 8.477-.04.033-.113.033-.152.033-.152-.033-.225-.146-.225-.298v-.523c0-.191.073-.303.225-.377a5.55 5.55 0 0 0 3.335-3.335 5.585 5.585 0 0 0-3.335-7.2c-.113-.079-.225-.225-.225-.377v-.523c0-.079 0-.113.04-.152"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">USD Coin</div>
                          <div className="text-muted-foreground text-sm">
                            USDC
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatBalance(
                            walletBalance?.USDC.amount ?? '0',
                            walletBalance?.USDC.decimals ?? 0,
                          )}{' '}
                          USDC
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Received USDC</div>
                        <div className="text-muted-foreground text-xs">
                          2 hours ago
                        </div>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        +9.98 USDC
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Received ETH</div>
                        <div className="text-muted-foreground text-xs">
                          1 day ago
                        </div>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        +0.003 ETH
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center">
          <div className="col-span-4 flex flex-col items-center justify-center gap-3 rounded-md p-6">
            <AddCryptoWalletIcon />
            <div className="flex flex-col items-center text-center">
              <h2 className="text-lg font-medium">
                {t('settings.cryptoWallet.emptyState.title')}
              </h2>
              <p className="text-official-gray-400 text-sm">
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
  const previousHeightRef = useRef<number | null>(null);

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
              {/* <Button
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
                  <div className="text-official-gray-400 text-sm">
                    MPC Wallets provides better recovery and stronger security
                    in crypto wallets.
                  </div>
                </div>
              </Button> */}
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
                  <div className="text-official-gray-400 text-sm">
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
                  <div className="text-official-gray-400 text-sm">
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
                  <div className="text-official-gray-400 text-sm">
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
                  <div className="text-official-gray-400 text-sm">
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
                  <div className="text-official-gray-400 text-sm">
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
                  <div className="text-official-gray-400 text-sm">
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
        <Button size="sm">{buttonLabel}</Button>
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
              className="absolute top-6 left-4"
              onClick={handleBack}
              size="icon"
              variant="tertiary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <DialogClose asChild>
            <Button
              className="absolute top-6 right-4"
              size="icon"
              variant="tertiary"
            >
              <XIcon className="text-official-gray-400 h-5 w-5" />
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
                    'text-official-gray-400 space-y-1 text-sm leading-none',
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
                    <SelectItem value="base-sepolia">Base Sepolia</SelectItem>
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
          {/*      <Label className="text-official-gray-400 pb-2 pl-2 text-xs">*/}
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
                    <SelectItem value="base-sepolia">Base Sepolia</SelectItem>
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
