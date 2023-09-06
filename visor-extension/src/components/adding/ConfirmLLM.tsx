import * as React from 'react';
import { useState } from 'react';
import { initPerms } from '../../shinkai';
import { getStorage, decrypt } from '../../storage';
import Spinner from '../ui/svg/Spinner';
import { motion } from 'framer-motion';
import icon from '../../icons/success-icon.svg';
import './adding.css';
import {
  DecryptedLLMCredentials,
  DecryptedShipCredentials,
  EncryptedLLMCredentials,
} from '../../types';

interface ConfirmLLMProps {
  llmName: string;
  url: string;
  pk: string;
  creds: EncryptedLLMCredentials;
  goBack: () => void;
  save: (llmName: string, url: string, pk: string, pw: string) => void;
}
export default function ConfirmLLM(props: ConfirmLLMProps) {
  const decryptedCreds: DecryptedLLMCredentials = {
    llmName: props.creds.llmName,
    uniqueId: props.creds.uniqueId,
    llmURL: decrypt(props.creds.encryptedLlmURL, 'caching'),
    privateKey: decrypt(props.creds.encryptedPrivateKey, 'caching'),
  };
  const [loading, setLoading] = useState(false);
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const spinner = (
    <div className="spinner">
      <Spinner width="24" height="24" innerColor="white" outerColor="black" />
    </div>
  );

  function addLLM(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    getStorage('password').then(res => {
      const string = decrypt(res.password, pw);
      if (string === 'shinkai_visor') {
        saveLLM();
      } else {
        setError('Wrong Password');
      }
    });
  }
  function saveLLM() {
    setLoading(true);
    props.save(decryptedCreds.llmName, decryptedCreds.llmURL, decryptedCreds.privateKey, pw);
    setLoading(false);
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
          <p className="confirm-shipname">~{decryptedCreds.llmName} </p>
        </div>
      </div>
      <form onSubmit={addLLM} className="form">
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
