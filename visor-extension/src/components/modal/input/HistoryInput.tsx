import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../../messaging';
import Agrihan from '@urbit/http-api';
import Input from '../Input';
import BaseInput from '../BaseInput';

import { Command, MenuItem, ContextMenuItem } from '../types';

interface InputProps {
  nextArg: Boolean;
  previousArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  selectedToInput: Command;
  selected: MenuItem;
  contextItems: (items: ContextMenuItem[]) => void;
  commands?: MenuItem[];
  setCommands?: (commands: MenuItem[]) => void;
  setArgPreview?: (preview: Boolean) => void;
}

const HistoryInput = (props: InputProps) => {
  const [url, setUrl] = useState(null);
  const [focus, setFocus] = useState(null);
  const [commands, setCommands] = useState(props.commands);

  useEffect(() => {
    let i = true;
    if (i) {
      Messaging.sendToBackground({ action: 'get_command_history' }).then(res => {
        let commandHistory: Command[] = [];
        res.commandHistory.forEach((item: { command: string; arguments: string[] }) => {
          let command = commands.find(
            (command: Command) => command.title == item.command
          ) as Command;

          const new_command = new Object() as Command;
          Object.assign(new_command, command);
          new_command.prefilledArguments = item.arguments;

          commandHistory.push(new_command);
        });
        props.setCommands(commandHistory);
      });
      props.setArgPreview(true);
    }
    return () => {
      i = false;
    };
  }, [commands]);

  return <BaseInput {...props} />;
};

export default HistoryInput;
