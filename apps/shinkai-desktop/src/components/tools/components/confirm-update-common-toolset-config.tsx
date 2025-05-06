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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Configuration Update</DialogTitle>
          <DialogDescription>
            The configuration key you are changing for {toolName ? `"${toolName}"` : 'this tool'} is also used by other tools in this set.
            <br />
            How would you like to proceed?
            {affectedToolNames && affectedToolNames.length > 0 && (
              <div className="mt-2 text-xs">
                <p className="font-medium">Choosing to update all tools in the set will also affect:</p>
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
            Update Only This Tool
          </Button>
          <Button
            onClick={() => {
              onConfirmUpdateToolset();
              onOpenChange(false);
            }}
          >
            Update All Tools in Set
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 