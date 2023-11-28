import * as React from 'react';

import { cn } from '../utils';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@shinkai_network/shinkai-ui';
import { FieldPathValue, Noop, RefCallBack } from 'react-hook-form/dist/types';

const TextField = ({
  classes,
  field,
  label,
  type = 'text',
}: {
  classes?: {
    formItem?: string;
    label?: string;
    input?: string;
    helperMessage?: string;
  };
  field: {
    onChange: (...event: any[]) => void;
    onBlur: Noop;
    value: any;
    disabled?: boolean;
    name: string;
    ref: RefCallBack;
  };
  label: React.ReactNode;
  type?: 'text' | 'password';
}) => {
  return (
    <FormItem className={cn(classes?.formItem)}>
      <FormControl>
        <Input {...field} className={cn(classes?.input)} type={type} />
      </FormControl>
      <FormLabel className={cn(classes?.label)}>{label}</FormLabel>
      <FormMessage className={cn(classes?.helperMessage)} />
    </FormItem>
  );
};
TextField.displayName = 'TextField';

export { TextField };
