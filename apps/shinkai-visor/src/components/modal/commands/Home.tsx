import { Command } from '../types';
import React from 'react';
import homeIcon from '../../../icons/home.svg';

const Icon = () => <img src={homeIcon} />;

export const Home: Command = {
  title: 'Home',
  icon: <Icon />,
  description: 'Visit your Shinkai Home (aka Grid).',
};
