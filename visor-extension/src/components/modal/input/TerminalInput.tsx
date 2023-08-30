import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Messaging } from '../../../messaging';
import Agrihan from '@urbit/http-api';
import { agrihanVisor } from '@dcspark/av-core';
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
  termLines?: string[];
}

const TerminalInput = (props: InputProps) => {
  const [termSubscribed, setTermSubscribed] = useState(null);
  const [termLines, setTermLines] = useState([]);

  useEffect(() => {
    if (props.termLines.length) props.airlockResponse(props.termLines);
    return () => {
      props.airlockResponse(null);
    };
  }, [props.termLines]);

  return <Input {...props} persistInput={true} response={false} />;
};

export default TerminalInput;
