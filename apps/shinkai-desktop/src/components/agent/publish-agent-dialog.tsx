import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { type Agent } from '@shinkai_network/shinkai-message-ts/api/agents/types';
import {
  type ToolOffering,
  type ToolUsageType,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useSetToolOffering } from '@shinkai_network/shinkai-node-state/v2/mutations/setToolOffering/useSetToolOffering';
import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import { useGetToolsWithOfferings } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsWithOfferings/useGetToolsWithOfferings';
import { useGetWalletList } from '@shinkai_network/shinkai-node-state/v2/queries/getWalletList/useGetWalletList';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  SearchInput,
  Input,
  Textarea,
} from '@shinkai_network/shinkai-ui';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../store/auth';

export default function PublishAgentDialog() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Agent | null>(null);
  const [payTo, setPayTo] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const auth = useAuth((s) => s.auth);
  const { t } = useTranslation();

  const { data: walletInfo } = useGetWalletList({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { data: agents } = useGetAgents({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { data: offerings } = useGetToolsWithOfferings({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const publishedKeys = useMemo(
    () => new Set((offerings ?? []).map((o) => o.tool_offering.tool_key)),
    [offerings],
  );

  const filtered = useMemo(
    () =>
      (agents ?? []).filter((agent) =>
        agent.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [agents, search],
  );

  const asset = 'USDC';

  const { mutateAsync: publish, isPending } = useSetToolOffering({
            extra: { name: asset, version: '2' },
      Downloadable: 'Free',
      setSelected(null);
      setPayTo('');
      setAmount('');
      setDescription('');
    },
  });

    if (selected && walletInfo?.payment_wallet?.data?.address?.address_id) {
      setPayTo(walletInfo.payment_wallet.data.address.address_id);
    }
  }, [selected, walletInfo]);

  const handlePublish = async () => {
    if (!selected) return;
    const usage: ToolUsageType = {
      PerUse: {
        Payment: [
          {
            scheme: 'exact',
            mimeType: 'application/json',
            asset: asset,
            outputSchema: {},
            resource: 'https://shinkai.com',
            extra: { name: asset, version: '1' },
            payTo: payTo,
            description: description,
            maxTimeoutSeconds: 300,
            network: 'base-sepolia',
            maxAmountRequired: amount,
          },
        ],
      },
      Downloadable: { Payment: [] },
    };

    if (!selected.tools.length) return;
    const offering: ToolOffering = {
      meta_description: description,
      tool_key: selected.tools[0],
      usage_type: usage,
    };

    await publish({
      nodeAddress: auth?.node_address ?? '',
              <p className="text-official-gray-400 text-sm">
                {t('agents.publishDialog.amountHelper')}
              </p>
              <p className="text-official-gray-400 text-sm">
                {t('agents.publishDialog.descriptionHelper')}
              </p>
      token: auth?.api_v2_key ?? '',
      offering,
    });
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t('agents.publishDialog.open')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px]">
        {selected ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {t('agents.publishDialog.title', { name: selected.name })}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-2">
              <Input
                placeholder={t('agents.publishDialog.paymentAddress')}
                value={payTo}
                disabled
                readOnly
              />
              <Input
                placeholder={t('agents.publishDialog.amount')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Textarea
                placeholder={t('agents.publishDialog.description')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                resize="vertical"
                className="!min-h-[100px]"
              />
            </div>
            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelected(null)}>
                {t('common.back')}
              </Button>
              <Button onClick={handlePublish} isLoading={isPending}>
                {t('agents.publishDialog.publish')}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('agents.publishDialog.selectAgent')}</DialogTitle>
            </DialogHeader>
            <SearchInput
              placeholder={t('agents.publishDialog.searchAgents')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              classNames={{ input: 'bg-transparent' }}
            />
            <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
              {filtered?.map((agent) => (
                <div
                  key={agent.agent_id}
                  className="hover:bg-official-gray-800 flex items-center justify-between gap-2 rounded p-2"
                >
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-official-gray-400 line-clamp-1 text-xs">
                      {agent.ui_description}
                    </p>
                  </div>
                  {publishedKeys.has(agent.tools[0]) ? (
                    <Button size="sm" variant="secondary" disabled>
                      {t('agents.publishDialog.published')}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setSelected(agent)}>
                      {t('agents.publishDialog.publish')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
