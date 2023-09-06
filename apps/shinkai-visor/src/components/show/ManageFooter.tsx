import * as React from 'react';
import permissionIcon from '../../icons/permissions-icon.svg';
import dashboardIcon from '../../icons/dashboard-icon.svg';
import homeIcon from '../../icons/home-icon.svg';

interface ManagerFooterProps {
  children: React.ReactNode;
  confirmPerms: () => void;
  gotoDashboard: () => void;
  confirmHome: () => void;
}

const ManagerFooter = ({
  children,
  confirmPerms,
  gotoDashboard,
  confirmHome,
}: ManagerFooterProps) => (
  <>
    {children}
    <div className="row-buttons">
      <button onClick={confirmPerms} className="surface-button vertical">
        <img src={permissionIcon} className="button-icon" />
        Permissions
      </button>
      <div className="separator" />
      <button onClick={gotoDashboard} className="surface-button vertical">
        <img src={dashboardIcon} className="button-icon" />
        Dashboard
      </button>
      <div className="separator" />
      <button onClick={confirmHome} className="surface-button vertical">
        <img src={homeIcon} className="button-icon" />
        Home
      </button>
    </div>
  </>
);

export default ManagerFooter;
