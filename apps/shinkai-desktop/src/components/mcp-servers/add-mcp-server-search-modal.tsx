import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { type ImportMCPServerFromGithubURLOutput } from '@shinkai_network/shinkai-node-state/v2/mutations/importMCPServerFromGithubURL/types';
import { useImportMCPServerFromGithubURL } from '@shinkai_network/shinkai-node-state/v2/mutations/importMCPServerFromGithubURL/useImportMCPServerFromGithubURL';
import { useSearchMcpServerRegistry } from '@shinkai_network/shinkai-node-state/v2/queries/searchMcpServerRegistry/useSearchMcpServerRegistry';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from '@shinkai_network/shinkai-ui';
import { useDebounce } from '../../hooks/use-debounce';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth';

interface AddMcpServerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: ImportMCPServerFromGithubURLOutput) => void;
}

export const AddMcpServerSearchModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddMcpServerSearchModalProps) => {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const isSearchSynced = search === debouncedSearch;

  const { data: results, isFetching } = useSearchMcpServerRegistry(
    { query: debouncedSearch },
    { enabled: !!debouncedSearch },
  );

  const { mutateAsync: importMcpServer, isPending: isImporting } =
    useImportMCPServerFromGithubURL({
      onSuccess: (data) => {
        toast.success('MCP Server fetched successfully');
        onSuccess(data);
        setSearch('');
      },
      onError: (error: Error) => {
        toast.error('Failed to fetch MCP Server', {
          description: error?.message,
        });
      },
    });

  const handleSelect = async (qualifiedName: string) => {
    if (!auth) {
      toast.error('Authentication details are missing.');
      return;
    }
    const path = qualifiedName.startsWith('@')
      ? qualifiedName.slice(1)
      : qualifiedName;
    const githubUrl = `https://github.com/${path}`;
    await importMcpServer({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      githubUrl,
    });
  };

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Search MCP Servers</DialogTitle>
          <DialogDescription>
            Search the public registry for MCP servers and install them
            automatically.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="max-h-60 space-y-2 overflow-y-auto pt-4">
          {isFetching && <p>Searching...</p>}
          {isSearchSynced &&
            results?.servers.map((server) => (
              <div
                key={server.qualifiedName}
                className="border-border flex flex-col gap-2 rounded-md border p-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{server.displayName}</p>
                    <p className="text-muted-foreground text-sm">
                      {server.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleSelect(server.qualifiedName)}
                    disabled={isImporting}
                  >
                    {isImporting ? 'Fetching...' : 'Fetch and Continue'}
                  </Button>
                </div>
              </div>
            ))}
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={onClose} type="button" variant="outline">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
