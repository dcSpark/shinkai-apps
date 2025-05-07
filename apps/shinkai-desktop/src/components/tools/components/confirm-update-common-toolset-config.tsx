import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shinkai_network/shinkai-ui';

interface ConfirmToolsetUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirmUpdateTool: () => void;
  onConfirmUpdateToolset: () => void;
  toolName?: string;
  affectedToolNames?: string[];
}

export function ConfirmToolsetUpdateDialog({
  isOpen,
  onOpenChange,
  onConfirmUpdateTool,
  onConfirmUpdateToolset,
  toolName,
  affectedToolNames,
}: ConfirmToolsetUpdateDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      <DialogContent showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>{t('tools.confirmConfigurationUpdate')}</DialogTitle>
          <DialogDescription>
            {t('tools.commonToolsetUpdateDescription', { toolName: toolName ? `"${toolName}"` : 'this tool' })}
            <br />
            {t('common.howWouldYouLikeToProceed')}
            {affectedToolNames && affectedToolNames.length > 0 && (
              <div className="mt-2 text-xs">
                <p className="font-medium">{t('tools.commonToolsetAffectedTools')}:</p>
                <ul className="list-disc pl-5">
                  {affectedToolNames.map(name => <li key={name}>{name}</li>)}
                </ul>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-4 sm:justify-center">
          <Button
            onClick={() => {
              onConfirmUpdateTool();
              onOpenChange(false);
            }}
            variant="outline"
          >
            {t('tools.updateOnlyThisTool')}
          </Button>
          <Button
            onClick={() => {
              onConfirmUpdateToolset();
              onOpenChange(false);
            }}
          >
            {t('tools.updateAllToolsInSet')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 