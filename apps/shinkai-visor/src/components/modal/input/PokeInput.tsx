import React from 'react';
import * as CSS from 'csstype';
import { useEffect, useState, useRef } from 'react';
import { Messaging } from '../../../messaging';
import Shinkai from '@urbit/http-api';
import Input from '../Input';
import { Command, MenuItem } from '../types';

interface InputProps {
  nextArg: boolean;
  previousArg: boolean;
  sendCommand: boolean;
  airlockResponse: (response: any) => void;
  clearSelected: (clear: boolean) => void;
  selectedToInput: Command;
  selected: MenuItem;
}

const PokeInput = (props: InputProps) => {
  return <Input {...props} />;
};

export default PokeInput;
