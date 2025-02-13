import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  CodeLanguage,
  ShinkaiTool,
} from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { useDisableAllTools } from '@shinkai_network/shinkai-node-state/v2/mutations/disableAllTools/useDisableAllTools';
import { useEnableAllTools } from '@shinkai_network/shinkai-node-state/v2/mutations/enableAllTools/useEnableAllTools';
import { useImportTool } from '@shinkai_network/shinkai-node-state/v2/mutations/importTool/useImportTool';
import { useUpdateTool } from '@shinkai_network/shinkai-node-state/v2/mutations/updateTool/useUpdateTool';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/v2/queries/getHealth/useGetHealth';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import { useGetSearchTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsSearch/useGetToolsSearch';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  buttonVariants,
  ChatInputArea,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Form,
  FormField,
  Input,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextField,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { SendIcon } from '@shinkai_network/shinkai-ui/assets';
import {
  formatText,
  getVersionFromTool,
} from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { animate } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BoltIcon,
  CheckCircle2,
  CloudDownloadIcon,
  Eye,
  EyeOff,
  ImportIcon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
  StoreIcon,
  XCircle,
  XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { AIModelSelector } from '../components/chat/chat-action-bar/ai-update-selection-action-bar';
import { LanguageToolSelector } from '../components/playground-tool/components/language-tool-selector';
import { ToolsSelection } from '../components/playground-tool/components/tools-selection';
import { useToolForm } from '../components/playground-tool/hooks/use-tool-code';
import { AuthorAvatarLink } from '../components/tools/components/tool-card';
import { VideoBanner } from '../components/video-banner';
import { useDebounce } from '../hooks/use-debounce';
import { useAuth } from '../store/auth';
import { TutorialBanner } from '../store/settings';
import { SHINKAI_TUTORIALS } from '../utils/constants';
import { SHINKAI_STORE_URL } from '../utils/store';
import { SimpleLayout } from './layout/simple-layout';

export function useAnimatedText(text: string, delimiter = '') {
  const [cursor, setCursor] = useState(0);
  const [startingCursor, setStartingCursor] = useState(0);
  const [prevText, setPrevText] = useState(text);

  if (prevText !== text) {
    setPrevText(text);
    setStartingCursor(text.startsWith(prevText) ? cursor : 0);
  }

  useEffect(() => {
    const parts = text.split(delimiter);
    const duration =
      delimiter === ''
        ? 2 // Character animation
        : delimiter === ' '
          ? 4 // Word animation
          : 2; // Chunk animation

    const controls = animate(startingCursor, parts.length, {
      duration,
      ease: 'easeOut',
      onUpdate(latest) {
        setCursor(Math.floor(latest));
      },
    });

    return () => controls.stop();
  }, [startingCursor, text, delimiter]);

  return text.split(delimiter).slice(0, cursor).join(delimiter);
}

export const ToolsHomepage = () => {
  const auth = useAuth((state) => state.auth);
  const { data: toolsList, isPending } = useGetTools({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(true);

  const chunkText = useAnimatedText(
    isPlaying
      ? 'Ask AI to create tools that transform your workflow and boost productivity...'
      : '',
    '',
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlaying(false);
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const form = useToolForm();

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-4 px-5 py-10">
      <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-10">
        <h1 className="font-clash text-center text-4xl font-semibold tracking-tight">
          Create your AI tools to automate your workflows.
        </h1>

        <div className="w-full max-w-3xl">
          <Form {...form}>
            <form>
              <ChatInputArea
                autoFocus
                onSubmit={console.log}
                placeholder={chunkText}
                textareaClassName="min-h-[90px]"
                bottomAddons={
                  <div className="flex items-end justify-between gap-3 pb-1 pl-1">
                    <div className="flex items-center gap-3">
                      <AIModelSelector
                        onValueChange={(value) => {
                          form.setValue('llmProviderId', value);
                        }}
                        value={form.watch('llmProviderId')}
                      />
                      <LanguageToolSelector
                        onValueChange={(value) => {
                          form.setValue('language', value as CodeLanguage);
                        }}
                        value={form.watch('language')}
                      />
                      <ToolsSelection
                        onChange={(value) => {
                          form.setValue('tools', value);
                        }}
                        value={form.watch('tools')}
                      />
                    </div>

                    <Button
                      className={cn(
                        'hover:bg-app-gradient bg-official-gray-800 h-[40px] w-[40px] cursor-pointer rounded-xl p-3 transition-colors',
                        'disabled:text-gray-80 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border disabled:border-gray-200 disabled:bg-gray-300 hover:disabled:bg-gray-300',
                      )}
                      size="icon"
                      variant="tertiary"
                    >
                      <SendIcon className="h-full w-full" />
                      <span className="sr-only">{t('chat.sendMessage')}</span>
                    </Button>
                  </div>
                }
                // disabled={
                //   isToolCodeGenerationPending || isMetadataGenerationPending
                // }
                onChange={(value) => {
                  form.setValue('message', value);
                }}
                // onSubmit={() => {}}
                value={form.watch('message')}
              />

              <div className="flex w-full items-center justify-center gap-3 py-6">
                {[
                  {
                    text: 'Download website as markdown',
                    prompt:
                      'Generate a tool for downloading a website into markdown',
                  },
                  {
                    text: 'Get Hacker News stories',
                    prompt:
                      'Generate a tool for getting top tech-related stories from Hacker News, include the title, author, and URL of the story',
                  },
                  {
                    text: 'Podcast summary',
                    prompt:
                      'Generate a tool for summarizing a podcast, include the title, author, and URL of the story',
                  },
                ].map((suggestion) => (
                  <Button
                    key={suggestion.text}
                    onClick={() => form.setValue('message', suggestion.prompt)}
                    size="xs"
                    type="button"
                    variant="outline"
                  >
                    {suggestion.text}
                    <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                ))}
              </div>
            </form>
          </Form>
        </div>
      </div>
      <div className="bg-official-gray-1100 relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] mb-12 w-screen">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-8 p-4 text-center lg:p-14">
          <div>
            <Badge>App Store</Badge>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-clash max-w-xl text-3xl font-semibold tracking-tighter md:text-5xl">
              Discover More Tools
            </h3>
            <p className="text-official-gray-400 max-w-xl text-lg leading-relaxed tracking-tight">
              Explore and install tools from our App Store to boost your
              productivity and automate your workflow.
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <Button className="gap-4" size="sm">
              Visit App Store <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs className="flex w-full flex-col gap-6" defaultValue="my-projects">
        <div className="flex w-full items-center justify-center">
          <TabsList className="border-official-gray-780 inline-flex h-[48px] items-center justify-center rounded-full border bg-transparent p-1">
            <TabsTrigger
              className="data-[state=active]:bg-official-gray-900 data-[state=inactive]:text-official-gray-400 inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2.5 text-sm transition-all data-[state=active]:text-white"
              value="my-projects"
            >
              My Tools
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-official-gray-900 data-[state=inactive]:text-official-gray-400 inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2.5 text-sm transition-all data-[state=active]:text-white"
              value="latest"
            >
              Latest
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-official-gray-900 data-[state=inactive]:text-official-gray-400 inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2.5 text-sm transition-all data-[state=active]:text-white"
              value="featured"
            >
              Featured
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-official-gray-900 data-[state=inactive]:text-official-gray-400 inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2.5 text-sm transition-all data-[state=active]:text-white"
              value="templates"
            >
              Templates
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className="mt-0" value="my-projects">
          <div className="grid grid-cols-1 gap-3">
            {toolsList?.map((tool) => (
              <div key={tool.tool_router_key}>
                <div className="bg-official-gray-950 relative flex gap-4 rounded-lg border border-gray-400 px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-500/80">
                  <Link
                    className="absolute inset-0 z-0"
                    to={`/product/${tool.tool_router_key}`}
                  >
                    <span className="sr-only"> Go to Details</span>
                  </Link>
                  <img
                    alt={tool.name}
                    className="size-12 rounded-lg object-cover"
                    src={tool?.icon_url ?? '/placeholder.png'}
                  />
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-white hover:underline">
                        {tool.name}
                      </h3>
                      <p className="text-gray-80 line-clamp-2 h-[40px] text-sm">
                        {tool.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-6 items-center gap-4 text-xs">
                        {/* {product.category &&
                            window.location.pathname === '/' && (
                              <span className="flex items-center gap-1.5">
                                <CategoryIcon className="h-5 w-5" />
                                <span className="text-gray-80 text-xs">
                                  {product.category.name}
                                </span>
                              </span>
                            )} */}

                        <AuthorAvatarLink author={tool.author} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent className="mt-0" value="latest">
          <div className="grid grid-cols-1 gap-3">
            {toolsList?.map((tool) => (
              <div key={tool.tool_router_key}>
                <div className="bg-official-gray-950 relative flex gap-4 rounded-lg border border-gray-400 px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-500/80">
                  <Link
                    className="absolute inset-0 z-0"
                    to={`/product/${tool.tool_router_key}`}
                  >
                    <span className="sr-only"> Go to Details</span>
                  </Link>
                  <img
                    alt={tool.name}
                    className="size-12 rounded-lg object-cover"
                    src={tool?.icon_url ?? '/placeholder.png'}
                  />
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-white hover:underline">
                        {tool.name}
                      </h3>
                      <p className="text-gray-80 line-clamp-2 h-[40px] text-sm">
                        {tool.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-6 items-center gap-4 text-xs">
                        {/* {product.category &&
                            window.location.pathname === '/' && (
                              <span className="flex items-center gap-1.5">
                                <CategoryIcon className="h-5 w-5" />
                                <span className="text-gray-80 text-xs">
                                  {product.category.name}
                                </span>
                              </span>
                            )} */}

                        <AuthorAvatarLink author={tool.author} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent className="mt-0" value="featured">
          <div className="grid grid-cols-1 gap-3">
            {toolsList?.map((tool) => (
              <div key={tool.tool_router_key}>
                <div className="bg-official-gray-950 relative flex gap-4 rounded-lg border border-gray-400 px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-500/80">
                  <Link
                    className="absolute inset-0 z-0"
                    to={`/product/${tool.tool_router_key}`}
                  >
                    <span className="sr-only"> Go to Details</span>
                  </Link>
                  <img
                    alt={tool.name}
                    className="size-12 rounded-lg object-cover"
                    src={tool?.icon_url ?? '/placeholder.png'}
                  />
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-white hover:underline">
                        {tool.name}
                      </h3>
                      <p className="text-gray-80 line-clamp-2 h-[40px] text-sm">
                        {tool.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-6 items-center gap-4 text-xs">
                        {/* {product.category &&
                            window.location.pathname === '/' && (
                              <span className="flex items-center gap-1.5">
                                <CategoryIcon className="h-5 w-5" />
                                <span className="text-gray-80 text-xs">
                                  {product.category.name}
                                </span>
                              </span>
                            )} */}

                        <AuthorAvatarLink author={tool.author} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent className="mt-0" value="templates">
          <div className="grid grid-cols-1 gap-3">
            {toolsList?.map((tool) => (
              <div key={tool.tool_router_key}>
                <div className="bg-official-gray-950 relative flex gap-4 rounded-lg border border-gray-400 px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-500/80">
                  <Link
                    className="absolute inset-0 z-0"
                    to={`/product/${tool.tool_router_key}`}
                  >
                    <span className="sr-only"> Go to Details</span>
                  </Link>
                  <img
                    alt={tool.name}
                    className="size-12 rounded-lg object-cover"
                    src={tool?.icon_url ?? '/placeholder.png'}
                  />
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-white hover:underline">
                        {tool.name}
                      </h3>
                      <p className="text-gray-80 line-clamp-2 h-[40px] text-sm">
                        {tool.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-6 items-center gap-4 text-xs">
                        {/* {product.category &&
                            window.location.pathname === '/' && (
                              <span className="flex items-center gap-1.5">
                                <CategoryIcon className="h-5 w-5" />
                                <span className="text-gray-80 text-xs">
                                  {product.category.name}
                                </span>
                              </span>
                            )} */}

                        <AuthorAvatarLink author={tool.author} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
