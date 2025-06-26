import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (open) {
      setAgentId('@@');
    }
  }, [open]);

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
          <DialogDescription className="space-y-2">
            <p>{t('networkAgentsPage.addAgentFromIdDescription')}</p>
            <p>{t('networkAgentsPage.addAgentFromIdHelper')}</p>
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder={t('networkAgentsPage.addAgentFromIdPlaceholder')}
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
