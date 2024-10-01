import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useRestoreCoinbaseMpcWallet } from '@shinkai_network/shinkai-node-state/v2/mutations/restoreCoinbaseMpcWallet/useRestoreCoinbaseMpcWallet';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Switch,
} from '@shinkai_network/shinkai-ui';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '../store/auth';

interface CoinbaseCDPWalletForm {
  name: string;
  privateKey: string;
  walletId: string;
  serverSigner: boolean;
}

const CryptoWalletPage: React.FC = () => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CoinbaseCDPWalletForm>({
    name: '',
    privateKey: '',
    walletId: '',
    serverSigner: true,
  });
  const { mutateAsync: restoreCoinbaseMPCWallet } = useRestoreCoinbaseMpcWallet(
    {
      onSuccess: (response) => {
        console.log('Wallet restored successfully:', response);
        toast.success(t('settings.cryptoWallet.successTitle'), {
          description: t('settings.cryptoWallet.successDescription'),
        });
        setIsDialogOpen(false);
      },
      onError: (error) => {
        console.error('Error restoring wallet:', error);
        toast.error(t('settings.cryptoWallet.errorTitle'), {
          description: t('settings.cryptoWallet.errorDescription'),
        });
      },
    },
  );

  const handleAddCoinbaseCDPWallet = () => {
    setIsDialogOpen(true);
  };

  const handleAddLocalWallet = () => {
    // Implement Local Wallet integration logic here
    console.log('Adding Local Wallet');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, serverSigner: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting Coinbase CDP Wallet:', formData);

    await restoreCoinbaseMPCWallet({
      token: auth?.api_v2_key ?? '',
      nodeAddress: auth?.node_address ?? '',
      network: 'BaseSepolia', // You might want to make this configurable
      name: formData.name,
      privateKey: formData.privateKey,
      walletId: formData.walletId,
      useServerSigner: formData.serverSigner.toString(),
      role: 'Both', // You might want to make this configurable
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-4 text-center text-3xl font-bold text-white">
        {t('settings.cryptoWallet.title')}
      </h1>
      <p className="mb-8 text-center text-gray-200">
        {t('settings.cryptoWallet.description')}
      </p>
      <h2 className="mb-4 text-xl font-semibold text-white">
        {t('settings.cryptoWallet.addWallet')}
      </h2>
      <div className="flex justify-center space-x-4">
        <Button onClick={handleAddCoinbaseCDPWallet}>
          {t('settings.cryptoWallet.addCoinbaseCDPWallet')}
        </Button>
        <Button onClick={handleAddLocalWallet}>
          {t('settings.cryptoWallet.addLocalWallet')}
        </Button>
      </div>

      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('settings.cryptoWallet.addCoinbaseCDPWallet')}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                className="py-1"
                id="name"
                name="name"
                onChange={handleInputChange}
                required
                value={formData.name}
              />
            </div>
            <div>
              <Label htmlFor="privateKey">Private Key</Label>
              <Input
                className="py-1"
                id="privateKey"
                name="privateKey"
                onChange={handleInputChange}
                required
                type="password"
                value={formData.privateKey}
              />
            </div>
            <div>
              <Label htmlFor="walletId">Wallet ID (optional)</Label>
              <Input
                className="py-1"
                id="walletId"
                name="walletId"
                onChange={handleInputChange}
                value={formData.walletId}
              />
              <p className="mt-1 text-sm text-gray-400">
                {t('settings.cryptoWallet.walletIdOptional')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.serverSigner}
                id="serverSigner"
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="serverSigner">Server Signer</Label>
            </div>
            <Button type="submit">{t('common.send')}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CryptoWalletPage;
