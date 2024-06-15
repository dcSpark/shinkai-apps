import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { Button } from '@shinkai_network/shinkai-ui';
import React from 'react';
import { useNavigate } from 'react-router-dom';

type EmptyInboxesProps = React.HTMLAttributes<HTMLDivElement>;

export const EmptyInboxes = ({ ...props }: EmptyInboxesProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex grow flex-col items-center justify-center" {...props}>
      <div className="mb-8 space-y-3 text-center">
        <span aria-hidden className="text-5xl">
          🤖
        </span>
        <p className="text-lg font-semibold">{t('chat.emptyStateTitle')}</p>
        <p className="text-center text-sm">{t('chat.emptyStateDescription')}</p>
      </div>

      <Button onClick={() => navigate('/inboxes/create-job')}>
        {t('chat.create')}
      </Button>
    </div>
  );
};
