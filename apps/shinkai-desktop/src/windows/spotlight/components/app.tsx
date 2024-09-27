import { Button, ScrollArea, Separator } from '@shinkai_network/shinkai-ui';
import { Bot } from 'lucide-react';

function App() {
  return (
    <div className="bg-app-gradient h-full w-full rounded-xl text-white shadow-lg backdrop-blur-lg">
      <div className="flex items-center space-x-3 p-4">
        <input
          autoFocus
          className="flex-grow bg-transparent text-lg text-white placeholder-gray-300 focus:outline-none"
          placeholder="Search..."
          type="text"
        />
        <Button className="text-white" size="icon" variant="ghost">
          <Bot className="h-5 w-5" />
        </Button>
      </div>
      <Separator className="bg-white bg-opacity-20" />
      <ScrollArea className="h-64">
        <div className="p-2">
          {/* Add search results or recent items here */}
        </div>
      </ScrollArea>
    </div>
  );
}

export default App;
