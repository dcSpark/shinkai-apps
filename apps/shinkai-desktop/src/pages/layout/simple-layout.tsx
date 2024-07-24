import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { LucideArrowLeft } from 'lucide-react';
import React from 'react';
import { Link, To } from 'react-router-dom';

export const SubpageLayout = ({
  title,
  children,
  className,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => {
  const { t } = useTranslation();
  return (
    <div className={cn('relative mx-auto max-w-xl py-10', className)}>
      <Link className="absolute left-4" to={-1 as To}>
        <LucideArrowLeft />
        <span className="sr-only">{t('common.back')}</span>
      </Link>
      <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight">
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
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => {
  const { t } = useTranslation();

  return (
    <div className={cn('mx-auto h-screen max-w-lg py-10 pb-4', className)}>
      <div className="mx-2 flex justify-between">
        <Link className="" to={-1 as To}>
          <LucideArrowLeft />
          <span className="sr-only">{t('common.back')}</span>
        </Link>
        <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        <div />
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
