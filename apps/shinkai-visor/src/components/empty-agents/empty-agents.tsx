import { Button } from '@shinkai_network/shinkai-ui';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

export const EmptyAgents = () => {
  const history = useHistory();
  return (
    <div className="align-center flex grow flex-col justify-center">
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

      <Button className="" onClick={() => history.push('/agents/add')}>
        <FormattedMessage id="add-agent" />
      </Button>
    </div>
  );
};
