import * as React from 'react';
import Spinner from '../ui/svg/Spinner';

interface ConnectFooterProps {
  setPw: (value: string) => void;
  error: string;
  confirmString: string;
  children: React.ReactNode;
}

const ConnectFooter = ({ setPw, error, confirmString, children }: ConnectFooterProps) => (
  <>
    <div className="flex-grow">
      <p className="confirm-string">{confirmString}</p>
      <label className="label-input">Master Password</label>
      <input
        onChange={e => setPw(e.currentTarget.value)}
        type="password"
        placeholder="Master Password"
      />
      <p className="errorMessage">{error}</p>
    </div>
    {children}
  </>
);

export default ConnectFooter;
