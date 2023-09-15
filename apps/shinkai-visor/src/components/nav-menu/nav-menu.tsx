import './nav-menu.css';

import { InboxOutlined, LogoutOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { disconnectNode } from '../../service-worker/store/node/node-actions';

enum MenuOption {
  Inbox = 'inbox',
  Logout = 'logout',
}

export const NavMenu = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const onClickMenuOption = (key: MenuOption) => {
    console.log('onClickMenuOption', key);

    switch (key) {
      case MenuOption.Inbox:
        break;
      case MenuOption.Logout:
        logout();
        break;
      default:
        break;
    }
  }
  const logout = (): void => {
    console.log('logout bro');
    dispatch(disconnectNode())
  }

  return (
    <Menu
      className="remove-antd-style"
      items={[
        { key: MenuOption.Inbox, label: intl.formatMessage({ id: 'inbox.other' }), icon: <InboxOutlined></InboxOutlined> },
        { key: MenuOption.Logout, label: intl.formatMessage({ id: 'logout' }), icon: <LogoutOutlined></LogoutOutlined> },
      ]}
      onClick={(e) => onClickMenuOption(e.key as unknown as MenuOption)}
    />
  );
};
