import { Command } from '../types';
import React from 'react';
import pokeIcon from '../../../icons/poke.svg';

const Icon = () => <img src={pokeIcon} />;

export const Poke: Command = {
  command: 'poke',
  title: 'Poke',
  icon: <Icon />,
  description: 'Send data to your Agrihan ship.',
  arguments: ['app', 'mark', 'json'],
  schema: [
    (props: any[]) => ({
      app: props[0].innerText,
      mark: props[1].innerText,
      json: props[2].innerText,
    }),
  ],
};
