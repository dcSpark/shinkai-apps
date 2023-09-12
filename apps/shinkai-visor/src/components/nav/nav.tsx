import './nav.css';

import { ArrowLeftOutlined, CloseOutlined,MenuOutlined } from '@ant-design/icons';
import { useClickAway } from '@uidotdev/usehooks';
import { Button } from 'antd';
import { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import visorLogo from '../../assets/icons/visor.svg';
import { NavMenu } from '../nav-menu/nav-menu';

export default function NavBar() {
  const history = useHistory();
  const location = useLocation();
  const [isMenuOpened, setMenuOpened] = useState(false);
  const isRootPage = ['/welcome'].includes(location.pathname);
  console.log(location.pathname);
  const ref = useClickAway<HTMLElement>(() => {
    setMenuOpened(false);
  });

  function goBack() {
    history.goBack();
  }

  return (
    <nav
      className={`flex flex-col bg-gray-100 shadow-lg p-5 rounded-lg space-y-6`}
      ref={ref}
    >
      <div className="flex flex-row justify-between place-items-center">
        {!isRootPage && (
          <Button
            className="grow-0"
            icon={<ArrowLeftOutlined />}
            onClick={() => goBack()}
            shape="circle"
          >
          </Button>
        )}
        <img alt="shinkai-app-logo" className="grow-0" src={visorLogo} />
        <Button icon={!isMenuOpened ? <MenuOutlined /> : <CloseOutlined />} onClick={() => setMenuOpened(!isMenuOpened)}>
        </Button>
      </div>
      {isMenuOpened && <NavMenu />}
    </nav>
  );
}
