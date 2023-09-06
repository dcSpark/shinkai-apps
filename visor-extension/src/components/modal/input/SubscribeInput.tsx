import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { shinkaiVisor } from '@dcspark/sv-core';
import { Messaging } from '../../../messaging';
import Shinkai from '@urbit/http-api';
import Input from '../Input';
import { Command, MenuItem } from '../types';

interface InputProps {
  nextArg: Boolean;
  previousArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selectedToInput: Command;
  selected: MenuItem;
}

const SubscribeInput = (props: InputProps) => {
  const [app, setApp] = useState(null);
  const [path, setPath] = useState(null);
  const [num, setNum] = useState(null);

  useEffect(() => {
    let subscription: any;

    subscription = shinkaiVisor.on('sse', [], (res: any) => {
      props.airlockResponse(res);
    });

    return () => {
      shinkaiVisor.unsubscribe(num);
      shinkaiVisor.off(subscription);
    };
  }, [props.selectedToInput, num]);

  useEffect(() => {
    if (app?.length) {
      const setSubData = () => {
        shinkaiVisor.subscribe({ app: app, path: path }).then(res => {
          setNum(res.response);
        });
      };
      shinkaiVisor.require(['subscribe'], setSubData);
    }
  }, [app, path]);

  const handleRefSet = (refs: any) => {
    if (refs.length) {
      setApp(refs[0]);
      setPath(refs[1]);
    }
  };

  return <Input {...props} persistInput={true} refs={(res: any) => handleRefSet(res)} />;
};

export default SubscribeInput;
