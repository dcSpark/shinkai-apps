import { FileKey, QrCode, Zap } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';

import { ConnectionMethodOption } from '../connection-method-option/connection-method-option';

export const ConnectSelectMethod = () => {
  const history = useHistory();
  const selectQuickStartMethod = () => {
    history.push('/nodes/connect/method/quick-start');
  };
  const selectQRCodeMethod = () => {
    history.push('/nodes/connect/method/qr-code');
  };
  const selectRestoreMethod = () => {
    history.push('/nodes/connect/method/restore-connection');
  };
  return (
    <div className="h-full flex flex-col space-y-3">
      <div className="grow-0 flex flex-col space-y-1">
        <span className="text-xl">
          <FormattedMessage id="connect-your-shinkai-node" />
        </span>
        <span className="text-xs">
          <FormattedMessage id="select-connection-method" />
        </span>
      </div>
      <div className="h-full flex flex-col space-y-3 grow place-content-center justify-center">
        <ConnectionMethodOption
          description={
            <FormattedMessage id="quick-connection-connection-method-description" />
          }
          icon={<Zap />}
          onClick={() => selectQuickStartMethod()}
          title={
            <FormattedMessage id="quick-connection-connection-method-title" />
          }
        />

        <ConnectionMethodOption
          description={
            <FormattedMessage id="qr-code-connection-connection-method-description" />
          }
          icon={<QrCode />}
          onClick={() => selectQRCodeMethod()}
          title={
            <FormattedMessage id="qr-code-connection-connection-method-title" />
          }
        />

        <ConnectionMethodOption
          description={
            <FormattedMessage id="restore-connection-connection-method-description" />
          }
          icon={<FileKey />}
          onClick={() => selectRestoreMethod()}
          title={
            <FormattedMessage id="restore-connection-connection-method-title" />
          }
        />
      </div>
    </div>
  );
};
