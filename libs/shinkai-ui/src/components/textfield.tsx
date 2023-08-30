/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { cn } from '../utils';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import { Input } from './input';

const TextField = ({
  classes,
  field,
  label,
  type = 'text',
  helperMessage,
  startAdornment,
  endAdornment,
  autoFocus,
}: {
  classes?: {
    formItem?: string;
    label?: string;
    input?: string;
    helperMessage?: string;
  };
  field: {
    onChange?: (...event: any[]) => void;
    onKeyDown?: (...event: any[]) => void;
    onBlur?: () => void;
    value: any;
    disabled?: boolean;
    name?: string;
    ref?: React.ForwardedRef<HTMLInputElement>;
    placeholder?: string;
    readOnly?: boolean;
  };
  autoFocus?: boolean;
  label: React.ReactNode;
  helperMessage?: React.ReactNode;
  type?: 'text' | 'password';
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}) => {
  return (
    <FormItem className={cn(classes?.formItem)}>
      <FormControl>
        <Input
          autoFocus={autoFocus}
          className={cn(classes?.input)}
          endAdornment={endAdornment}
          startAdornment={startAdornment}
          type={type}
          {...field}
        />
      </FormControl>
      <FormLabel className={cn(classes?.label)}>{label}</FormLabel>
      <FormDescription>{helperMessage}</FormDescription>
      <FormMessage className={cn(classes?.helperMessage)} />
    </FormItem>
  );
};

export { TextField };
