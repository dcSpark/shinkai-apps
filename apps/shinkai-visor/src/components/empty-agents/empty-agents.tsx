import { Button } from '@shinkai_network/shinkai-ui';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

type EmptyAgentsProps = React.HTMLAttributes<HTMLDivElement>

export const EmptyAgents = ({ ...props }: EmptyAgentsProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex grow flex-col items-center justify-center" {...props}>
      <div className="mb-8 space-y-3 text-center">
        <span aria-hidden className="text-5xl">
          🤖
        </span>
        <p className="text-2xl font-semibold">
          <FormattedMessage id="empty-agents-title" />
        </p>
        <p className="text-center text-sm font-medium text-gray-100">
          <FormattedMessage id="empty-agents-message" />
        </p>
      </div>

      <Button onClick={() => navigate('/agents/add')}>
        <FormattedMessage id="add-agent" />
      </Button>
    </div>
  );
};
