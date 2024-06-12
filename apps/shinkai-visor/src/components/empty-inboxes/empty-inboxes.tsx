import { Button } from '@shinkai_network/shinkai-ui';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

type EmptyInboxesProps = React.HTMLAttributes<HTMLDivElement>

export const EmptyInboxes = ({ ...props }: EmptyInboxesProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex grow flex-col items-center justify-center" {...props}>
      <div className="mb-8 space-y-3 text-center">
        <span aria-hidden className="text-5xl">
          🤖
        </span>
        <p className="text-lg font-semibold">
          <FormattedMessage id="empty-inboxes-title" />
        </p>
        <p className="text-center text-sm">
          <FormattedMessage id="empty-inboxes-message" />
        </p>
      </div>

      <Button onClick={() => navigate('/inboxes/create-job')}>
        <FormattedMessage id="create-job" />
      </Button>
    </div>
  );
};
