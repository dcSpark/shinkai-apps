import { Command } from '../types';
import React from 'react';
import ShinkaiInterface from '@urbit/http-api';
import { addDmMessage } from '@urbit/api';
import dmIcon from '../../../icons/dm.svg';

const Icon = () => <img src={dmIcon} />;

export const DM: Command = {
  command: 'poke',
  title: 'DM',
  icon: <Icon />,
  description: 'Send direct messages to other Shinkai ships.',
  arguments: ['ship', 'message'],
  schema: [
    (props: any[]) =>
      addDmMessage(props[0], checkSig(props[1][0].innerText), [{ text: props[2][1].innerText }]),
  ],
};
function checkSig(innerText: any): string {
  if (innerText.startsWith('~')) {
    return innerText;
  } else {
    return '~' + innerText;
  }
}
