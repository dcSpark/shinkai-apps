import { CodeLanguage } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ChevronDownIcon } from 'lucide-react';

import { actionButtonClassnames } from '../../chat/conversation-footer';

const LANGUAGE_TOOLS = [
  {
    label: CodeLanguage.Python,
    value: CodeLanguage.Python,
    icon: (
      <svg
        className="size-4 text-white"
        fill={'none'}
        height={24}
        viewBox="0 0 24 24"
        width={24}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11 5.49976V5.50976"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
        <path
          d="M13 18.4898V18.4998"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
        <path
          d="M17.498 8.5H15.4989V6.5C15.4989 5.09554 15.4989 4.39331 15.1618 3.88886C15.0159 3.67048 14.8284 3.48298 14.61 3.33706C14.1056 3 13.4033 3 11.9989 3C10.5944 3 9.89218 3 9.38773 3.33706C9.16935 3.48298 8.98185 3.67048 8.83593 3.88886C8.49887 4.39331 8.49887 5.09554 8.49887 6.5V8.5H6.49805C5.09358 8.5 4.39135 8.5 3.88691 8.83706C3.66853 8.98298 3.48103 9.17048 3.33511 9.38886C2.99805 9.89331 2.99805 10.5955 2.99805 12C2.99805 13.4045 2.99805 14.1067 3.33511 14.6111C3.48102 14.8295 3.66853 15.017 3.88691 15.1629C4.39135 15.5 5.09358 15.5 6.49805 15.5H8.49887V17.5C8.49887 18.9045 8.49887 19.6067 8.83593 20.1111C8.98185 20.3295 9.16935 20.517 9.38773 20.6629C9.89218 21 10.5944 21 11.9989 21C13.4033 21 14.1056 21 14.61 20.6629C14.8284 20.517 15.0159 20.3295 15.1618 20.1111C15.4989 19.6067 15.4989 18.9045 15.4989 17.5V15.5H17.498C18.9025 15.5 19.6047 15.5 20.1092 15.1629C20.3276 15.017 20.5151 14.8295 20.661 14.6111C20.998 14.1067 20.998 13.4045 20.998 12C20.998 10.5955 20.998 9.89331 20.661 9.38886C20.5151 9.17048 20.3276 8.98298 20.1092 8.83706C19.6047 8.5 18.9025 8.5 17.498 8.5Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M15.5 8.5V12H8.5V15.5M12 15.5H15.5M8.5 8.5H12"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    label: CodeLanguage.Typescript,
    value: CodeLanguage.Typescript,
    icon: (
      <svg
        className="size-4 text-white"
        fill="none"
        height="24"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.5 12.0001C2.5 7.52178 2.5 5.28261 3.89124 3.89136C5.28249 2.50012 7.52166 2.50012 12 2.50012C16.4783 2.50012 18.7175 2.50012 20.1088 3.89136C21.5 5.28261 21.5 7.52178 21.5 12.0001C21.5 16.4785 21.5 18.7176 20.1088 20.1089C18.7175 21.5001 16.4783 21.5001 12 21.5001C7.52166 21.5001 5.28249 21.5001 3.89124 20.1089C2.5 18.7176 2.5 16.4785 2.5 12.0001Z"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M18 12.0001H16.2C15.5373 12.0001 15 12.5374 15 13.2001V13.8001C15 14.4629 15.5373 15.0001 16.2 15.0001H16.8C17.4627 15.0001 18 15.5374 18 16.2001V16.8001C18 17.4629 17.4627 18.0001 16.8 18.0001H15"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M8.5 12.0001H10.5M12.5 12.0001H10.5M10.5 12.0001V18.0001"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

export function LanguageToolSelector({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger
              className={cn(
                actionButtonClassnames,
                'flex w-auto items-center justify-between gap-2 truncate [&[data-state=open]>.icon]:rotate-180',
              )}
            >
              <div className="flex items-center gap-1">
                {
                  (
                    LANGUAGE_TOOLS.find(
                      (language) => language.value === value,
                    ) ?? LANGUAGE_TOOLS[0]
                  ).icon
                }
                {value}
              </div>
              <ChevronDownIcon className="icon h-3 w-3" />
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent align="center" side="top">
              Switch code language
            </TooltipContent>
          </TooltipPortal>
          <DropdownMenuContent
            align="start"
            className="min-w-[200px] overflow-y-auto bg-gray-300 p-1 py-2"
            side="top"
          >
            <DropdownMenuRadioGroup onValueChange={onValueChange} value={value}>
              {LANGUAGE_TOOLS.map((language) => (
                <DropdownMenuRadioItem
                  className="flex cursor-pointer items-center justify-between gap-1.5 rounded-md px-2 py-2 text-white transition-colors hover:bg-gray-200 aria-checked:bg-gray-200"
                  key={language.value}
                  value={language.value}
                >
                  <div className="inline-flex gap-1.5">
                    {language.icon}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs">{language.label}</span>
                    </div>
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </Tooltip>
      </TooltipProvider>
    </DropdownMenu>
  );
}
