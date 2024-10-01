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

import documentationResults from './documentation_results.json';

// Add this type definition at the top of the file
type InputArg = {
  name: string;
  arg_type: string;
  description: string;
  is_required: boolean;
};

// Helper function to capitalize each word
function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

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
        className="max-w-md p-0 bg-black-gradient text-foreground"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-3">
            <SheetTitle className="text-2xl font-bold text-foreground">
              Documentation
            </SheetTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Learn more about available functions and how to use them.
            </p>
          </SheetHeader>
          <ScrollArea className="flex-grow px-6 pb-6">
            {documentationResults.map((func, index) => (
              <div className="mb-8 pb-8 border-b border-gray-350 last:border-b-0" key={index}>
                <h3 className="text-xl font-bold text-foreground mb-1 break-words">
                  {capitalizeWords(func.name)}
                </h3>
                <p className="text-xs text-muted-foreground mb-2 break-words">{func.description}</p>
                <p className="text-xs text-gray-80 mb-3">
                  Type: {func.tool_type} | Author: {func.author}
                </p>
                <div className="bg-gray-400 rounded-md p-2 mb-3 overflow-x-auto">
                  <code className="text-brand-500 text-xs whitespace-pre-wrap break-words">Fn: {func.fn_name}</code>
                </div>
                {Array.isArray(func.input_args) && func.input_args.length > 0 && (
                  <div className="bg-black-gradient rounded-md p-2 border border-gray-350">
                    <h5 className="text-xs font-semibold text-foreground mb-2">Parameters:</h5>
                    {func.input_args.map((arg: InputArg, argIndex: number) => (
                      <div className="mb-2 last:mb-0 text-xs" key={argIndex}>
                        <span className="text-foreground font-medium">{arg.name} </span>
                        <span className="text-muted-foreground">{arg.description} </span>
                        {arg.is_required && <span className="text-red">(Required)</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default DocsPanel;
