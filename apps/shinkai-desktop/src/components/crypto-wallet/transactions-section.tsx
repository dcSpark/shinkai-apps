import { useEffect, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/plugin-shell';
import { Button } from '@shinkai_network/shinkai-ui';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Loader2 } from 'lucide-react';

interface Props {
  address: string;
  network: string; // BaseSepolia or BaseMainnet
  decimals: number;
  asset: string;
}

interface TxResponse {
  result?: Array<any>;
  status?: string;
}

export const TransactionsSection = ({
  address,
  network,
  decimals,
  asset,
}: Props) => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchTx = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoke<TxResponse>('fetch_transactions', {
        address,
        network,
        page,
      });
      setTransactions(res?.result ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [address, network, page]);

  useEffect(() => {
    fetchTx();
  }, [fetchTx]);

  const baseUrl =
    network === 'BaseSepolia'
      ? 'https://sepolia.basescan.org/tx/'
      : 'https://basescan.org/tx/';

  const formatValue = (val: string) => {
    try {
      return (Number(val) / Math.pow(10, decimals)).toFixed(4);
    } catch (_) {
      return val;
    }
  };

  return (
    <div className="mt-6 space-y-2">
      <h3 className="text-sm font-medium">
        {t('settings.cryptoWallet.recentTransactions')}
      </h3>
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="size-4 animate-spin" />
        </div>
      ) : (
        <div className="space-y-1 text-xs">
          {transactions.map((tx) => (
            <div
              key={tx.hash}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-md p-2 hover:bg-gray-300/20"
              onClick={() => open(baseUrl + tx.hash)}
            >
              <span className="truncate text-gray-100">
                {tx.hash.slice(0, 10)}...
              </span>
              <span className="text-gray-80">
                {formatValue(tx.value)} {asset}
              </span>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-gray-80 text-center">No transactions</div>
          )}
        </div>
      )}
      <div className="flex justify-between pt-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
        >
          Prev
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={transactions.length < 10}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
