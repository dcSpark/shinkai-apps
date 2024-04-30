import { cn } from '@shinkai_network/shinkai-ui/utils';
import { LucideArrowLeft } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { HOME_PATH } from '../../routes/name';

export const SubpageLayout = ({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="relative mx-auto max-w-lg py-10">
      <Link className="absolute left-0" to={HOME_PATH}>
        <LucideArrowLeft />
        <span className="sr-only">Back</span>
      </Link>
      <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight">
        {title}
      </h1>
      <div className="flex-1">{children}</div>
    </div>
  );
};
export const SimpleLayout = ({
  title,
  children,
  classname,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  classname?: string;
}) => {
  return (
    <div
      className={cn(
        'mx-auto flex h-full max-w-4xl flex-col gap-4 px-2 py-10',
        classname,
      )}
    >
      {title ? (
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      ) : null}
      <div className="flex-1">{children}</div>
    </div>
  );
};
