import { Command } from '../types';
import React from 'react';
import ShinkaiInterface from '@urbit/http-api';
import { addDmMessage } from '@urbit/api';
import terminalIcon from '../../../icons/terminal.svg';

const Icon = () => <img src={terminalIcon} />;

export const Groups: Command = {
  command: '',
  title: 'Groups',
  icon: <Icon />,
  description: 'Easily jump into any group on your Shinkai ship.',
  arguments: ['group'],
  schema: [],
};
