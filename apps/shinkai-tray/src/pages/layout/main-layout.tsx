import { ExitIcon, GearIcon, TokensIcon } from '@radix-ui/react-icons';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/lib/queries/getHealth/useGetHealth';
import {
  ChatBubbleIcon,
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  JobBubbleIcon,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Separator,
} from '@shinkai_network/shinkai-ui';
import { listen } from '@tauri-apps/api/event';
import { BotIcon } from 'lucide-react';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  ADD_AGENT_PATH,
  CREATE_CHAT_PATH,
  CREATE_JOB_PATH,
  GENERATE_CODE_PATH,
  INBOXES,
  ONBOARDING_PATH,
  SETTINGS_PATH,
} from '../../routes/name';
import { useAuth } from '../../store/auth';

export function Footer() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const logout = useAuth((state) => state.setLogout);
  const auth = useAuth((state) => state.auth);

  const goToCreateJob = useCallback(() => {
    navigate(CREATE_JOB_PATH);
    setOpen(false);
  }, [navigate]);

  React.useEffect(() => {
    const unlisten = async () =>
      listen('navigate-job-and-focus', (event) => {
        console.log('Received event from Rust:', event);
        goToCreateJob();
      });

    const down = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => {
      unlisten();
      document.removeEventListener('keydown', down);
    };
  }, [goToCreateJob]);

  const goToCreateChat = () => {
    navigate(CREATE_CHAT_PATH);
    setOpen(false);
  };

  const goToConversations = () => {
    navigate(INBOXES);
    setOpen(false);
  };
  const goToCreateAgent = () => {
    navigate(ADD_AGENT_PATH);
    setOpen(false);
  };

  const goToGenerateCode = () => {
    navigate(GENERATE_CODE_PATH);
    setOpen(false);
  };
  const goToSettings = () => {
    navigate(SETTINGS_PATH);
    setOpen(false);
  };
  const handleDisconnect = () => {
    logout();
    navigate(ONBOARDING_PATH);
  };

  const handleCommandCardKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.metaKey || event.ctrlKey) {
      switch (event.key) {
        case '1': {
          goToCreateJob();
          break;
        }
        case '2': {
          goToCreateChat();
          break;
        }
        case '3': {
          goToCreateAgent();
          break;
        }

        default: {
          break;
        }
      }
    }
  };

  return (
    <div className="absolute bottom-2 left-2 text-sm text-white">
      <Popover modal onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          aria-expanded={open}
          className="rounded-lg bg-gray-400 px-2.5 py-2 shadow-lg transition-colors duration-150 hover:bg-gray-300"
          onClick={() => setOpen(true)}
        >
          <span className="text-xs text-white">
            Actions
            <kbd className="text-gray-80 pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-300 px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </span>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          alignOffset={0}
          asChild
          className="rounded-md border-0 bg-gray-500 p-4 shadow-xl"
          side="top"
          sideOffset={2}
        >
          <Command
            className="p-0 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-3 [&_[cmdk-item]_svg]:w-3"
            onKeyDown={handleCommandCardKeyDown}
          >
            <CommandList className="bg-gray-400 p-0 pt-2">
              <ScrollArea className="h-[280px]">
                <CommandGroup heading="Actions">
                  <CommandItem onSelect={goToCreateJob}>
                    <JobBubbleIcon className="mr-2" />
                    <span>Create AI Chat</span>
                    <CommandShortcut>⌘1</CommandShortcut>
                  </CommandItem>
                  {auth?.shinkai_identity.includes('localhost') ? null : (
                    <CommandItem onSelect={goToCreateChat}>
                      <ChatBubbleIcon className="mr-2" />
                      <span>Create DM Chat</span>
                      <CommandShortcut>⌘2</CommandShortcut>
                    </CommandItem>
                  )}
                  <CommandItem onSelect={goToCreateAgent}>
                    <BotIcon className="mr-2" />
                    <span>Add Agent</span>
                    <CommandShortcut>⌘3</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="General">
                  <CommandItem onSelect={goToConversations}>
                    <JobBubbleIcon className="mr-2" />
                    <span>Conversations</span>
                  </CommandItem>
                  <CommandItem onSelect={goToGenerateCode}>
                    <TokensIcon className="mr-2 h-4 w-4" />
                    <span>Generate Code</span>
                  </CommandItem>
                  <CommandItem onSelect={goToSettings}>
                    <GearIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </CommandItem>
                  <CommandItem onSelect={handleDisconnect}>
                    <ExitIcon className="mr-2 h-4 w-4" />
                    <span>Disconnect</span>
                    {/*<CommandShortcut>⌘6</CommandShortcut>*/}
                  </CommandItem>
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const MainLayout = () => {
  const auth = useAuth((state) => state.auth);
  const { nodeInfo, isSuccess, isFetching } = useGetHealth(
    { node_address: auth?.node_address ?? '' },
    { refetchInterval: 10000, enabled: !!auth },
  );

  useEffect(() => {
    if (isSuccess && nodeInfo?.status === 'ok') {
      toast.error('Node Unavailable', {
        description:
          'Visor is having trouble connecting to your Shinkai Node. Your node may be offline, or your internet connection may be down.',
        important: true,
        id: 'node-unavailable',
        duration: 20000,
      });
    }
    if (isSuccess && nodeInfo?.status !== 'ok') {
      toast.dismiss('node-unavailable');
    }
  }, [isSuccess, nodeInfo?.status, isFetching]);

  return (
    <div className="relative flex h-full flex-col bg-gray-500 text-white">
      <div
        className="flex h-9 shrink-0 cursor-default select-none items-center justify-center text-xs"
        data-tauri-drag-region={true}
      >
        {/*Shinkai AI*/}
      </div>
      <Separator />
      <div className="flex-auto overflow-auto">
        <Outlet />
      </div>
      {auth && <Footer />}
    </div>
  );
};
export default MainLayout;
