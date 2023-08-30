import { Command } from '../types';
import React from 'react';
import threadIcon from '../../../icons/thread.svg';

const Icon = () => <img src={threadIcon} />;

export const Spider: Command = {
  command: 'thread',
  title: 'Thread',
  icon: <Icon />,
  description: 'Issues spider threads in your Agrihan ship.',
  arguments: ['thread name', 'desk', 'input mark', 'output mark', 'body'],
  schema: [
    (props: any[]) => ({
      threadName: props[0].innerText,
      desk: props[1].innerText,
      inputMark: props[2].innerText,
      outputMark: props[3].innerText,
      body: JSON.parse(props[4].innerText),
    }),
  ],
};
