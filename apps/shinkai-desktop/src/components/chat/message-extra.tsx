import { PaymentTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';
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

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function MessageExtra({
  name,
  metadata,
}: {
  name: string;
  metadata: PaymentTool | any;
}) {
  console.log(metadata, 'name');
  if (name === 'payment' || metadata != null) {
    return <Payment data={metadata} />;
  }
  return null;
}

function Payment({ data }: { data: PaymentTool }) {
  const [selectedPlan, setSelectedPlan] = React.useState<
    'one-time' | 'download' | 'both'
  >('one-time');

  const [status, setStatus] = React.useState<
    'idle' | 'pending' | 'success' | 'error'
  >('error');

  const auth = useAuth((state) => state.auth);
  const { mutateAsync: payInvoice } = usePayInvoice({
    onSuccess: () => {
      setStatus('success');
    },
    onError: () => {
      setStatus('error');
    },
  });

  const handleConfirmPayment = () => {
    setStatus('pending');
    setTimeout(() => {
      setStatus('success');
    }, 1000);
  };

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
                <CardTitle className="text-center text-lg font-semibold">
                  {data.toolKey}
                </CardTitle>
                <CardDescription className="text-center text-xs">
                  {data.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <RadioGroup
                  className="grid grid-cols-2 gap-4"
                  onValueChange={(value) =>
                    setSelectedPlan(value as 'one-time' | 'download' | 'both')
                  }
                  value={selectedPlan}
                >
                  {!!data.usageType.PerUse && (
                    <div className="relative">
                      <RadioGroupItem
                        className="peer sr-only"
                        id="one-time"
                        value="one-time"
                      />
                      <Label
                        className="hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-brand [&:has([data-state=checked])]:border-brand flex w-full flex-col items-center justify-between rounded-md border-2 border-gray-400 bg-gray-500 p-4"
                        htmlFor="one-time"
                      >
                        <span className="text-2xl font-semibold">
                          {data.usageType.PerUse === 'Free'
                            ? 'Free'
                            : 'Payment' in data.usageType.PerUse
                              ? data.usageType.PerUse.Payment.amount
                              : data.usageType.PerUse.DirectDelegation}
                        </span>
                        <span className="text-gray-100">one-time use</span>
                      </Label>
                    </div>
                  )}
                  {!!data.usageType.Downloadable && (
                    <div className="relative">
                      <RadioGroupItem
                        className="peer sr-only"
                        id="download"
                        value="download"
                      />
                      <Label
                        className="hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-brand [&:has([data-state=checked])]:border-brand flex w-full flex-col items-center justify-between rounded-md border-2 border-gray-400 bg-gray-500 p-4"
                        htmlFor="download"
                      >
                        <span className="text-2xl font-semibold">
                          {data.usageType.Downloadable === 'Free'
                            ? 'Free'
                            : 'Payment' in data.usageType.Downloadable
                              ? data.usageType.Downloadable.Payment.amount
                              : data.usageType.Downloadable.DirectDelegation}
                        </span>
                        <span className="text-gray-100">for download</span>
                      </Label>
                    </div>
                  )}
                </RadioGroup>
                <div className="mx-auto flex max-w-sm flex-col gap-2 py-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-100">Wallet Address</span>
                    <span className="text-white">
                      {truncateAddress(
                        '0x1234567890123456789012345678901234567890',
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-100">Wallet Balance</span>
                    <span className="text-white">1000</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <div className="flex justify-between gap-2">
                  <Button
                    className="mx-auto min-w-[200px] rounded-md"
                    onClick={handleConfirmPayment}
                    size="sm"
                    variant="ghost"
                  >
                    No, thanks
                  </Button>
                  <Button
                    className="mx-auto min-w-[200px] rounded-md"
                    onClick={() => {
                      if (!auth) return;
                      payInvoice({
                        nodeAddress: auth.node_address,
                        token: auth.api_v2_key,
                        payload: {
                          invoice_id:
                            '1234567890123456789012345678901234567890',
                          data_for_tool: {
                            plan: selectedPlan,
                          },
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
                    setStatus('idle');
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
