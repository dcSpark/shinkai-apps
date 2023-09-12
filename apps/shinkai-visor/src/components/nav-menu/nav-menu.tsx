import './nav-menu.css';

import { InboxOutlined, InfoCircleOutlined,SettingOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

export const NavMenu = () => {
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex flex-row space-x-2 align-content-center">
        <InboxOutlined />
        <span>
          <FormattedMessage id="inbox.other"></FormattedMessage>
        </span>
      </div>
      <div className="flex flex-row space-x-2">
        <SettingOutlined />
        <span>
          <FormattedMessage id="settings.other"></FormattedMessage>
        </span>
      </div>
      <div className="flex flex-row space-x-2">
        <InfoCircleOutlined />
        <span>
          <FormattedMessage id="about"></FormattedMessage>
        </span>
      </div>
    </div>
  );
};
