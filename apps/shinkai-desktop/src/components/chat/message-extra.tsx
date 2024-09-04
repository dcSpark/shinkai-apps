import { PaymentTool } from '@shinkai_network/shinkai-message-ts/api/tools/types';
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
import { CheckCircle, Loader2 } from 'lucide-react';
import React from 'react';

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
  >('idle');

  const handleConfirmPayment = () => {
    setStatus('pending');
    setTimeout(() => {
      setStatus('success');
    }, 1000);
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="-mt-7 mb-4 ml-10 min-h-[250px] max-w-4xl rounded-xl border border-gray-300 p-1"
      exit={{ opacity: 0, y: -20 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mx-auto max-w-xl border-0">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="idle"
              transition={{ duration: 0.2 }}
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
            </motion.div>
          )}

          {status === 'pending' && (
            <motion.div
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="pending"
              transition={{ duration: 0.2 }}
            >
              <CardContent className="mt-16 flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <span className="text-gray-80 ml-2">Processing payment...</span>
              </CardContent>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              initial={{ opacity: 0, scale: 0.8 }}
              key="success"
              transition={{ duration: 0.3 }}
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
            </motion.div>
          )}
        </AnimatePresence>
        <CardFooter className="flex justify-center">
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between gap-2"
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: 10 }}
                key="idle-button"
                transition={{ duration: 0.2 }}
              >
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
                  onClick={handleConfirmPayment}
                  size="sm"
                >
                  Confirm Payment
                </Button>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
                exit={{ opacity: 0, scale: 0.8 }}
                initial={{ opacity: 0, scale: 0.8 }}
                key="success-button"
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
