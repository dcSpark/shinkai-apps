import { Command } from '../types';
import React from 'react';
import subscriptionIcon from '../../../icons/subscription.svg';

const Icon = () => <img src={subscriptionIcon} />;

export const Subscribe: Command = {
  command: 'subscribe',
  title: 'Subscribe',
  icon: <Icon />,
  description: 'Reads a continuous stream of data from your Agrihan.',
  arguments: ['app', 'path'],
  schema: [(props: any[]) => ({ app: props[0].innerText, path: props[1].innerText })],
};
