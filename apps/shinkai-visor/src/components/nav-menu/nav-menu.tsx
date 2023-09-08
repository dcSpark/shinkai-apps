import { FormattedMessage } from 'react-intl';
import RocketIcon from '../../assets/icons/rocket.svg';
import SettingsIcon from '../../assets/icons/settings.svg';
import AboutIcon from '../../assets/icons/info.svg';

import './nav-menu.css';

export const NavMenu = () => {
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex flex-row space-x-2 align-content-center">
        <img alt="rocket-icon" src={RocketIcon} />
        <span>
          <FormattedMessage id="inbox.other"></FormattedMessage>
        </span>
      </div>
      <div className="flex flex-row space-x-2">
        <img alt="settings-icon" src={SettingsIcon} />
        <span>
          <FormattedMessage id="settings.other"></FormattedMessage>
        </span>
      </div>
      <div className="flex flex-row space-x-2">
        <img alt="about-icon" src={AboutIcon} />
        <span>
          <FormattedMessage id="about"></FormattedMessage>
        </span>
      </div>
    </div>
  );
};
