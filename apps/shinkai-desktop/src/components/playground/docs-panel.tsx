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
        className="bg-onboarding-card max-w-md p-0 text-white"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="space-y-0.5 p-6 pb-4">
            <SheetTitle className="text-xl font-bold text-white">
              Documentation
            </SheetTitle>
            <p className="text-gray-80 text-sm">
              Learn more about available functions and how to use them.
            </p>
          </SheetHeader>
          <ScrollArea className="flex-grow px-6 pb-6 pr-4 [&>div>div]:!block">
            {documentationResults.map((func, index) => (
              <div
                className="mb-6 border-b border-gray-300 pb-6 last:border-b-0"
                key={index}
              >
                <h3 className="mb-1 break-words text-base font-semibold text-gray-50">
                  {capitalizeWords(func.name)}
                </h3>
                <p className="text-gray-80 mb-2 break-words text-xs">
                  {func.description}
                </p>
                <p className="text-gray-80 mb-3 text-xs">
                  Type: {func.tool_type} | Author: {func.author}
                </p>
                <div className="mb-3 overflow-x-auto rounded-md bg-gray-400 p-2">
                  <code className="text-brand-500 whitespace-pre-wrap break-words text-xs">
                    Fn: {func.fn_name}
                  </code>
                </div>
                {Array.isArray(func.input_args) &&
                  func.input_args.length > 0 && (
                    <div className="border-gray-350 rounded-md border bg-gray-500 p-2 text-xs">
                      <h5 className="text-foreground mb-2 font-semibold">
                        Parameters:
                      </h5>
                      {func.input_args.map(
                        (arg: InputArg, argIndex: number) => (
                          <div className="mb-2 last:mb-0" key={argIndex}>
                            <span className="font-medium text-white">
                              {arg.name}{' '}
                            </span>
                            <span className="text-gray-80">
                              {arg.description}{' '}
                            </span>
                            {arg.is_required && (
                              <span className="text-red-500">(Required)</span>
                            )}
                          </div>
                        ),
                      )}
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
