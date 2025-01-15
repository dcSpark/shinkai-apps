import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  ExportIcon,
  PromptLibraryIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  BarChart2,
  CodesandboxIcon,
  SettingsIcon,
  WalletMinimal,
} from 'lucide-react';
import React from 'react';
import { Link, Outlet, useMatch } from 'react-router-dom';

import galxeIcon from '../../assets/galxe-icon.png';
import { openShinkaiNodeManagerWindow } from '../../lib/shinkai-node-manager/shinkai-node-manager-windows-utils';
import { useAuth } from '../../store/auth';
import { useShinkaiNodeManager } from '../../store/shinkai-node-manager';

type NavigationLink = {
  title: string;
  href: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  external?: boolean;
  disabled?: boolean;
};
const NavLink = ({
  href,
  external,
  onClick,
  icon,
  title,
  disabled,
}: {
  href: string;
  external?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  title: string;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();

  const isMatch = useMatch({
    path: href,
    end: true,
  });

  if (disabled) {
    return (
      <div
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-4 py-3 text-white transition-colors',
          'opacity-40',
        )}
      >
        {icon && <span>{icon}</span>}

        <div className="flex items-center gap-3 whitespace-nowrap text-xs">
          <span className="max-w-[100px] truncate">{title} </span>
          <Badge className="text-[10px] uppercase" variant="inputAdornment">
            {t('common.soon')}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Link
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-4 py-3 text-white transition-colors',
        isMatch
          ? 'bg-gray-300 text-white'
          : 'opacity-60 hover:bg-gray-500 hover:opacity-100',
      )}
      onClick={onClick}
      rel={external ? 'noreferrer' : ''}
      target={external ? '_blank' : ''}
      to={href}
    >
      <span>{icon}</span>

      <div className="whitespace-nowrap text-xs">{title}</div>
    </Link>
  );
};

export function MainNav() {
  const { t } = useTranslation();
  const isLocalShinkaiNodeInUse = useShinkaiNodeManager(
    (state) => state.isInUse,
  );

  const navigationLinks = [
    {
      title: t('settings.layout.general'),
      href: '/settings',
      icon: <SettingsIcon className="text-gray-80 h-4 w-4" />,
    },
    isLocalShinkaiNodeInUse && {
      title: t('settings.layout.shinkaiNode'),
      href: '#',
      onClick: () => {
        openShinkaiNodeManagerWindow();
      },
      icon: <CodesandboxIcon className="text-gray-80 h-4 w-4" />,
    },
    {
      title: t('settings.layout.analytics'),
      href: '/settings/analytics-settings',
      icon: <BarChart2 className="text-gray-80 h-4 w-4" />,
    },
    {
      title: t('settings.layout.exportConnection'),
      href: '/settings/export-connection',
      icon: <ExportIcon className="text-gray-80 h-4 w-4" />,
    },
    {
      title: t('settings.layout.publicKeys'),
      href: '/settings/public-keys',
      icon: (
        <svg
          className="text-gray-80 h-4 w-4"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0"
          viewBox="0 0 512 512"
        >
          <path d="M261.1 24.8c-6.3 0-12.7.43-19.2 1.18-34.6 4.01-64.8 17.59-86.1 37.06-21.4 19.48-34.2 45.56-31 73.16 2.8 24.6 17.8 45.2 39.1 59.4 2.6-6.2 5.9-11.9 9.2-16.5-17.6-11.6-28.4-27.3-30.4-45-2.3-19.7 6.7-39.58 24.8-56.14 18.2-16.57 45.3-29.06 76.6-32.68 31.3-3.63 60.6 2.33 82.1 14.3 21.4 11.98 34.7 29.31 37 48.92 2.2 19.3-6.2 38.8-23.4 55a69.91 69.91 0 0 0-35.4-10.6h-2.2c-5.1.1-10.1.7-15.3 1.8-37.5 8.7-60.8 45.5-52.2 82.7 5.3 23 21.6 40.6 42.2 48.5l39.7 172.2 47 29.1 29.5-46.7-23.5-14.5 14.8-23.4-23.5-14.6 14.7-23.3-23.5-14.6 14.8-23.4-13.5-58.4c15.1-16.1 22-39.1 16.7-62.2-2.7-11.7-8.2-22-15.8-30.4 18.9-19 29.8-43.5 26.8-69.2-3.2-27.55-21.6-50.04-46.9-64.11-20.5-11.45-45.8-17.77-73.1-17.59zm-20.2 135.5c-25.9 1.1-49.9 16.8-60.4 42.2-9.1 21.9-6 45.7 6.2 64.2l-67.8 163 21.3 51 51.2-20.9-10.7-25.5 25.6-10.4-10.6-25.5 25.6-10.4-10.7-25.5 25.6-10.5 22.8-54.8c-20.5-11.5-36.2-31.2-41.9-55.8-6.9-30.3 3.1-60.6 23.8-81.1zm58 7.2c8.9-.1 17.3 3.5 23.4 9.4-5.5 3.5-11.6 6.6-18 9.4-1.6-.6-3.3-.8-5.1-.8-.6 0-1.1 0-1.6.1-7 .8-12.2 6.1-13.1 12.7-.2 1-.2 2-.2 2.9.1.3.1.7.1 1 1 8.4 8.3 14.2 16.7 13.2 6.8-.8 12-5.9 13-12.3 6.2-2.8 12-5.9 17.5-9.4.2 1 .4 2 .5 3 2.1 18-11 34.5-29 36.6-17.9 2.1-34.5-11-36.5-29-2.1-18 11-34.5 29-36.6 1.1-.1 2.2-.2 3.3-.2z" />
        </svg>
      ),
    },
    {
      title: t('settings.layout.promptLibrary'),
      href: '/settings/prompt-library',
      icon: <PromptLibraryIcon className="text-gray-80 h-4 w-4" />,
    },
    {
      title: t('settings.layout.cryptoWallet'),
      href: '/settings/crypto-wallet',
      icon: <WalletMinimal className="text-gray-80 h-4 w-4" />,
    },
    {
      title: t('settings.layout.galxe'),
      href: '/settings/galxe-validation',
      icon: (
        <div className="text-gray-100">
          <img alt="galxe icon" className="h-4 w-4" src={galxeIcon} />
        </div>
      ),
      disabled: true,
    },
  ].filter(Boolean) as NavigationLink[];

  return (
    <aside className="flex max-w-[250px] flex-1 shrink-0 flex-col gap-2 overflow-y-auto overflow-x-hidden border-r border-gray-400 px-2 py-6 pt-9">
      <div className="flex flex-col gap-1.5">
        {navigationLinks.map((item) => {
          if (item.disabled) {
            return (
              <TooltipProvider
                delayDuration={item.disabled ? 0 : 10000}
                key={item.title}
              >
                <Tooltip>
                  <TooltipTrigger>
                    <NavLink
                      disabled={item.disabled}
                      external={item.external}
                      href={item.href}
                      icon={item.icon}
                      title={item.title}
                    />
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent
                      align="start"
                      alignOffset={16}
                      arrowPadding={2}
                      className="max-w-[240px]"
                      side="bottom"
                      sideOffset={-6}
                    >
                      <p>
                        {' '}
                        Galxe is going to come back the first week of October.
                        More details soon.
                      </p>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return (
            <NavLink
              disabled={item.disabled}
              external={item.external}
              href={item.href}
              icon={item.icon}
              key={item.title}
              onClick={item.onClick}
              title={item.title}
            />
          );
        })}
      </div>
    </aside>
  );
}

const SettingsLayout = () => {
  const auth = useAuth((state) => state.auth);

  return (
    <div className={cn('flex min-h-screen flex-1', !!auth && '')}>
      <MainNav />
      <div className={cn('flex-1 overflow-hidden')}>
        <Outlet />
      </div>
    </div>
  );
};
export default SettingsLayout;
