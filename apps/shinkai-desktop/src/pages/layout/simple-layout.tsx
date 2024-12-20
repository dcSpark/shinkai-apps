import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { LucideArrowLeft } from 'lucide-react';
import React from 'react';
import { Link, To } from 'react-router-dom';

export const SubpageLayout = ({
  title,
  children,
  className,
  alignLeft,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  alignLeft?: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <div className={cn('relative mx-auto max-w-2xl py-10', className)}>
      <Link
        className={cn('absolute left-4', alignLeft && 'left-0')}
        to={-1 as To}
      >
        <LucideArrowLeft />
        <span className="sr-only">{t('common.back')}</span>
      </Link>
      <h1
        className={cn(
          'mb-8 text-center text-2xl font-semibold tracking-tight',
          alignLeft && 'pl-[40px] pt-0 text-left text-xl',
        )}
      >
        {title}
      </h1>
      <div className="flex-1">{children}</div>
    </div>
  );
};
export const FixedHeaderLayout = ({
  title,
  children,
  className,
  rightElement,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
  className?: string;
}) => {
  const { t } = useTranslation();

  return (
    <div className={cn('mx-auto h-screen max-w-lg py-10 pb-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link className="" to={-1 as To}>
            <LucideArrowLeft />
            <span className="sr-only">{t('common.back')}</span>
          </Link>
          <h1 className="font-clash text-center text-2xl font-semibold tracking-tight">
            {title}
          </h1>
        </div>
        {rightElement}
      </div>
      {children}
    </div>
  );
};
export const SimpleLayout = ({
  title,
  children,
  classname,
  headerRightElement,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  headerRightElement?: React.ReactNode;
  classname?: string;
}) => {
  return (
    <div
      className={cn(
        'mx-auto flex h-full max-w-4xl flex-col gap-4 px-5 py-10',
        classname,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {title ? (
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        ) : null}
        {headerRightElement}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
};
