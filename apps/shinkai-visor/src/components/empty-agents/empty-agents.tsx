import { Button } from '@shinkai_network/shinkai-ui';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

interface EmptyAgentsProps extends React.HTMLAttributes<HTMLDivElement> {
}

export const EmptyAgents = ({ ...props }: EmptyAgentsProps) => {
  const history = useHistory();
  return (
    <div className="flex grow flex-col items-center justify-center" { ...props }>
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

      <Button onClick={() => history.push('/agents/add')}>
        <FormattedMessage id="add-agent" />
      </Button>
    </div>
  );
};
