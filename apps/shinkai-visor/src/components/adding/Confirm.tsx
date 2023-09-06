import * as React from 'react';
import { useState } from 'react';
import { initPerms } from '../../shinkai';
import { getStorage, decrypt } from '../../storage';
import Spinner from '../ui/svg/Spinner';
import { motion } from 'framer-motion';
import icon from '../../icons/success-icon.svg';
import './adding.css';
import { DecryptedShipCredentials, EncryptedShipCredentials } from '../../types';

interface ConfirmProps {
  url: string;
  code: string;
  creds: EncryptedShipCredentials;
  goBack: () => void;
  save: (shipName: string, url: string, code: string, pw: string) => void;
}
export default function Confirm(props: ConfirmProps) {
  const decryptedCreds: DecryptedShipCredentials = {
    shipName: props.creds.shipName,
    shipURL: decrypt(props.creds.encryptedShipURL, 'caching'),
    shipCode: decrypt(props.creds.encryptedShipCode, 'caching'),
  };
  const [loading, setLoading] = useState(false);
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const spinner = (
    <div className="spinner">
      <Spinner width="24" height="24" innerColor="white" outerColor="black" />
    </div>
  );

  function addShip(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    getStorage('password').then(res => {
      const string = decrypt(res.password, pw);
      if (string === 'shinkai_visor') {
        saveShip();
      } else {
        setError('Wrong Password');
      }
    });
  }
  function saveShip() {
    setLoading(true);
    initPerms(decryptedCreds.shipName, decryptedCreds.shipURL)
      .then(res => {
        props.save(decryptedCreds.shipName, decryptedCreds.shipURL, decryptedCreds.shipCode, pw);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        setError('Error Adding Ship, Please Try Again');
      });
  }
  const hidden = { display: 'none' };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="padding flex-grow-wrapper"
    >
      <div>
        <div className="container-progress">
          <div className="progress-bar" style={{ width: '100%' }} />
          <span className="progress-step">Step 3/3</span>
        </div>
        <div className="image-container">
          <img src={icon} className="image-success" />
        </div>
        <h1 className="center-title">Connection Success To</h1>
        <div className="container-shipname">
          <p className="confirm-shipname">~{decryptedCreds.shipName} </p>
        </div>
      </div>
      <form onSubmit={addShip} className="form">
        <label className="label-input" htmlFor="">
          Confirm master password
        </label>
        <input type="submit" style={hidden} />
        <div className="flex-grow">
          <input
            value={pw}
            onChange={e => setPw(e.currentTarget.value)}
            type="password"
            placeholder="Master Password"
          />
          {loading && spinner}
          <p className="errorMessage">{error}</p>
        </div>
        <div className="two-buttons">
          <button className="red-bg left" onClick={props.goBack}>
            Cancel
          </button>
          <button disabled={!pw} type="submit" className="single-button right">
            Submit
          </button>
        </div>
      </form>
    </motion.div>
  );
}
