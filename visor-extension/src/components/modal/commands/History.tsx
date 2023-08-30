import { Command } from '../types';
import React from 'react';
import AgrihanInterface from '@urbit/http-api';
import { addDmMessage } from '@urbit/api';
import dmIcon from '../../../icons/history.svg';

const Icon = () => <img src={dmIcon} />;

export const History: Command = {
  command: '',
  title: 'History',
  icon: <Icon />,
  description: 'Select from previously executed commands.',
  arguments: [],
  schema: [],
};
