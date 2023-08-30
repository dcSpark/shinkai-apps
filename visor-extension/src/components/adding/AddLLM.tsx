import * as React from 'react';
import { useState, useEffect } from 'react';
import { Messaging } from '../../messaging';
import {
  DecryptedLLMCredentials,
  EncryptedLLMCredentials,
} from '../../types';
import { encryptLLMCreds } from '../../storage';
import { motion } from 'framer-motion';
import { useHistory } from 'react-router';
import AddLLMForm from './AddLLMForm';
import ConfirmLLM from './ConfirmLLM';
import { v4 as uuidv4 } from 'uuid';

export default function AddLLM() {
  useEffect(() => {
    let isMounted = true;
    Messaging.sendToBackground({ action: 'get_cached_url' }).then(res => {
      if (isMounted) {
        setURL(res.cached_url);
        fixCreds(res.cached_creds);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);
  const history = useHistory();

  function goBack() {
    Messaging.sendToBackground({
      action: 'cache_form_creds',
      data: { creds: null },
    });
    fixCreds(null);
  }

  async function save(llmName: string, url: string, pk: string, pw: string): Promise<any> {
    Messaging.sendToBackground({
      action: 'add_llm',
      data: { llmName, uniqueId, url, pk, pw },
    }).then(res => {
      Messaging.sendToBackground({
        action: 'cache_form_creds',
        data: { creds: null },
      });
      history.push(`/llm/${creds.uniqueId}`);
    });
  }

  // TODO: add other options e.g.
  // - adapter type e.g. langchain / gpt4 / etc so we don't need to pass submit_prompt
  // - add secret key
  const [llmName, setLlmName] = useState('My LLM');
  const [url, setURL] = useState('http://0.0.0.0:8080/submit_prompt');
  const [pk, setPk] = useState('');
  const [creds, fixCreds] = useState<EncryptedLLMCredentials>(null);
  const [uniqueId, setUniqueId] = useState(uuidv4());

  function setCreds(creds: DecryptedLLMCredentials) {
    const encryptedCreds: EncryptedLLMCredentials = encryptLLMCreds(
      creds.llmName,
      creds.uniqueId,
      creds.llmURL,
      creds.privateKey,
      'caching'
    );
    Messaging.sendToBackground({ action: 'cache_form_creds', data: { creds: encryptedCreds } });
    fixCreds(encryptedCreds);
  }

  const component = creds ? (
    <ConfirmLLM
      llmName={llmName}
      url={url.replace(/\/$/g, '')}
      pk={pk}
      creds={creds}
      goBack={goBack}
      save={save}
    />
  ) : (
    <AddLLMForm
      llmName={llmName}
      uniqueId={uniqueId}
      url={url}
      pk={pk}
      setUrl={setURL}
      setPk={setPk}
      setCreds={setCreds}
      setName={setLlmName}
    />
  );
  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="full-size"
      >
        {component}
      </motion.div>
    </div>
  );
}
