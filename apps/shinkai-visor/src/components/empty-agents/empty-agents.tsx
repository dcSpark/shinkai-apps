import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Button } from '@shinkai_network/shinkai-ui';
import React from 'react';
import { useNavigate } from 'react-router-dom';

type EmptyAgentsProps = React.HTMLAttributes<HTMLDivElement>;

export const EmptyAgents = ({ ...props }: EmptyAgentsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="flex grow flex-col items-center justify-center" {...props}>
      <div className="mb-8 space-y-3 text-center">
        <span aria-hidden className="text-5xl">
          🤖
        </span>
        <p className="text-2xl font-semibold">{t('agents.notFound.title')}</p>
        <p className="text-center text-sm font-medium text-gray-100">
          {t('agents.notFound.description')}
        </p>
      </div>

      <Button onClick={() => navigate('/agents/add')}>{t('agents.add')}</Button>
    </div>
  );
};
