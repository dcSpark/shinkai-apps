import { useState } from 'react';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from '@shinkai_network/shinkai-ui';

export default function AddAgentFromIdModal() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [agentId, setAgentId] = useState('');

  const handleAdd = () => {
    // TODO: Add agent using the provided Shinkai ID
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t('networkAgentsPage.addAgentFromId')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('networkAgentsPage.addAgentFromId')}</DialogTitle>
          <DialogDescription>
            {t('networkAgentsPage.addAgentFromIdDescription')}
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Shinkai ID"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
        />
        <DialogFooter className="flex-row gap-1">
          <Button variant="outline" size="md" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button size="md" onClick={handleAdd}>
            {t('common.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
