import {
  PaymentRequest,
  WidgetToolData,
  WidgetToolType,
} from '@shinkai_network/shinkai-message-ts/api/general/types';
import { usePayInvoice } from '@shinkai_network/shinkai-node-state/v2/mutations/payInvoice/usePayInvoice';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@shinkai_network/shinkai-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import React from 'react';

import { useAuth } from '../../store/auth';
import { useToolsStore } from './context/tools-context';

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatAmount = (amount: string, decimals = 18): string => {
  const value = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;

  if (fractionalPart === BigInt(0)) {
    return integerPart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractionalStr = fractionalStr.replace(/0+$/, '');

  return `${integerPart}.${trimmedFractionalStr}`;
};

export default function MessageExtra() {
  const widget = useToolsStore((state) => state.widget);
  console.log(widget, 'widget');
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
  const [selectedPlan, setSelectedPlan] = React.useState<
    'one-time' | 'download' | 'both'
  >('one-time');

  const [status, setStatus] = React.useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');

  const auth = useAuth((state) => state.auth);
  const { mutateAsync: payInvoice } = usePayInvoice({
    onSuccess: () => {
      setStatus('success');
    },
    onError: () => {
      setStatus('error');
    },
  });

  const hasPerUse = !!data?.usage_type?.PerUse;
  const hasDownload = !!data?.usage_type?.Downloadable;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="-mt-7 mb-4 ml-10 min-h-[300px] max-w-3xl rounded-xl border border-gray-300 p-2"
      exit={{ opacity: 0, y: -20 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mx-auto flex h-full max-w-xl flex-col items-center justify-center border-0">
        <AnimatePresence mode="popLayout">
          {status === 'idle' && (
            <motion.div
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={{ y: 8, opacity: 0, filter: 'blur(4px)' }}
              initial={{ y: -32, opacity: 0, filter: 'blur(4px)' }}
              key="idle"
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            >
              <CardHeader className="space-y-1">
                <CardTitle className="font-clash text-center text-xl font-medium">
                  {/*{data.toolKey}*/}
                </CardTitle>
                <CardDescription className="text-center text-xs">
                  {data.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <RadioGroup
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
                                  data.usage_type.PerUse.Payment[0].amount,
                                  data.usage_type.PerUse.Payment[0].asset
                                    .decimals,
                                )} ${
                                  data.usage_type.PerUse.Payment[0].asset
                                    .asset_id
                                }
                                  `
                              : data.usage_type.PerUse.DirectDelegation}
                        </span>
                        <span className="text-gray-100">one-time use</span>
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
                                    .amount,
                                  data.usage_type.Downloadable.Payment[0].asset
                                    .decimals,
                                )} ${
                                  data.usage_type.Downloadable.Payment[0].asset
                                    .asset_id
                                }
                                  `
                              : data.usage_type.Downloadable.DirectDelegation}
                        </span>
                        <span className="text-gray-100">for download</span>
                      </Label>
                    </div>
                  )}
                </RadioGroup>
                <div className="mx-auto flex max-w-sm flex-col gap-2 py-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-100">Author</span>
                    <span className="text-white">
                      {data.invoice.provider_name}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-100">Wallet Address</span>
                    <span className="text-white">
                      {truncateAddress(data.invoice.address.address_id)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-100">Wallet Balances</span>
                    <div className="text-white">
                      {data.wallet_balances.data.map((balance) => (
                        <div
                          className="text-right"
                          key={balance.asset.asset_id}
                        >
                          {formatAmount(balance.amount, balance.asset.decimals)}{' '}
                          {balance.asset.asset_id}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <div className="flex justify-between gap-2">
                  <Button
                    className="mx-auto min-w-[200px] rounded-md"
                    onClick={onCancel}
                    size="sm"
                    variant="ghost"
                  >
                    No, thanks
                  </Button>
                  <Button
                    className="mx-auto min-w-[200px] rounded-md"
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
                    size="sm"
                  >
                    Confirm Payment
                  </Button>
                </div>
              </CardFooter>
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
              <CardContent className="flex flex-col items-center justify-center gap-2 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <span className="text-gray-80 ml-2">Processing payment...</span>
              </CardContent>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              initial={{ y: -32, opacity: 0, filter: 'blur(4px)' }}
              key="success"
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            >
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <span className="mt-4 text-lg font-semibold text-white">
                    Payment Successful!
                  </span>
                  <span className="mt-2 text-sm text-gray-100">
                    Thank you for your purchase.
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button
                  className="mx-auto min-w-[200px] rounded-md"
                  onClick={() => {
                    onCancel();
                  }}
                  size="sm"
                  variant="ghost"
                >
                  Dismiss
                </Button>
              </CardFooter>
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
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <XCircle className="h-12 w-12 text-red-500" />
                  <span className="mt-4 text-lg font-semibold text-white">
                    Payment Failed!
                  </span>
                  <span className="mt-2 text-sm text-gray-100">
                    Please try again.
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
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
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
