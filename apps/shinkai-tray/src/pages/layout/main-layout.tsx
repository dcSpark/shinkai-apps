import {
  ExitIcon,
  GearIcon,
  PersonIcon,
  TokensIcon,
} from '@radix-ui/react-icons';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from '@shinkai_network/shinkai-ui';
import { listen } from '@tauri-apps/api/event';
import { BotIcon, BoxesIcon, MessageCircleIcon } from 'lucide-react';
import * as React from 'react';
import { useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import {
  ADD_AGENT_PATH,
  CREATE_CHAT_PATH,
  CREATE_JOB_PATH,
  GENERATE_CODE_PATH,
  ONBOARDING_PATH,
  SETTINGS_PATH,
} from '../../routes/name';
import { useAuth } from '../../store/auth';

export function Footer() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const logout = useAuth((state) => state.setLogout);

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
  const goToCreateAgent = () => {
    navigate(ADD_AGENT_PATH);
    setOpen(false);
  };

  const goToProfile = () => {
    navigate(SETTINGS_PATH);
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
        case '4': {
          goToProfile();
          break;
        }
        case '5': {
          goToGenerateCode();
          break;
        }
        case '6': {
          goToSettings();
          break;
        }
        default: {
          break;
        }
      }
    }
  };

  return (
    <div className="text-gray-80 absolute bottom-2 left-2 text-sm">
      <Popover modal onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          aria-expanded={open}
          className="rounded-lg bg-gray-400 px-2.5 py-2 shadow-lg transition-colors duration-150 hover:bg-gray-500/40"
          onClick={() => setOpen(true)}
        >
          <span className="text-xs">
            Actions
            <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-500 px-1.5 font-mono text-[10px] font-medium text-gray-100 opacity-100">
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
            className="p-0 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500 dark:[&_[cmdk-group-heading]]:text-gray-400 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-3 [&_[cmdk-item]_svg]:w-3"
            onKeyDown={handleCommandCardKeyDown}
          >
            <CommandList className="p-0 pt-2">
              <CommandGroup heading="Actions">
                <CommandItem onSelect={goToCreateJob}>
                  <BoxesIcon className="mr-2" />
                  <span>Create Job</span>
                  <CommandShortcut>⌘1</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={goToCreateChat}>
                  <MessageCircleIcon className="mr-2" />
                  <span>Create Chat</span>
                  <CommandShortcut>⌘2</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={goToCreateAgent}>
                  <BotIcon className="mr-2" />
                  <span>Add Agent</span>
                  <CommandShortcut>⌘3</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="General">
                <CommandItem onSelect={goToProfile}>
                  <PersonIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  <CommandShortcut>⌘4</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={goToGenerateCode}>
                  <TokensIcon className="mr-2 h-4 w-4" />
                  <span>Generate Code</span>
                  <CommandShortcut>⌘5</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={goToSettings}>
                  <GearIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <CommandShortcut>⌘6</CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={handleDisconnect}>
                  <ExitIcon className="mr-2 h-4 w-4" />
                  <span>Disconnect</span>
                  {/*<CommandShortcut>⌘6</CommandShortcut>*/}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const MainLayout = () => {
  const auth = useAuth((state) => state.auth);
  return (
    <div className="relative flex h-full flex-col bg-gray-500 text-white">
      <div
        className="flex h-9 shrink-0 cursor-default select-none items-center justify-center text-xs"
        data-tauri-drag-region={true}
      >
        Shinkai AI
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
