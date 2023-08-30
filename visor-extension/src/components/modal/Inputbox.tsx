import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import Agrihan from '@urbit/http-api';
import HistoryInput from './input/HistoryInput';
import PokeInput from './input/PokeInput';
import ScryInput from './input/ScryInput';
import SubscribeInput from './input/SubscribeInput';
import SpiderInput from './input/SpiderInput';
import TerminalInput from './input/TerminalInput';
import DMInput from './input/DMInput';
import GroupsInput from './input/GroupsInput';
import NotificationInput from './input/NotificationInput';
import BaseInput from './BaseInput';
import visorSvgLogo from '../../icons/visorWhiteText.svg';

import { Command, ContextMenuItem, MenuItem } from './types';
import Input from './Input';
import HomeInput from './input/HomeInput';
import BitcoinInput from './input/BitcoinInput';

interface InputProps {
  selectedToInput: MenuItem;
  selected: MenuItem;
  metadata?: Object;
  termLines?: string[];
  commands?: MenuItem[];
  setCommands?: (commands: MenuItem[]) => void;
  filteredCommands?: (commands: MenuItem[]) => void;
  baseFocus: Boolean;
  nextArg: Boolean;
  previousArg: Boolean;
  sendCommand: Boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: Boolean) => void;
  contextItems: (items: ContextMenuItem[]) => void;
  prefilledArgs?: (args: string[]) => void;
  setArgPreview?: (preview: Boolean) => void;
  argPreview?: Boolean;
  placeholder?: string;
  landscapeFork: string;
}

const Inputbox = (props: InputProps) => {
  let command;

  const selectedCommand = (selected: any): selected is Command => (selected?.title ? true : false);
  const selectedContext = (selected: any): selected is ContextMenuItem =>
    selected?.commandTitle ? true : false;

  switch (
    selectedContext(props.selected) ? props.selected?.commandTitle : props.selectedToInput?.title
  ) {
    case 'History':
      command = <HistoryInput {...props} />;
      break;
    case 'Poke':
      command = <PokeInput {...props} />;
      break;
    case 'Home':
      command = <HomeInput {...props} />;
      break;
    case 'Scry':
      command = <ScryInput {...props} />;
      break;
    case 'Subscribe':
      command = <SubscribeInput {...props} />;
      break;
    case 'Thread':
      command = <SpiderInput {...props} />;
      break;
    case 'Terminal':
      command = <TerminalInput {...props} />;
      break;
    case 'DM':
      command = <DMInput {...props} />;
      break;
    case 'Groups':
      command = <GroupsInput {...props} />;
      break;
    case 'Notifications':
      command = <NotificationInput {...props} />;
      break;
    case 'Bitcoin':
      command = <BitcoinInput {...props} />;
      break;
    default:
      command = <BaseInput {...props} />;
  }

  return (
    <div className="modal-input-box">
      <div className="logo-container">
        <div className="logo">
          <img src={visorSvgLogo} />
        </div>
      </div>
      {command}
    </div>
  );
};

export default Inputbox;
