import {
  type PaymentRequest,
  type WidgetToolData,
  type WidgetToolType,
} from '@shinkai_network/shinkai-message-ts/api/general/types';
import { usePayInvoice } from '@shinkai_network/shinkai-node-state/v2/mutations/payInvoice/usePayInvoice';
import { Button, Dialog, DialogContent } from '@shinkai_network/shinkai-ui';
import { CryptoWalletIcon } from '@shinkai_network/shinkai-ui/assets';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, ExternalLinkIcon, Loader2, XCircle } from 'lucide-react';
import React from 'react';

import { useAuth } from '../../store/auth';
import {
  formatBalanceAmount,
  getBasescanAddressUrl,
  truncateAddress,
} from '../crypto-wallet/utils';
import { useToolsStore } from './context/tools-context';

export default function MessageExtra() {
  const widget = useToolsStore((state) => state.widget);
  const setWidget = useToolsStore((state) => state.setWidget);
  const name = widget?.name as WidgetToolType;
  const metadata = widget?.data as WidgetToolData;

  if (metadata == null || name == null) return null;

  if (name === 'PaymentRequest' && 'invoice' in metadata) {
    return <Payment data={metadata} onCancel={() => setWidget(null)} />;
  }

  return null;
}

function Payment({
  data,
  onCancel,
}: {
  data: PaymentRequest;
  onCancel: () => void;
}) {
  // const [selectedPlan, setSelectedPlan] = React.useState<
  //   'one-time' | 'download' | 'both'
  // >('one-time');

  const [open, setOpen] = React.useState(true);

  const [status, setStatus] = React.useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');

  const auth = useAuth((state) => state.auth);
  const { mutateAsync: payInvoice } = usePayInvoice({
    onSuccess: () => {
      setStatus('success');
      setTimeout(() => {
        setOpen(false);
      }, 4000);
    },
    onError: () => {
      setStatus('error');
    },
  });

  // const hasPerUse = !!data?.usage_type?.PerUse;
  // const hasDownload = !!data?.usage_type?.Downloadable;

  const token = data.wallet_balances.data.find((balance) => {
    const payment =
      data.usage_type?.PerUse &&
      typeof data.usage_type.PerUse === 'object' &&
      'Payment' in data.usage_type.PerUse
        ? data.usage_type.PerUse.Payment?.[0]
        : undefined;
    return payment?.extra.name === balance.asset.asset_id;
  })?.asset;

  const tokenDecimals = token?.decimals;
  const tokenId = token?.asset_id;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-full max-w-lg"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="min-h-[300px] max-w-3xl rounded-xl"
          exit={{ opacity: 0, y: -20 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="size-full">
            <AnimatePresence mode="popLayout">
              {status === 'idle' && (
                <motion.div
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: 8, opacity: 0, filter: 'blur(4px)' }}
                  initial={{ y: -32, opacity: 0, filter: 'blur(4px)' }}
                  key="idle"
                  className="space-y-6"
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                >
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-center text-base font-medium">
                      <CryptoWalletIcon /> Tool Payment Required
                    </div>
                    <p className="text-sm">
                      This tool requires payment to use.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-official-gray-850 rounded-lg p-4">
                      <h4 className="mb-3 font-medium">Network Tool Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-official-gray-400">Tool:</span>
                          <span>{data.tool_key}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-official-gray-400">
                            Author:
                          </span>
                          <span>{data.invoice.provider_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-official-gray-400">
                            Cost per use:
                          </span>
                          <span className="font-semibold text-white">
                            {data.usage_type.PerUse === 'Free'
                              ? 'Free'
                              : 'Payment' in data.usage_type.PerUse
                                ? `${formatBalanceAmount(
                                    data.usage_type.PerUse.Payment[0]
                                      .maxAmountRequired ?? '0',
                                    tokenDecimals,
                                  )} ${tokenId}
                                  `
                                : data.usage_type.PerUse.DirectDelegation}
                          </span>
                        </div>
                        {data.usage_type?.PerUse &&
                          typeof data.usage_type.PerUse === 'object' &&
                          'Payment' in data.usage_type.PerUse &&
                          data.usage_type.PerUse.Payment?.[0].payTo && (
                            <div className="flex justify-between">
                              <span className="text-official-gray-400">
                                Payment Recipient:
                              </span>
                              <span className="inline-flex items-center gap-1 text-white">
                                {truncateAddress(
                                  data.usage_type?.PerUse &&
                                    typeof data.usage_type.PerUse ===
                                      'object' &&
                                    'Payment' in data.usage_type.PerUse
                                    ? (data.usage_type.PerUse.Payment?.[0]
                                        .payTo ?? '')
                                    : '',
                                )}
                                <a
                                  href={getBasescanAddressUrl(
                                    data.usage_type?.PerUse &&
                                      typeof data.usage_type.PerUse ===
                                        'object' &&
                                      'Payment' in data.usage_type.PerUse
                                      ? (data.usage_type.PerUse.Payment?.[0]
                                          .payTo ?? '')
                                      : '',
                                    data.usage_type?.PerUse &&
                                      typeof data.usage_type.PerUse ===
                                        'object' &&
                                      'Payment' in data.usage_type.PerUse
                                      ? (data.usage_type.PerUse.Payment?.[0]
                                          .network ?? '')
                                      : '',
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-official-gray-400 ml-1 hover:text-white"
                                >
                                  <ExternalLinkIcon className="h-4 w-4" />
                                </a>
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                    {/* <RadioGroup
                  className="flex items-center justify-center gap-4"
                  onValueChange={(value) =>
                    setSelectedPlan(value as 'one-time' | 'download' | 'both')
                  }
                  value={selectedPlan}
                >
                  {hasPerUse && (
                    <div className="relative max-w-[200px] flex-1">
                      <RadioGroupItem
                        className="peer sr-only"
                        id="one-time"
                        value="one-time"
                      />
                      <Label
                        className="hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-brand [&:has([data-state=checked])]:border-brand flex w-full flex-col items-center justify-between rounded-md border-2 border-gray-400 bg-gray-500 p-4"
                        htmlFor="one-time"
                      >
                        <span className="font-clash text-2xl font-semibold">
                          {data.usage_type.PerUse === 'Free'
                            ? 'Free'
                            : 'Payment' in data.usage_type.PerUse
                              ? `${formatAmount(
                                  data.usage_type.PerUse.Payment[0]
                                    .maxAmountRequired ?? '0',
                                  tokenDecimals,
                                )} ${tokenId}
                                  `
                              : data.usage_type.PerUse.DirectDelegation}
                        </span>
                        <span className="text-official-gray-400">
                          one-time use
                        </span>
                      </Label>
                    </div>
                  )}
                  {hasDownload && (
                    <div className="relative max-w-[200px] flex-1">
                      <RadioGroupItem
                        className="peer sr-only"
                        id="download"
                        value="download"
                      />
                      <Label
                        className="hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-brand [&:has([data-state=checked])]:border-brand flex w-full flex-col items-center justify-between rounded-md border-2 border-gray-400 bg-gray-500 p-4"
                        htmlFor="download"
                      >
                        <span className="font-clash text-xl font-semibold">
                          {data.usage_type.Downloadable === 'Free'
                            ? 'Free'
                            : 'Payment' in data.usage_type.Downloadable
                              ? `${formatAmount(
                                  data.usage_type.Downloadable.Payment[0]
                                    .maxAmountRequired ?? '0',
                                  tokenDecimals,
                                )} ${tokenId}
                                  `
                              : data.usage_type.Downloadable.DirectDelegation}
                        </span>
                        <span className="text-gray-100">for download</span>
                      </Label>
                    </div>
                  )}
                </RadioGroup> */}
                    <div className="bg-official-gray-850 rounded-lg p-4">
                      <h4 className="mb-2 font-medium">Your Wallet</h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-official-gray-400">
                            Wallet Address:
                          </span>
                          <div className="flex flex-col items-end justify-start gap-2">
                            {truncateAddress(data.invoice.address.address_id)}
                          </div>
                        </div>
                        <div className="flex items-start justify-between text-sm">
                          <span className="text-official-gray-400">
                            USDC Balance:
                          </span>
                          <div className="flex flex-col items-end justify-start gap-0.5">
                            {data.wallet_balances.data.map((balance) => (
                              <div
                                className="text-right"
                                key={balance.asset.asset_id}
                              >
                                {formatBalanceAmount(
                                  balance.amount,
                                  balance.asset.decimals,
                                )}{' '}
                                <span className="text-official-gray-200 font-medium">
                                  {balance.asset.asset_id}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto flex max-w-xs items-center justify-between gap-2">
                    <Button
                      className="flex-1"
                      onClick={onCancel}
                      size="md"
                      variant="outline"
                    >
                      No, thanks
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={async () => {
                        if (!auth) return;
                        setStatus('pending');
                        await payInvoice({
                          nodeAddress: auth.node_address,
                          token: auth.api_v2_key,
                          payload: {
                            invoice_id: data.invoice.invoice_id,
                            data_for_tool: data.function_args,
                          },
                        });
                      }}
                      size="md"
                    >
                      Confirm Payment
                    </Button>
                  </div>
                </motion.div>
              )}

              {status === 'pending' && (
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full pt-12"
                  exit={{ opacity: 0, scale: 0.8 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  key="pending"
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col items-center justify-center pt-8">
                    <Loader2 className="mb-4 size-8 animate-spin text-cyan-500" />
                    <span className="mb-2 text-lg text-white">
                      Processing payment
                    </span>
                    <p className="text-official-gray-400 text-sm">
                      Please wait while we process your transaction...
                    </p>
                  </div>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  initial={{ y: -32, opacity: 0, filter: 'blur(4px)' }}
                  key="success"
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                >
                  <div className="mx-auto flex max-w-sm flex-col items-center justify-center pt-8 text-center">
                    <CheckCircle className="mb-4 size-8 text-green-500" />
                    <span className="mb-2 text-lg font-semibold text-white">
                      Payment Successful!
                    </span>
                    <span className="text-official-gray-400 mb-10 text-sm">
                      Your payment went through successfully. The tool is now
                      executing...
                    </span>
                    <Button
                      className="mx-auto min-w-[200px] rounded-md"
                      onClick={() => {
                        onCancel();
                      }}
                      size="sm"
                      variant="outline"
                    >
                      Dismiss
                    </Button>
                  </div>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: 8, opacity: 0, filter: 'blur(4px)' }}
                  initial={{ y: -32, opacity: 0, filter: 'blur(4px)' }}
                  key="success"
                  transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                >
                  <div>
                    <div className="flex flex-col items-center justify-center py-8">
                      <XCircle className="mb-4 size-8 text-red-500" />
                      <span className="mb-2 text-lg font-semibold text-white">
                        Payment Failed!
                      </span>
                      <span className="text-official-gray-400 text-sm">
                        Please try again.
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button
                      className="mx-auto min-w-[200px] rounded-md"
                      onClick={() => {
                        setStatus('idle');
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      Go back
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
