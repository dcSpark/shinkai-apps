import { Button } from '@shinkai_network/shinkai-ui';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

interface EmptyInboxesProps extends React.HTMLAttributes<HTMLDivElement> {}

export const EmptyInboxes = ({ ...props }: EmptyInboxesProps) => {
  const history = useHistory();
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

      <Button onClick={() => history.push('/inboxes/create-job')}>
        <FormattedMessage id="create-job" />
      </Button>
    </div>
  );
};
