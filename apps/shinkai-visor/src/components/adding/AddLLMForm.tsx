import * as React from 'react';
import { useState } from 'react';
import Spinner from '../ui/svg/Spinner';
import { DecryptedLLMCredentials } from '../../types';
import { Messaging } from '../../messaging';
import './adding.css';
import { motion } from 'framer-motion';
import icon from '../../icons/plus-icon.svg';

interface AddLLMFormProps {
  llmName: string;
  uniqueId: string;
  url: string;
  pk: string;
  setName: (a: string) => void;
  setUrl: (a: string) => void;
  setPk: (a: string) => void;
  setCreds: (a: DecryptedLLMCredentials) => void;
}

export default function AddLLMForm({
  llmName,
  uniqueId,
  url,
  pk,
  setName,
  setUrl,
  setPk,
  setCreds,
}: AddLLMFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // New stuff
  // TODO:
  // - Check if works
  // - Store it somewhere (Localstorage?)
  async function checkConnection(
    url: string,
    llmName: string,
    pk: string | undefined
  ): Promise<void> {
    console.log('checkConnection: ', url);
    const requestBody = {
      prompt: 'Are you an AI?',
    };

    try {
      const response = await fetch(url, {
        // e.g. http://0.0.0.0:8080/submit_prompt
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (responseData.success) {
        Messaging.sendToBackground({
          action: 'cache_form_url',
          data: { url: '' },
        });
        setLoading(false);
        setCreds({ llmName, uniqueId, llmURL: url, privateKey: pk }); // TODO: add privateKey support
        console.log('responseData', responseData);
      } else {
        setError('Invalid url.\nCould Not Connect To LLM. Error code: ' + responseData.error);
        setLoading(false);
      }
    } catch (error) {
      setError('Invalid url.\nCould Not Connect To LLM. Error: ' + error);
      setLoading(false);
    }
  }

  const spinner = <Spinner width="24" height="24" innerColor="white" outerColor="black" />;

  const onChangeURL = (e: React.FormEvent<HTMLInputElement>) => {
    setUrl(e.currentTarget.value);
    Messaging.sendToBackground({
      action: 'cache_form_url',
      data: { url: e.currentTarget.value.replace(/\/$/g, '') },
    });
  };

  const onChangeName = (e: React.FormEvent<HTMLInputElement>) => setName(e.currentTarget.value);
  const onChangePk = (e: React.FormEvent<HTMLInputElement>) => setPk(e.currentTarget.value);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);
    checkConnection(url.replace(/\/$/g, ''), llmName, pk);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="padding flex-grow-wrapper"
    >
      <div>
        <div className="container-progress">
          <div className="progress-bar" style={{ width: '66%' }} />
          <span className="progress-step">Step 2/3</span>
        </div>
        <img src={icon} className="icon" />
        <h2 className="mid-title">Input Your LLM Credentials</h2>
      </div>
      <form className="form" onSubmit={onSubmit}>
        <div className="inputs flex-grow">
          <label className="label-input" htmlFor="llmName">
            LLM Name
          </label>
          <input
            type="text"
            name="llmName"
            id="loginFormLLMUrl"
            value={llmName}
            placeholder="My LLM"
            onChange={onChangeName}
            required
          />
          <label className="label-input" htmlFor="llmURL">
            URL
          </label>
          <input
            type="text"
            name="llmURL"
            id="loginFormLlmURL"
            value={url}
            placeholder="http://localhost"
            onChange={onChangeURL}
            required
          />
          {/* <label className="label-input" htmlFor="shipCode">
            +code ({code.length}/27)
          </label>
          <input
            type="password"
            name="shipCode"
            id="loginFormShipCode"
            value={code}
            placeholder="sampel-sampel-sampel-sampel"
            onChange={onChangeCode}
            maxLength={27}
            required
          /> */}
        </div>
        <div className="errorMessage">
          {loading && <div className="spinner">{spinner}</div>}
          {error.split('\n').map(p => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <button
          disabled={llmName.length < 1 || !url.includes('http')}
          className="single-button"
          type="submit"
        >
          + Add LLM
        </button>
      </form>
    </motion.div>
  );
}
