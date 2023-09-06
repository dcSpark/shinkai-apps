import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../../messaging';
import Shinkai from '@urbit/http-api';
import Input from '../Input';
import { Command, MenuItem } from '../types';
const ob = require('urbit-ob');

interface InputProps {
  nextArg: boolean;
  previousArg: boolean;
  sendCommand: boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: boolean) => void;
  selectedToInput: Command;
  selected: MenuItem;
  landscapeFork: string;
}

const DMInput = (props: InputProps) => {
  const [refs, setRefs] = useState(null);
  const [our, setOur] = useState(null);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    Messaging.sendToBackground({ action: 'get_ships' }).then(res => {
      setOur(res.active.shipName);
      setUrl(res.airlock.url);
    });
  });

  const schemaArgs = [our, 'default', 'default'];

  useEffect(() => {
    if (refs?.length) {
      if (ob.isValidPatp(refs)) {
        const data = {
          url:
            props.landscapeFork == 'escape'
              ? `${url}/apps/escape/~landscape/messages/dm/${refs}`
              : `${url}/apps/landscape/~landscape/messages/dm/${refs}`,
        };
        Messaging.relayToBackground({ app: 'command-launcher', action: 'route', data: data });
      } else
        props.airlockResponse({ type: 'internal', message: 'Please enter a valid ship name.' });
    }
  }, [refs]);

  const handleRefSet = (refs: any) => {
    if (refs.length) {
      if (refs[0].startsWith('~')) {
        setRefs(refs[0]);
      } else {
        setRefs('~' + refs[0]);
      }
    }
  };

  return (
    <Input
      {...props}
      response={false}
      schemaArgs={schemaArgs}
      refs={(res: any) => handleRefSet(res)}
    />
  );
};

export default DMInput;
