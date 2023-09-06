import * as React from 'react';
import { useState, useEffect } from 'react';
import Form from './Form';
import Confirm from './Confirm';
import { useHistory } from 'react-router';
import { DecryptedShipCredentials, EncryptedShipCredentials } from '../../types';
import { Messaging } from '../../messaging';
import { motion } from 'framer-motion';
import { encrypt, encryptCreds } from '../../storage';

export default function AddShip() {
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

  async function save(shipName: string, url: string, code: string, pw: string): Promise<any> {
    Messaging.sendToBackground({
      action: 'add_ship',
      data: { ship: shipName, url: url, code: code, pw: pw },
    }).then(res => {
      Messaging.sendToBackground({
        action: 'cache_form_creds',
        data: { creds: null },
      });
      history.push(`/ship/${creds.shipName}`);
    });
  }

  const [url, setURL] = useState('http://localhost');
  const [code, setCode] = useState('');
  const [creds, fixCreds] = useState<EncryptedShipCredentials>(null);
  function setCreds(creds: DecryptedShipCredentials) {
    const encryptedCreds: EncryptedShipCredentials = encryptCreds(
      creds.shipName,
      creds.shipURL,
      creds.shipCode,
      'caching'
    );
    Messaging.sendToBackground({ action: 'cache_form_creds', data: { creds: encryptedCreds } });
    fixCreds(encryptedCreds);
  }
  const component = creds ? (
    <Confirm url={url.replace(/\/$/g, '')} code={code} save={save} creds={creds} goBack={goBack} />
  ) : (
    <Form url={url} code={code} setUrl={setURL} setCode={setCode} setCreds={setCreds} />
  );
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="full-size"
    >
      {component}
    </motion.div>
  );
}
