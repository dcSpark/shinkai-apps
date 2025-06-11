import {
  type ShinkaiToolHeader,
  type ToolOffering,
  type ToolUsageType,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useSetToolOffering } from '@shinkai_network/shinkai-node-state/v2/mutations/setToolOffering/useSetToolOffering';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import { useGetToolsWithOfferings } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsWithOfferings/useGetToolsWithOfferings';
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
} from '@shinkai_network/shinkai-ui';
import { useState, useMemo } from 'react';
import { useAuth } from '../../store/auth';

export default function PublishAgentDialog() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ShinkaiToolHeader | null>(null);
  const [payTo, setPayTo] = useState('');
  const [asset, setAsset] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const auth = useAuth((s) => s.auth);

  const { data: tools } = useGetTools({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    category: 'default',
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
      (tools ?? []).filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [tools, search],
  );

  const { mutateAsync: publish, isPending } = useSetToolOffering({
    onSuccess: () => {
      setOpen(false);
      setSelected(null);
      setPayTo('');
      setAsset('');
      setAmount('');
      setDescription('');
    },
  });

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

    const offering: ToolOffering = {
      meta_description: description,
      tool_key: selected.tool_router_key,
      usage_type: usage,
    };

    await publish({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      offering,
    });
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Publish Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px]">
        {selected ? (
          <>
            <DialogHeader>
              <DialogTitle>Publish {selected.name}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-2">
              <Input
                placeholder="Payment Address"
                value={payTo}
                onChange={(e) => setPayTo(e.target.value)}
              />
              <Input
                placeholder="Asset"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
              />
              <Input
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Back
              </Button>
              <Button onClick={handlePublish} isLoading={isPending}>
                Publish
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Select Agent</DialogTitle>
            </DialogHeader>
            <SearchInput
              placeholder="Search agents"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              classNames={{ input: 'bg-transparent' }}
            />
            <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
              {filtered?.map((tool) => (
                <div
                  key={tool.tool_router_key}
                  className="hover:bg-official-gray-800 flex items-center justify-between gap-2 rounded p-2"
                >
                  <div>
                    <p className="text-sm font-medium">{tool.name}</p>
                    <p className="text-official-gray-400 line-clamp-1 text-xs">
                      {tool.description}
                    </p>
                  </div>
                  {publishedKeys.has(tool.tool_router_key) ? (
                    <Button size="sm" variant="secondary" disabled>
                      Published
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setSelected(tool)}>
                      Publish
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
