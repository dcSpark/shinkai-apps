import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../messaging';
import Shinkai from '@urbit/http-api';
import { Command, MenuItem } from './types';

interface InputProps {
  nextArg: boolean;
  sendCommand: boolean;
  baseFocus?: boolean;
  commands?: MenuItem[];
  filteredCommands?: (commands: MenuItem[]) => void;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: boolean) => void;
  selectedToInput: Command;
  schemaArgs?: any[];
  refs?: (refs: any) => void;
  placeholder?: string;
}

const BaseInput = (props: InputProps) => {
  const baseInput = useRef(null);
  const [commands, setCommands] = useState(props.commands);

  useEffect(() => {
    if (!props.placeholder) {
      if (props.baseFocus) baseInput.current.focus();
    }
  }, [props.baseFocus]);

  useEffect(() => {
    if (!props.placeholder) {
      baseInput.current.focus();
    }
  }, [baseInput]);

  const handleInputChange = (change: any) => {
    if (change.target.value == 0) {
      props.clearSelected(true);
    } else if (change.target) {
      const inp = change.target.value.toLowerCase();

      if (inp.length > 0) {
        const filtered = commands.filter(command => command.title.toLowerCase().includes(inp));

        if (commands.length == filtered.length) {
          return;
        } else {
          props.filteredCommands(filtered);
        }
      } else {
        props.filteredCommands(commands);
      }
    }
  };

  let input;

  if (props.placeholder) {
    input = <div className="input-placeholder">{props.placeholder}</div>;
  } else {
    input = (
      <input
        ref={baseInput}
        onChange={(change: any) => handleInputChange(change)}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key == 'Backspace' && (event.target as any).value == 0) {
            props.clearSelected(true);
          }
        }}
        contentEditable
        className="cl-base-input"
        placeholder="Type..."
      />
    );
  }

  return input;
};

export default BaseInput;
