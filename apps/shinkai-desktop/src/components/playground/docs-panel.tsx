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
        className="max-w-md p-0 bg-gray-900 text-gray-100"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-3">
            <SheetTitle className="flex h-[40px] items-center gap-4 text-white">
              Documentation
            </SheetTitle>
            <p className="text-gray-300 text-sm">
              Learn more about available functions and how to use them.
            </p>
          </SheetHeader>
          <ScrollArea className="flex-grow px-6 pb-6">
            {documentationResults.map((func, index) => (
              <div className="mb-6 border-b border-gray-700 pb-4 last:border-b-0" key={index}>
                <h3 className="text-xl font-bold text-yellow-400">
                  Fn: <code className="bg-gray-800 p-1 rounded text-green-400">{func.fn_name}</code>
                </h3>
                <h4 className="text-lg font-semibold mt-1 text-white">{func.name}</h4>
                <p className="text-sm text-gray-300 mt-2">{func.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Type: {func.tool_type} | Author: {func.author}
                </p>
                {func.input_args && func.input_args.length > 0 && (
                  <div className="mt-2">
                    <h5 className="text-sm font-semibold text-white">Parameters:</h5>
                    <ul className="list-disc list-inside">
                      {func.input_args.map((arg, argIndex) => (
                        <li className="text-xs mt-1 text-gray-300" key={argIndex}>
                          <span className="font-medium text-cyan-400">{arg.name}</span>
                          {arg.description && `: ${arg.description}`}
                          {arg.is_required && <span className="text-red-400"> (Required)</span>}
                        </li>
                      ))}
                    </ul>
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
