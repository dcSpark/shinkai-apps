import {
  Button,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shinkai_network/shinkai-ui';
import { BookText } from 'lucide-react';

function DocsPanel() {
  return (
    <Sheet modal={false}>
      <SheetTrigger asChild>
        <Button className="h-8 gap-1.5 rounded-lg" size="sm" variant="outline">
          <BookText className="h-4 w-4" />
          Docs
        </Button>
      </SheetTrigger>
      <SheetContent
        className="max-w-md"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <SheetHeader className="mb-3">
          <SheetTitle className="flex h-[40px] items-center gap-4">
            Documentation
          </SheetTitle>
          <p className="text-gray-80 text-sm">
            Learn more about [] and how to use them.
          </p>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-200px)] flex-1">
          {/*// content*/}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
export default DocsPanel;
