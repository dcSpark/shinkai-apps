import { FileKey, SettingsIcon } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';

import { Header } from '../header/header';
import { Button } from '../ui/button';

export const Settings = () => {
  const history = useHistory();
  const exportConnection = () => {
    history.push('settings/export-connection');
  };
  return (
    <div className="flex flex-col space-y-3">
      <Header
        icon={<SettingsIcon />}
        title={<FormattedMessage id="setting.other"></FormattedMessage>}
      />
      <div>
        <Button className="w-full" onClick={() => exportConnection()}>
          <FileKey className="mr-2 h-4 w-4" />
          <FormattedMessage id="export-connection" />
        </Button>
      </div>
    </div>
  );
};
