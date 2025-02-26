import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { ModelPrefix } from '@shinkai_network/shinkai-message-ts/api/jobs/index';
import { Models } from '@shinkai_network/shinkai-node-state/lib/utils/models';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import {
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ResourcesBanner } from '../components/hardware-capabilities/resources-banner';
import { OllamaModels } from '../components/shinkai-node-manager/ollama-models';
import { useURLQueryParams } from '../hooks/use-url-query-params';
import { shinkaiNodeQueryClient } from '../lib/shinkai-node-manager/shinkai-node-manager-client';
import { useAuth } from '../store/auth';
import { FixedHeaderLayout } from './layout/simple-layout';

const cloudProviders = [
  {
    id: Models.OpenAI,
    prefix: ModelPrefix.OpenAI,
    name: 'OpenAI',
    icon: (
      <svg
        fill="currentColor"
        fillRule="evenodd"
        height="1em"
        viewBox="0 0 24 24"
        width="1em"
      >
        <path d="M21.55 10.004a5.416 5.416 0 00-.478-4.501c-1.217-2.09-3.662-3.166-6.05-2.66A5.59 5.59 0 0010.831 1C8.39.995 6.224 2.546 5.473 4.838A5.553 5.553 0 001.76 7.496a5.487 5.487 0 00.691 6.5 5.416 5.416 0 00.477 4.502c1.217 2.09 3.662 3.165 6.05 2.66A5.586 5.586 0 0013.168 23c2.443.006 4.61-1.546 5.361-3.84a5.553 5.553 0 003.715-2.66 5.488 5.488 0 00-.693-6.497v.001zm-8.381 11.558a4.199 4.199 0 01-2.675-.954c.034-.018.093-.05.132-.074l4.44-2.53a.71.71 0 00.364-.623v-6.176l1.877 1.069c.02.01.033.029.036.05v5.115c-.003 2.274-1.87 4.118-4.174 4.123zM4.192 17.78a4.059 4.059 0 01-.498-2.763c.032.02.09.055.131.078l4.44 2.53c.225.13.504.13.73 0l5.42-3.088v2.138a.068.068 0 01-.027.057L9.9 19.288c-1.999 1.136-4.552.46-5.707-1.51h-.001zM3.023 8.216A4.15 4.15 0 015.198 6.41l-.002.151v5.06a.711.711 0 00.364.624l5.42 3.087-1.876 1.07a.067.067 0 01-.063.005l-4.489-2.559c-1.995-1.14-2.679-3.658-1.53-5.63h.001zm15.417 3.54l-5.42-3.088L14.896 7.6a.067.067 0 01.063-.006l4.489 2.557c1.998 1.14 2.683 3.662 1.529 5.633a4.163 4.163 0 01-2.174 1.807V12.38a.71.71 0 00-.363-.623zm1.867-2.773a6.04 6.04 0 00-.132-.078l-4.44-2.53a.731.731 0 00-.729 0l-5.42 3.088V7.325a.068.068 0 01.027-.057L14.1 4.713c2-1.137 4.555-.46 5.707 1.513.487.833.664 1.809.499 2.757h.001zm-11.741 3.81l-1.877-1.068a.065.065 0 01-.036-.051V6.559c.001-2.277 1.873-4.122 4.181-4.12.976 0 1.92.338 2.671.954-.034.018-.092.05-.131.073l-4.44 2.53a.71.71 0 00-.365.623l-.003 6.173v.002zm1.02-2.168L12 9.25l2.414 1.375v2.75L12 14.75l-2.415-1.375v-2.75z" />
      </svg>
    ),
    models: [],
    description:
      'OpenAI is an AI research lab that aims to ensure that artificial general intelligence benefits all of humanity.',
  },
  {
    id: Models.TogetherComputer,
    prefix: ModelPrefix.TogetherAI,
    name: 'Together AI',
    icon: (
      <svg
        fill="currentColor"
        fillRule="evenodd"
        height="1em"
        viewBox="0 0 24 24"
        width="1em"
      >
        <title>together.ai</title>
        <g>
          <path
            d="M17.385 11.23a4.615 4.615 0 100-9.23 4.615 4.615 0 000 9.23zm0 10.77a4.615 4.615 0 100-9.23 4.615 4.615 0 000 9.23zm-10.77 0a4.615 4.615 0 100-9.23 4.615 4.615 0 000 9.23z"
            opacity=".2"
          />
          <circle cx="6.615" cy="6.615" fill="#0F6FFF" r="4.615" />
        </g>
      </svg>
    ),
    models: [],
    description:
      'Together AI focus on efficient AI compute with high-performance inference and training on open ModelPrefix.',
  },
  {
    id: Models.Gemini,
    prefix: ModelPrefix.Gemini,
    name: 'Gemini',
    description:
      ' A state-of-the-art large language model offering advanced reasoning, multimodal capabilities, and extended context handling.',
    hasInstructions: true,
    docUrl: 'https://ai.google.dev/api',
    icon: (
      <svg height="1em" viewBox="0 0 24 24" width="1em">
        <defs>
          <linearGradient
            id="lobe-icons-gemini-fill"
            x1="0%"
            x2="68.73%"
            y1="100%"
            y2="30.395%"
          >
            <stop offset="0%" stopColor="#1C7DFF" />
            <stop offset="52.021%" stopColor="#1C69FF" />
            <stop offset="100%" stopColor="#F0DCD6" />
          </linearGradient>
        </defs>
        <path
          d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12"
          fill="url(#lobe-icons-gemini-fill)"
          fillRule="nonzero"
        />
      </svg>
    ),
  },
  {
    id: Models.Groq,
    prefix: ModelPrefix.Groq,
    name: 'Groq',
    description:
      'A hardware-accelerated inference solution optimized for low-latency and high-throughput deployments.',
    hasInstructions: true,
    docUrl: 'https://console.groq.com/docs/overview',
    icon: (
      <svg
        fill="currentColor"
        fillRule="evenodd"
        height="1em"
        viewBox="0 0 24 24"
        width="1em"
      >
        <title>Groq</title>
        <path d="M12.036 2c-3.853-.035-7 3-7.036 6.781-.035 3.782 3.055 6.872 6.908 6.907h2.42v-2.566h-2.292c-2.407.028-4.38-1.866-4.408-4.23-.029-2.362 1.901-4.298 4.308-4.326h.1c2.407 0 4.358 1.915 4.365 4.278v6.305c0 2.342-1.944 4.25-4.323 4.279a4.375 4.375 0 01-3.033-1.252l-1.851 1.818A7 7 0 0012.029 22h.092c3.803-.056 6.858-3.083 6.879-6.816v-6.5C18.907 4.963 15.817 2 12.036 2z" />
      </svg>
    ),
  },
  {
    id: Models.OpenRouter,
    prefix: ModelPrefix.OpenRouter,
    name: 'OpenRouter',
    description:
      'A scalable orchestration layer that intelligently routes queries across multiple AI models, optimizing performance and cost.',
    docUrl: 'https://openrouter.ai/docs/quick-start',
    icon: (
      <svg
        fill="currentColor"
        fillRule="evenodd"
        height="1em"
        viewBox="0 0 24 24"
        width="1em"
      >
        <title>OpenRouter</title>
        <path d="M16.804 1.957l7.22 4.105v.087L16.73 10.21l.017-2.117-.821-.03c-1.059-.028-1.611.002-2.268.11-1.064.175-2.038.577-3.147 1.352L8.345 11.03c-.284.195-.495.336-.68.455l-.515.322-.397.234.385.23.53.338c.476.314 1.17.796 2.701 1.866 1.11.775 2.083 1.177 3.147 1.352l.3.045c.694.091 1.375.094 2.825.033l.022-2.159 7.22 4.105v.087L16.589 22l.014-1.862-.635.022c-1.386.042-2.137.002-3.138-.162-1.694-.28-3.26-.926-4.881-2.059l-2.158-1.5a21.997 21.997 0 00-.755-.498l-.467-.28a55.927 55.927 0 00-.76-.43C2.908 14.73.563 14.116 0 14.116V9.888l.14.004c.564-.007 2.91-.622 3.809-1.124l1.016-.58.438-.274c.428-.28 1.072-.726 2.686-1.853 1.621-1.133 3.186-1.78 4.881-2.059 1.152-.19 1.974-.213 3.814-.138l.02-1.907z" />
      </svg>
    ),
  },
  {
    id: Models.Exo,
    prefix: ModelPrefix.Exo,
    name: 'Exo',
    description:
      'A specialized model platform focused on precise information extraction, efficient summarization, and reliable knowledge retrieval.',
    icon: (
      <div className="size-5 rounded-sm bg-gray-200 p-1">
        <svg
          className="h-full w-full"
          fill="none"
          height="1em"
          viewBox="0 0 168 109"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.72477 19.3761C15.0956 19.3761 19.4495 15.0386 19.4495 9.68807C19.4495 4.3375 15.0956 0 9.72477 0C4.35393 0 0 4.3375 0 9.68807C0 15.0386 4.35393 19.3761 9.72477 19.3761Z"
            fill="currentColor"
          />
          <path
            d="M9.72477 108.092C15.0956 108.092 19.4495 103.754 19.4495 98.4039C19.4495 93.0533 15.0956 88.7158 9.72477 88.7158C4.35393 88.7158 0 93.0533 0 98.4039C0 103.754 4.35393 108.092 9.72477 108.092Z"
            fill="currentColor"
          />
          <path
            d="M157.638 19.3761C163.009 19.3761 167.363 15.0386 167.363 9.68807C167.363 4.3375 163.009 0 157.638 0C152.267 0 147.913 4.3375 147.913 9.68807C147.913 15.0386 152.267 19.3761 157.638 19.3761Z"
            fill="currentColor"
          />
          <path
            d="M83.7521 19.3761C89.123 19.3761 93.4769 15.0386 93.4769 9.68807C93.4769 4.3375 89.123 0 83.7521 0C78.3813 0 74.0273 4.3375 74.0273 9.68807C74.0273 15.0386 78.3813 19.3761 83.7521 19.3761Z"
            fill="currentColor"
          />
          <path
            d="M46.8078 41.7297C52.1786 41.7297 56.5325 37.3922 56.5325 32.0416C56.5325 26.691 52.1786 22.3535 46.8078 22.3535C41.4369 22.3535 37.083 26.691 37.083 32.0416C37.083 37.3922 41.4369 41.7297 46.8078 41.7297Z"
            fill="currentColor"
          />
          <path
            d="M83.7521 108.092C89.123 108.092 93.4769 103.754 93.4769 98.4039C93.4769 93.0533 89.123 88.7158 83.7521 88.7158C78.3813 88.7158 74.0273 93.0533 74.0273 98.4039C74.0273 103.754 78.3813 108.092 83.7521 108.092Z"
            fill="currentColor"
          />
          <path
            d="M120.867 41.7294C126.243 41.7294 130.601 37.3919 130.601 32.0413C130.601 26.6908 126.243 22.3533 120.867 22.3533C115.491 22.3533 111.133 26.6908 111.133 32.0413C111.133 37.3919 115.491 41.7294 120.867 41.7294Z"
            fill="currentColor"
          />
          <path
            d="M46.8072 86.0095C52.1831 86.0095 56.5411 81.672 56.5411 76.3214C56.5411 70.9708 52.1831 66.6333 46.8072 66.6333C41.4313 66.6333 37.0732 70.9708 37.0732 76.3214C37.0732 81.672 41.4313 86.0095 46.8072 86.0095Z"
            fill="currentColor"
          />
          <path
            d="M157.638 108.092C163.009 108.092 167.363 103.754 167.363 98.4039C167.363 93.0533 163.009 88.7158 157.638 88.7158C152.267 88.7158 147.913 93.0533 147.913 98.4039C147.913 103.754 152.267 108.092 157.638 108.092Z"
            fill="currentColor"
          />
          <path
            d="M120.867 86.0095C126.243 86.0095 130.601 81.672 130.601 76.3214C130.601 70.9708 126.243 66.6333 120.867 66.6333C115.491 66.6333 111.133 70.9708 111.133 76.3214C111.133 81.672 115.491 86.0095 120.867 86.0095Z"
            fill="currentColor"
          />
          <path
            d="M83.7525 63.7753C89.1284 63.7753 93.4864 59.4378 93.4864 54.0872C93.4864 48.7367 89.1284 44.3992 83.7525 44.3992C78.3766 44.3992 74.0186 48.7367 74.0186 54.0872C74.0186 59.4378 78.3766 63.7753 83.7525 63.7753Z"
            fill="currentColor"
          />
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint0_logo_gradient"
              x1="13.4495"
              x2="131.693"
              y1="13.4083"
              y2="131.656"
            >
              <stop stopColor="#10F8E4" />
              <stop offset="1" stopColor="#24B0FF" />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint1_logo_gradient"
              x1="-22.1193"
              x2="96.1239"
              y1="66.5599"
              y2="184.803"
            >
              <stop stopColor="#10F8E4" />
              <stop offset="1" stopColor="#24B0FF" />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint2_logo_gradient"
              x1="75.3122"
              x2="193.56"
              y1="-72.6376"
              y2="45.6055"
            >
              <stop stopColor="#10F8E4" />
              <stop offset="1" stopColor="#24B0FF" />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint3_logo_gradient"
              x1="44.4127"
              x2="162.656"
              y1="-29.656"
              y2="88.5917"
            >
              <stop stopColor="#10F8E4" />
              <stop offset="1" stopColor="#24B0FF" />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint4_logo_gradient"
              x1="19.9958"
              x2="138.244"
              y1="5.22967"
              y2="123.473"
            >
              <stop stopColor="#10F8E4" />
              <stop offset="1" stopColor="#24B0FF" />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint5_logo_gradient"
              x1="8.84387"
              x2="127.087"
              y1="23.4956"
              y2="141.739"
            >
              <stop stopColor="#10F8E4" />
              <stop offset="1" stopColor="#24B0FF" />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint6_logo_gradient"
              x1="50.9815"
              x2="169.211"
              y1="-37.844"
              y2="80.3853"
            >
              <stop stopColor="#10F8E4" />
              <stop offset="1" stopColor="#24B0FF" />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint7_logo_gradient"
              x1="2.25214"
              x2="120.482"
              y1="31.7617"
              y2="149.991"
            >
              <stop stopColor="#10F8E4" />
              <stop offset="1" stopColor="#24B0FF" />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint8_logo_gradient"
              x1="39.748"
              x2="157.991"
              y1="-19.486"
              y2="98.7571"
            >
              <stop stopColor="#10F8E4" />
              <stop offset="1" stopColor="#24B0FF" />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint9_logo_gradient"
              x1="33.2292"
              x2="151.459"
              y1="-11.3163"
              y2="106.913"
            >
              <stop stopColor="#10F8E4" />
              <stop offset="1" stopColor="#24B0FF" />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint10_logo_gradient"
              x1="26.6149"
              x2="144.849"
              y1="-3.04579"
              y2="115.184"
            >
              <stop stopColor="#10F8E4" />
              <stop offset="1" stopColor="#24B0FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
  },
  {
    id: Models.Claude,
    prefix: ModelPrefix.Claude,
    name: 'Claude',
    models: [],
    docUrl: 'https://docs.anthropic.com/en/docs/intro-to-claude',
    icon: (
      <svg height="1em" viewBox="0 0 24 24" width="1em">
        <title>Claude</title>
        <path
          d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"
          fill="#D97757"
          fillRule="nonzero"
        />
      </svg>
    ),
    description:
      'Claude is a powerful AI model that can be used to generate text, images, and code.',
  },
];
const AIModelInstallation = ({
  isOnboardingStep,
}: {
  isOnboardingStep?: boolean;
}) => {
  const [selectedProvider, setSelectedProvider] = useState<'local' | 'cloud'>(
    'local',
  );

  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const [showAllOllamaModels, setShowAllOllamaModels] = useState(false);

  const query = useURLQueryParams();

  useEffect(() => {
    const provider = query.get('provider');
    if (provider) {
      setSelectedProvider(provider as 'local' | 'cloud');
    }
  }, [query]);

  const { data: llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const providerModels = useMemo(() => {
    if (!llmProviders) return {};

    return llmProviders.reduce(
      (acc, provider) => {
        const [providerName] = provider.model.split(':');
        if (providerName === ModelPrefix.Ollama) {
          return acc;
        }
        if (!acc[providerName]) {
          acc[providerName] = [];
        }
        acc[providerName].push(provider.model.split(':')[1]);
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }, [llmProviders]);

  const cloudProvidersWithInstalledModels = useMemo(() => {
    return cloudProviders.map((provider) => ({
      ...provider,
      models: providerModels[provider.prefix] || [],
    }));
  }, [providerModels]);

  const navigate = useNavigate();
  return (
    <Tabs
      className="flex h-screen w-full flex-col overflow-hidden"
      onValueChange={(value) => setSelectedProvider(value as 'local' | 'cloud')}
      value={selectedProvider}
    >
      <QueryClientProvider client={shinkaiNodeQueryClient}>
        <FixedHeaderLayout
          className="relative flex h-full w-full max-w-6xl flex-col gap-2 px-4"
          rightElement={
            <TabsList className="grid w-full max-w-xs grid-cols-2 rounded-lg border border-gray-400 bg-transparent p-0.5">
              <TabsTrigger
                className="flex items-center gap-1.5 px-3 text-sm font-semibold"
                value="local"
              >
                <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
                  <g clipPath="url(#clip0_3706_1161)">
                    <path
                      d="M3.99967 12.0002H5.33301M7.99967 12.0002H11.9997M4.66634 1.3335H11.333C12.0694 1.3335 12.6663 1.93045 12.6663 2.66683V5.3335C12.6663 6.06988 12.0694 6.66683 11.333 6.66683H4.66634C3.92996 6.66683 3.33301 6.06988 3.33301 5.3335V2.66683C3.33301 1.93045 3.92996 1.3335 4.66634 1.3335ZM2.66634 9.3335H13.333C14.0694 9.3335 14.6663 9.93045 14.6663 10.6668V13.3335C14.6663 14.0699 14.0694 14.6668 13.333 14.6668H2.66634C1.92996 14.6668 1.33301 14.0699 1.33301 13.3335V10.6668C1.33301 9.93045 1.92996 9.3335 2.66634 9.3335Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_3706_1161">
                      <rect fill="currentColor" height="16" width="16" />
                    </clipPath>
                  </defs>
                </svg>
                Local AI
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-1.5 px-3 text-sm font-semibold"
                value="cloud"
              >
                <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
                  <path
                    d="M11.6671 12.6668H6.00043C5.13501 12.6666 4.28669 12.4257 3.55028 11.9711C2.81387 11.5165 2.21838 10.8661 1.83035 10.0926C1.44231 9.31902 1.27703 8.4528 1.35296 7.59071C1.42889 6.72862 1.74305 5.90463 2.26033 5.21082C2.77761 4.517 3.47763 3.98069 4.28217 3.66182C5.0867 3.34295 5.96406 3.25408 6.8162 3.40514C7.66834 3.5562 8.46168 3.94124 9.10759 4.51723C9.75349 5.09323 10.2265 5.83748 10.4738 6.66683H11.6671C12.4627 6.66683 13.2258 6.9829 13.7884 7.54551C14.351 8.10812 14.6671 8.87118 14.6671 9.66683C14.6671 10.4625 14.351 11.2255 13.7884 11.7882C13.2258 12.3508 12.4627 12.6668 11.6671 12.6668Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Cloud AI
              </TabsTrigger>
            </TabsList>
          }
          title={t('llmProviders.localAI.installTitle')}
        >
          <ResourcesBanner />
          <TabsContent className="h-full" value="local">
            <div className="flex items-center justify-between gap-10 space-y-2 pb-4">
              <div className="max-w-3xl">
                <h1 className="font-clash text-lg font-medium">Local AI</h1>
                <p className="text-gray-80 text-sm">
                  Local AI operates directly on your device, providing immediate
                  responses and strict data privacy with no internet required.
                  Ideal for consistent, secure AI access anywhere.
                </p>
              </div>
              <Button
                className={cn('shrink-0')}
                onClick={() => setShowAllOllamaModels(!showAllOllamaModels)}
                size="sm"
                variant="outline"
              >
                <Sparkles className="h-4 w-4" />
                <span className="capitalize">
                  {showAllOllamaModels
                    ? t('shinkaiNode.models.labels.showRecommended')
                    : t('shinkaiNode.models.labels.showAll')}
                </span>
              </Button>
            </div>
            <OllamaModels
              parentSetShowAllOllamaModels={setShowAllOllamaModels}
              parentShowAllOllamaModels={showAllOllamaModels}
            />
            {isOnboardingStep && (
              <div className="flex w-full justify-center">
                <Link
                  className={cn(
                    buttonVariants({
                      size: 'sm',
                    }),
                    'gap-2 rounded-lg px-6',
                  )}
                  to={{ pathname: '/' }}
                >
                  {t('common.continue')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </TabsContent>
          <TabsContent className="h-full" value="cloud">
            <div className="flex items-center justify-between gap-10 space-y-2 pb-4">
              <div className="max-w-3xl">
                <h1 className="font-clash text-lg font-medium">Cloud AI</h1>
                <p className="text-gray-80 text-sm">
                  Cloud AI leverages remote servers for powerful computational
                  capabilities, offering scalability and real-time updates.
                  Access cutting-edge AI features with an active internet
                  connection.
                </p>
              </div>
              <Button
                className={cn('shrink-0')}
                onClick={() => navigate('/add-ai')}
                size="sm"
                variant="outline"
              >
                <Sparkles className="h-4 w-4" />
                <span className="capitalize">Add Custom AI Model </span>
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {cloudProvidersWithInstalledModels.map((model) => (
                <Card
                  className="flex h-[235px] flex-col justify-between"
                  key={model.name}
                >
                  <div className="space-y-3">
                    <CardHeader className="px-4 pb-0 pt-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-6 w-6 items-center justify-center`}
                        >
                          {model.icon}
                        </div>
                        <h3 className="font-clash text-lg font-semibold">
                          {model.name}
                        </h3>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 px-4">
                      {model.models && model.models.length > 0 ? (
                        <div>
                          <p className="text-gray-80 mb-2 text-xs uppercase">
                            Available Models
                          </p>
                          <ul className="space-y-1">
                            {model.models.map((item) => (
                              <li
                                className="text-gray-80 flex items-center gap-2 truncate text-xs"
                                key={item}
                              >
                                <span>✓</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-gray-80 text-xs">
                          {model.description}
                        </p>
                      )}

                      {model.hasInstructions && (
                        <a
                          className="w-full text-xs underline"
                          href={model.docUrl}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Instructions
                        </a>
                      )}
                    </CardContent>
                  </div>

                  <CardFooter className="px-4 pb-4">
                    <Link
                      className={cn(
                        buttonVariants({
                          size: 'sm',
                          variant: 'outline',
                        }),
                      )}
                      state={{
                        type: 'cloud',
                      }}
                      to={`/add-ai?aiProvider=${model.id}`}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add AI
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {isOnboardingStep && (
              <div className="flex w-full justify-center pt-6">
                <Link
                  className={cn(
                    buttonVariants({
                      size: 'sm',
                    }),
                    'gap-2 rounded-lg px-6',
                  )}
                  to={{ pathname: '/' }}
                >
                  {t('common.continue')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </TabsContent>
        </FixedHeaderLayout>
      </QueryClientProvider>
    </Tabs>
  );
};

export default AIModelInstallation;
