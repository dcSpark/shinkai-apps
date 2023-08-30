import { Command } from '../types';
import React from 'react';
import scryIcon from '../../../icons/scry.svg';

const Icon = () => <img src={scryIcon} />;

export const Scry: Command = {
  command: 'scry',
  title: 'Scry',
  icon: <Icon />,
  description: 'Read data from your Agrihan ship.',
  arguments: ['app', 'path'],
  schema: [(props: any[]) => ({ app: props[0].innerText, path: props[1].innerText })],
};
